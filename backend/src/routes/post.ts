import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { verify } from "hono/jwt";
import { CreatePostInput, UpdatePostInput } from "@arunamballa_dev/medium-common";

const postRouter = new Hono<{
    Bindings:{
        DATABASE_URL:string,
        JWT_SECRET:string
    },
    Variables:{
        userId:string
    }
}>();


postRouter.use("*",async (c,next)=>{

    const jwt=c.req.header('Authorization')

    if(!jwt){
        c.status(401)
        return c.json({message:"Token Missing Unauthorized"})
    }

    const token = jwt?.split(' ')[1]

    try{
        const payload=await verify(token,c.env.JWT_SECRET)

        if(!payload){
            c.status(401)
            return c.json({message:"unauthorized"})
        }
        //@ts-ignore
        c.set("userId",payload.id);
        await next();
    }catch(error){
        c.status(403)
        return c.json({message:"Invalid JWT"})
    }
   
})

postRouter.post("/",async(c)=>{

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const body=await c.req.json();

    const response=CreatePostInput.safeParse(body);
    if(!response.success){
        c.status(403)
        return c.json({message:'Invalid Input'})
    }
    const userId=c.get("userId")
    try{
        const post=await prisma.post.create({
            data:{
                title:body.title,
                content:body.content,
                authorId:Number(userId)
            }
        })

        c.status(200)
        return c.json({
            message:"Post Created Successfully"
        })
    }catch(error){
        c.status(500)
        return c.json({message:"Something went wrong while creating Post"})
    }

})
postRouter.put("/",async(c)=>{

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const body=await c.req.json();

    const response=UpdatePostInput.safeParse(body)
    if(!response.success){
        c.status(403)
        return c.json({message:"Invalid Input"})
    }
    const userId=c.get("userId")

    try{
        const post=await prisma.post.update({
            where:{
                id:body.id,
                authorId:Number(userId)
            },data:{
                title:body.title,
                content:body.content
            }
        })

        c.status(200)
        return c.json({message:"Post updated Successfully",post:post})

    }catch(error){
        c.status(500)
        return c.json({message:"something went wrog while updating the post"})
    }
})

postRouter.get("/",async (c)=>{

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    try{
        const posts=await prisma.post.findMany({})
        c.status(200)
        return c.json(posts)
    }catch(error){
        c.status(500)
        return c.json({message:"something went wrong while fetchig all Posts"})
    }
})

postRouter.get("/:id",async (c)=>{

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const id=c.req.param("id");
    try{
        const post=await prisma.post.findFirst({
            where:{
                id:Number(id)
            }
        })

        c.status(200)
        return c.json(post)
    }catch(error){
        c.status(500)
        return c.json({
            message:"Something went wrong while Fetching Post"
        })
    }
})


postRouter.delete("/:id", async (c)=>{

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const id=c.req.param("id")

    try{
        const post=await prisma.post.delete({
            where:{
                id:Number(id)
            }
        })
        c.status(200)
        return c.json({message:"post Deleted Successfully"})
    }catch(error){
        c.status(500)
        return c.json({message:"Something went wrong while deleting the post"})
    }
})
export default postRouter