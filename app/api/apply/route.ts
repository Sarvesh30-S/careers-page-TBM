import { NextRequest, NextResponse } from "next/server";
import pool, { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    if (!data.name || !data.email || !data.phone || !data.role) {
      return NextResponse.json(
        { error: "Missing required fields (name, email, phone, role)" },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // 1. Get and increment sequence counter
      const seqRes = await client.query(`
        UPDATE app_settings
        SET value = jsonb_set(
          value,
          '{seq}',
          to_jsonb(COALESCE((value->>'seq')::int, 0) + 1)
        ),
        updated_at = CURRENT_TIMESTAMP
        WHERE key = 'applicant_seq'
        RETURNING (value->>'seq')::int as new_seq;
      `);

      let seq = 1;
      if (seqRes.rows.length > 0 && seqRes.rows[0].new_seq) {
        seq = seqRes.rows[0].new_seq;
      }

      const now = new Date();
      const yy = String(now.getFullYear()).slice(-2);
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const ref = `TBM-${yy}${mm}-${String(seq).padStart(4, "0")}`;
      const id = data.id || "a" + Date.now();

      const num = (x: any) => (x === "" || x == null ? 0 : Number(x));

      const defaultScore = {
        Craft: Math.min(4, Math.max(1, Math.round(num(data.rel) || 2))),
        Thinking: 3,
        Culture: 3,
        Speed: 3,
      };

      const initialNotes = [
        {
          text: `Application received online for ${data.dept || data.role}.`,
          by: "Website",
          at: now.toISOString(),
        },
      ];

      // Fetch role details for clean department & title mapping (essential for Google Sheets sync)
      let dept = data.dept;
      let roleTitle = data.role_title;
      const roleInfo = await client.query(
        "SELECT title, dept FROM roles WHERE id = $1 LIMIT 1;",
        [data.role]
      );
      if (roleInfo.rows.length > 0) {
        if (!dept) dept = roleInfo.rows[0].dept;
        if (!roleTitle) roleTitle = roleInfo.rows[0].title;
      }
      if (!dept) dept = "Creative Team";
      if (!roleTitle) roleTitle = data.role;

      // 2. Insert applicant with full organized columns
      const insertRes = await client.query(
        `
        INSERT INTO applicants (
          id, ref, name, email, phone, age, gender, city, mumbai,
          role, role_title, dept, stage, applied_at, total, rel, ctc, ectc,
          notice, buyout, joining, negotiable, lastco, lastdes,
          langs, resume_url, resume_name, portfolio, linkedin, instagram,
          why, admire, problem, source, referral, consent,
          score, notes
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9,
          $10, $11, $12, 'New', CURRENT_TIMESTAMP, $13, $14, $15, $16,
          $17, $18, $19, $20, $21, $22,
          $23, $24, $25, $26, $27, $28,
          $29, $30, $31, $32, $33, $34,
          $35, $36
        )
        RETURNING id, ref, name, role_title, dept, stage, applied_at;
      `,
        [
          id,
          ref,
          data.name,
          data.email,
          data.phone,
          data.age ? Number(data.age) : null,
          data.gender || null,
          data.city,
          data.mumbai || "Yes",
          data.role,
          roleTitle,
          dept,
          num(data.total),
          num(data.rel),
          num(data.ctc),
          num(data.ectc),
          data.notice || "30 days",
          data.buyout || "No",
          data.joining || null,
          data.negotiable || null,
          data.lastco || null,
          data.lastdes || null,
          Array.isArray(data.langs) ? data.langs : [],
          data.resume_url || null,
          data.resume_name || null,
          data.portfolio || null,
          data.linkedin || null,
          data.instagram || null,
          data.why || null,
          data.admire || null,
          data.problem || null,
          data.source || "Website",
          data.referral || null,
          data.consent !== false,
          JSON.stringify(defaultScore),
          JSON.stringify(initialNotes),
        ]
      );

      await client.query("COMMIT");

      return NextResponse.json({
        success: true,
        applicant: insertRes.rows[0],
      });
    } catch (err: any) {
      await client.query("ROLLBACK");
      console.error("Failed to insert applicant:", err);
      return NextResponse.json(
        { error: "Database error saving application", details: err.message },
        { status: 500 }
      );
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error("Apply API error:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    );
  }
}
