import { publicProcedure as procedure, router } from "./trpc";
import { powerSchoolRouter } from "./routes/powerschoolRouter";
require('dotenv').config();


export const appRouter = router({

  powerschool: powerSchoolRouter,
});

export type AppRouter = typeof appRouter;
