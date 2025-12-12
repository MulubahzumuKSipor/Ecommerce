// /api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { supabase } from "@/lib/client";
import { authMiddleware } from "@/lib/middleware";
import type { User } from "@supabase/supabase-js";

interface UpdateRequestBody {
  username?: string;
  email?: string;
  phone?: string;
  oldPassword?: string;
  newPassword?: string;
  subscribe?: boolean;
}

export async function PATCH(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);

    if ("status" in authResult) return authResult;

    const user: User = authResult;
    const body: UpdateRequestBody = await req.json();
    const { username, email, phone, oldPassword, newPassword, subscribe } = body;

    // Password change
    if (newPassword) {
      if (!oldPassword) {
        return NextResponse.json(
          { error: "Old password is required to change password" },
          { status: 400 }
        );
      }

      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: email ?? user.email!,
          password: oldPassword,
        });

      if (signInError || !signInData.session) {
        return NextResponse.json({ error: "Old password is incorrect" }, { status: 400 });
      }

      const { error: pwError } = await supabase.auth.admin.updateUserById(user.id, {
        password: newPassword,
      });

      if (pwError) {
        return NextResponse.json({ error: pwError.message }, { status: 400 });
      }
    }

    // Update other profile fields
    const { rows } = await pool.query(
      `UPDATE users SET
        username = COALESCE($1, username),
        email = COALESCE($2, email),
        phone = COALESCE($3, phone),
        subscribed = COALESCE($4, subscribed)
       WHERE user_id = $5
       RETURNING user_id, username, email, phone, subscribed`,
      [username, email, phone, subscribe, user.id]
    );

    if (!rows[0]) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      user: rows[0],
    });
  } catch (err: unknown) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Server error";
    const status = message.includes("Unauthorized") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
