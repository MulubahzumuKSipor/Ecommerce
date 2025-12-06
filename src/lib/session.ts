import { cookies } from "next/headers";
import { randomUUID } from "crypto";

export async function getOrCreateSessionId() {
  const cookieStore = await cookies(); // ← FIX HERE
  let sessionId = cookieStore.get("session_id")?.value;

  if (!sessionId) {
    sessionId = randomUUID();
    cookieStore.set("session_id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });
  }

  return sessionId;
}
