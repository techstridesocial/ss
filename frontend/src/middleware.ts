import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define public routes, including the homepage and any specific API routes if needed.
// Clerk's own API routes are typically handled automatically.
// The '/api(.*)' pattern from the original attempt can be kept if we want all general API routes to be public by default,
// or we can be more specific. For now, let's keep it broad and adjust if security needs tightening.
const isPublicRoute = createRouteMatcher([
  '/', // Homepage
  '/sign-in(.*)', // Sign-in pages
  '/sign-up(.*)', // Sign-up pages
  '/api/(.*)' // Allow all /api routes by default - review for production
]);

export default clerkMiddleware((auth, req) => {
  // If the route is not public, then protect it.
  if (!isPublicRoute(req)) {
    auth.protect(); // Call protect directly on the auth object passed to the middleware
  }
  // For public routes, no action is needed here, access is allowed by default.
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}; 