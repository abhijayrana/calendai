import { authMiddleware } from "@clerk/nextjs";
 
// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your Middleware
export default authMiddleware({
    publicRoutes: [
        "/(.*)",
        "/login",
        "/signup",
    ],
    // afterAuth(auth, req, evt) {
    //   if(!auth.userId && !auth.isPublicRoute) {
    //     return {
    //       redirect: {
    //         destination: '/login',
    //         permanent: false,
    //       },
    //     };
    //   }
    // }
});
 
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
 