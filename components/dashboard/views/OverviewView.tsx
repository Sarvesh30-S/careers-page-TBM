"use client";

import React from "react";
import { Applicant, Role, DashboardRolePermission } from "@/types";
import { STAGES } from "@/data/data";
import { median, reachedIdx } from "@/lib/dashboard";

interface OverviewViewProps {
  applicants: Applicant[];
  roles: Role[];
  permission: DashboardRolePermission;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  applicants,
  roles,
  permission,
}) => {
  const scopedApps = permission.scope
    ? applicants.filter((a) => {
        const r = roles.find((x) => x.id === a.role);
        return r?.dept === permission.scope || a.dept === permission.scope;
      })
    : applicants;

  const scopedRoles = permission.scope
    ? roles.filter((r) => r.dept === permission.scope)
    : roles;

  const openRolesCount = scopedRoles.filter((r) => r.status === "Open").length;

  const now = Date.now();
  const dayMs = 86400000;
  const newLastWeek = scopedApps.filter((a) => {
    const t = new Date(a.applied || a.appliedAt || "").getTime();
    return !isNaN(t) && now - t < 7 * dayMs;
  }).length;

  const hiredApps = scopedApps.filter((a) => a.hiredAt || a.hiredAfter);
  const tthValues = hiredApps.map((a) => {
    if (a.hiredAfter != null) return a.hiredAfter;
    if (a.hiredAt) {
      const start = new Date(a.applied || a.appliedAt || "").getTime();
      const end = new Date(a.hiredAt).getTime();
      if (!isNaN(start) && !isNaN(end)) return Math.round((end - start) / dayMs);
    }
    return 22;
  });
  const tth = median(tthValues);

  const inInterviewCount = scopedApps.filter((a) => a.stage === "Interview").length;

  // Funnel by stage
  const funnelStages = STAGES.slice(0, 5); // New, Shortlisted, Interview, Offer, Hired
  const fun: [string, number][] = funnelStages.map((s, i) => [
    s,
    scopedApps.filter((a) => reachedIdx(a) >= i).length,
  ]);

  let drop = -1;
  let worst = 0;
  for (let i = 1; i < fun.length; i++) {
    const prev = fun[i - 1][1];
    const cur = fun[i][1];
    const p = prev ? 1 - cur / prev : 0;
    if (p > worst) {
      worst = p;
      drop = i;
    }
  }

  const SO: Record<number, string> = {
    1: "Screening is the choke point. Tighten job posts so fewer wrong-fit people apply.",
    2: "Check how fast shortlisted people get an interview slot. Days here cost us candidates.",
    3: "Check interviewers use the scorecard, not gut feel.",
    4: "Look at offer terms and how fast offers go out.",
  };

  // Dept counts
  const deptMap: Record<string, number> = {};
  scopedApps.forEach((a) => {
    const r = roles.find((x) => x.id === a.role);
    const d = r?.dept || a.dept || "General";
    deptMap[d] = (deptMap[d] || 0) + 1;
  });
  const depts = Object.entries(deptMap).sort((a, b) => b[1] - a[1]);

  const maxFun = fun[0]?.[1] || 0;
  const maxDept = depts[0]?.[1] || 0;

  return (
    <div>
      <h1>
        {drop > 0 && scopedApps.length > 0
          ? `Most candidates drop between ${fun[drop - 1][0]} and ${fun[drop][0]}.`
          : "Hiring at a glance."}
      </h1>
      <p className="dsub">
        {permission.scope ? `${permission.scope} · ` : ""}
        {scopedApps.length} applicants in the system.
      </p>

      {/* 4 KPIs */}
      <div className="kpis">
        <div className="kpi">
          <b>{openRolesCount}</b>
          <span>Open roles</span>
        </div>
        <div className="kpi">
          <b>{newLastWeek}</b>
          <span>New applicants, last 7 days</span>
        </div>
        <div className="kpi">
          <b>{tth != null ? `${tth}d` : "—"}</b>
          <span>Median time-to-hire · target 22d</span>
        </div>
        <div className="kpi">
          <b>{inInterviewCount}</b>
          <span>In interview right now</span>
        </div>
      </div>

      {/* 2 Comparison Blocks */}
      <div className="cols">
        {/* Funnel */}
        <div className="blk">
          <h2>Funnel by stage</h2>
          <p className="so">People who reached each stage.</p>
          <div className="bars">
            {fun.map(([label, n], i) => {
              const widthPct = maxFun ? Math.max(2, (n / maxFun) * 100) : 0;
              return (
                <div key={label} className="bar">
                  <span>{label}</span>
                  <span className="track">
                    <i
                      className={i === drop && scopedApps.length > 0 ? "hi" : ""}
                      style={{ width: `${widthPct}%` }}
                    />
                  </span>
                  <em>{n}</em>
                </div>
              );
            })}
          </div>
        </div>

        {/* Departments */}
        <div className="blk">
          <h2>Applicants by department</h2>
          <p className="so">Where interest is, and isn&apos;t.</p>
          <div className="bars">
            {depts.length > 0 ? (
              depts.map(([label, n]) => {
                const widthPct = maxDept ? Math.max(2, (n / maxDept) * 100) : 0;
                return (
                  <div key={label} className="bar">
                    <span>{label}</span>
                    <span className="track">
                      <i style={{ width: `${widthPct}%` }} />
                    </span>
                    <em>{n}</em>
                  </div>
                );
              })
            ) : (
              <p className="note">No applications received yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Insight */}
      {drop > 0 && scopedApps.length > 0 && (
        <p className="insight">
          <span className="dot" aria-hidden="true" style={{ marginTop: "8px" }} />
          <span>
            <b>So what:</b> {Math.round(worst * 100)}% fall off at{" "}
            {fun[drop][0].toLowerCase()}. {SO[drop]}
          </span>
        </p>
      )}
    </div>
  );
};

export default OverviewView;
