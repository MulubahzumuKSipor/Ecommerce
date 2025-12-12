// /app/api/jobs/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db"; // Make sure this points to your PostgreSQL pool helper

// Type for a job record
type Job = {
  id: number;
  title: string;
  department: string;
  type: string;
  location: string;
};

/**
 * GET /api/jobs
 * Returns a list of active job opportunities
 */
export async function GET() {
  try {


    const sql = `
      SELECT id, title, department, type, location
      FROM jobs
      WHERE is_active = TRUE
      ORDER BY created_at DESC;
    `;

    const result = await pool.query(sql); // Using pool.query to fetch data

    const jobs: Job[] = result.rows as Job[];

    return NextResponse.json(jobs, { status: 200 });
  } catch (error) {
    console.error("Error fetching job opportunities:", error);
    return NextResponse.json(
      { message: "Failed to fetch career opportunities." },
      { status: 500 }
    );
  }
}
