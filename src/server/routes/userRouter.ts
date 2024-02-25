import { publicProcedure as procedure, router } from "../trpc";
import z from "zod";
import prisma from "@database/prisma";
import { fetchUserInfo } from "@/utils/canvas/api";
import { addOrUpdateCourseWithAssignments } from "@database/api";
import React from "react";

export const userRouter = router({
  signup: procedure
    .input(
      z.object({
        emailAddress: z.string(),
        username: z.string(),
        clerkID: z.string(),
      })
    )
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
    .input(
      z.object({
        emailAddress: z.string(),
      })
    )
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
  isUserSetupWithLMSandGMS: procedure
    .input(
      z.object({
        emailAddress: z.string(),
      })
    )
    .query(async (opts) => {
      console.log(opts.input.emailAddress);
      const user = await prisma.user.findUnique({
        where: {
          email: opts.input.emailAddress,
        },
      });
      if (!user) {
        throw new Error("User not found");
      }
      console.log(user.LMS);
      return { lms: user.LMS };
    }),
  addLMStoUser: procedure
    .input(
      z.object({
        id: z.string(),
        lms: z.string(),
        lmsUrl: z.string(),
        lmsToken: z.string(),
      })
    )
    .mutation(async (opts) => {
      let userInfo;
      if (opts.input.lms === "canvas") {
        userInfo = await fetchUserInfo(opts.input.lmsToken);
      } else {
        userInfo = null;
      }

      // Construct the new LMS configuration object
      const newLmsConfig = {
        lmsUrl: opts.input.lmsUrl,
        lmsToken: opts.input.lmsToken,
        lmsUserId: userInfo?.id,
        syncs: 0,
      };

      console.log(opts.input.id);
      // Fetch the current user to check their existing lmsConfig
      const user = await prisma.user.findUnique({
        where: {
          clerkAuthId: opts.input.id,
        },
      });

      console.log(user);
      // Ensure lmsConfig is treated as an array
      const currentLmsConfig = Array.isArray(user!.lmsconfig)
        ? user!.lmsconfig
        : [];

      // Append new config to existing array or create a new array with the new config
      const updatedLmsConfig = [...currentLmsConfig, newLmsConfig];

      // Update the user with the new lmsConfig
      const updatedUser = await prisma.user.update({
        where: {
          clerkAuthId: opts.input.id,
        },
        data: {
          LMS: opts.input.lms,
          lmsconfig: updatedLmsConfig,
        },
      });

      return updatedUser;
    }),
  userInfo: procedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async (opts) => {
      const user = await prisma.user.findUnique({
        where: {
          clerkAuthId: opts.input.id,
        },
      });
      return user;
    }),
    addCoursesAssignments: procedure
    .input(
      z.array(
        z.object({
          canvasCourseId: z.string(),
          name: z.string(),
          assignments: z.array(
            z.object({
              id: z.string(),
              title: z.string(),
              description: z.string().optional(),
              dueDate: z.string(),
              priority: z.number().optional(),
              score: z.number().optional(),
              grade: z.string().optional(),
              status: z.string().optional(),
              isMissing: z.boolean().optional(),
            })
          ),
        })
      )
    )
    .mutation(async (opts) => {
      const errors = []; // Array to collect errors
      for (const courseData of opts.input) {
        try {
          await addOrUpdateCourseWithAssignments(courseData);
        } catch (error) {
          // Log the error or push it to the errors array
          console.error(`Error processing course ${courseData.canvasCourseId}:`, error);
          errors.push({
            courseId: courseData.canvasCourseId,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
  
      if (errors.length > 0) {
        // You might want to handle errors differently, e.g., throw a custom error or return the errors array
        return {
          success: false,
          errors: errors,
        };
      }
  
      return { success: true };
    }),

  
});
