import {z} from "zod"

export const SignupInput=z.object({
    name:z.string().optional(),
    email:z.string().email(),
    password:z.string()
})


export const SigninInput=z.object({
    email:z.string().email(),
    password:z.string()
})


export const CreatePostInput=z.object({
    title:z.string(),
    content:z.string()
})

export const UpdatePostInput=z.object({
    title:z.string(),
    content:z.string()
})

export type SignupType=z.infer<typeof SignupInput>
export type SiginType=z.infer<typeof SigninInput>
export type CreatePostType=z.infer<typeof CreatePostInput>
export type UpdatePostType=z.infer<typeof UpdatePostInput>

