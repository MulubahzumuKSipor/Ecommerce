import { NextResponse } from "next/server";
import pool from "@/lib/db"; // Your PostgreSQL pool helper

type ContactMessage = {
  name: string;
  email: string;
  subject?: string;
  message: string;
};

export async function POST(req: Request) {
  try {
    const { name, email, subject, message }: ContactMessage = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ message: "Name, email, and message are required." }, { status: 400 });
    }

    const sql = `
      INSERT INTO contact_messages (name, email, subject, message)
      VALUES ($1, $2, $3, $4)
      RETURNING id, created_at;
    `;

    const values = [name, email, subject || null, message];

    const result = await pool.query(sql, values);

    return NextResponse.json({
      message: "Message submitted successfully.",
      id: result.rows[0].id,
      created_at: result.rows[0].created_at
    }, { status: 201 });

  } catch (error) {
    console.error("Error saving contact message:", error);
    return NextResponse.json({ message: "Failed to save message." }, { status: 500 });
  }
}
