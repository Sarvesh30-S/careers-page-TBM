"use client";

import React, { useState } from "react";
import { Role, Applicant } from "@/types";
import { DEPTS } from "@/data/data";

interface RolesViewProps {
  roles: Role[];
  applicants: Applicant[];
  onSaveRole: (role: Role) => void;
  onToast: (msg: string) => void;
}

export const RolesView: React.FC<RolesViewProps> = ({
  roles,
  applicants,
  onSaveRole,
  onToast,
}) => {
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [aiBullets, setAiBullets] = useState<string>("");
  const [roleError, setRoleError] = useState<string>("");

  const [formData, setFormData] = useState({
    id: "",
    title: "",
    dept: DEPTS[0],
    type: "Full-time",
    location: "Lower Parel, Mumbai",
    pay: "",
    exp0: "1",
    exp1: "3",
    problem: "",
    resp: "",
    must: "",
    nice: "",
    metrics: "",
    status: "Open" as "Open" | "Closed",
  });

  const handleOpenNewRole = () => {
    setEditingRole(null);
    setFormData({
      id: "",
      title: "",
      dept: DEPTS[0],
      type: "Full-time",
      location: "Lower Parel, Mumbai",
      pay: "",
      exp0: "1",
      exp1: "3",
      problem: "",
      resp: "",
      must: "",
      nice: "",
      metrics: "",
      status: "Open",
    });
    setAiBullets("");
    setRoleError("");
    setIsDrawerOpen(true);
  };

  const handleEditRole = (r: Role) => {
    setEditingRole(r);
    setFormData({
      id: r.id,
      title: r.title,
      dept: (r.dept as any) || DEPTS[0],
      type: r.type,
      location: r.location || "Lower Parel, Mumbai",
      pay: r.pay,
      exp0: String(r.exp[0]),
      exp1: String(r.exp[1]),
      problem: r.problem,
      resp: (r.resp || []).join("\n"),
      must: (r.must || []).join("\n"),
      nice: (r.nice || []).join("\n"),
      metrics: r.metrics || "",
      status: r.status,
    });
    setAiBullets("");
    setRoleError("");
    setIsDrawerOpen(true);
  };

  const handleToggleStatus = (r: Role) => {
    const updated: Role = {
      ...r,
      status: r.status === "Open" ? "Closed" : "Open",
    };
    onSaveRole(updated);
    onToast(
      `${r.title} is now ${updated.status.toLowerCase()}. Updated on site.`
    );
  };

  const handleDuplicate = (r: Role) => {
    const newId = `${r.id}-copy-${Date.now().toString(36).slice(-4)}`;
    const duplicated: Role = {
      ...r,
      id: newId,
      title: `${r.title} (Copy)`,
      status: "Open",
    };
    onSaveRole(duplicated);
    onToast(`Duplicated ${r.title}.`);
  };

  const handleAiDraft = () => {
    if (!aiBullets.trim()) return;
    const bullets = aiBullets.split("\n").filter((b) => b.trim());
    setFormData((prev) => ({
      ...prev,
      problem: `Own and scale: ${bullets[0]?.replace(/^[-*]\s*/, "") || "key business outcome"}.`,
      resp: bullets.map((b) => b.replace(/^[-*]\s*/, "")).join("\n"),
      must: bullets.slice(0, 3).map((b) => b.replace(/^[-*]\s*/, "")).join("\n"),
      metrics: "Retention, efficiency, and on-time delivery.",
    }));
    onToast("Drafted description from your bullets.");
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setRoleError("Give the role a title.");
      return;
    }

    const lo = Number(formData.exp0) || 0;
    const hi = Math.max(lo, Number(formData.exp1) || lo);
    const lines = (text: string) =>
      text.split("\n").map((s) => s.trim()).filter(Boolean);
    const mustLines = lines(formData.must);

    const keys = [
      ...new Set(
        mustLines.join(" ").toLowerCase().match(/[a-z]{5,}/g) || []
      ),
    ].slice(0, 10);

    const roleId =
      formData.id ||
      formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") +
        "-" +
        Date.now().toString(36).slice(-4);

    const roleToSave: Role = {
      id: roleId,
      title: formData.title.trim(),
      dept: formData.dept,
      type: formData.type,
      location: formData.location,
      pay: formData.pay,
      exp: [lo, hi],
      problem: formData.problem.trim(),
      resp: lines(formData.resp),
      must: mustLines,
      nice: lines(formData.nice),
      metrics: formData.metrics.trim(),
      status: formData.status,
      keys,
      langs: [],
    };

    onSaveRole(roleToSave);
    setIsDrawerOpen(false);
    onToast("Role saved. It's live on the careers site.");
  };

  const openCount = roles.filter((r) => r.status === "Open").length;
  const closedCount = roles.filter((r) => r.status !== "Open").length;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "16px",
          flexWrap: "wrap",
          alignItems: "flex-end",
        }}
      >
        <div>
          <h1>Roles</h1>
          <p className="dsub">
            {openCount} open, {closedCount} closed. Changes show on the careers
            site instantly.
          </p>
        </div>
        <button
          className="btn primary"
          type="button"
          data-newrole
          onClick={handleOpenNewRole}
        >
          New role
        </button>
      </div>

      <div className="scroll">
        <table className="stack">
          <thead>
            <tr>
              <th>Role</th>
              <th>Department</th>
              <th>Type</th>
              <th className="num">Applicants</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((r) => {
              const roleApps = applicants.filter((a) => a.role === r.id);
              return (
                <tr key={r.id} tabIndex={0} data-editrole={r.id}>
                  <td className="nm">
                    <b>{r.title}</b>
                    <span>
                      {r.exp[0]}–{r.exp[1]} yrs · {r.pay}
                    </span>
                  </td>
                  <td>{r.dept}</td>
                  <td>{r.type}</td>
                  <td className="num">{roleApps.length}</td>
                  <td>
                    <span
                      className="stage"
                      data-s={r.status === "Open" ? "Interview" : "Rejected"}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <button
                      className="link small"
                      type="button"
                      onClick={() => handleEditRole(r)}
                    >
                      Edit
                    </button>{" "}
                    ·{" "}
                    <button
                      className="link small"
                      type="button"
                      onClick={() => handleDuplicate(r)}
                    >
                      Duplicate
                    </button>{" "}
                    ·{" "}
                    <button
                      className="link small"
                      type="button"
                      onClick={() => handleToggleStatus(r)}
                    >
                      {r.status === "Open" ? "Close" : "Reopen"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Role Editor Drawer */}
      <div
        className={`scrim ${isDrawerOpen ? "on" : ""}`}
        onClick={() => setIsDrawerOpen(false)}
      />
      <aside
        className={`drawer panel ${isDrawerOpen ? "on" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Role editor"
      >
        {isDrawerOpen && (
          <>
            <div className="dh">
              <b>{editingRole ? "Edit role" : "New role"}</b>
              <button
                className="x"
                type="button"
                aria-label="Close editor"
                onClick={() => setIsDrawerOpen(false)}
              >
                ×
              </button>
            </div>

            <form
              className="db"
              id="roleform"
              onSubmit={handleSave}
              style={{ display: "grid", gap: "18px" }}
            >
              {/* AI Draft Assist */}
              <section className="ai" style={{ margin: 0 }}>
                <div className="aih">
                  <b>Draft with AI</b>
                  <span className="tag">Suggestion · edit before saving</span>
                </div>
                <textarea
                  id="re-bullets"
                  placeholder="Paste a few bullets, e.g.&#10;- run creator shoots for 3 brands&#10;- 2+ years in production&#10;- fluent in Telugu"
                  value={aiBullets}
                  onChange={(e) => setAiBullets(e.target.value)}
                  aria-label="Bullets for AI draft"
                />
                <button
                  type="button"
                  className="btn ghost sm"
                  style={{ marginTop: "10px" }}
                  onClick={handleAiDraft}
                >
                  Draft the description
                </button>
              </section>

              <div className="field">
                <label htmlFor="re-title">Role title</label>
                <input
                  id="re-title"
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>

              <div className="two">
                <div className="field">
                  <label htmlFor="re-dept">Department</label>
                  <select
                    id="re-dept"
                    value={formData.dept}
                    onChange={(e) =>
                      setFormData({ ...formData, dept: e.target.value as any })
                    }
                  >
                    {DEPTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="re-type">Type</label>
                  <select
                    id="re-type"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
              </div>

              <div className="two">
                <div className="field">
                  <label htmlFor="re-location">Location</label>
                  <input
                    id="re-location"
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                  />
                </div>
                <div className="field">
                  <label htmlFor="re-pay">Pay range (monthly)</label>
                  <input
                    id="re-pay"
                    type="text"
                    placeholder="e.g. ₹50k–75k / month"
                    value={formData.pay}
                    onChange={(e) =>
                      setFormData({ ...formData, pay: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="two">
                <div className="field">
                  <label htmlFor="re-exp0">Min experience (yrs)</label>
                  <input
                    id="re-exp0"
                    type="number"
                    value={formData.exp0}
                    onChange={(e) =>
                      setFormData({ ...formData, exp0: e.target.value })
                    }
                  />
                </div>
                <div className="field">
                  <label htmlFor="re-exp1">Max experience (yrs)</label>
                  <input
                    id="re-exp1"
                    type="number"
                    value={formData.exp1}
                    onChange={(e) =>
                      setFormData({ ...formData, exp1: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="re-problem">The problem this person owns</label>
                <textarea
                  id="re-problem"
                  value={formData.problem}
                  onChange={(e) =>
                    setFormData({ ...formData, problem: e.target.value })
                  }
                />
                <p className="hint">One line. Candidates read this first.</p>
              </div>

              <div className="field">
                <label htmlFor="re-resp">Responsibilities</label>
                <textarea
                  id="re-resp"
                  value={formData.resp}
                  onChange={(e) =>
                    setFormData({ ...formData, resp: e.target.value })
                  }
                />
                <p className="hint">One per line.</p>
              </div>

              <div className="field">
                <label htmlFor="re-must">Must-have skills</label>
                <textarea
                  id="re-must"
                  value={formData.must}
                  onChange={(e) =>
                    setFormData({ ...formData, must: e.target.value })
                  }
                />
                <p className="hint">
                  One per line. The AI fit score reads these.
                </p>
              </div>

              <div className="field">
                <label htmlFor="re-nice">Good to have</label>
                <textarea
                  id="re-nice"
                  value={formData.nice}
                  onChange={(e) =>
                    setFormData({ ...formData, nice: e.target.value })
                  }
                />
                <p className="hint">One per line.</p>
              </div>

              <div className="field">
                <label htmlFor="re-metrics">How they&apos;ll know it&apos;s working</label>
                <textarea
                  id="re-metrics"
                  value={formData.metrics}
                  onChange={(e) =>
                    setFormData({ ...formData, metrics: e.target.value })
                  }
                />
              </div>

              <div className="field">
                <label htmlFor="re-status">Status</label>
                <select
                  id="re-status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as "Open" | "Closed",
                    })
                  }
                >
                  <option value="Open">Open</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </form>

            <div className="df">
              <span className="small muted" id="roleerr" aria-live="polite">
                {roleError}
              </span>
              <button
                className="btn primary"
                type="button"
                onClick={handleSave}
              >
                Save role
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
};

export default RolesView;
