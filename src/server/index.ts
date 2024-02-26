import { publicProcedure as procedure, router } from "./trpc";
import { assignmentsAndGradesRouter } from "./routes/assignmentsAndGradesRouter";
import { userRouter } from "./routes/userRouter";
require('dotenv').config();


export const appRouter = router({
  user: userRouter,
  assignmentsAndGrades: assignmentsAndGradesRouter,

});

export type AppRouter = typeof appRouter;
