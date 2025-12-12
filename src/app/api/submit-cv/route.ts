import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import pool from "@/lib/db";

// Optional: mark the route as dynamic (recommended for file uploads)
export const dynamic = "force-dynamic";

// Utility to sanitize filenames
function sanitizeFileName(name: string): string {
  return name.replace(/[^a-z0-9_\-]/gi, "_");
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const fullName = formData.get("name")?.toString() || "";
    const email = formData.get("email")?.toString() || "";
    const position = formData.get("position")?.toString() || "";

    const cvFile = formData.get("cv") as File | null;
    if (!cvFile) {
      return NextResponse.json(
        { message: "CV file is required" },
        { status: 400 }
      );
    }

    // Read file data
    const arrayBuffer = await cvFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create uploads folder if missing
    const uploadDir = path.join(process.cwd(), "/public/uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    // Save file with unique, safe name
    const ext = path.extname(cvFile.name || ".pdf");
    const safeName = sanitizeFileName(fullName) + "_" + Date.now() + ext;
    const filePath = path.join(uploadDir, safeName);
    fs.writeFileSync(filePath, buffer);

    // Insert into PostgreSQL
    const query = `
      INSERT INTO career_applications (full_name, email, position, cv_filename)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;
    const result = await pool.query(query, [fullName, email, position, safeName]);

    return NextResponse.json({
      message: "CV submitted successfully",
      applicationId: result.rows[0].id,
      file: safeName,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Error uploading CV" }, { status: 500 });
  }
}
