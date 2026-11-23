import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "csv";
    const dept = searchParams.get("dept");
    const stage = searchParams.get("stage");

    let sql = `SELECT * FROM google_sheets_sync_view WHERE 1=1`;
    const params: any[] = [];

    if (dept && dept !== "All") {
      params.push(dept);
      sql += ` AND "Department" = $${params.length}`;
    }

    if (stage && stage !== "All") {
      params.push(stage);
      sql += ` AND "Current Hiring Stage" = $${params.length}`;
    }

    sql += ` ORDER BY "Applied At (IST)" DESC;`;

    const rows = await query(sql, params);

    // Return JSON if requested
    if (format.toLowerCase() === "json") {
      return NextResponse.json({
        success: true,
        count: rows.length,
        department: dept || "All",
        data: rows,
      });
    }

    // Default: Return RFC 4180 formatted CSV for Google Sheets =IMPORTDATA(...)
    if (rows.length === 0) {
      return new NextResponse("No data available", {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
        },
      });
    }

    const headers = Object.keys(rows[0]);

    // Escape CSV cell according to RFC 4180
    const escapeCsv = (val: any): string => {
      if (val === null || val === undefined) return "";
      const str = String(val);
      if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvLines = [
      headers.map(escapeCsv).join(","),
      ...rows.map((row) => headers.map((h) => escapeCsv(row[h])).join(",")),
    ];

    // UTF-8 BOM ensures non-English characters & symbols (e.g. ₹) render cleanly
    const csvContent = "\uFEFF" + csvLines.join("\r\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="tbm_applicants_${dept ? dept.replace(/\s+/g, "_") : "all"}.csv"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (err: any) {
    console.error("Sheets sync error:", err);
    return NextResponse.json(
      { error: "Database error querying sheets view", details: err.message },
      { status: 500 }
    );
  }
}
