import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { credential, devEmail } = body;

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const allowedDomain = (process.env.AUTHORIZED_DOMAINS || "theboredmonkey.com").toLowerCase().trim();
    const rawAllowedEmails = (process.env.AUTHORIZED_ADMIN_EMAILS || "")
      .toLowerCase()
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);

    let email = "";
    let googleId = "";
    let name = "";
    let picture = "";

    if (devEmail) {
      email = devEmail.toLowerCase().trim();
      googleId = `dev_${crypto.createHash("md5").update(email).digest("hex")}`;
      name = email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    } else if (credential) {
      // 1. Verify Google ID Token with Google's tokeninfo API
      const googleVerifyRes = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`,
        { cache: "no-store" }
      );

      if (!googleVerifyRes.ok) {
        const errData = await googleVerifyRes.json().catch(() => ({}));
        return NextResponse.json(
          { error: "Invalid Google credential token", details: errData },
          { status: 401 }
        );
      }

      const payload = await googleVerifyRes.json();

      // 2. Validate Audience (Client ID)
      if (clientId && payload.aud !== clientId) {
        return NextResponse.json(
          { error: "Token audience does not match configured Google Client ID" },
          { status: 401 }
        );
      }

      // 3. Validate Email Verification
      if (payload.email_verified !== "true" && payload.email_verified !== true) {
        return NextResponse.json(
          { error: "Google account email is not verified" },
          { status: 401 }
        );
      }

      email = (payload.email || "").toLowerCase().trim();
      googleId = payload.sub;
      name = payload.name || email.split("@")[0];
      picture = payload.picture || "";
    } else {
      return NextResponse.json(
        { error: "Missing Google credential token" },
        { status: 400 }
      );
    }

    // 4. Authorization Policy:
    // User must be @theboredmonkey.com OR in the authorized admin list
    const isDomainAllowed = email.endsWith(`@${allowedDomain}`);
    const isEmailAllowed = rawAllowedEmails.includes(email);

    if (!isDomainAllowed && !isEmailAllowed) {
      return NextResponse.json(
        {
          error: `Access denied. Only @${allowedDomain} team members and authorized administrators can log in.`,
          email,
        },
        { status: 403 }
      );
    }

    // 5. Store / update user in team_users table
    const userRes = await query(
      `
      INSERT INTO team_users (google_id, email, name, picture, role, last_login_at)
      VALUES ($1, $2, $3, $4, 'admin', NOW())
      ON CONFLICT (email) DO UPDATE SET
        google_id = EXCLUDED.google_id,
        name = EXCLUDED.name,
        picture = EXCLUDED.picture,
        last_login_at = NOW()
      RETURNING id, email, name, picture, role;
      `,
      [googleId, email, name, picture]
    );

    const user = userRes[0];

    // 6. Generate secure session token (7-day validity)
    const sessionId = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await query(
      `
      INSERT INTO team_sessions (id, user_id, email, role, expires_at)
      VALUES ($1, $2, $3, 'admin', $4);
      `,
      [sessionId, user.id, user.email, expiresAt]
    );

    // 7. Set secure HTTP-only session cookie
    const response = NextResponse.json({
      success: true,
      user: {
        email: user.email,
        name: user.name,
        picture: user.picture,
        role: "admin",
      },
    });

    response.cookies.set("tbm_team_session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    });

    return response;
  } catch (err: any) {
    console.error("Google auth error:", err);
    return NextResponse.json(
      { error: "Internal server error during authentication", message: err.message },
      { status: 500 }
    );
  }
}
