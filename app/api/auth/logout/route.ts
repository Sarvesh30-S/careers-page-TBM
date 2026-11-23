import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("tbm_team_session");

    if (sessionCookie && sessionCookie.value) {
      await query(`DELETE FROM team_sessions WHERE id = $1`, [sessionCookie.value]);
    }

    const response = NextResponse.json({ success: true, message: "Signed out successfully" });
    response.cookies.delete("tbm_team_session");
    return response;
  } catch (err: any) {
    console.error("Logout error:", err);
    const response = NextResponse.json({ success: true });
    response.cookies.delete("tbm_team_session");
    return response;
  }
}
