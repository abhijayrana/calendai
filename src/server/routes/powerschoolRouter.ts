import { publicProcedure as procedure, router } from "../trpc";
import { loginAndScrapeGrades } from "@/utils/powerschool/scrape";
import fetchCurrentCoursesAndAssignments from "@/utils/canvas/api";
import z from "zod";

// Define processData function
const processData = (data: any) => {
    console.log("processor", data);
  return data;
};


export const powerSchoolRouter = router({
  getStudentInfo: procedure
      .input(
        z.object({
            email: z.string(),
            password: z.string(),
        })
      )
    .query(async (opts) => {
        try {

            const result = await loginAndScrapeGrades(
              processData,
              "bellarmine",
              opts.input.email,
              opts.input.password
            );
            return 'hi';
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
                url: z.string(),
            })
        )
        .query(async (opts) => {
            const result = await fetchCurrentCoursesAndAssignments(opts.input.url, process.env.CANVAS_TOKEN);
            return result;
        })



});
