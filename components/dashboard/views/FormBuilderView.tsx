"use client";

import React, { useState } from "react";
import { FormField, FormStep } from "@/types";
import { STEPS, FIELDS } from "@/data/data";

interface FormBuilderViewProps {
  fields: FormField[];
  onUpdateFields: (fields: FormField[]) => void;
  onPreviewForm: () => void;
  onToast: (msg: string) => void;
}

export const FormBuilderView: React.FC<FormBuilderViewProps> = ({
  fields,
  onUpdateFields,
  onPreviewForm,
  onToast,
}) => {
  const [qLabel, setQLabel] = useState<string>("");
  const [qType, setQType] = useState<string>("short");
  const [qStep, setQStep] = useState<string>("about");
  const [qOptions, setQOptions] = useState<string>("");
  const [qRequired, setQRequired] = useState<boolean>(false);
  const [qError, setQError] = useState<string>("");

  const typesMap: Record<string, string> = {
    text: "Short text",
    email: "Email",
    tel: "Phone",
    number: "Number",
    select: "Dropdown",
    dropdown: "Dropdown",
    yesno: "Yes / No",
    date: "Date",
    long: "Long answer",
    url: "Link",
    link: "Link",
    file: "File",
    langs: "Multi-select",
    consent: "Consent",
    dept: "Department",
    role: "Role",
    short: "Short text",
  };

  const handleToggleShown = (id: string, checked: boolean) => {
    const updated = fields.map((f) => {
      if (f.id === id) {
        return {
          ...f,
          on: checked,
          required: checked ? f.required : false,
        };
      }
      return f;
    });
    onUpdateFields(updated);
    onToast("Field updated. Live form synced.");
  };

  const handleToggleRequired = (id: string, checked: boolean) => {
    const updated = fields.map((f) => {
      if (f.id === id) {
        return {
          ...f,
          required: checked,
        };
      }
      return f;
    });
    onUpdateFields(updated);
    onToast("Field updated. Live form synced.");
  };

  const handleMove = (id: string, direction: "up" | "down") => {
    const i = fields.findIndex((f) => f.id === id);
    if (i < 0) return;
    const f = fields[i];

    // Filter fields on the same step
    const sameStepIndices = fields
      .map((x, j) => (x.step === f.step ? j : -1))
      .filter((j) => j >= 0);

    const posInStep = sameStepIndices.indexOf(i);
    const targetPosInStep = posInStep + (direction === "up" ? -1 : 1);
    if (targetPosInStep < 0 || targetPosInStep >= sameStepIndices.length) return;

    const targetIndex = sameStepIndices[targetPosInStep];
    const copy = [...fields];
    copy[i] = fields[targetIndex];
    copy[targetIndex] = fields[i];

    onUpdateFields(copy);
    onToast("Field order updated.");
  };

  const handleDeleteCustom = (id: string) => {
    const updated = fields.filter((f) => f.id !== id);
    onUpdateFields(updated);
    onToast("Custom field removed.");
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qLabel.trim()) {
      setQError("Write the question first.");
      return;
    }

    const opts = qOptions
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (qType === "dropdown" && opts.length < 2) {
      setQError("Add at least two options.");
      return;
    }

    const newField: FormField = {
      step: qStep,
      id: "c" + Date.now().toString(36),
      label: qLabel.trim(),
      type: (qType === "short" ? "text" : qType) as any,
      options: opts.length ? opts : undefined,
      required: qRequired,
      on: true,
      custom: true,
    };

    onUpdateFields([...fields, newField]);
    setQLabel("");
    setQOptions("");
    setQRequired(false);
    setQError("");
    onToast("Question added to the live form.");
  };

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
          <h1>Application form</h1>
          <p className="dsub">
            Toggle, require or reorder fields. Changes go live on the public form
            instantly.
          </p>
        </div>
        <button
          className="btn primary"
          type="button"
          data-preview
          onClick={onPreviewForm}
        >
          Preview live form <span className="arr" aria-hidden="true">→</span>
        </button>
      </div>

      {STEPS.map((s) => {
        const stepFields = fields.filter((f) => f.step === s.id);
        const shownCount = stepFields.filter((f) => f.on).length;

        return (
          <section key={s.id} className="fb-step">
            <h3>
              {s.label}{" "}
              <span className="muted" style={{ fontWeight: 400 }}>
                · {shownCount} shown
              </span>
            </h3>

            {stepFields.map((f) => (
              <div key={f.id} className="fbrow" data-fid={f.id}>
                <span>
                  {f.label}
                  {f.custom && (
                    <span className="muted small"> (custom)</span>
                  )}
                </span>
                <span className="t">{typesMap[f.type] || f.type}</span>

                <label className="sw">
                  <input
                    type="checkbox"
                    checked={f.on}
                    disabled={f.locked}
                    aria-label={`Show ${f.label}`}
                    onChange={(e) => handleToggleShown(f.id, e.target.checked)}
                  />
                  Shown
                </label>

                <label className="sw">
                  <input
                    type="checkbox"
                    checked={f.required}
                    disabled={f.locked || !f.on}
                    aria-label={`Require ${f.label}`}
                    onChange={(e) =>
                      handleToggleRequired(f.id, e.target.checked)
                    }
                  />
                  Required
                </label>

                <span className="mv">
                  <button
                    type="button"
                    aria-label={`Move ${f.label} up`}
                    onClick={() => handleMove(f.id, "up")}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    aria-label={`Move ${f.label} down`}
                    onClick={() => handleMove(f.id, "down")}
                  >
                    ↓
                  </button>
                  {f.custom && (
                    <button
                      type="button"
                      aria-label={`Delete ${f.label}`}
                      onClick={() => handleDeleteCustom(f.id)}
                    >
                      ×
                    </button>
                  )}
                </span>
              </div>
            ))}
          </section>
        );
      })}

      {/* Add Custom Question */}
      <section className="fb-step">
        <h3>Add a custom question</h3>
        <form
          id="addq"
          onSubmit={handleAddQuestion}
          style={{ display: "grid", gap: "14px", marginTop: "16px", maxWidth: "640px" }}
        >
          <div className="field">
            <label htmlFor="q-l">Question</label>
            <input
              id="q-l"
              type="text"
              placeholder="e.g. Which regional creator would you sign first, and why?"
              value={qLabel}
              onChange={(e) => setQLabel(e.target.value)}
            />
          </div>

          <div className="two">
            <div className="field">
              <label htmlFor="q-t">Answer type</label>
              <select
                id="q-t"
                value={qType}
                onChange={(e) => setQType(e.target.value)}
              >
                <option value="short">Short answer</option>
                <option value="long">Long answer</option>
                <option value="link">Link</option>
                <option value="yesno">Yes / No</option>
                <option value="dropdown">Dropdown</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="q-s">Step</label>
              <select
                id="q-s"
                value={qStep}
                onChange={(e) => setQStep(e.target.value)}
              >
                {STEPS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {qType === "dropdown" && (
            <div className="field" id="q-ow">
              <label htmlFor="q-o">Options</label>
              <input
                id="q-o"
                type="text"
                placeholder="Comma separated, e.g. Tamil, Telugu, Kannada"
                value={qOptions}
                onChange={(e) => setQOptions(e.target.value)}
              />
            </div>
          )}

          <label className="check">
            <input
              type="checkbox"
              id="q-r"
              checked={qRequired}
              onChange={(e) => setQRequired(e.target.checked)}
            />{" "}
            Required
          </label>

          {qError && (
            <p className="err" id="q-e" aria-live="polite">
              {qError}
            </p>
          )}

          <div>
            <button className="btn ghost" type="submit">
              Add question
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default FormBuilderView;
