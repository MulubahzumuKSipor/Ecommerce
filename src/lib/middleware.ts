import { NextRequest, NextResponse } from "next/server";
import { supabase } from "./client";
import type { User } from "@supabase/supabase-js";

function extractTokenFromCookieValue(value: string | undefined): string | null {
  if (!value) return null;

  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    decoded = value;
  }

  const trimmed = decoded.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (
        parsed &&
        typeof parsed === "object" &&
        "access_token" in (parsed as Record<string, unknown>) &&
        typeof (parsed as Record<string, unknown>).access_token === "string"
      ) {
        return (parsed as Record<string, string>).access_token;
      }
    } catch {
    }
  }

  return trimmed || null;
}

function extractToken(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization") ?? req.headers.get("Authorization") ?? null;
  if (authHeader && typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    const parts = authHeader.split(" ");
    if (parts.length >= 2 && parts[1]) return parts[1].trim();
  }

  const cookieNames = [
    "sb-access-token",
    "sb:token",
    "supabase-auth-token",
    "sb-session",
    "supabase-session",
  ];

  for (const name of cookieNames) {
    const cookie = req.cookies.get(name);
    if (!cookie) continue;
    const token = extractTokenFromCookieValue(cookie.value);
    if (token) return token;
  }

  return null;
}

export async function authMiddleware(req: NextRequest): Promise<User | NextResponse> {
  try {
    const token = extractToken(req);
    if (!token) {
      console.debug("[authMiddleware] no token extracted from header/cookies");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const masked = `${token.slice(0, 4)}...${token.slice(-4)}`;
    console.debug(`[authMiddleware] token found (masked): ${masked}`);

    const { data, error } = await supabase.auth.getUser(token);

    if (error) {
      // data may be undefined if supabase returns error
      console.debug("[authMiddleware] supabase.auth.getUser error:", error.message ?? error);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!data || !data.user) {
      console.debug("[authMiddleware] supabase.auth.getUser returned no user");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.debug("[authMiddleware] authenticated user id:", String(data.user.id));
    return data.user as User;
  } catch (err) {
    console.error("[authMiddleware] unexpected error:", err);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function authMiddlewareOrThrow(req: NextRequest): Promise<User> {
  const result = await authMiddleware(req);
  if (result instanceof NextResponse) throw result;
  return result;
}

export async function accountPageMiddleware(req: NextRequest) {
  const url = req.nextUrl.clone();

  if (!url.pathname.startsWith("/account")) {
    return NextResponse.next();
  }

  try {
    const token = extractToken(req);
    if (!token) {
      url.pathname = "/auth/login";
      return NextResponse.redirect(url);
    }

    const { data } = await supabase.auth.getUser(token);
    if (!data?.user) {
      url.pathname = "/auth/login";
      return NextResponse.redirect(url);
    }
  } catch (err) {
    console.error("[accountPageMiddleware] error validating session:", err);
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*"],
};
