"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { Role, FormField } from "@/types";
import { FIELDS, STEPS, ROLES, DEPTS } from "@/data/data";

interface ApplicationModalProps {
  isOpen: boolean;
  roleId: string | null;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export const STEP_TITLES: Record<string, string> = {
  personal: "First, the basics.",
  role: "Which problem do you want?",
  comp: "Let's talk money, plainly.",
  exp: "What you've done so far.",
  links: "Show us the work.",
  about: "How you think. Our favourite part.",
  final: "Last bit, promise.",
};

const PAIRS = [
  "age", "gender", "ctc", "ectc", "total", "rel",
  "lastco", "lastdes", "joining", "notice", "dept", "role",
  "source", "referral"
];

const DRAFT_KEY = "tbm-apply-draft";
const PROTO_KEY = "tbm-careers-proto-v1";
const SEQ_KEY = "tbm-careers-seq";

const fmtT = (d: string | Date): string => {
  return new Date(d).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
};

export const ApplicationModal: React.FC<ApplicationModalProps> = ({
  isOpen,
  roleId,
  onClose,
  onToast,
}) => {
  const [mounted, setMounted] = useState<boolean>(false);
  const [step, setStep] = useState<number>(0);
  const [values, setValues] = useState<Record<string, any>>({});
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [referenceId, setReferenceId] = useState<string>("");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sheetRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastActiveElementRef = useRef<HTMLElement | null>(null);

  // Active role
  const selectedRole = useMemo(() => {
    return ROLES.find((r) => r.id === roleId) || ROLES[0];
  }, [roleId]);

  // Open roles
  const openRoles = useMemo(() => {
    return ROLES.filter((r) => r.status === "Open");
  }, []);

  // Filter fields per step
  const visibleSteps = useMemo(() => {
    return STEPS.filter((s) => FIELDS.some((f) => f.on && f.step === s.id));
  }, []);

  const currentStepObj = visibleSteps[step] || visibleSteps[0];
  const stepFields = useMemo(() => {
    return FIELDS.filter((f) => f.on && f.step === currentStepObj?.id);
  }, [currentStepObj]);

  // Initialize or restore state when modal opens
  useEffect(() => {
    if (isOpen) {
      lastActiveElementRef.current = document.activeElement as HTMLElement | null;
      document.body.style.overflow = "hidden";

      // Check draft
      let restored = false;
      try {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (raw) {
          const draft = JSON.parse(raw);
          if (draft && draft.v && draft.v.role === (roleId || selectedRole.id)) {
            setValues({
              dept: selectedRole.dept,
              role: selectedRole.id,
              ...draft.v,
            });
            setStep(Math.min(draft.step || 0, visibleSteps.length - 1));
            setSavedAt(draft.at || null);
            setIsSubmitted(false);
            setErrors({});
            restored = true;
            setTimeout(() => {
              onToast("Picked up where you left off.");
            }, 300);
          }
        }
      } catch (e) {
        console.error("Draft read error", e);
      }

      if (!restored) {
        setValues({
          dept: selectedRole.dept,
          role: selectedRole.id,
        });
        setStep(0);
        setFile(null);
        setIsSubmitted(false);
        setSavedAt(null);
        setErrors({});
      }

      // Auto-focus first input in form
      const timer = setTimeout(() => {
        const firstInput = formRef.current?.querySelector<HTMLElement>(
          "input:not([type=hidden]), select, textarea, [data-seg], [data-drop]"
        );
        firstInput?.focus();
      }, 100);

      return () => {
        clearTimeout(timer);
      };
    } else {
      document.body.style.overflow = "";
      lastActiveElementRef.current?.focus?.();
    }
  }, [isOpen, roleId, selectedRole, visibleSteps.length, onToast]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, values, step, isSubmitted]);

