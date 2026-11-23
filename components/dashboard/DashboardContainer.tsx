"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Applicant,
  Role,
  FormField,
  DashboardSession,
  ApplicationStage,
} from "@/types";
import { ROLES as DEFAULT_ROLES, FIELDS as DEFAULT_FIELDS, PERMS } from "@/data/data";
import { Toast } from "@/components/ui/Toast";
import DashboardLogin from "./DashboardLogin";
import DashboardHeader from "./DashboardHeader";
import OverviewView from "./views/OverviewView";
import ApplicantsView from "./views/ApplicantsView";
import PipelineView from "./views/PipelineView";
import RolesView from "./views/RolesView";
import FormBuilderView from "./views/FormBuilderView";
import ExportsView from "./views/ExportsView";
import ApplicantDrawer from "./ApplicantDrawer";

const SESSION_KEY = "tbm-dash-session";
const ROLES_KEY = "tbm-dash-roles";
const FIELDS_KEY = "tbm-dash-fields";

export const DashboardContainer: React.FC = () => {
  const [isDash, setIsDash] = useState<boolean>(false);
  const [session, setSession] = useState<DashboardSession | null>(null);
  const [tab, setTab] = useState<string>("overview");
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [roles, setRoles] = useState<Role[]>(DEFAULT_ROLES);
  const [fields, setFields] = useState<FormField[]>(DEFAULT_FIELDS);
  const [selectedApp, setSelectedApp] = useState<Applicant | null>(null);

  // Toast
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

  // Sync hash and body.dash class
  useEffect(() => {
    const checkHash = () => {
      const active = window.location.hash === "#dashboard";
      setIsDash(active);
      document.body.classList.toggle("dash", active);
      if (active) {
        window.scrollTo(0, 0);
      }
    };

    checkHash();
    window.addEventListener("hashchange", checkHash);
    return () => window.removeEventListener("hashchange", checkHash);
  }, []);

  // Restore session, roles, and fields from localStorage and server
  useEffect(() => {
    try {
      const rawSession = localStorage.getItem(SESSION_KEY);
      if (rawSession) setSession(JSON.parse(rawSession));

      const rawRoles = localStorage.getItem(ROLES_KEY);
      if (rawRoles) setRoles(JSON.parse(rawRoles));

      const rawFields = localStorage.getItem(FIELDS_KEY);
      if (rawFields) setFields(JSON.parse(rawFields));
    } catch (e) {
      console.warn("Storage restore error:", e);
    }

    // Verify server session
    const verifyServerSession = async () => {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        if (data.authenticated && data.user) {
          setSession(data.user);
          localStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
        } else if (data.authenticated === false) {
          // Server session expired/invalid
          setSession(null);
          localStorage.removeItem(SESSION_KEY);
        }
      } catch (err) {
        console.warn("Server session check error:", err);
      }
    };
    verifyServerSession();
  }, []);

  // Fetch live applicants from PostgreSQL database
  const fetchApplicants = useCallback(async () => {
    try {
      const res = await fetch("/api/applicants");
      const data = await res.json();
      if (data.success && Array.isArray(data.applicants)) {
        setApplicants(data.applicants);
      }
    } catch (err) {
      console.warn("Error fetching applicants from API:", err);
    }
  }, []);

  useEffect(() => {
    if (isDash) {
      fetchApplicants();
    }
  }, [isDash, fetchApplicants]);

  const handleLogin = (newSession: DashboardSession) => {
    setSession(newSession);
    localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
    setTab("overview");
    showToast(`Welcome, ${newSession.name || newSession.email}. Signed in as Admin.`);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.warn("Logout error:", e);
    }
    setSession(null);
    localStorage.removeItem(SESSION_KEY);
    showToast("Signed out.");
  };

  const handleViewSite = () => {
    window.location.hash = "#top";
    setIsDash(false);
    document.body.classList.remove("dash");
  };

  // Every authorized team member is Admin (access to everything)
  const permission = PERMS.admin;

  // Handle stage update
  const handleUpdateStage = async (
    applicant: Applicant,
    newStage: ApplicationStage
  ) => {
    // 1. Optimistic update
    const updatedApp = {
      ...applicant,
      stage: newStage,
      notes: [
        ...(applicant.notes || []),
        {
          text: `Moved to ${newStage}.`,
          by: permission.label,
          at: new Date().toISOString(),
        },
      ],
    };

    setApplicants((prev) =>
      prev.map((a) => (a.id === applicant.id ? updatedApp : a))
    );
    if (selectedApp?.id === applicant.id) {
      setSelectedApp(updatedApp);
    }

    showToast(`${applicant.name.split(" ")[0]} moved to ${newStage}.`);

    // 2. Commit to PostgreSQL
    try {
      await fetch("/api/applicants", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: applicant.id,
          stage: newStage,
          note: {
            text: `Moved to ${newStage}.`,
            by: permission.label,
          },
        }),
      });
    } catch (err) {
      console.warn("Failed to update stage in database:", err);
    }
  };

  // Handle score update
  const handleUpdateScore = async (
    applicant: Applicant,
    score: Record<string, number>
  ) => {
    const updatedApp = { ...applicant, score };
    setApplicants((prev) =>
      prev.map((a) => (a.id === applicant.id ? updatedApp : a))
    );
    if (selectedApp?.id === applicant.id) {
      setSelectedApp(updatedApp);
    }

    try {
      await fetch("/api/applicants", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: applicant.id,
          score,
        }),
      });
    } catch (err) {
      console.warn("Failed to update score in database:", err);
    }
  };

  // Handle add note
  const handleAddNote = async (applicant: Applicant, noteText: string) => {
    const newNote = {
      text: noteText,
      by: permission.label,
      at: new Date().toISOString(),
    };
    const updatedApp = {
      ...applicant,
      notes: [...(applicant.notes || []), newNote],
    };

    setApplicants((prev) =>
      prev.map((a) => (a.id === applicant.id ? updatedApp : a))
    );
    if (selectedApp?.id === applicant.id) {
      setSelectedApp(updatedApp);
    }

    showToast("Note added.");

    try {
      await fetch("/api/applicants", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: applicant.id,
          note: newNote,
        }),
      });
    } catch (err) {
      console.warn("Failed to add note to database:", err);
    }
  };

  const handleSaveRole = (roleToSave: Role) => {
    setRoles((prev) => {
      const idx = prev.findIndex((r) => r.id === roleToSave.id);
      let updated: Role[];
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = roleToSave;
      } else {
        updated = [roleToSave, ...prev];
      }
      localStorage.setItem(ROLES_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const handleUpdateFields = (updatedFields: FormField[]) => {
    setFields(updatedFields);
    localStorage.setItem(FIELDS_KEY, JSON.stringify(updatedFields));
  };

  return (
    <div id="dash">
      {!session ? (
        <DashboardLogin onLogin={handleLogin} onBackToSite={handleViewSite} />
      ) : (
        <>
          <DashboardHeader
            currentTab={tab}
            onTabChange={setTab}
            permission={permission}
            user={session || undefined}
            onViewSite={handleViewSite}
            onLogout={handleLogout}
          />

          <main className="dmain">
            <div className="wrap" id="dview">
              {tab === "overview" && (
                <OverviewView
                  applicants={applicants}
                  roles={roles}
                  permission={permission}
                />
              )}

              {tab === "applicants" && (
                <ApplicantsView
                  applicants={applicants}
                  roles={roles}
                  permission={permission}
                  onSelectApplicant={setSelectedApp}
                />
              )}

              {tab === "pipeline" && (
                <PipelineView
                  applicants={applicants}
                  roles={roles}
                  permission={permission}
                  onSelectApplicant={setSelectedApp}
                  onUpdateStage={handleUpdateStage}
                />
              )}

              {tab === "roles" && (
                <RolesView
                  roles={roles}
                  applicants={applicants}
                  onSaveRole={handleSaveRole}
                  onToast={showToast}
                />
              )}

              {tab === "form" && (
                <FormBuilderView
                  fields={fields}
                  onUpdateFields={handleUpdateFields}
                  onPreviewForm={handleViewSite}
                  onToast={showToast}
                />
              )}

              {tab === "exports" && (
                <ExportsView
                  applicants={applicants}
                  roles={roles}
                  permission={permission}
                  onToast={showToast}
                />
              )}
            </div>
          </main>

          {/* Candidate Profile Drawer */}
          <ApplicantDrawer
            applicant={selectedApp}
            roles={roles}
            hidePay={permission.hidePay}
            onClose={() => setSelectedApp(null)}
            onUpdateStage={handleUpdateStage}
            onUpdateScore={handleUpdateScore}
            onAddNote={handleAddNote}
            onToast={showToast}
          />
        </>
      )}

      {/* Floating Status Toast */}
      <Toast message={toastMsg} isOpen={toastVisible} />
    </div>
  );
};

export default DashboardContainer;
