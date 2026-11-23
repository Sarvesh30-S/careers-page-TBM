import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";

// GET /api/applicants - Fetch applicants with optional filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dept = searchParams.get("dept");
    const stage = searchParams.get("stage");
    const role = searchParams.get("role");

    let sql = `
      SELECT 
        id, ref, name, email, phone, age, gender, city, mumbai,
        role, dept, stage, applied_at as "appliedAt",
        total, rel, ctc, ectc, notice, buyout, joining, negotiable,
        lastco, lastdes, langs, resume_url as "resumeUrl", resume_name as "resumeName",
        portfolio, linkedin, instagram, why, admire, problem, source, referral,
        score, notes, ai_summary as "aiSummary", ai_rationale as "aiRationale",
        custom, rej_at as "rejAt", hired_at as "hiredAt", hired_after as "hiredAfter",
        updated_at as "updatedAt"
      FROM applicants
      WHERE 1=1
    `;
    const params: any[] = [];

    if (dept && dept !== "All") {
      params.push(dept);
      sql += ` AND dept = $${params.length}`;
    }

    if (stage && stage !== "All") {
      params.push(stage);
      sql += ` AND stage = $${params.length}`;
    }

    if (role) {
      params.push(role);
      sql += ` AND role = $${params.length}`;
    }

    sql += ` ORDER BY applied_at DESC;`;

    const rows = await query(sql, params);

    return NextResponse.json({
      success: true,
      count: rows.length,
      applicants: rows,
    });
  } catch (err: any) {
    console.error("GET /api/applicants error:", err);
    return NextResponse.json(
      { error: "Database error fetching applicants", details: err.message },
      { status: 500 }
    );
  }
}

// PATCH /api/applicants - Update applicant stage, notes, or score
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, stage, note, score, aiSummary, aiRationale } = body;

    if (!id) {
      return NextResponse.json({ error: "Applicant id is required" }, { status: 400 });
    }

    // Check applicant exists
    const existing = await queryOne(`SELECT * FROM applicants WHERE id = $1;`, [id]);
    if (!existing) {
      return NextResponse.json({ error: "Applicant not found" }, { status: 404 });
    }

    const updates: string[] = ["updated_at = CURRENT_TIMESTAMP"];
    const params: any[] = [id];

    if (stage) {
      params.push(stage);
      updates.push(`stage = $${params.length}`);

      if (stage === "Hired") {
        updates.push(`hired_at = CURRENT_TIMESTAMP`);
      }
    }

    if (score) {
      params.push(JSON.stringify(score));
      updates.push(`score = $${params.length}`);
    }

    if (aiSummary !== undefined) {
      params.push(aiSummary);
      updates.push(`ai_summary = $${params.length}`);
    }

    if (aiRationale !== undefined) {
      params.push(aiRationale);
      updates.push(`ai_rationale = $${params.length}`);
    }

    if (note) {
      // Append note to JSONB array
      const newNote = {
        text: note.text || String(note),
        by: note.by || "Team Member",
        at: new Date().toISOString(),
      };
      params.push(JSON.stringify(newNote));
      updates.push(`notes = COALESCE(notes, '[]'::jsonb) || $${params.length}::jsonb`);
    }

    const updateSql = `
      UPDATE applicants
      SET ${updates.join(", ")}
      WHERE id = $1
      RETURNING *;
    `;

    const updated = await queryOne(updateSql, params);

    return NextResponse.json({
      success: true,
      applicant: updated,
    });
  } catch (err: any) {
    console.error("PATCH /api/applicants error:", err);
    return NextResponse.json(
      { error: "Database error updating applicant", details: err.message },
      { status: 500 }
    );
  }
}