  // Autosave to localStorage
  const autosave = useCallback(
    (newValues: Record<string, any>, currentStep: number) => {
      if (isSubmitted) return;
      try {
        const now = new Date().toISOString();
        const { resume, ...serializable } = newValues;
        localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({
            v: { ...serializable, resume: file ? file.name : resume },
            step: currentStep,
            at: now,
          })
        );
        setSavedAt(now);
      } catch (e) {
        console.error("Autosave error", e);
      }
    },
    [file, isSubmitted]
  );

  // Field validation logic (matches reference/app.js)
  const validateField = useCallback(
    (f: FormField, currentValues: Record<string, any>, uploadedFile: File | null): string => {
      const v = currentValues[f.id];
      const empty = v == null || v === "" || (Array.isArray(v) && !v.length);

      if (f.type === "file") {
        if (!uploadedFile && !currentValues.resume) {
          return f.required ? "Attach your resume to continue." : "";
        }
        const name = uploadedFile ? uploadedFile.name : String(currentValues.resume || "");
        if (!/\.(pdf|docx?)$/i.test(name)) {
          return "Use a PDF or DOC file.";
        }
        if (uploadedFile && uploadedFile.size > 5 * 1048576) {
          return "That file is over 5 MB. Try a lighter PDF.";
        }
        return "";
      }

      if (f.type === "consent") {
        return v ? "" : "We need your consent to store your application.";
      }

      if (empty) {
        return f.required ? (f.type === "langs" ? "Pick at least one." : "We need this one.") : "";
      }

      const s = String(v).trim();

      if (f.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s)) {
        return "That email looks off. Check for a typo.";
      }

      if (f.type === "tel") {
        const n = s.replace(/\D/g, "");
        if (n.length < 10 || n.length > 13) {
          return "Use a 10-digit number. Add +91 if you like.";
        }
      }

      if (f.type === "number") {
        const n = Number(s);
        if (Number.isNaN(n)) return "Enter a number.";
        if ((f.min != null && n < f.min) || (f.max != null && n > f.max)) {
          return `Enter a number between ${f.min} and ${f.max}.`;
        }
      }

      if (f.id === "rel" && Number(s) > Number(currentValues.total || 0)) {
        return "Relevant can't be more than total experience.";
      }

      if (f.type === "url" || f.type === "link") {
        try {
          const u = new URL(/^https?:\/\//i.test(s) ? s : "https://" + s);
          if (!u.hostname.includes(".")) throw 0;
        } catch {
          return "Paste a full link, like linkedin.com/in/you.";
        }
      }

      if (f.type === "date" && s < new Date().toISOString().slice(0, 10)) {
        return "Pick today or a later date.";
      }

      if (f.type === "long" && f.required && s.length < 15) {
        return "A line or two, please. Specifics help.";
      }

      if (f.id === "role" && !ROLES.find((r) => r.id === s)) {
        return "Choose a role.";
      }

      return "";
    },
    []
  );

  // Field change handler
  const handleInputChange = (name: string, value: any) => {
    const updated = { ...values, [name]: value };

    // If department changed, reset role
    if (name === "dept") {
      updated.role = "";
    }

    setValues(updated);

    // If field currently has an error, revalidate immediately
    const fieldDef = FIELDS.find((f) => f.id === name);
    if (fieldDef && errors[name]) {
      const err = validateField(fieldDef, updated, file);
      setErrors((prev) => ({ ...prev, [name]: err }));
    }

    autosave(updated, step);
  };

  const handleBlur = (name: string) => {
    const fieldDef = FIELDS.find((f) => f.id === name);
    if (fieldDef && values[name] != null && values[name] !== "") {
      const err = validateField(fieldDef, values, file);
      setErrors((prev) => ({ ...prev, [name]: err }));
    }
  };

  // File upload handler
  const handleFileUpload = (newFile: File | null) => {
    if (!newFile) return;
    setFile(newFile);
    const updated = { ...values, resume: newFile.name };
    setValues(updated);

    const f = FIELDS.find((x) => x.id === "resume");
    if (f) {
      const err = validateField(f, updated, newFile);
      setErrors((prev) => ({ ...prev, resume: err }));
    }
    autosave(updated, step);
  };

  // Navigation handlers
  const handleNext = () => {
    // Validate current step
    let firstErrorField: FormField | null = null;
    const stepErrors: Record<string, string> = {};

    for (const f of stepFields) {
      const err = validateField(f, values, file);
      if (err) {
        stepErrors[f.id] = err;
        if (!firstErrorField) {
          firstErrorField = f;
        }
      }
    }

    if (firstErrorField) {
      setErrors((prev) => ({ ...prev, ...stepErrors }));
      // Focus first error field
      setTimeout(() => {
        const errEl = formRef.current?.querySelector<HTMLElement>(
          `#f-${firstErrorField?.id}, [data-field="${firstErrorField?.id}"] button, [data-field="${firstErrorField?.id}"] [data-drop]`
        );
        errEl?.focus();
      }, 50);
      return;
    }

    // Clear step errors
    setErrors((prev) => {
      const copy = { ...prev };
      stepFields.forEach((f) => delete copy[f.id]);
      return copy;
    });

    if (step < visibleSteps.length - 1) {
      const nextStep = step + 1;
      setStep(nextStep);
      autosave(values, nextStep);
      if (formRef.current) {
        formRef.current.scrollTop = 0;
      }
      // Focus first input of new step
      setTimeout(() => {
        const firstInput = formRef.current?.querySelector<HTMLElement>(
          "input:not([type=hidden]), select, textarea, [data-seg], [data-drop]"
        );
        firstInput?.focus();
      }, 80);
    } else {
      // Final submission
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      const prevStep = step - 1;
      setStep(prevStep);
      autosave(values, prevStep);
      if (formRef.current) {
        formRef.current.scrollTop = 0;
      }
    }
  };

  const handleClose = () => {
    if (!isSubmitted) {
      onToast("Draft saved. Come back any time.");
    }
    onClose();
  };

  // Final submission
  const handleSubmit = () => {
    const id = "a" + Date.now();
    const num = (x: any) => (x === "" || x == null ? 0 : Number(x));

    let seq = 0;
    try {
      const storedSeq = localStorage.getItem(SEQ_KEY);
      if (storedSeq) seq = Number(storedSeq) || 0;
    } catch {}
    seq++;
    try {
      localStorage.setItem(SEQ_KEY, String(seq));
    } catch {}

    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const ref = `TBM-${yy}${mm}-${String(seq).padStart(4, "0")}`;

    // Store applicant prototype record
    try {
      const rawProto = localStorage.getItem(PROTO_KEY);
      let protoData: any = null;
      if (rawProto) protoData = JSON.parse(rawProto);

      const newApp = {
        id,
        name: values.name,
        email: values.email,
        phone: values.phone,
        age: values.age,
        gender: values.gender,
        city: values.city,
        mumbai: values.mumbai,
        role: values.role,
        joining: values.joining,
        notice: values.notice || "30 days",
        buyout: values.buyout || "No",
        ctc: num(values.ctc),
        ectc: num(values.ectc),
        negotiable: values.negotiable,
        total: num(values.total),
        rel: num(values.rel),
        lastco: values.lastco,
        lastdes: values.lastdes,
        langs: values.langs || [],
        portfolio: values.portfolio,
        linkedin: values.linkedin,
        instagram: values.instagram,
        resume: file?.name || values.resume,
        why: values.why,
        admire: values.admire,
        problem: values.problem,
        source: values.source,
        referral: values.referral,
        stage: "New",
        applied: now.toISOString(),
        notes: [],
        score: {},
        ai: {},
        custom: {},
      };

      if (protoData && Array.isArray(protoData.apps)) {
        protoData.apps.unshift(newApp);
        protoData.seq = seq;
        localStorage.setItem(PROTO_KEY, JSON.stringify(protoData));
      }
      localStorage.removeItem(DRAFT_KEY);
    } catch (e) {
      console.error("Submit storage error", e);
    }

    // Persist asynchronously to Supabase PostgreSQL database
    fetch("/api/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        dept: selectedRole?.dept,
        resume_name: file?.name || values.resume,
        ...values,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.success && result.applicant?.ref) {
          setReferenceId(result.applicant.ref);
        }
      })
      .catch((err) => {
        console.warn("Database sync warning (using local ref):", err);
      });

    setReferenceId(ref);
    setIsSubmitted(true);
  };

  // Render individual field control
  const renderFieldControl = (f: FormField) => {
    const v = values[f.id] ?? "";
    const id = `f-${f.id}`;
    const errorMsg = errors[f.id];
    const isBad = !!errorMsg;

    switch (f.type) {
      case "long":
        return (
          <textarea
            id={id}
            name={f.id}
            value={v}
            required={f.required}
            aria-invalid={isBad}
            aria-describedby={`e-${f.id}${f.hint ? ` h-${f.id}` : ""}`}
            onChange={(e) => handleInputChange(f.id, e.target.value)}
            onBlur={() => handleBlur(f.id)}
          />
        );

      case "select":
      case "dropdown":
        return (
          <select
            id={id}
            name={f.id}
            value={v}
            required={f.required}
            aria-invalid={isBad}
            aria-describedby={`e-${f.id}${f.hint ? ` h-${f.id}` : ""}`}
            onChange={(e) => handleInputChange(f.id, e.target.value)}
            onBlur={() => handleBlur(f.id)}
          >
            <option value="">Choose…</option>
            {(f.options || []).map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );

      case "dept":
        return (
          <select
            id={id}
            name="dept"
            value={v}
            required={true}
            aria-invalid={isBad}
            aria-describedby={`e-${f.id}${f.hint ? ` h-${f.id}` : ""}`}
            onChange={(e) => handleInputChange("dept", e.target.value)}
            onBlur={() => handleBlur(f.id)}
          >
            {DEPTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        );

      case "role": {
        const teamRoles = openRoles.filter((r) => r.dept === values.dept);
        return (
          <select
            id={id}
            name="role"
            value={v}
            required={true}
            aria-invalid={isBad}
            aria-describedby={`e-${f.id}${f.hint ? ` h-${f.id}` : ""}`}
            onChange={(e) => handleInputChange("role", e.target.value)}
            onBlur={() => handleBlur(f.id)}
          >
            <option value="">
              {teamRoles.length ? "Choose…" : "No open roles in this team"}
            </option>
            {teamRoles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title}
              </option>
            ))}
          </select>
        );
      }

      case "yesno":
        return (
          <div className="seg" role="group" aria-labelledby={`l-${f.id}`}>
            {["Yes", "No"].map((opt) => (
              <button
                key={opt}
                type="button"
                className="chip"
                data-seg={f.id}
                data-val={opt}
                aria-pressed={v === opt}
                onClick={() => handleInputChange(f.id, opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        );

      case "langs": {
        const currentLangs: string[] = Array.isArray(v) ? v : [];
        const toggleLang = (lang: string) => {
          const updated = currentLangs.includes(lang)
            ? currentLangs.filter((l) => l !== lang)
            : [...currentLangs, lang];
          handleInputChange(f.id, updated);
        };
        return (
          <div className="seg" role="group" aria-labelledby={`l-${f.id}`}>
            {(f.options || []).map((opt) => (
              <button
                key={opt}
                type="button"
                className="chip"
                data-multi={f.id}
                data-val={opt}
                aria-pressed={currentLangs.includes(opt)}
                onClick={() => toggleLang(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        );
      }

      case "file": {
        const currentName = file ? file.name : values.resume;
        const currentSize = file
          ? `${(file.size / 1048576).toFixed(1)} MB · click to replace`
          : "or click to browse · PDF or DOC, up to 5 MB";

        return (
          <div
            className={`drop ${isDragging ? "over" : ""}`}
            id={id}
            role="button"
            tabIndex={0}
            data-drop
            aria-invalid={isBad}
            aria-describedby={`e-${f.id}${f.hint ? ` h-${f.id}` : ""}`}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileUpload(e.dataTransfer.files[0]);
              }
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              data-file
              style={{ display: "none" }}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />
            <b>{currentName || "Drop your resume here"}</b>
            <br />
            <span className="small muted">{currentSize}</span>
          </div>
        );
      }

      case "consent":
        return (
          <label className="check">
            <input
              type="checkbox"
              id={id}
              name={f.id}
              checked={!!v}
              aria-invalid={isBad}
              aria-describedby={`e-${f.id}`}
              onChange={(e) => handleInputChange(f.id, e.target.checked)}
            />
            <span>
              {f.label} Questions: careers@theboredmonkey.com.
            </span>
          </label>
        );

      default: {
        const typeMap: Record<string, string> = {
          email: "email",
          tel: "tel",
          number: "number",
          url: "url",
          link: "url",
          date: "date",
        };
        const inputType = typeMap[f.type] || "text";

        const minDate =
          inputType === "date"
            ? new Date().toISOString().slice(0, 10)
            : undefined;

        const autocomplete =
          {
            name: "name",
            email: "email",
            phone: "tel",
            city: "address-level2",
          }[f.id] || "off";

        return (
          <input
            id={id}
            name={f.id}
            type={inputType}
            value={v}
            required={f.required}
            inputMode={inputType === "number" ? "decimal" : undefined}
            step={inputType === "number" ? "0.1" : undefined}
            min={inputType === "number" ? f.min : minDate}
            max={inputType === "number" ? f.max : undefined}
            autoComplete={autocomplete}
            aria-invalid={isBad}
            aria-describedby={`e-${f.id}${f.hint ? ` h-${f.id}` : ""}`}
            onChange={(e) => handleInputChange(f.id, e.target.value)}
            onBlur={() => handleBlur(f.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleNext();
              }
            }}
          />
        );
      }
    }
  };

  const renderField = (f: FormField) => {
    const errorMsg = errors[f.id];
    const isBad = !!errorMsg;

    const labelElement =
      f.type === "consent" ? null : ["yesno", "langs", "file"].includes(
          f.type
        ) ? (
        <span className="lbl" id={`l-${f.id}`}>
          {f.label} {f.required ? "" : <span className="req">(optional)</span>}
        </span>
      ) : (
        <label htmlFor={`f-${f.id}`} id={`l-${f.id}`}>
          {f.label} {f.required ? "" : <span className="req">(optional)</span>}
        </label>
      );

    return (
      <div
        key={f.id}
        className={`field ${isBad ? "bad" : ""}`}
        data-field={f.id}
      >
        {labelElement}
        {renderFieldControl(f)}
        {f.hint && (
          <p className="hint" id={`h-${f.id}`}>
            {f.hint}
          </p>
        )}
        <p className="err" id={`e-${f.id}`} aria-live="polite">
          {errorMsg || ""}
        </p>
      </div>
    );
  };

  // Group fields into pairs (<div class="two">) or single fields
  const renderedFields = useMemo(() => {
    const result: React.ReactNode[] = [];
    let i = 0;
    while (i < stepFields.length) {
      const a = stepFields[i];
      const b = stepFields[i + 1];
      if (b && PAIRS.includes(a.id) && PAIRS.includes(b.id)) {
        result.push(
          <div key={`pair-${a.id}-${b.id}`} className="two">
            {renderField(a)}
            {renderField(b)}
          </div>
        );
        i += 2;
      } else {
        result.push(renderField(a));
        i++;
      }
    }
    return result;
  }, [stepFields, values, errors, file, isDragging]);

  const isLastStep = step === visibleSteps.length - 1;
  const firstName = String(values.name || "").trim().split(" ")[0] || "there";
  const appliedRoleObj = ROLES.find((r) => r.id === values.role) || selectedRole;

  if (!isOpen || !mounted) return null;

  return createPortal(
    <>
      {/* Modal Container */}
      <div
        className={`modal ${isOpen ? "on" : ""}`}
        id="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ap-title"
        aria-hidden={!isOpen}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            handleClose();
          }
        }}
      >
        <div className="sheet" id="sheet" ref={sheetRef}>
          {isSubmitted ? (
            /* Confirmation Screen */
            <div className="done-screen">
              <p className="muted small">Reference {referenceId}</p>
              <h3 id="ap-title">
                Application in. Thank you, {firstName}.
              </h3>
              <p className="muted">
                You applied for {appliedRoleObj?.title}. Here&apos;s exactly
                what happens next.
              </p>
              <ol>
                <li>
                  <span>
                    A person on our team reads your answers. We use AI to
                    summarise, never to decide.
                  </span>
                </li>
                <li>
                  <span>You hear back within 48 hours, either way.</span>
                </li>
                <li>
                  <span>
                    If it&apos;s a match: a 30-minute call, a short task on a
                    real problem, then a chat with the team.
                  </span>
                </li>
              </ol>
              <p className="note">
                Prototype note: this application now shows in the HR dashboard
                (Team login, in the footer).
              </p>
              <div>
                <button
                  type="button"
                  className="btn primary"
                  data-close="modal"
                  onClick={handleClose}
                >
                  Back to roles
                </button>
              </div>
            </div>
          ) : (
            /* Multi-step Form */
            <>
              {/* Step Label Header */}
              <div className="steplabel">
                <span id="ap-title">
                  Applying for {appliedRoleObj ? appliedRoleObj.title : "a role"}
                </span>
                <span>
                  Step {step + 1} of {visibleSteps.length} ·{" "}
                  {currentStepObj?.label}
                </span>
              </div>

              {/* Progress Indicator */}
              <div className="progress" aria-hidden="true">
                {visibleSteps.map((s, idx) => (
                  <i
                    key={s.id}
                    className={
                      idx < step ? "done" : idx === step ? "cur" : ""
                    }
                  />
                ))}
              </div>

              {/* Form Body */}
              <form
                className="form"
                id="apform"
                ref={formRef}
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  handleNext();
                }}
              >
                <h3>{STEP_TITLES[currentStepObj?.id] || currentStepObj?.label}</h3>
                {renderedFields}
              </form>

              {/* Sheet Footer */}
              <div className="foot">
                <span className="saved" id="saved">
                  {savedAt ? (
                    <>
                      <span className="dot" aria-hidden="true" />
                      Saved {fmtT(savedAt)}
                    </>
                  ) : (
                    "Autosaves as you type"
                  )}
                </span>
                <div style={{ display: "flex", gap: "8px" }}>
                  {step > 0 ? (
                    <button
                      type="button"
                      className="btn ghost"
                      data-back
                      onClick={handleBack}
                    >
                      Back
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn ghost"
                      data-close="modal"
                      onClick={handleClose}
                    >
                      Close
                    </button>
                  )}
                  <button
                    type="button"
                    className={`btn ${isLastStep ? "accent" : "primary"}`}
                    data-next
                    onClick={handleNext}
                  >
                    {isLastStep ? "Send application" : "Continue"}{" "}
                    <span className="arr" aria-hidden="true">
                      →
                    </span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>,
    document.body
  );
};

export default ApplicationModal;
