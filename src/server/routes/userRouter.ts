import { publicProcedure as procedure, router } from "../trpc";
import z from "zod";
import prisma from "@database/prisma";


export const userRouter = router({
    signup: procedure
        .input(z.object({
            emailAddress: z.string(),
            username: z.string(),
            clerkID: z.string(),
        }))
        .mutation(async (opts) => {
            const user = await prisma.user.create({
                data: {
                    email: opts.input.emailAddress,
                    username: opts.input.username,
                    clerkAuthId: opts.input.clerkID,
                },
            });
            return user;
        }),
    user: procedure
        .input(z.object({
            emailAddress: z.string(),
            password: z.string(),
        }))
        .mutation(async (opts) => {
            const user = await prisma.user.findUnique({
                where: {
                    email: opts.input.emailAddress,
                },
            });
            if (!user) {
                throw new Error("User not found");
            }
            return user;
        }),
    isUserSetupWithLMS: procedure
        .input(z.object({
            emailAddress: z.string(),
        }))
        .query(async (opts) => {
            const user = await prisma.user.findUnique({
                where: {
                    email: opts.input.emailAddress,
                },
            });
            if (!user) {
                throw new Error("User not found");
            }
            return !!user.LMS;
        }),
});
