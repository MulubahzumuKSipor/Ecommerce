import { NextRequest, NextResponse } from "next/server";
import { createClient, User } from "@supabase/supabase-js";

// Ensure you are using the service role key with admin privileges (SUPABASE_SERVICE_ROLE_KEY or similar).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ROLE!; // Use your service role key

// Initialize Supabase client (server-side only)
const supabase = createClient(supabaseUrl, supabaseKey);

interface ResendRequestBody {
  email: string;
}

interface ApiResponse {
  message?: string;
  error?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: ResendRequestBody = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json<ApiResponse>({ error: "Email is required" }, { status: 400 });
    }

    // 1. Find the user by email using the Admin API
    // IMPORTANT: Supabase admin.listUsers uses a 'filter' property.
    // We suppress the 'any' warning here because the local type definitions for listUsers
    // appear to be missing the 'filter' property required for filtering by email.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filterOptions: any = {
      filter: `email eq '${email}'`
    };

    const { data: userData, error: listError } = await supabase.auth.admin.listUsers(filterOptions);

    if (listError) {
      console.error("Supabase List Error:", listError);
      return NextResponse.json<ApiResponse>({ error: "Database search failed." }, { status: 500 });
    }

    // Check if user exists
    if (!userData.users.length) {
      // Return a generic success message to prevent user enumeration
      return NextResponse.json<ApiResponse>({ message: "If an account exists, a verification link has been sent." });
    }

    const user: User = userData.users[0];

    // 2. Resend verification email by updating the user's email_confirm status
    // Setting email_confirm to false forces Supabase to send a new confirmation email.
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, { email_confirm: false });

    if (updateError) {
      console.error("Supabase Update Error:", updateError);
      return NextResponse.json<ApiResponse>({ error: updateError.message }, { status: 400 });
    }

    // 3. Success response
    return NextResponse.json<ApiResponse>({ message: "Verification email resent. Check your inbox (and spam folder)." });
  } catch (err: unknown) {
    console.error("API Route Catch Error:", err);

    const message = err instanceof Error ? err.message : "An unexpected server error occurred.";
    return NextResponse.json<ApiResponse>({ error: message }, { status: 500 });
  }
}