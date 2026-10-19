import { createAuthClient } from "better-auth/react";

// The browser-side client calls the Better Auth API and keeps session state
// synchronized for React components.
export const authClient = createAuthClient();