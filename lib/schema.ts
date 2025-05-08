//Prevents users from submitting a non-existent ENS name like abcxyz.lisk.eth
import { z } from "zod";

export const schema = z.object({
    username: z
    .string()
    .min(1, {message: "Username required"})
});