"use client";

import React from "react";
import { Role } from "@/types";

interface JobCardProps {
  role: Role;
  onSelectRole: (role: Role) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ role, onSelectRole }) => {
  return (
    <button
      className="rolerow"
      data-role={role.id}
      onClick={() => onSelectRole(role)}
      aria-haspopup="dialog"
    >
      <b>{role.title}</b>
      <span className="meta">{role.dept}</span>
      <span className="meta">{role.location || "Lower Parel, Mumbai"}</span>
      <span className="meta">{role.type}</span>
      <span className="mob">
        {role.dept} · {role.type}
      </span>
      <span className="go" aria-hidden="true">
        →
      </span>
    </button>
  );
};

export default JobCard;
