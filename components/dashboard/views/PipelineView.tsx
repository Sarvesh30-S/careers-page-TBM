"use client";

import React, { useState } from "react";
import { Applicant, Role, DashboardRolePermission, ApplicationStage } from "@/types";
import { STAGES } from "@/data/data";
import { fitOf } from "@/lib/dashboard";

interface PipelineViewProps {
  applicants: Applicant[];
  roles: Role[];
  permission: DashboardRolePermission;
  onSelectApplicant: (applicant: Applicant) => void;
  onUpdateStage: (applicant: Applicant, newStage: ApplicationStage) => void;
}

export const PipelineView: React.FC<PipelineViewProps> = ({
  applicants,
  roles,
  permission,
  onSelectApplicant,
  onUpdateStage,
}) => {
  const [draggedAppId, setDraggedAppId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [liveMsg, setLiveMsg] = useState<string>("");

  const scopedApps = permission.scope
    ? applicants.filter((a) => {
        const r = roles.find((x) => x.id === a.role);
        return r?.dept === permission.scope || a.dept === permission.scope;
      })
    : applicants;

  const now = Date.now();
  const dayMs = 86400000;

  const handleDragStart = (e: React.DragEvent, appId: string) => {
    setDraggedAppId(appId);
    e.dataTransfer.setData("text/plain", appId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggedAppId(null);
    setDragOverCol(null);
  };

  const handleDragOver = (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    if (dragOverCol !== stage) {
      setDragOverCol(stage);
    }
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = (e: React.DragEvent, targetStage: ApplicationStage) => {
    e.preventDefault();
    setDragOverCol(null);
    const appId = draggedAppId || e.dataTransfer.getData("text/plain");
    if (!appId) return;

    const applicant = scopedApps.find((a) => a.id === appId);
    if (applicant && applicant.stage !== targetStage) {
      onUpdateStage(applicant, targetStage);
      setLiveMsg(`${applicant.name} moved to ${targetStage}.`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, applicant: Applicant) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelectApplicant(applicant);
      return;
    }

    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const currentIndex = STAGES.indexOf(applicant.stage);
      const delta = e.key === "ArrowRight" ? 1 : -1;
      const nextIndex = Math.min(
        STAGES.length - 1,
        Math.max(0, currentIndex + delta)
      );
      const nextStage = STAGES[nextIndex];

      if (nextStage !== applicant.stage) {
        onUpdateStage(applicant, nextStage);
        setLiveMsg(`${applicant.name} moved to ${nextStage}.`);
      }
    }
  };

  return (
    <div>
      <h1>Pipeline</h1>
      <p className="dsub">
        Drag a card to move it. With a keyboard, focus a card and use ← →. Enter
        opens the profile.
      </p>

      {/* Board */}
      <div className="board">
        {STAGES.map((s) => {
          const colApps = scopedApps.filter((a) => a.stage === s);
          const isOver = dragOverCol === s;

          return (
            <section
              key={s}
              className={`col ${isOver ? "over" : ""}`}
              data-col={s}
              aria-label={s}
              onDragOver={(e) => handleDragOver(e, s)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, s)}
            >
              <h3>
                <span className="stage" data-s={s}>
                  {s}
                </span>
                <span className="muted">{colApps.length}</span>
              </h3>

              {colApps.map((a) => {
                const r = roles.find((x) => x.id === a.role);
                const roleTitle = r?.title || a.roleTitle || a.role;
                const fitScore = fitOf(a, roles).score;

                const appliedTime = new Date(
                  a.applied || a.appliedAt || ""
                ).getTime();
                const daysInSystem = !isNaN(appliedTime)
                  ? Math.max(0, Math.round((now - appliedTime) / dayMs))
                  : a.daysAgo ?? 0;

                const isBeingDragged = draggedAppId === a.id;

                return (
                  <article
                    key={a.id}
                    className={`card ${isBeingDragged ? "drag" : ""}`}
                    draggable
                    tabIndex={0}
                    data-card={a.id}
                    aria-label={`${a.name}, ${roleTitle}, ${s}`}
                    onDragStart={(e) => handleDragStart(e, a.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => onSelectApplicant(a)}
                    onKeyDown={(e) => handleKeyDown(e, a)}
                  >
                    <b>{a.name}</b>
                    <span>{roleTitle}</span>
                    <div className="crow">
                      <span>Fit {fitScore}</span>
                      <span>{daysInSystem}d in system</span>
                    </div>
                  </article>
                );
              })}
            </section>
          );
        })}
      </div>

      {/* Screen Reader Live Region */}
      <p className="sr" id="pipelive" aria-live="polite">
        {liveMsg}
      </p>
    </div>
  );
};

export default PipelineView;
