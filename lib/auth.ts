import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import Database from "better-sqlite3";

export const auth = betterAuth({
  // Better Auth uses this SQLite database to store users,
  // linked accounts, and active sessions.
  database: new Database("./sqlite.db"),
  emailAndPassword: { enabled: true },
  user: {
    deleteUser: {
      // Enables the /api/auth/delete-user route used by the account
      // deletion button in the chat interface.
      enabled: true,
    },
  },
  // Allows Better Auth to manage session cookies with Next.js.
  plugins: [nextCookies()],
});