import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign } from "hono/jwt";
import { SigninInput, SignupInput } from "@arunamballa_dev/medium-common";

const userRouter = new Hono<{
    Bindings:{
        DATABASE_URL:string,
        JWT_SECRET:string
    }
}>();


userRouter.post("/signup",async (c)=>{

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const body=await c.req.json();

    const response=SignupInput.safeParse(body);

    if(!response.success){
        c.status(403)
        return c.json({message:"Invalid Inputs"})
    }

    try{
        const user=await prisma.user.findFirst({
            where:{
                email:body.email,
            }
        })

        if (user){
            c.status(411)
            return c.json({message:"User Already Exists with the Email Id"})
        }

        const userResponse=await prisma.user.create({
            data:{
                email:body.email,
                password:body.password,
                name:body.name
            }
        })

        const token=await sign({id:userResponse.id},c.env.JWT_SECRET)



        c.status(200)
        return c.json({userId:userResponse.id,JWT:token})
    }catch(error){

        c.status(500)
        return c.json({message:"Something Went Wrong while Sign Up"})
    }
})



userRouter.post("/signin",async (c)=>{

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const body=await c.req.json();

    const response=SigninInput.safeParse(body)
    if(!response.success){
        c.status(403)
        return c.json({message:"Invalid Inputs"})
    }

    try{

        const user=await prisma.user.findFirst({
            where:{
                email:body.email
            }
        })

        if(!user){
            c.status(411)
            return c.json({
                message:"User Does not Exists"
            })
        }

        const token=await sign({id:user.id},c.env.JWT_SECRET)

        c.status(200)
        return c.json({userId:user.id,JWT:token})
    }catch(error){
        c.status(500)
        return c.json({message:"Something Went wrong while Sign In"})
    }
})
userRouter.delete("/:id",async(c)=>{

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const id=c.req.param("id")

    try{
        const posts=await prisma.post.deleteMany({
            where:{
                authorId:Number(id)
            }
        })
        const user=await prisma.user.delete({
            where:{
                id:Number(id)
            }
       
        })
        c.status(200)
        return c.json({message:"User Deleted Successfully"})
    }catch(error){
        c.status(500)
        console.log(error)
        return c.json({message:"Somethig went wrong while Deleting User"})
    }

})

export default userRouter