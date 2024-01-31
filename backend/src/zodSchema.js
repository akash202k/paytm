import { string, z } from "zod";

const USER_SIGNUP = z.object({
    username: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    password: z.string()
})

const USER_SIGNIN = z.object({
    username: z.string(),
    password: z.string()
})

const USER_UPDATE = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    password: z.string().optional(),
})

const AMOUNT_TRANSFER = z.object({
    recipientId: z.string(),
    amount: z.number
})

export { USER_SIGNUP, USER_SIGNIN, USER_UPDATE, AMOUNT_TRANSFER };