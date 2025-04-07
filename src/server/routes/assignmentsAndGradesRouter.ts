import { publicProcedure as procedure, router } from "../trpc";
import { loginAndScrapeGrades } from "@/utils/powerschool/scrape";
import {
  fetchCoursesAssignmentsWithGrades,
  fetchSubmissionInfo,
} from "@/utils/canvas/api";
import z from "zod";
import prisma from "@database/prisma";
import {
  addOrUpdateCourseWithAssignments,
  executeForceUpdatePriorityAndEstimatedTime,
  fetchAssignmentsAndCourses,
} from "@/utils/database/api";
import { TRPCError } from "@trpc/server";

// Define processData function
const processData = (data: any) => {
  console.log("processor", data);
  return data;
};

export const assignmentsAndGradesRouter = router({
  getStudentInfo: procedure.query(async (opts) => {
    try {
      // Create a promise wrapper for loginAndScrapeGrades
      const resultPromise = new Promise((resolve, reject) => {
        loginAndScrapeGrades(
          (data: any) => {
            const processedData = processData(data);
            resolve(processedData);
          },
          "bellarmine",
          process.env.EMAIL,
          process.env.PASSWORD
        );
      });

      // Await the promise
      const result = await resultPromise;
      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error("Error during scraping: " + error.message);
      } else {
        throw new Error("An unknown error occurred during scraping");
      }
    }
  }),

  initialAssignmentsSync: procedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input }) => {
      const user = await prisma.user.findUnique({
        where: {
          clerkAuthId: input.id,
        },
      });

      if (!user || !user.lmsconfig || !Array.isArray(user.lmsconfig)) {
        throw new Error(
          "User not found or user does not have any LMS configurations"
        );
      }

      // Assuming lmsconfig is an array of { lmsToken: string, lmsUrl: string }
      const assignmentFetchPromises = user.lmsconfig.map((config) => {
        // Validate config object structure or throw error if necessary
        // @ts-ignore
        if (!config!.lmsToken || !config!.lmsUrl) {
          console.error("Invalid LMS configuration:", config);
          throw new Error("Invalid LMS configuration encountered.");
        }
        // @ts-ignore
        return fetchCoursesAssignmentsWithGrades(
          //@ts-ignore
          config!.lmsToken,
          //@ts-ignore
          config!.lmsUrl,
          //@ts-ignore
          config!.lmsUserId
        );
      });

      try {
        // Wait for all fetch operations to complete and aggregate results
        const assignmentsResults = await Promise.all(assignmentFetchPromises);
        // Flatten the results if each fetch operation returns an array of assignments

        return assignmentsResults.flat();
      } catch (error) {
        console.error("Error fetching assignments:", error);
        throw error;
      }
    }),

  syncAssignments: procedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input }) => {
      const user = await prisma.user.findUnique({
        where: {
          clerkAuthId: input.id,
        },
      });

      if (!user || !user.lmsconfig || !Array.isArray(user.lmsconfig)) {
        throw new Error(
          "User not found or user does not have any LMS configurations"
        );
      }

      // Assuming lmsconfig is an array of { lmsToken: string, lmsUrl: string }
      const assignmentFetchPromises = user.lmsconfig.map((config) => {
        // Validate config object structure or throw error if necessary
        // @ts-ignore
        if (!config!.lmsToken || !config!.lmsUrl) {
          console.error("Invalid LMS configuration:", config);
          throw new Error("Invalid LMS configuration encountered.");
        }
        // @ts-ignore
        return fetchCoursesAssignmentsWithGrades(
          //@ts-ignore
          config!.lmsToken,
          //@ts-ignore
          config!.lmsUrl,
          //@ts-ignore
          config!.lmsUserId
        );
      });

      try {
        const assignmentsResults = await Promise.all(assignmentFetchPromises);
        const formattedData = assignmentsResults.flat().map((course) => ({
          canvasCourseId: String(course.id),
          name: course.name,
          // @ts-ignore
          assignments: course.assignments.map((assignment) => ({
            id: String(assignment.id),
            title: assignment.name,
            description: assignment.description || undefined,
            dueDate: assignment.due_at,
            priority: assignment.priority || undefined,
            score: assignment.score || undefined,
            grade: assignment.grade || undefined,
            status: assignment.status || undefined,
            isMissing: assignment.isMissing || undefined,
            points_possible: assignment.points_possible || undefined,
          })),
        }));

        const errors = [];
        for (const courseData of formattedData) {
          try {
            await addOrUpdateCourseWithAssignments(courseData);
          } catch (error) {
            console.error(
              `Error processing course ${courseData.canvasCourseId}:`,
              error
            );
            errors.push({
              courseId: courseData.canvasCourseId,
              error: error instanceof Error ? error.message : "Unknown error",
            });
          }
        }

        if (errors.length > 0) {
          return [
            {
              success: false,
              errors: errors,
            },
          ];
        }

        const user = await prisma.user.findUnique({
          where: { clerkAuthId: input.id },
        });

        //@ts-ignore
        if (!user || !user.lmsconfig || user.lmsconfig.length === 0) {
          throw new Error("User not found or `lmsconfig` is empty");
        }

        //@ts-ignore
        let lmsconfig = [...user.lmsconfig]; // Create a shallow copy of the lmsconfig array
        if (lmsconfig[0].syncs !== undefined) {
          lmsconfig[0].syncs += 1; // Increment syncs
        } else {
          throw new Error(
            "`syncs` field not found in the first `lmsconfig` object"
          );
        }

        await prisma.user.update({
          where: { clerkAuthId: input.id },
          data: {
            lmsconfig: lmsconfig, // Update with the modified array
          },
        });

        const assignments = await fetchAssignmentsAndCourses();
        return assignments.flat();
      } catch (error) {
        console.error("Error fetching assignments:", error);
        throw error;
      }
    }),

  assignmentSubmissions: procedure
    .input(
      z.object({
        assignmentId: z.string(),
      })
    )
    .query(async (opts) => {
      const result = await fetchSubmissionInfo(opts.input.assignmentId);
      return result;
    }),

  fetchAssignmentsFromDb: procedure.query(async () => {
    const assignments = await fetchAssignmentsAndCourses();
    return assignments.flat();
  }),

  forceUpdatePrioAndTime: procedure.query(async () => {
    await executeForceUpdatePriorityAndEstimatedTime();
    return "Force update complete";
  }),

  edit: procedure
  .input(
    z.object({
      id: z.string(),
      priority: z.number().optional(),
      estimatedTime: z.number().optional(),
      status: z.enum(['unsubmitted', 'submitted', 'graded']).optional(),
      pointsPossible: z.number().optional(),
      userClerkId: z.string(),
    })
  )
  .mutation(async (opts) => {
    const { id, priority, estimatedTime, status, pointsPossible } = opts.input;
    const user = await prisma.user.findUnique({
      where: { clerkAuthId: opts.input.userClerkId },
    });
    const userId = user?.id;

    if (!userId) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      });
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: { course: true },
    });

    if (!assignment) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Assignment not found',
      });
    }

    const courseId = assignment.course.id;

    const edit = await prisma.edit.upsert({
      where: {
        userId_assignmentId: {
          userId,
          assignmentId: id,
        },
      },
      create: {
        userId,
        assignmentId: id,
        courseId,
        priority,
        estimatedTime,
        status,
        pointsPossible,
      },
      update: {
        priority,
        estimatedTime,
        status,
        pointsPossible,
      },
    });

    return edit;
  }),
});
