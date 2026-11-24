"use client";

import React, { useState, useMemo } from "react";
import { Applicant, Role, DashboardRolePermission } from "@/types";
import { DEPTS, STAGES } from "@/data/data";
import { fitOf, formatMonthly } from "@/lib/dashboard";

interface ApplicantsViewProps {
  applicants: Applicant[];
  roles: Role[];
  permission: DashboardRolePermission;
  onSelectApplicant: (applicant: Applicant) => void;
}

export const ApplicantsView: React.FC<ApplicantsViewProps> = ({
  applicants,
  roles,
  permission,
  onSelectApplicant,
}) => {
  const hp = permission.hidePay;
  const scopedRoles = permission.scope
    ? roles.filter((r) => r.dept === permission.scope)
    : roles;

  const scopedApps = useMemo(() => {
    return permission.scope
      ? applicants.filter((a) => {
          const r = roles.find((x) => x.id === a.role);
          return r?.dept === permission.scope || a.dept === permission.scope;
        })
      : applicants;
  }, [applicants, roles, permission.scope]);

  // Filters state
  const [q, setQ] = useState<string>("");
  const [dept, setDept] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [stage, setStage] = useState<string>("");
  const [exp, setExp] = useState<string>("");
  const [min, setMin] = useState<string>("");
  const [max, setMax] = useState<string>("");
  const [notice, setNotice] = useState<string>("");
  const [sortField, setSortField] = useState<string>("applied");
  const [sortDir, setSortDir] = useState<number>(-1); // -1 = descending, 1 = ascending

  const handleClear = () => {
    setQ("");
    setDept("");
    setRole("");
    setStage("");
    setExp("");
    setMin("");
    setMax("");
    setNotice("");
    setSortField("applied");
    setSortDir(-1);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir((prev) => -prev);
    } else {
      setSortField(field);
      setSortDir(1);
    }
  };

  const filteredApplicants = useMemo(() => {
    const query = q.trim().toLowerCase();

    const list = scopedApps.filter((a) => {
      const r = roles.find((x) => x.id === a.role);
      if (
        query &&
        ![
          a.name,
          a.email,
          r?.title,
          a.city,
          a.lastco,
          ...(a.langs || []),
        ]
          .join(" ")
          .toLowerCase()
          .includes(query)
      ) {
        return false;
      }

      if (dept && r?.dept !== dept && a.dept !== dept) return false;
      if (role && a.role !== role) return false;
      if (stage && a.stage !== stage) return false;

      if (exp) {
        const [lo, hi] = exp.split("-").map(Number);
        if (Number(a.total) < lo || Number(a.total) > hi) return false;
      }

      if (min !== "") {
        const minNum = Number(min);
        const aMonthly =
          Number(a.ectc) <= 200 ? (Number(a.ectc) * 100000) / 12 : Number(a.ectc);
        if (aMonthly < minNum) return false;
      }
      if (max !== "") {
        const maxNum = Number(max);
        const aMonthly =
          Number(a.ectc) <= 200 ? (Number(a.ectc) * 100000) / 12 : Number(a.ectc);
        if (aMonthly > maxNum) return false;
      }
      if (notice && a.notice !== notice) return false;

      return true;
    });

    const keyFns: Record<string, (a: Applicant) => any> = {
      name: (a) => a.name?.toLowerCase() || "",
      stage: (a) => STAGES.indexOf(a.stage),
      total: (a) => Number(a.total) || 0,
      ectc: (a) =>
        (Number(a.ectc) <= 200
          ? (Number(a.ectc) * 100000) / 12
          : Number(a.ectc)) || 0,
      notice: (a) => parseInt(a.notice) || 0,
      fit: (a) => fitOf(a, roles).score,
      applied: (a) => new Date(a.applied || a.appliedAt || "").getTime() || 0,
    };

    const fn = keyFns[sortField] || keyFns.applied;

    return [...list].sort((a, b) => {
      const valA = fn(a);
      const valB = fn(b);
      if (valA > valB) return 1 * sortDir;
      if (valA < valB) return -1 * sortDir;
      return 0;
    });
  }, [scopedApps, roles, q, dept, role, stage, exp, min, max, notice, sortField, sortDir]);

  const fmtD = (iso?: string): string => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  return (
    <div>
      <h1>Applicants</h1>
      <p className="dsub" id="acount">
        {filteredApplicants.length} of {scopedApps.length} applicants. Click a row
        for the full profile.
      </p>

      {/* Filter Toolbar */}
      <div className="toolbar">
        <input
          type="search"
          id="fq"
          placeholder="Search name, city, company, language"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search applicants"
        />

        {!permission.scope && (
          <select
            id="fdept"
            value={dept}
            onChange={(e) => setDept(e.target.value)}
            aria-label="Department"
          >
            <option value="">All departments</option>
            {DEPTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        )}

        <select
          id="frole"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          aria-label="Role"
        >
          <option value="">All roles</option>
          {scopedRoles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.title}
            </option>
          ))}
        </select>

        <select
          id="fstage"
          value={stage}
          onChange={(e) => setStage(e.target.value)}
          aria-label="Stage"
        >
          <option value="">All stages</option>
          {STAGES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          id="fexp"
          value={exp}
          onChange={(e) => setExp(e.target.value)}
          aria-label="Experience"
        >
          <option value="">Any experience</option>
          <option value="0-1">0–1 yrs</option>
          <option value="1-3">1–3 yrs</option>
          <option value="3-5">3–5 yrs</option>
          <option value="5-50">5+ yrs</option>
        </select>

        {!hp && (
          <>
            <input
              type="number"
              id="fmin"
              placeholder="Min ₹/mo"
              value={min}
              onChange={(e) => setMin(e.target.value)}
              aria-label="Minimum expected monthly pay, rupees"
            />
            <input
              type="number"
              id="fmax"
              placeholder="Max ₹/mo"
              value={max}
              onChange={(e) => setMax(e.target.value)}
              aria-label="Maximum expected monthly pay, rupees"
            />
          </>
        )}

        <select
          id="fnotice"
          value={notice}
          onChange={(e) => setNotice(e.target.value)}
          aria-label="Notice period"
        >
          <option value="">Any notice</option>
          <option value="Immediate">Immediate</option>
          <option value="15 days">15 days</option>
          <option value="30 days">30 days</option>
          <option value="60 days">60 days</option>
          <option value="90 days">90 days</option>
        </select>

        <button
          className="btn ghost sm"
          type="button"
          data-clear
          onClick={handleClear}
        >
          Clear
        </button>
      </div>

      {/* Table */}
      <div className="scroll">
        <table>
          <thead>
            <tr>
              <th
                aria-sort={
                  sortField === "name"
                    ? sortDir > 0
                      ? "ascending"
                      : "descending"
                    : "none"
                }
              >
                <button type="button" onClick={() => handleSort("name")}>
                  Applicant{sortField === "name" ? (sortDir > 0 ? " ↑" : " ↓") : ""}
                </button>
              </th>
              <th
                aria-sort={
                  sortField === "stage"
                    ? sortDir > 0
                      ? "ascending"
                      : "descending"
                    : "none"
                }
              >
                <button type="button" onClick={() => handleSort("stage")}>
                  Stage{sortField === "stage" ? (sortDir > 0 ? " ↑" : " ↓") : ""}
                </button>
              </th>
              <th
                className="num"
                aria-sort={
                  sortField === "total"
                    ? sortDir > 0
                      ? "ascending"
                      : "descending"
                    : "none"
                }
              >
                <button type="button" onClick={() => handleSort("total")}>
                  Exp{sortField === "total" ? (sortDir > 0 ? " ↑" : " ↓") : ""}
                </button>
              </th>
              {!hp && (
                <th
                  className="num hide-m"
                  aria-sort={
                    sortField === "ectc"
                      ? sortDir > 0
                      ? "ascending"
                      : "descending"
                      : "none"
                  }
                >
                  <button type="button" onClick={() => handleSort("ectc")}>
                    Expected / mo{sortField === "ectc" ? (sortDir > 0 ? " ↑" : " ↓") : ""}
                  </button>
                </th>
              )}
              <th
                className="hide-m"
                aria-sort={
                  sortField === "notice"
                    ? sortDir > 0
                      ? "ascending"
                      : "descending"
                    : "none"
                }
              >
                <button type="button" onClick={() => handleSort("notice")}>
                  Notice{sortField === "notice" ? (sortDir > 0 ? " ↑" : " ↓") : ""}
                </button>
              </th>
              <th
                className="num"
                aria-sort={
                  sortField === "fit"
                    ? sortDir > 0
                      ? "ascending"
                      : "descending"
                    : "none"
                }
              >
                <button type="button" onClick={() => handleSort("fit")}>
                  AI fit{sortField === "fit" ? (sortDir > 0 ? " ↑" : " ↓") : ""}
                </button>
              </th>
              <th
                className="num hide-m"
                aria-sort={
                  sortField === "applied"
                    ? sortDir > 0
                      ? "ascending"
                      : "descending"
                    : "none"
                }
              >
                <button type="button" onClick={() => handleSort("applied")}>
                  Applied{sortField === "applied" ? (sortDir > 0 ? " ↑" : " ↓") : ""}
                </button>
              </th>
            </tr>
          </thead>
          <tbody id="atbody">
            {filteredApplicants.length > 0 ? (
              filteredApplicants.map((a) => {
                const r = roles.find((x) => x.id === a.role);
                const roleTitle = r?.title || a.roleTitle || a.role || "—";
                const fitResult = fitOf(a, roles);

                return (
                  <tr
                    key={a.id}
                    tabIndex={0}
                    data-app={a.id}
                    onClick={() => onSelectApplicant(a)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelectApplicant(a);
                      }
                    }}
                  >
                    <td className="nm">
                      <b>{a.name}</b>
                      <span>{roleTitle}</span>
                    </td>
                    <td>
                      <span className="stage" data-s={a.stage}>
                        {a.stage}
                      </span>
                    </td>
                    <td className="num">{a.total} yrs</td>
                    {!hp && (
                      <td className="num hide-m">{formatMonthly(a.ectc)}</td>
                    )}
                    <td className="hide-m">{a.notice}</td>
                    <td className="num fitpill">{fitResult.score}</td>
                    <td className="num hide-m">
                      {fmtD(a.applied || a.appliedAt)}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={hp ? 6 : 7} className="empty">
                  {scopedApps.length === 0
                    ? "No applicants in the system yet. Real applications will appear here as candidates submit the form."
                    : "No one matches these filters. Try clearing one."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApplicantsView;
