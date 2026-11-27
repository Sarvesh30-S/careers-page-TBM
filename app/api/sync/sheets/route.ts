import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getGoogleSheetWebhookUrl } from "@/lib/googleSheets";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "csv";
    const dept = searchParams.get("dept");
    const stage = searchParams.get("stage");

    let sql = `SELECT * FROM google_sheets_sync_view WHERE 1=1`;
    const params: any[] = [];

    if (dept && dept !== "All") {
      params.push(`%${dept.trim()}%`);
      sql += ` AND "Department" ILIKE $${params.length}`;
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
    let headers: string[] = [];
    if (rows.length > 0) {
      headers = Object.keys(rows[0]);
    } else {
      // Query column names from view so empty department tabs still display clean headers
      const colRes = await query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'google_sheets_sync_view' 
        ORDER BY ordinal_position;
      `);
      headers = colRes.map((c: any) => c.column_name);
    }

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

    // UTF-8 BOM ensures non-English characters & symbols (e.g. ₹) render cleanly in Google Sheets
    const csvContent = "\uFEFF" + csvLines.join("\r\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="tbm_applicants_${dept ? dept.replace(/[^a-zA-Z0-9]/g, "_") : "master"}.csv"`,
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action || "push_all";

    if (action === "save_webhook") {
      const webhookUrl = (body.url || "").trim();
      await query(
        `
        INSERT INTO app_settings (key, value, updated_at)
        VALUES ('google_sheet_webhook_url', to_jsonb($1::text), CURRENT_TIMESTAMP)
        ON CONFLICT (key) DO UPDATE
        SET value = to_jsonb($1::text), updated_at = CURRENT_TIMESTAMP;
      `,
        [webhookUrl]
      );
      return NextResponse.json({ success: true, webhookUrl });
    }

    if (action === "get_webhook") {
      const webhookUrl = await getGoogleSheetWebhookUrl();
      return NextResponse.json({ success: true, webhookUrl });
    }

    if (action === "push_all") {
      const webhookUrl = await getGoogleSheetWebhookUrl();
      if (!webhookUrl) {
        return NextResponse.json(
          { error: "No Google Sheet Webhook URL configured" },
          { status: 400 }
        );
      }

      // Fetch all applicants from view
      const rows = await query(
        `SELECT * FROM google_sheets_sync_view ORDER BY "Applied At (IST)" ASC;`
      );

      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bulk_sync",
          timestamp: new Date().toISOString(),
          total: rows.length,
          rows,
        }),
      });

      if (!res.ok) {
        return NextResponse.json(
          { error: `Webhook responded with status ${res.status}` },
          { status: 502 }
        );
      }

      return NextResponse.json({ success: true, syncedCount: rows.length });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    console.error("Sheets sync POST error:", err);
    return NextResponse.json(
      { error: "Failed to process sheets sync action", details: err.message },
      { status: 500 }
    );
  }
}
