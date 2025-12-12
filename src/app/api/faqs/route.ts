import { NextResponse } from "next/server";
import pool from "@/lib/db"; // Your PostgreSQL pool helper

type FAQ = {
  id: number;
  category: string;
  question: string;
  answer: string;
};

export async function GET() {
  try {
    const sql = `
      SELECT id, category, question, answer
      FROM faqs
      WHERE is_active = TRUE
      ORDER BY category, created_at DESC;
    `;
    const result = await pool.query(sql);
    const faqs: FAQ[] = result.rows;
    return NextResponse.json(faqs, { status: 200 });
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return NextResponse.json({ message: "Failed to fetch FAQs." }, { status: 500 });
  }
}
