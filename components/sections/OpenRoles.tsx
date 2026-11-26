"use client";

import React, { useState, useMemo, useCallback, useRef } from "react";
import { ROLES, DEPTS } from "@/data/data";
import { Role } from "@/types";
import { DepartmentFilter } from "@/components/roles/DepartmentFilter";
import { JobCard } from "@/components/roles/JobCard";
import { RoleDetailDrawer } from "@/components/roles/RoleDetailDrawer";
import { ApplicationModal } from "@/components/apply/ApplicationModal";
import { Toast } from "@/components/ui/Toast";

interface OpenRolesProps {
  onApplyRole?: (role: Role) => void;
}

export const OpenRoles: React.FC<OpenRolesProps> = ({ onApplyRole }) => {
  const [selectedDept, setSelectedDept] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [applyRoleId, setApplyRoleId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string>("");
  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToastVisible(false);
    }, 2400);
  }, []);

  // Active open roles
  const openRoles = useMemo(() => {
    return ROLES.filter((r) => r.status === "Open");
  }, []);

  // Department counts for badges
  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = {
      All: openRoles.length,
    };
    DEPTS.forEach((dept) => {
      counts[dept] = openRoles.filter((r) => r.dept === dept).length;
    });
    return counts;
  }, [openRoles]);

  // Filtered roles based on department and search query
  const filteredRoles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return openRoles.filter((r) => {
      const matchesDept = selectedDept === "All" || r.dept === selectedDept;
      const matchesQuery =
        !q ||
        [
          r.title,
          r.dept,
          r.problem,
          ...r.resp,
          ...r.must,
          ...(r.nice || []),
          ...(r.langs || []),
        ]
          .join(" ")
          .toLowerCase()
          .includes(q);
      return matchesDept && matchesQuery;
    });
  }, [openRoles, selectedDept, searchQuery]);

  const handleOpenRole = useCallback((role: Role) => {
    setSelectedRole(role);
    setIsDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const handleApply = useCallback(
    (role: Role) => {
      setIsDrawerOpen(false);
      setApplyRoleId(role.id);
      setIsModalOpen(true);
      if (onApplyRole) {
        onApplyRole(role);
      }
    },
    [onApplyRole]
  );

  const countText = `${filteredRoles.length} open role${
    filteredRoles.length === 1 ? "" : "s"
  }${selectedDept !== "All" ? " in " + selectedDept : ""}. All based in Lower Parel, Mumbai.`;

  return (
    <section className="band" id="roles" aria-labelledby="roles-h">
      <div className="wrap">
        <div className="roles-head">
          <div>
            <p className="kicker">Join our tribe</p>
            <h2 id="roles-h" className="sec-h">
              Be a part of TBM&apos;s Tribe
            </h2>
          </div>
          <label className="search">
            <span className="sr">Search roles</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="search"
              id="roleq"
              placeholder="Search roles, skills, languages"
              autoComplete="off"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </label>
        </div>

        {/* Filter Chips */}
        <DepartmentFilter
          departments={DEPTS}
          selectedDept={selectedDept}
          onSelectDept={setSelectedDept}
          roleCounts={roleCounts}
        />

        {/* Dynamic Count Text */}
        <p
          className="small muted"
          id="rolecount"
          aria-live="polite"
          style={{ marginTop: "20px" }}
        >
          {countText}
        </p>

        {/* Role List */}
        <div className="rolelist" id="rolelist">
          {filteredRoles.length > 0 ? (
            filteredRoles.map((role) => (
              <JobCard
                key={role.id}
                role={role}
                onSelectRole={handleOpenRole}
              />
            ))
          ) : (
            <p className="empty">
              Nothing here right now. Write to careers@theboredmonkey.com with a
              problem you&apos;d solve, and we&apos;ll keep you in mind.
            </p>
          )}
        </div>
      </div>

      {/* Role Detail Drawer & Backdrop */}
      <RoleDetailDrawer
        role={selectedRole}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onApply={handleApply}
      />

      {/* Application Modal */}
      <ApplicationModal
        isOpen={isModalOpen}
        roleId={applyRoleId}
        onClose={() => setIsModalOpen(false)}
        onToast={showToast}
      />

      {/* Toast Status */}
      <Toast message={toastMsg} isOpen={toastVisible} />
    </section>
  );
};

export default OpenRoles;
