import { postRouter } from "~/server/api/routers/post";
import { practiceRouter } from "~/server/api/routers/practice";
import { settingsRouter } from "~/server/api/routers/settings";
import { speechRouter } from "~/server/api/routers/speech";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  practice: practiceRouter,
  settings: settingsRouter,
  speech: speechRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
