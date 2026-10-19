import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Expose Better Auth's GET and POST endpoints under /api/auth/[...all].
// This includes sign-in, sign-up, session, sign-out, and account deletion.
export const { GET, POST } = toNextJsHandler(auth);