"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ApertureIcon } from "./ApertureIcon";
import { SHOOT_TYPES, CONTACT_METHODS, type InquiryInput } from "@/lib/inquiry";
import { SITE } from "@/content/site";
import { track } from "@/lib/analytics";

const EASE = [0.16, 1, 0.3, 1] as const;

type Form = Omit<InquiryInput, "utm"> & { utm: Record<string, string> };

const STEP_TITLES = [
  "What are we photographing?",
  "When?",
  "Where?",
  "Tell us about your story.",
  "Your details.",
];

const emptyForm: Form = {
  shootType: "Wedding",
  date: "",
  location: "",
  story: "",
  name: "",
  email: "",
  phone: "",
  preferredContact: "Email",
  referralSource: "",
  landingPage: "",
  utm: {},
};

export function InquiryWizard() {
  const [step, setStep] = useState(0); // 0..4 steps, 5 = confirmation
  const [form, setForm] = useState<Form>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const total = STEP_TITLES.length;

  // Capture attribution once on mount.
  useEffect(() => {
    track("inquiry_started");
    try {
      const params = new URLSearchParams(window.location.search);
      const utm: Record<string, string> = {};
      params.forEach((v, k) => {
        if (k.startsWith("utm_")) utm[k] = v;
      });
      setForm((f) => ({
        ...f,
        utm,
        landingPage: window.location.pathname + window.location.search,
        referralSource: document.referrer || "direct",
      }));
    } catch {
      /* noop */
    }
  }, []);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }));

  const validateStep = (s: number): string | null => {
    if (s === 2 && form.location.trim().length < 2) return "Where are we photographing?";
    if (s === 3 && form.story.trim().length < 10) return "Tell us a little about what you're imagining.";
    if (s === 4) {
      if (form.name.trim().length < 2) return "Your name, please.";
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return "A valid email so we can reply.";
    }
    return null;
  };

  const next = () => {
    const v = validateStep(step);
    if (v) {
      setError(v);
      return;
    }
    setError(null);
    track("inquiry_step_completed", { step: step + 1, shootType: form.shootType });
    if (step < total - 1) setStep(step + 1);
    else void submit();
  };

  const back = () => {
    setError(null);
    if (step > 0) setStep(step - 1);
  };

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/inquire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong. Please try again.");
      }
      track("inquiry_submitted", { shootType: form.shootType });
      setStep(total); // confirmation
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const progress = useMemo(() => (step >= total ? 1 : step / (total - 1)), [step, total]);
  const isWedding = form.shootType === "Wedding";

  if (step >= total) return <Confirmation form={form} />;

  return (
    <div className="grid min-h-[80vh] grid-cols-1 lg:grid-cols-[0.85fr_1.15fr]">
      {/* Left: aperture progress rail */}
      <aside className="grain relative flex flex-col justify-between overflow-hidden bg-ink px-5 py-14 text-paper sm:px-10 lg:py-20">
        <div className="flex items-center gap-4">
          <ApertureIcon progress={progress} className="h-12 w-12" />
          <div>
            <p className="font-sans text-[0.62rem] uppercase tracking-label text-mist">Inquiry</p>
            <p className="font-sans text-[0.72rem] tabular-nums tracking-label text-champagne">
              Step {String(step + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </p>
          </div>
        </div>

        <div className="mt-16 lg:mt-0">
          <p className="eyebrow mb-6 text-champagne">Tell us what you&rsquo;re imagining</p>
          <AnimatePresence mode="wait">
            <motion.h1
              key={step}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="max-w-sm font-serif text-display-sm"
            >
              {STEP_TITLES[step]}
            </motion.h1>
          </AnimatePresence>
        </div>

        {/* exposure-mark step ticks */}
        <div className="mt-16 flex gap-1.5" aria-hidden>
          {STEP_TITLES.map((_, i) => (
            <span
              key={i}
              className={`h-[2px] flex-1 rounded-full transition-colors duration-500 ${
                i <= step ? "bg-champagne" : "bg-paper/20"
              }`}
            />
          ))}
        </div>
      </aside>

      {/* Right: field panel */}
      <div className="flex flex-col justify-center bg-paper px-5 py-16 sm:px-12 lg:px-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            {step === 0 && (
              <fieldset>
                <legend className="sr-only">What are we photographing?</legend>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {SHOOT_TYPES.map((t) => {
                    const active = form.shootType === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => set("shootType", t)}
                        className={`border px-4 py-5 text-left font-serif text-xl transition-colors ${
                          active
                            ? "border-ink bg-ink text-paper"
                            : "border-ink/15 text-ink hover:border-ink/40"
                        }`}
                        aria-pressed={active}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            )}

            {step === 1 && (
              <div className="max-w-md">
                <label className="eyebrow mb-4 block text-mist" htmlFor="date">
                  {isWedding ? "Your wedding date" : "Approximate timeframe"}
                </label>
                {isWedding ? (
                  <input
                    id="date"
                    type="date"
                    value={form.date}
                    onChange={(e) => set("date", e.target.value)}
                    className="w-full border-b border-ink/20 bg-transparent pb-3 font-serif text-2xl text-ink outline-none focus:border-ink"
                  />
                ) : (
                  <input
                    id="date"
                    type="text"
                    placeholder="e.g. Late September, or flexible"
                    value={form.date}
                    onChange={(e) => set("date", e.target.value)}
                    className="w-full border-b border-ink/20 bg-transparent pb-3 font-serif text-2xl text-ink outline-none placeholder:text-mist/60 focus:border-ink"
                  />
                )}
                <p className="mt-4 text-sm text-charcoal/60">
                  Not sure yet? That&rsquo;s completely fine &mdash; leave it blank and we&rsquo;ll figure it out
                  together.
                </p>
              </div>
            )}

            {step === 2 && (
              <div className="max-w-md">
                <label className="eyebrow mb-4 block text-mist" htmlFor="location">
                  Location or venue
                </label>
                <input
                  id="location"
                  type="text"
                  placeholder="e.g. The Maxwell, Raleigh — or the Blue Ridge Mountains"
                  value={form.location}
                  onChange={(e) => set("location", e.target.value)}
                  className="w-full border-b border-ink/20 bg-transparent pb-3 font-serif text-2xl text-ink outline-none placeholder:text-mist/60 focus:border-ink"
                />
              </div>
            )}

            {step === 3 && (
              <div className="max-w-lg">
                <label className="eyebrow mb-4 block text-mist" htmlFor="story">
                  The short version of your story
                </label>
                <textarea
                  id="story"
                  rows={6}
                  placeholder="How you met, what you're picturing, what matters most to you about the photographs…"
                  value={form.story}
                  onChange={(e) => set("story", e.target.value)}
                  className="w-full resize-none border border-ink/15 bg-transparent p-4 text-[1rem] leading-relaxed text-ink outline-none placeholder:text-mist/60 focus:border-ink"
                />
              </div>
            )}

            {step === 4 && (
              <div className="grid max-w-lg gap-6">
                <Field id="name" label="Your name">
                  <input
                    id="name"
                    type="text"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    className="w-full border-b border-ink/20 bg-transparent pb-2 text-lg text-ink outline-none focus:border-ink"
                  />
                </Field>
                <Field id="email" label="Email">
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    className="w-full border-b border-ink/20 bg-transparent pb-2 text-lg text-ink outline-none focus:border-ink"
                  />
                </Field>
                <Field id="phone" label="Phone (optional)">
                  <input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    className="w-full border-b border-ink/20 bg-transparent pb-2 text-lg text-ink outline-none focus:border-ink"
                  />
                </Field>
                <div>
                  <span className="eyebrow mb-3 block text-mist">Preferred contact</span>
                  <div className="flex gap-2">
                    {CONTACT_METHODS.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => set("preferredContact", m)}
                        aria-pressed={form.preferredContact === m}
                        className={`border px-4 py-2 text-sm transition-colors ${
                          form.preferredContact === m
                            ? "border-ink bg-ink text-paper"
                            : "border-ink/15 text-ink hover:border-ink/40"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {error && (
              <p role="alert" className="mt-6 text-sm text-[#9a3b2f]">
                {error}
              </p>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Controls */}
        <div className="mt-14 flex items-center justify-between">
          <button
            type="button"
            onClick={back}
            disabled={step === 0}
            className="font-sans text-[0.72rem] uppercase tracking-label text-mist transition-colors hover:text-ink disabled:opacity-0"
          >
            &larr; Back
          </button>
          <button
            type="button"
            onClick={next}
            disabled={submitting}
            data-cursor="explore"
            className="group inline-flex items-center gap-3 rounded-full bg-ink px-8 py-4 font-sans text-[0.72rem] uppercase tracking-label text-paper transition-transform duration-500 ease-aperture hover:scale-[1.03] disabled:opacity-60"
          >
            {submitting ? "Sending…" : step === total - 1 ? "Send inquiry" : "Continue"}
            <span className="transition-transform duration-500 ease-aperture group-hover:translate-x-1">&rarr;</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="eyebrow mb-3 block text-mist">
        {label}
      </label>
      {children}
    </div>
  );
}

function Confirmation({ form }: { form: Form }) {
  return (
    <section className="grain relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden bg-ink px-5 py-24 text-center text-paper">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: EASE }}
        className="text-champagne"
      >
        <ApertureIcon progress={1} className="mx-auto h-20 w-20" />
      </motion.div>
      <p className="eyebrow mt-10 text-champagne">Inquiry received</p>
      <h1 className="mt-6 max-w-2xl text-balance font-serif text-display-md">
        Thank you, {form.name.split(" ")[0] || "friend"}. Your inquiry is in.
      </h1>
      <p className="mt-6 max-w-md text-[0.98rem] leading-relaxed text-paper/80">
        I&rsquo;ll be in touch personally about your {form.shootType.toLowerCase()} — {SITE.responseTime.toLowerCase()}{" "}
        In the meantime, feel free to keep exploring the work.
      </p>
      <div className="mt-12 flex flex-wrap items-center justify-center gap-5">
        <Link
          href="/weddings"
          className="rounded-full bg-paper px-7 py-3.5 font-sans text-[0.72rem] uppercase tracking-label text-ink transition-transform duration-500 ease-aperture hover:scale-[1.03]"
        >
          View the work
        </Link>
        <Link
          href="/journal"
          className="border-b border-paper/40 pb-1 font-sans text-[0.72rem] uppercase tracking-label text-paper/85 hover:border-paper"
        >
          Read the journal
        </Link>
      </div>
    </section>
  );
}
