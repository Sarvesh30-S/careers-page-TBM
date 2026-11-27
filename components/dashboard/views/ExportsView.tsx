"use client";

import React, { useState, useEffect } from "react";
import { Applicant, Role, DashboardRolePermission } from "@/types";
import { csvOf } from "@/lib/dashboard";
import { DEPTS } from "@/data/data";

interface ExportsViewProps {
  applicants: Applicant[];
  roles: Role[];
  permission: DashboardRolePermission;
  onResetSampleData?: () => void;
  onToast: (msg: string) => void;
}

const GOOGLE_APPS_SCRIPT_CODE = `/**
 * The Bored Monkey (TBM) - Continuous Real-Time Google Sheet Sync
 * 
 * INSTRUCTIONS:
 * 1. In your Google Sheet ("career page data"), go to: Extensions > Apps Script
 * 2. Delete any existing code, paste this entire code, and click Save (disk icon).
 * 3. (Optional) In the function dropdown at top, select "setupSheet" and click "Run"
 *    to instantly create and format all category tabs!
 * 4. To activate real-time web sync, click the blue "Deploy" button (top right) > "New deployment":
 *    - Type: "Web app"
 *    - Description: "TBM Applicant Sync"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone"
 * 5. Click "Deploy", copy the Web App URL, and paste it into your TBM Dashboard.
 */

const HEADERS = [
  "Reference ID", "Applied At (IST)", "Full Name", "Email Address", "Phone / WhatsApp",
  "Current City", "Open to Mumbai Office", "Department", "Role Title", "Current Hiring Stage",
  "Notice Period", "Earliest Joining Date", "Buyout Possible", "Total Experience (Years)",
  "Relevant Experience (Years)", "Current Monthly Pay (₹)", "Expected Monthly Pay (₹)",
  "Pay Negotiable", "Last Company", "Last Designation", "Languages", "Resume File Name",
  "Resume File URL", "Portfolio URL", "LinkedIn URL", "Instagram Handle", "Why TBM",
  "Admired Creator / Campaign", "Brand Problem Solution", "Source", "Referred By",
  "Craft Rating (1-4)", "Thinking Rating (1-4)", "Culture Rating (1-4)", "Speed Rating (1-4)",
  "Latest Note", "Last Updated (IST)"
];

const CATEGORIES = [
  "Creative Team",
  "Influencer Relations",
  "Brand Partnerships",
  "Brand Solutions",
  "Production",
  "Post-Production",
  "Talent Management",
  "Human Resources",
  "Finance"
];

/**
 * Click "Run" on this function to automatically create and format
 * the "career page data" tab and all category tabs with 1 click!
 */
function setupSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var master = getOrCreateSheet(ss, "career page data");

  CATEGORIES.forEach(function(cat) {
    getOrCreateSheet(ss, cat);
  });

  Logger.log("✅ Successfully initialized 'career page data' master tab and all category tabs!");
}

function getOrCreateSheet(a, b) {
  var ss = (a && typeof a.getSheetByName === "function") ? a : 
           (b && typeof b.getSheetByName === "function") ? b : 
           SpreadsheetApp.getActiveSpreadsheet();

  var sheetName = (typeof a === "string") ? a : 
                  (typeof b === "string") ? b : 
                  "career page data";

  var sheet = ss.getSheetByName(sheetName);
  if (!sheet && (sheetName === "career page data" || sheetName === "Master All Applicants")) {
    sheet = ss.getSheetByName("career page data") ||
            ss.getSheetByName("Career Page Data") ||
            ss.getSheetByName("Master") ||
            ss.getSheets()[0];
  }
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold").setBackground("#F4F4F6");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function applicantToRow(app) {
  return [
    app.ref || "",
    app.applied_at || Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyy-MM-dd HH:mm:ss"),
    app.name || "",
    app.email || "",
    app.phone || "",
    app.city || "",
    app.mumbai || "Yes",
    app.dept || "Creative Team",
    app.role_title || "",
    app.stage || "New",
    app.notice || "30 days",
    app.joining || "",
    app.buyout || "No",
    app.total_exp || 0,
    app.rel_exp || 0,
    app.ctc || 0,
    app.ectc || 0,
    app.negotiable || "",
    app.lastco || "",
    app.lastdes || "",
    app.langs || "",
    app.resume_name || "",
    app.resume_url || "",
    app.portfolio || "",
    app.linkedin || "",
    app.instagram || "",
    app.why || "",
    app.admire || "",
    app.problem || "",
    app.source || "Website",
    app.referral || "",
    app.craft || 3,
    app.thinking || 3,
    app.culture || 3,
    app.speed || 3,
    app.notes || "",
    Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyy-MM-dd HH:mm:ss")
  ];
}

function doPost(e) {
  try {
    var contents = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var master = getOrCreateSheet(ss, "career page data");

    if (contents.action === "new_applicant" && contents.applicant) {
      var row = applicantToRow(contents.applicant);
      master.appendRow(row);

      var categoryName = contents.applicant.dept || "General";
      var catSheet = getOrCreateSheet(ss, categoryName);
      catSheet.appendRow(row);

      return ContentService.createTextOutput(JSON.stringify({ status: "success", appended: 1 }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (contents.action === "bulk_sync" && Array.isArray(contents.rows)) {
      contents.rows.forEach(function(r) {
        var rowValues = Object.values(r);
        master.appendRow(rowValues);
        var dept = r["Department"] || "General";
        var catSheet = getOrCreateSheet(ss, dept);
        catSheet.appendRow(rowValues);
      });

      return ContentService.createTextOutput(JSON.stringify({ status: "success", count: contents.rows.length }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "ignored" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

export const ExportsView: React.FC<ExportsViewProps> = ({
  applicants,
  roles,
  permission,
  onResetSampleData,
  onToast,
}) => {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isSavingWebhook, setIsSavingWebhook] = useState(false);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [activeTab, setActiveTab] = useState<"formulas" | "webhook" | "csv">("formulas");

  const origin = typeof window !== "undefined" ? window.location.origin : "https://careers-page-tbm.vercel.app";

  useEffect(() => {
    fetch("/api/sync/sheets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "get_webhook" }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.webhookUrl) setWebhookUrl(d.webhookUrl);
      })
      .catch(() => {});
  }, []);

  const handleSaveWebhook = async () => {
    setIsSavingWebhook(true);
    try {
      const res = await fetch("/api/sync/sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save_webhook", url: webhookUrl }),
      });
      const data = await res.json();
      if (data.success) {
        onToast("Webhook URL saved. Continuous sync is now active!");
      } else {
        onToast("Failed to save webhook: " + (data.error || "Unknown error"));
      }
    } catch (e: any) {
      onToast("Error saving webhook: " + e.message);
    } finally {
      setIsSavingWebhook(false);
    }
  };

  const handleSyncAll = async () => {
    if (!webhookUrl) {
      onToast("Please save a Google Sheet Webhook URL first.");
      return;
    }
    setIsSyncingAll(true);
    try {
      const res = await fetch("/api/sync/sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "push_all" }),
      });
      const data = await res.json();
      if (data.success) {
        onToast(`Successfully synced ${data.syncedCount} applicants to Google Sheet!`);
      } else {
        onToast("Sync failed: " + (data.error || "Check your Webhook URL"));
      }
    } catch (e: any) {
      onToast("Error triggering sync: " + e.message);
    } finally {
      setIsSyncingAll(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      onToast(`${label} copied to clipboard.`);
    }
  };

  const scopedApps = permission.scope
    ? applicants.filter((a) => {
        const r = roles.find((x) => x.id === a.role);
        return r?.dept === permission.scope || a.dept === permission.scope;
      })
    : applicants;

  const csvContent = csvOf(scopedApps, roles, permission.hidePay);

  return (
    <div>
      <h1>Google Sheet Sync &amp; Exports</h1>
      <p className="dsub">
        Store all applicant data in one Master Google Sheet with dedicated category tabs, continuously synced in real time.
      </p>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", margin: "24px 0 16px" }}>
        <button
          type="button"
          className={`btn ${activeTab === "formulas" ? "primary" : "ghost"}`}
          onClick={() => setActiveTab("formulas")}
        >
          Google Sheet Formulas
        </button>
        <button
          type="button"
          className={`btn ${activeTab === "webhook" ? "primary" : "ghost"}`}
          onClick={() => setActiveTab("webhook")}
        >
          Continuous Real-Time Push (Apps Script)
        </button>
        <button
          type="button"
          className={`btn ${activeTab === "csv" ? "primary" : "ghost"}`}
          onClick={() => setActiveTab("csv")}
        >
          Raw CSV
        </button>
      </div>

      {/* TAB 1: Formulas */}
      {activeTab === "formulas" && (
        <div className="cols" style={{ marginTop: 0 }}>
          <div className="blk" style={{ gridColumn: "1 / -1" }}>
            <h2>Master Sheet Tab Formula</h2>
            <p className="so">
              Pulls all applicants across all categories directly from the database into cell A1. Google Sheets refreshes this continuously.
            </p>
            <div
              style={{
                background: "var(--soft)",
                padding: "14px 18px",
                borderRadius: "8px",
                margin: "12px 0",
                fontFamily: "ui-monospace, monospace",
                fontSize: "14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                border: "1px solid var(--border)",
              }}
            >
              <code>=IMPORTDATA(&quot;{origin}/api/sync/sheets&quot;)</code>
              <button
                type="button"
                className="btn primary"
                style={{ fontSize: "12px", padding: "6px 14px" }}
                onClick={() =>
                  copyToClipboard(
                    `=IMPORTDATA("${origin}/api/sync/sheets")`,
                    "Master sheet formula"
                  )
                }
              >
                Copy Formula
              </button>
            </div>
            <p className="note">
              In your Google Sheet tab named <strong>career page data</strong>, click cell <strong>A1</strong> and paste this formula.
            </p>

            <h2 style={{ marginTop: "32px" }}>Category Tabs (Filtered Views)</h2>
            <p className="so">
              Create separate tabs in the same Google Sheet for each job category (Creative, Influencer, Brand Partnerships, etc.).
            </p>

            <div style={{ overflowX: "auto", marginTop: "12px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "var(--soft)", borderBottom: "1px solid var(--border)" }}>
                    <th style={{ textAlign: "left", padding: "10px 14px" }}>Tab Name</th>
                    <th style={{ textAlign: "left", padding: "10px 14px" }}>Method A: Master Tab Filter</th>
                    <th style={{ textAlign: "left", padding: "10px 14px" }}>Method B: Direct Category Sync</th>
                    <th style={{ textAlign: "right", padding: "10px 14px" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {DEPTS.map((dept) => {
                    const encoded = encodeURIComponent(dept);
                    const masterFilter = `=QUERY('career page data'!A:AK, "SELECT * WHERE Col8 = '${dept}'", 1)`;
                    const directUrl = `=IMPORTDATA("${origin}/api/sync/sheets?dept=${encoded}")`;
                    return (
                      <tr key={dept} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "12px 14px", fontWeight: 600 }}>{dept}</td>
                        <td style={{ padding: "12px 14px", fontFamily: "ui-monospace, monospace", color: "var(--muted)" }}>
                          <code>{masterFilter}</code>
                        </td>
                        <td style={{ padding: "12px 14px", fontFamily: "ui-monospace, monospace", color: "var(--muted)" }}>
                          <code>{directUrl}</code>
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "right" }}>
                          <button
                            type="button"
                            className="btn ghost"
                            style={{ fontSize: "11px", padding: "4px 10px" }}
                            onClick={() => copyToClipboard(masterFilter, `${dept} filter formula`)}
                          >
                            Copy Formula
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Continuous Real-Time Webhook Push */}
      {activeTab === "webhook" && (
        <div className="cols" style={{ marginTop: 0 }}>
          <div className="blk" style={{ gridColumn: "1 / -1" }}>
            <h2>Continuous Real-Time Push (Google Apps Script)</h2>
            <p className="so">
              Instantly appends new candidates to the Master tab AND their respective category tab the exact moment they apply online.
            </p>

            <div style={{ margin: "20px 0" }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: "8px" }}>
                Google Sheet Web App Webhook URL:
              </label>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/.../exec"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    borderRadius: "6px",
                    border: "1px solid var(--border)",
                    background: "var(--soft)",
                    fontSize: "14px",
                    fontFamily: "ui-monospace, monospace",
                  }}
                />
                <button
                  type="button"
                  className="btn primary"
                  disabled={isSavingWebhook}
                  onClick={handleSaveWebhook}
                >
                  {isSavingWebhook ? "Saving..." : "Save Webhook"}
                </button>
                <button
                  type="button"
                  className="btn ghost"
                  disabled={isSyncingAll || !webhookUrl}
                  onClick={handleSyncAll}
                >
                  {isSyncingAll ? "Syncing..." : "Sync All DB Applicants Now"}
                </button>
              </div>
              <p className="note" style={{ marginTop: "6px" }}>
                Once saved, every new application submitted on your website immediately pushes to your Google Sheet in the background.
              </p>
            </div>

            <div style={{ marginTop: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <h3 style={{ margin: 0 }}>Google Apps Script Code (Copy &amp; Paste in 1 minute)</h3>
                <button
                  type="button"
                  className="btn ghost"
                  style={{ fontSize: "12px", padding: "4px 12px" }}
                  onClick={() => copyToClipboard(GOOGLE_APPS_SCRIPT_CODE, "Google Apps Script code")}
                >
                  Copy Script
                </button>
              </div>
              <ol style={{ paddingLeft: "20px", fontSize: "14px", lineHeight: "1.6", color: "var(--muted)" }}>
                <li>Open your Google Sheet and click <strong>Extensions &gt; Apps Script</strong>.</li>
                <li>Clear the editor, paste the script below, and click <strong>Save</strong>.</li>
                <li>Click <strong>Deploy &gt; New deployment</strong>. Choose <strong>Web app</strong>.</li>
                <li>Set <em>Execute as:</em> <strong>Me</strong> and <em>Who has access:</em> <strong>Anyone</strong>.</li>
                <li>Click <strong>Deploy</strong>, copy the Web App URL, and paste it into the field above!</li>
              </ol>

              <textarea
                readOnly
                value={GOOGLE_APPS_SCRIPT_CODE}
                style={{
                  width: "100%",
                  minHeight: "260px",
                  font: "12px/1.5 ui-monospace, Menlo, monospace",
                  padding: "12px",
                  borderRadius: "6px",
                  border: "1px solid var(--border)",
                  background: "var(--soft)",
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Raw CSV */}
      {activeTab === "csv" && (
        <div className="cols" style={{ marginTop: 0 }}>
          <div className="blk" style={{ gridColumn: "1 / -1" }}>
            <h2>Raw CSV Export</h2>
            <p className="so">
              {scopedApps.length} applicants, all columns. Copy, then paste into Sheets or Excel.
            </p>
            <textarea
              readOnly
              style={{
                minHeight: "220px",
                font: "13px/1.5 ui-monospace, Menlo, monospace",
                width: "100%",
              }}
              aria-label="CSV export"
              value={csvContent}
            />
            <button
              className="btn primary"
              type="button"
              data-copycsv
              style={{ marginTop: "12px" }}
              onClick={() => copyToClipboard(csvContent, "CSV")}
            >
              Copy CSV
            </button>
          </div>
        </div>
      )}

      {onResetSampleData && (
        <div style={{ marginTop: "40px" }}>
          <h2>Sample data</h2>
          <p className="so">
            Bring back the starting applicants, roles and form if you want to test with demo data.
          </p>
          <button
            className="btn ghost"
            type="button"
            data-reset
            onClick={onResetSampleData}
          >
            Reset sample data
          </button>
        </div>
      )}
    </div>
  );
};

export default ExportsView;

