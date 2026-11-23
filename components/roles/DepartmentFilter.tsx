"use client";

import React, { useState, useEffect, useRef } from "react";

interface DepartmentFilterProps {
  departments: readonly string[];
  selectedDept: string;
  onSelectDept: (dept: string) => void;
  roleCounts: Record<string, number>;
}

export const DepartmentFilter: React.FC<DepartmentFilterProps> = ({
  departments,
  selectedDept,
  onSelectDept,
  roleCounts,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // If a department is selected externally, ensure chips remain expanded
  useEffect(() => {
    if (selectedDept !== "All") {
      setIsExpanded(true);
      setIsClosing(false);
    }
  }, [selectedDept]);

  const handleAllClick = () => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!isExpanded) {
      // 1. Initially collapsed: clicking "All 11" expands and reveals department chips
      setIsExpanded(true);
      setIsClosing(false);
      onSelectDept("All");
    } else {
      // 2. Expanded: clicking "All" restores "All" filter and collapses the department list
      onSelectDept("All");
      setIsClosing(true);
      timerRef.current = setTimeout(() => {
        setIsExpanded(false);
        setIsClosing(false);
      }, 180);
    }
  };

  const handleDeptClick = (dept: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsClosing(false);
    onSelectDept(dept);
  };

  const allCount = roleCounts["All"] ?? 0;
  const isAllSelected = selectedDept === "All";

  return (
    <div
      className="filters"
      id="deptchips"
      role="group"
      aria-label="Filter by department"
    >
      {/* All Filter Chip - Always Visible: Black with white text when selected (initial load & expanded) */}
      <button
        type="button"
        className="chip"
        aria-pressed={isAllSelected}
        aria-expanded={isExpanded}
        data-dept="All"
        onClick={handleAllClick}
      >
        All <span style={{ opacity: 0.55 }}>{allCount}</span>
      </button>

      {/* Department Filter Chips - Revealed on Click */}
      {(isExpanded || isClosing) &&
        departments.map((dept, idx) => {
          const count = roleCounts[dept] ?? 0;
          const isSelected = selectedDept === dept;
          return (
            <button
              key={dept}
              type="button"
              className={`chip ${isClosing ? "chip-collapse" : "chip-reveal"}`}
              style={{
                animationDelay: isClosing
                  ? "0ms"
                  : `${Math.min(idx * 20, 160)}ms`,
              }}
              aria-pressed={isSelected}
              data-dept={dept}
              onClick={() => handleDeptClick(dept)}
            >
              {dept} <span style={{ opacity: 0.55 }}>{count}</span>
            </button>
          );
        })}
    </div>
  );
};

export default DepartmentFilter;
