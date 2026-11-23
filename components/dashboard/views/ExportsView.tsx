"use client";

import React, { useState } from "react";
import { Applicant, Role, DashboardRolePermission } from "@/types";
import { csvOf } from "@/lib/dashboard";

interface ExportsViewProps {
  applicants: Applicant[];
  roles: Role[];
  permission: DashboardRolePermission;
  onResetSampleData?: () => void;
  onToast: (msg: string) => void;
}

export const ExportsView: React.FC<ExportsViewProps> = ({
  applicants,
  roles,
  permission,
  onResetSampleData,
  onToast,
}) => {
  const scopedApps = permission.scope
    ? applicants.filter((a) => {
        const r = roles.find((x) => x.id === a.role);
        return r?.dept === permission.scope || a.dept === permission.scope;
      })
    : applicants;

  const csvContent = csvOf(scopedApps, roles, permission.hidePay);

  const handleCopyCsv = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(csvContent);
      onToast("CSV copied to clipboard.");
    }
  };

  return (
    <div>
      <h1>Exports</h1>
      <p className="dsub">Take the data where you work.</p>

      <div className="cols" style={{ marginTop: 0 }}>
        {/* CSV Block */}
        <div className="blk">
          <h2>CSV</h2>
          <p className="so">
            {scopedApps.length} applicants, all columns. Copy, then paste into
            Sheets or Excel.
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
            onClick={handleCopyCsv}
          >
            Copy CSV
          </button>
        </div>

        {/* Google Sheet Sync Block */}
        <div className="blk">
          <h2>Google Sheet sync</h2>
          <p className="so">Direct endpoint &amp; formula ready.</p>
          <p>
            In this build, every new application is saved directly to your
            PostgreSQL database and available via the live sync endpoint:
          </p>
          <div
            style={{
              background: "var(--soft)",
              padding: "12px 16px",
              borderRadius: "8px",
              margin: "12px 0",
              fontFamily: "ui-monospace, monospace",
              fontSize: "13px",
              wordBreak: "break-all",
            }}
          >
            =IMPORTDATA(&quot;{typeof window !== "undefined" ? window.location.origin : ""}/api/sync/sheets&quot;)
          </div>
          <p className="note" style={{ marginTop: "10px" }}>
            Paste this formula into cell A1 of your Google Sheet to pull live candidate data.
          </p>

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
      </div>
    </div>
  );
};

export default ExportsView;
