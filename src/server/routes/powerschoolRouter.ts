import { publicProcedure as procedure, router } from "../trpc";
import { loginAndScrapeGrades } from "@/utils/powerschool/scrape";
import {
  fetchCoursesAssignmentsWithGrades,
  fetchAssignmentsFromCourse,
  fetchSubmissionInfo,
} from "@/utils/canvas/api";
import z from "zod";

// Define processData function
const processData = (data: any) => {
  console.log("processor", data);
  return data;
};

export const powerSchoolRouter = router({
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

  assignments: procedure
    .input(
      z.object({
      })
    )
    .query(async (opts) => {
      const result = await fetchCoursesAssignmentsWithGrades(

        process.env.CANVAS_TOKEN
      );
      return result;
    }),

  assignmentsWithCourse: procedure.input(z.object({})).query(async () => {
    const result = await fetchAssignmentsFromCourse(process.env.CANVAS_TOKEN);
    return result;
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
});
