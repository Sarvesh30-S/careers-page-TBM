"use client";

import React, { useState, useEffect } from "react";
import { Applicant, Role, ApplicationStage } from "@/types";
import { STAGES } from "@/data/data";
import { fitOf, summaryOf, emailOf, formatMonthly } from "@/lib/dashboard";

interface ApplicantDrawerProps {
  applicant: Applicant | null;
  roles: Role[];
  hidePay?: boolean;
  onClose: () => void;
  onUpdateStage: (applicant: Applicant, stage: ApplicationStage) => void;
  onUpdateScore: (applicant: Applicant, score: Record<string, number>) => void;
  onAddNote: (applicant: Applicant, noteText: string) => void;
  onToast: (msg: string) => void;
}

const SC = [
  "Logic",
  "First principles",
  "Second-order thinking",
  "Mental models",
  "Creative",
  "Judgment",
  "People & ownership",
];

export const ApplicantDrawer: React.FC<ApplicantDrawerProps> = ({
  applicant,
  roles,
  hidePay,
  onClose,
  onUpdateStage,
  onUpdateScore,
  onAddNote,
  onToast,
}) => {
  const [newNoteText, setNewNoteText] = useState<string>("");
  const [emailDraft, setEmailDraft] = useState<string>("");
  const [aiSummary, setAiSummary] = useState<string>("");
  const [aiRationale, setAiRationale] = useState<string>("");

  useEffect(() => {
    if (applicant) {
      setNewNoteText("");
      setEmailDraft("");
      setAiSummary(applicant.ai?.summary || summaryOf(applicant, hidePay));
      const fit = fitOf(applicant, roles);
      setAiRationale(applicant.ai?.rationale || fit.why.join("\n"));
    }
  }, [applicant, hidePay, roles]);

  if (!applicant) return null;

  const r = roles.find((x) => x.id === applicant.role);
  const roleTitle = r?.title || applicant.roleTitle || applicant.role;
  const deptTitle = r?.dept || applicant.dept || "General";
  const fitResult = fitOf(applicant, roles);
  const scores = applicant.score || {};

  const handleScoreClick = (comp: string, val: number) => {
    const updated = { ...scores, [comp]: val };
    onUpdateScore(applicant, updated);
  };

  const handleAddNoteClick = () => {
    if (!newNoteText.trim()) return;
    onAddNote(applicant, newNoteText.trim());
    setNewNoteText("");
  };

  const handleStageSelect = (newStage: ApplicationStage) => {
    if (newStage !== applicant.stage) {
      onUpdateStage(applicant, newStage);
    }
  };

  const handleGenerateEmail = (kind: "invite" | "reject") => {
    const text = emailOf(applicant, kind, roles);
    setEmailDraft(text);
  };

  const fmtD = (iso?: string): string => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  const fmtT = (iso?: string): string => {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const detailRows: [string, string][] = [
    ["Email", applicant.email],
    ["Phone", applicant.phone],
    ["City", applicant.city],
    ["Open to Mumbai", applicant.mumbai || "Yes"],
    ["Experience", `${applicant.total} yrs (${applicant.rel} relevant)`],
    [
      "Last role",
      [applicant.lastdes, applicant.lastco].filter(Boolean).join(", ") || "—",
    ],
    [
      "Notice",
      `${applicant.notice || "30 days"}${
        applicant.buyout === "Yes" ? ", buyout possible" : ""
      }`,
    ],
    ...(hidePay
      ? []
      : [
          [
            "Pay",
            applicant.ctc
              ? `${formatMonthly(applicant.ctc)} now → ${formatMonthly(
                  applicant.ectc
                )} expected${
                  applicant.negotiable === "Yes" ? ", negotiable" : ""
                }`
              : `${formatMonthly(applicant.ectc)} expected`,
          ] as [string, string],
        ]),
    ["Languages", (applicant.langs || []).join(", ") || "—"],
    [
      "Source",
      (applicant.source || "Website") +
        (applicant.referral ? `, via ${applicant.referral}` : ""),
    ],
    ["Applied", fmtD(applicant.applied || applicant.appliedAt)],
  ];

  return (
    <>
      <div className="scrim on" onClick={onClose} />
      <aside
        className="drawer panel on"
        role="dialog"
        aria-modal="true"
        aria-label="Applicant profile"
      >
        <div className="dh">
          <div>
            <b>{applicant.name}</b>
            <div className="small muted">
              {roleTitle} · {deptTitle}
            </div>
          </div>
          <button
            className="x"
            type="button"
            data-close="drawer"
            aria-label="Close profile"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="db">
          {/* Details Grid */}
          <dl className="pgrid">
            {detailRows
              .filter((x) => x[1])
              .map(([k, val]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{val}</dd>
                </div>
              ))}
          </dl>

          {/* Links and Resume */}
          <h4>Links and resume</h4>
          <p style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            {applicant.portfolio && (
              <a
                href={
                  /^https?:/i.test(applicant.portfolio)
                    ? applicant.portfolio
                    : `https://${applicant.portfolio}`
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                Portfolio
              </a>
            )}
            {applicant.linkedin && (
              <a
                href={
                  /^https?:/i.test(applicant.linkedin)
                    ? applicant.linkedin
                    : `https://${applicant.linkedin}`
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
            )}
            {applicant.instagram && (
              <a
                href={
                  /^https?:/i.test(applicant.instagram)
                    ? applicant.instagram
                    : `https://instagram.com/${applicant.instagram.replace(
                        "@",
                        ""
                      )}`
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram
              </a>
            )}
            {!applicant.portfolio &&
              !applicant.linkedin &&
              !applicant.instagram && (
                <span className="muted">No links shared.</span>
              )}
          </p>

          <p className="small muted" style={{ marginTop: "8px" }}>
            {applicant.resume || applicant.resumeName ? (
              <span style={{ fontWeight: 500 }}>
                File: {applicant.resume || applicant.resumeName}.{" "}
              </span>
            ) : (
              ""
            )}
            In production the resume PDF previews here from secure storage.
          </p>

          {/* Answers */}
          <h4>Their answers</h4>
          <ul className="lines">
            <li>
              <span className="small muted">Why TBM</span>
              <br />
              {applicant.why || "—"}
            </li>
            <li>
              <span className="small muted">
                Campaign or creator they admire
              </span>
              <br />
              {applicant.admire || "—"}
            </li>
            <li>
              <span className="small muted">Brand problem they&apos;d solve</span>
              <br />
              {applicant.problem || "—"}
            </li>
          </ul>

          {/* AI Assist Section */}
          <section className="ai" aria-label="AI assist">
            <div className="aih">
              <b>Summary</b>
              <span className="tag">AI suggestion · edit before use</span>
            </div>
            <textarea
              aria-label="AI summary, editable"
              value={aiSummary}
              onChange={(e) => setAiSummary(e.target.value)}
            />

            <div className="aih" style={{ marginTop: "18px" }}>
              <b>Fit against must-haves</b>
              <span className="fitbig">
                {fitResult.score}
                <small>/ 100</small>
              </span>
            </div>
            <textarea
              aria-label="Fit rationale, editable"
              value={aiRationale}
              onChange={(e) => setAiRationale(e.target.value)}
            />
            <p className="note" style={{ marginTop: "8px" }}>
              Scores are a reading aid, not a decision. A person moves every
              stage.
            </p>

            <div
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
                marginTop: "14px",
              }}
            >
              <button
                type="button"
                className="btn ghost sm"
                data-email="invite"
                onClick={() => handleGenerateEmail("invite")}
              >
                Draft interview email
              </button>
              <button
                type="button"
                className="btn ghost sm"
                data-email="reject"
                onClick={() => handleGenerateEmail("reject")}
              >
                Draft rejection email
              </button>
            </div>

            {emailDraft && (
              <div id="emailbox" style={{ marginTop: "14px" }}>
                <textarea
                  readOnly
                  style={{
                    minHeight: "160px",
                    width: "100%",
                    fontFamily: "var(--sans)",
                  }}
                  value={emailDraft}
                />
                <button
                  type="button"
                  className="btn ghost sm"
                  style={{ marginTop: "8px" }}
                  onClick={() => {
                    navigator.clipboard?.writeText(emailDraft);
                    onToast("Email draft copied.");
                  }}
                >
                  Copy email text
                </button>
              </div>
            )}
          </section>

          {/* Scorecard */}
          <h4>Scorecard</h4>
          <div className="score">
            {SC.map((k) => (
              <React.Fragment key={k}>
                <span>{k}</span>
                <div
                  className="seg"
                  role="group"
                  aria-label={`${k} rating`}
                >
                  {[1, 2, 3, 4].map((n) => (
                    <button
                      key={n}
                      type="button"
                      className="chip"
                      data-score={k}
                      data-val={n}
                      aria-pressed={scores[k] === n}
                      onClick={() => handleScoreClick(k, n)}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </React.Fragment>
            ))}
          </div>

          {/* Recruiter Notes */}
          <h4>Notes</h4>
          <ul className="notes">
            {(applicant.notes || []).length > 0 ? (
              applicant.notes?.map((n, i) => (
                <li key={i}>
                  {n.text}
                  <span>
                    {n.by} · {fmtD(n.at)} {fmtT(n.at)}
                  </span>
                </li>
              ))
            ) : (
              <li className="muted">No notes yet.</li>
            )}
          </ul>

          <textarea
            id="newnote"
            placeholder="What did you notice? Be specific."
            aria-label="New note"
            style={{ minHeight: "80px", width: "100%" }}
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
          />
          <button
            type="button"
            className="btn ghost sm"
            data-note
            style={{ marginTop: "8px" }}
            onClick={handleAddNoteClick}
          >
            Add note
          </button>
        </div>

        {/* Drawer Footer: Stage Dropdown */}
        <div className="df">
          <label
            className="small"
            style={{ display: "flex", gap: "10px", alignItems: "center" }}
          >
            Stage{" "}
            <select
              id="stagesel"
              style={{ width: "auto", minHeight: "40px" }}
              value={applicant.stage}
              onChange={(e) =>
                handleStageSelect(e.target.value as ApplicationStage)
              }
            >
              {STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <span className="small muted">Changes save instantly.</span>
        </div>
      </aside>
    </>
  );
};

export default ApplicantDrawer;
