"use client";

import React from "react";
import Image from "next/image";
import { TABNAMES } from "@/data/data";
import { DashboardRolePermission } from "@/types";

interface DashboardHeaderProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  permission: DashboardRolePermission;
  user?: { email: string; name?: string; picture?: string };
  onViewSite: () => void;
  onLogout: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  currentTab,
  onTabChange,
  permission,
  user,
  onViewSite,
  onLogout,
}) => {
  return (
    <header className="dtop">
      <div className="wrap">
        <a
          href="#top"
          aria-label="Careers site"
          onClick={(e) => {
            e.preventDefault();
            onViewSite();
          }}
        >
          <Image
            className="logo logo-light"
            src="/assets/logo-light.png"
            alt="TheBoredMonkey"
            width={137}
            height={24}
            priority
          />
          <Image
            className="logo logo-dark"
            src="/assets/logo-dark.png"
            alt="TheBoredMonkey"
            width={137}
            height={24}
            priority
          />
        </a>

        <div className="tabs" role="tablist" aria-label="Dashboard sections">
          {permission.tabs.map((t) => (
            <button
              key={t}
              role="tab"
              data-tab={t}
              aria-selected={t === currentTab}
              onClick={() => onTabChange(t)}
            >
              {TABNAMES[t] || t}
            </button>
          ))}
        </div>

        <div className="who">
          <span className="hide-m" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
            {user?.picture && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.picture}
                alt={user.name || user.email}
                style={{ width: "22px", height: "22px", borderRadius: "50%", objectFit: "cover" }}
              />
            )}
            <span>{user?.name || user?.email || permission.label}</span>
            <span style={{ fontSize: "11px", padding: "2px 6px", borderRadius: "4px", background: "var(--accent)", color: "var(--on-accent)", fontWeight: 600 }}>
              Admin
            </span>
          </span>
          <button
            className="btn ghost sm"
            type="button"
            onClick={onViewSite}
          >
            View site
          </button>
          <button
            className="btn ghost sm"
            type="button"
            data-logout
            onClick={onLogout}
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
