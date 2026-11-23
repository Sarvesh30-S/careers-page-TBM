import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("tbm_team_session");

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const sessionId = sessionCookie.value;

    const sessionRes = await query(
      `
      SELECT s.id, s.email, s.role, s.expires_at, u.name, u.picture
      FROM team_sessions s
      JOIN team_users u ON s.user_id = u.id
      WHERE s.id = $1 AND s.expires_at > NOW();
      `,
      [sessionId]
    );

    if (sessionRes.length === 0) {
      // Session expired or invalid
      const response = NextResponse.json({ authenticated: false, user: null });
      response.cookies.delete("tbm_team_session");
      return response;
    }

    const session = sessionRes[0];

    return NextResponse.json({
      authenticated: true,
      user: {
        email: session.email,
        name: session.name,
        picture: session.picture,
        role: "admin", // Everyone is Admin per requirement
      },
    });
  } catch (err: any) {
    console.error("Session check error:", err);
    return NextResponse.json(
      { error: "Internal server error checking session", message: err.message },
      { status: 500 }
    );
  }
}
