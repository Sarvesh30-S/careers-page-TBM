import { query } from "@/lib/db";

export interface ApplicantSyncPayload {
  ref: string;
  applied_at: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  mumbai: string;
  dept: string;
  role_title: string;
  stage: string;
  notice: string;
  joining?: string | null;
  buyout?: string | null;
  total_exp: number;
  rel_exp: number;
  ctc: number;
  ectc: number;
  negotiable?: string | null;
  lastco?: string | null;
  lastdes?: string | null;
  langs?: string;
  resume_name?: string | null;
  resume_url?: string | null;
  portfolio?: string | null;
  linkedin?: string | null;
  instagram?: string | null;
  why?: string | null;
  admire?: string | null;
  problem?: string | null;
  source?: string;
  referral?: string | null;
  craft?: number;
  thinking?: number;
  culture?: number;
  speed?: number;
  notes?: string;
}

/**
 * Get the Google Sheets Webhook URL from environment variables or database app_settings.
 */
export async function getGoogleSheetWebhookUrl(): Promise<string | null> {
  if (process.env.GOOGLE_SHEET_WEBHOOK_URL) {
    return process.env.GOOGLE_SHEET_WEBHOOK_URL.trim();
  }
  try {
    const res = await query(
      "SELECT value FROM app_settings WHERE key = 'google_sheet_webhook_url' LIMIT 1;"
    );
    if (res.length > 0 && res[0].value) {
      const val = res[0].value;
      if (typeof val === "string") return val.trim();
      if (val.url) return String(val.url).trim();
    }
  } catch (err) {
    console.error("Error fetching google_sheet_webhook_url from settings:", err);
  }
  return null;
}

/**
 * Real-time push: Asynchronously appends the applicant row to the Master Google Sheet
 * and the specific category tab (e.g. Creative Team, Influencer Relations) via webhook.
 */
export async function syncApplicantToGoogleSheets(
  applicant: ApplicantSyncPayload
): Promise<boolean> {
  try {
    const webhookUrl = await getGoogleSheetWebhookUrl();
    if (!webhookUrl) {
      // No webhook configured yet; =IMPORTDATA(...) pulls continuously from /api/sync/sheets
      return false;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "new_applicant",
        timestamp: new Date().toISOString(),
        applicant,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`Google Sheet webhook returned status ${res.status}`);
      return false;
    }

    return true;
  } catch (err: any) {
    console.error("Failed to push applicant to Google Sheet webhook:", err?.message || err);
    return false;
  }
}
