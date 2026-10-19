import {GoogleGenerativeAI} from "@google/generative-ai";
import {NextResponse} from "next/server";
import {randomUUID} from "crypto";
import {auth} from "@/lib/auth";

// Anonymous visitors receive a temporary token budget. Authenticated users
// bypass this limit because their identity is verified by Better Auth.
const TOKEN_LIMIT = 3000;
const RESET_AFTER_MS = 2 * 60 * 60 * 1000;

// This in-memory store tracks anonymous usage by visitor cookie. It is kept
// on globalThis so hot reloads do not reset it during local development.
const store = globalThis.__chatStore || (globalThis.__chatStore = new Map());

function getVisitorId(request) {
  // Reuse the visitor cookie when available, otherwise create an identifier
  // that will be sent back to the browser by withCookie().
  const existing = request.cookies.get("visitor_id")?.value;
  return { id: existing ?? randomUUID(), isNew: !existing };
}

function withCookie(response, visitor) {
  // The cookie identifies anonymous usage without exposing the usage data
  // itself to the client.
  if (visitor.isNew) {
    response.cookies.set("visitor_id", visitor.id, {
      httpOnly: true,
      maxAge: RESET_AFTER_MS / 1000,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
  }

  return response;
}

function getUsage(visitorId) {
  const now = Date.now();
  const current = store.get(visitorId);

  // Keep the current window while it is active; otherwise start a new one.
  if (current && current.resetAt > now) {
    return current;
  }

  const usage = {used: 0, resetAt: now + RESET_AFTER_MS};
  store.set(visitorId, usage);
  return usage;
}

async function getSession(request) {
  // Better Auth reads the request cookies and returns the signed-in session,
  // or null when the request comes from an anonymous visitor.
  return auth.api.getSession({
    headers: request.headers,
  });
}

export async function GET(request) {
  const session = await getSession(request);

  // Authenticated users never need the anonymous limit modal.
  if (session) {
    return NextResponse.json({limited: false, resetAt: null});
  }

  const visitor = getVisitorId(request);
  const usage = getUsage(visitor.id);
  const limited = usage.used >= TOKEN_LIMIT;

  // Anonymous clients receive only their current limit status and reset time.
  return withCookie(
    NextResponse.json({
      limited,
      resetAt: limited ? usage.resetAt : null,
    }),
    visitor
  );
}

export async function POST(request) {
  try {
    const session = await getSession(request);
    const visitor = getVisitorId(request);
    const {prompt} = await request.json();

    // Reject empty or malformed requests before calling the external AI API.
    if (typeof prompt !== "string" || !prompt.trim()) {
      return withCookie(
        NextResponse.json({error: "Prompt is required"}, {status: 400}),
        visitor
      );
    }

    const apiKey = process.env.GEMINI_API?.trim();
    if (!apiKey) {
      // Do not attempt a request when the server has not been configured.
      console.error("GEMINI_API is not configured.");
      return withCookie(
        NextResponse.json(
          {error: "The chat service is not configured."},
          {status: 500}
        ),
        visitor
      );
    }

    const usage = session ? null : getUsage(visitor.id);

    // Check the limit again on POST because the client-side GET result can
    // become stale between the page check and the message submission.
    if (usage && usage.used >= TOKEN_LIMIT) {
      return withCookie(
        NextResponse.json(
          {
            error: "limit_reached",
            remaining: 0,
            resetAt: usage.resetAt,
          },
          {status: 429}
        ),
        visitor
      );
    }

    // Create the Gemini client only after validation and limit checks pass.
    const GenIA = new GoogleGenerativeAI(apiKey);

    const model = GenIA.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    // Gemini receives the trimmed prompt and returns the generated answer.
    const result = await model.generateContent(prompt.trim());
    const response = await result.response;
    const text = response.text();
    const metadata = response.usageMetadata;
    const metadataTokenCount =
      metadata?.totalTokenCount ??
      ((metadata?.promptTokenCount ?? 0) +
        (metadata?.candidatesTokenCount ?? 0));
    // Prefer Gemini's measured token count; the character estimate is a
    // fallback for responses where usage metadata is unavailable.
    const consumed =
      metadataTokenCount ||
      Math.ceil((prompt.trim().length + text.length) / 4);
    const nextUsage = usage
      ? {
          used: usage.used + consumed,
          resetAt: usage.resetAt,
        }
      : null;

    if (nextUsage) {
      store.set(visitor.id, nextUsage);
    }

    // Authenticated responses have no remaining anonymous quota to report.
    return withCookie(
      NextResponse.json({
        text,
        remaining: nextUsage ? Math.max(0, TOKEN_LIMIT - nextUsage.used) : null,
      }),
      visitor
    );

  } catch (error) {
    // Keep provider errors server-side while returning a stable API shape.
    console.error("Error generating content:", error);

    let message = "there's erreur in the AI service, we are working on it.";

    return NextResponse.json({error: message}, {status: 502});
  }
}