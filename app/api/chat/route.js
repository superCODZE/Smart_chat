import {GoogleGenerativeAI} from "@google/generative-ai";
import {NextResponse} from "next/server";
import {randomUUID} from "crypto";
import {auth} from "@/lib/auth";

const TOKEN_LIMIT = 3000;
const RESET_AFTER_MS = 2 * 60 * 60 * 1000;

const store = globalThis.__chatStore || (globalThis.__chatStore = new Map());

function getVisitorId(request) {
  const existing = request.cookies.get("visitor_id")?.value;
  return { id: existing ?? randomUUID(), isNew: !existing };
}

function withCookie(response, visitor) {
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

  if (current && current.resetAt > now) {
    return current;
  }

  const usage = {used: 0, resetAt: now + RESET_AFTER_MS};
  store.set(visitorId, usage);
  return usage;
}

async function getSession(request) {
  return auth.api.getSession({
    headers: request.headers,
  });
}

export async function GET(request) {
  const session = await getSession(request);

  if (session) {
    return NextResponse.json({limited: false, resetAt: null});
  }

  const visitor = getVisitorId(request);
  const usage = getUsage(visitor.id);
  const limited = usage.used >= TOKEN_LIMIT;

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

    if (typeof prompt !== "string" || !prompt.trim()) {
      return withCookie(
        NextResponse.json({error: "Prompt is required"}, {status: 400}),
        visitor
      );
    }

    const apiKey = process.env.GEMINI_API?.trim();
    if (!apiKey) {
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

    const GenIA = new GoogleGenerativeAI(apiKey);

    const model = GenIA.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const result = await model.generateContent(prompt.trim());
    const response = await result.response;
    const text = response.text();
    const metadata = response.usageMetadata;
    const metadataTokenCount =
      metadata?.totalTokenCount ??
      ((metadata?.promptTokenCount ?? 0) +
        (metadata?.candidatesTokenCount ?? 0));
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

    return withCookie(
      NextResponse.json({
        text,
        remaining: nextUsage ? Math.max(0, TOKEN_LIMIT - nextUsage.used) : null,
      }),
      visitor
    );

  } catch (error) {
    console.error("Error generating content:", error);

    let message = "there's erreur in the AI service, we are working on it.";

    return NextResponse.json({error: message}, {status: 502});
  }
}