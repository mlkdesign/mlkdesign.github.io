"use client";
import { useEffect, useRef, useState } from "react";
import { copy, jobs, type Lang } from "@/lib/content";

export default function ApplicationForm({
  lang,
  referral = false,
  selected = "",
  onBusy,
}: {
  lang: Lang;
  referral?: boolean;
  selected?: string;
  onBusy?: (busy: boolean) => void;
}) {
  const t = copy[lang];
  const form = useRef<HTMLFormElement>(null),
    fileInput = useRef<HTMLInputElement>(null);
  const [position, setPosition] = useState(selected),
    [file, setFile] = useState<File | null>(null),
    [errors, setErrors] = useState<Record<string, string>>({}),
    [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
      "idle",
    );
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefix = referral ? "ref" : "cv";
  useEffect(() => setPosition(selected), [selected]);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      onBusy?.(false);
    },
    [onBusy],
  );
  function validateContact(value: string) {
    return value.includes("@") && !value.startsWith("@")
      ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      : /^@[a-zA-Z0-9_]{5,32}$/.test(value) ||
          /^\+?[\d\s()\-]{7,22}$/.test(value);
  }
  function chooseFile(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.files?.[0] ?? null;
    if (
      next &&
      (!/\.(jpe?g|png|pdf|docx?)$/i.test(next.name) ||
        next.size > 10 * 1024 * 1024 ||
        next.size === 0)
    ) {
      setErrors((prev) => ({ ...prev, cv: t.fileError }));
      e.target.value = "";
      setFile(null);
      return;
    }
    setFile(next);
    setErrors((prev) => {
      const n = { ...prev };
      delete n.cv;
      return n;
    });
  }
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "loading" || status === "success") return;
    const data = new FormData(e.currentTarget),
      err: Record<string, string> = {};
    for (const key of referral
      ? ["name", "contact", "candidate", "candidateContact", "position"]
      : ["name", "contact", "position"]) {
      if (!String(data.get(key) || "").trim()) err[key] = t.required;
    }
    const contact = String(data.get("contact") || "");
    if (
      contact &&
      (!referral
        ? !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)
        : !validateContact(contact))
    )
      err.contact = t.contactError;
    if (
      referral &&
      data.get("candidateContact") &&
      !validateContact(String(data.get("candidateContact")))
    )
      err.candidateContact = t.contactError;
    if (!file && String(data.get("message") || "").trim().length < 30)
      err.cv = t.experienceError;
    setErrors(err);
    if (Object.keys(err).length) {
      requestAnimationFrame(() =>
        form.current
          ?.querySelector<HTMLElement>('[aria-invalid="true"]')
          ?.focus(),
      );
      return;
    }
    setStatus("loading");
    onBusy?.(true);
    // Portfolio demo explicitly requested by the owner. No network request or persistence.
    timer.current = setTimeout(() => {
      setStatus("success");
      onBusy?.(false);
    }, 1100);
  }
  function field(name: string, label: string, type = "text", hint?: string) {
    return (
      <div className="form-field">
        <label htmlFor={`${prefix}-${name}`}>
          {label} <span>*</span>
        </label>
        <input
          id={`${prefix}-${name}`}
          name={name}
          type={type}
          placeholder={label}
          autoComplete={
            name === "name" ? "name" : type === "email" ? "email" : "off"
          }
          maxLength={160}
          aria-required="true"
          aria-invalid={!!errors[name]}
          aria-describedby={
            errors[name]
              ? `${prefix}-${name}-error`
              : hint
                ? `${prefix}-${name}-hint`
                : undefined
          }
        />
        {hint && <small id={`${prefix}-${name}-hint`}>{hint}</small>}
        {errors[name] && (
          <span className="field-error" id={`${prefix}-${name}-error`}>
            {errors[name]}
          </span>
        )}
      </div>
    );
  }
  return (
    <form
      ref={form}
      className={`application-form ${referral ? "referral-form" : ""}`}
      onSubmit={submit}
      noValidate
    >
      <fieldset disabled={status === "loading" || status === "success"}>
        <div className="form-grid">
          {field("name", t.name)}
          {field(
            "contact",
            referral ? t.yourContact : t.email,
            referral ? "text" : "email",
            referral ? t.contactHelp : undefined,
          )}
          {referral && (
            <>
              {field("candidate", t.candidate)}
              {field(
                "candidateContact",
                t.candidateContact,
                "text",
                t.contactHelp,
              )}
            </>
          )}
          <div className="form-field select-field">
            <label htmlFor={`${prefix}-position`}>
              {t.position} <span>*</span>
            </label>
            <select
              id={`${prefix}-position`}
              name="position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              aria-required="true"
              aria-invalid={!!errors.position}
              aria-describedby={
                errors.position ? `${prefix}-position-error` : undefined
              }
            >
              <option value="">{t.select}</option>
              {jobs.map((job) => (
                <option key={job}>{job}</option>
              ))}
            </select>
            {errors.position && (
              <span className="field-error" id={`${prefix}-position-error`}>
                {errors.position}
              </span>
            )}
          </div>
          <div className="file-field">
            <div className="file-info">
              <strong>{file ? file.name : t.upload}</strong>
              <small>{t.formats}</small>
            </div>
            <input
              ref={fileInput}
              type="file"
              id={`${prefix}-cv`}
              name="cv"
              accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
              onChange={chooseFile}
              className="sr-only"
              aria-invalid={!!errors.cv}
              aria-describedby={errors.cv ? `${prefix}-cv-error` : undefined}
            />
            <label
              className="upload-button"
              htmlFor={`${prefix}-cv`}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInput.current?.click();
                }
              }}
            >
              <span>{t.upload}</span> {file ? "↺" : "↓"}
            </label>
            {file && (
              <button
                className="remove-file"
                type="button"
                onClick={() => {
                  setFile(null);
                  if (fileInput.current) fileInput.current.value = "";
                }}
                aria-label={t.remove}
              >
                ×
              </button>
            )}
            {errors.cv && (
              <span className="field-error" id={`${prefix}-cv-error`}>
                {errors.cv}
              </span>
            )}
          </div>
          <div className="form-field span-2">
            <label htmlFor={`${prefix}-message`}>{t.message}</label>
            <textarea
              placeholder={t.message}
              id={`${prefix}-message`}
              name="message"
              rows={3}
              maxLength={5000}
            />
          </div>
        </div>
      </fieldset>
      <div className="form-bottom">
        <small>{t.consent}</small>
        <button
          className="button"
          disabled={status === "loading" || status === "success"}
          type="submit"
        >
          {status === "loading" ? (
            <>
              <span className="spinner" />
              {t.sending}
            </>
          ) : referral ? (
            t.recommend
          ) : (
            t.sendCV
          )}
          <span aria-hidden="true">→</span>
        </button>
      </div>
      <p className={`form-status ${status}`} role="status" aria-live="polite">
        {status === "success" ? t.success : status === "error" ? t.error : ""}
      </p>
    </form>
  );
}
