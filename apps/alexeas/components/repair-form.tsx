"use client";

import { useState, type FormEvent } from "react";
import { BrassRule } from "@/components/ui";
import { SITE } from "@/lib/site";

const labelClass =
  "block font-sans text-xs uppercase tracking-wider2 text-ink-muted mb-2";
const fieldClass =
  "w-full bg-warmwhite border border-brass/30 px-4 py-3 font-sans text-ink placeholder:text-ink-muted/60 focus:border-brass outline-none transition-colors";

export function RepairForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="border border-brass/30 bg-parchment/50 p-10 sm:p-14">
        <p className="overline">Received</p>
        <h3 className="mt-4 font-serif text-3xl text-espresso sm:text-4xl">
          Thank you — we&rsquo;ll be in touch.
        </h3>
        <p className="mt-5 max-w-prose2 text-lg leading-relaxed text-ink-soft text-pretty">
          Your repair inquiry has been noted. A copy also reaches{" "}
          <a href={`mailto:${SITE.email}`} className="link-underline text-espresso">
            <span>{SITE.email}</span>
          </a>
          , and {SITE.maker} will write back with next steps, an honest
          assessment, and any questions about the instrument.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="repair-name" className={labelClass}>
            Name
          </label>
          <input
            id="repair-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="repair-email" className={labelClass}>
            Email
          </label>
          <input
            id="repair-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={fieldClass}
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="repair-instrument" className={labelClass}>
            Instrument
          </label>
          <input
            id="repair-instrument"
            name="instrument"
            type="text"
            required
            placeholder="Guitar, mandolin, violin…"
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="repair-manufacturer" className={labelClass}>
            Manufacturer
          </label>
          <input
            id="repair-manufacturer"
            name="manufacturer"
            type="text"
            placeholder="Maker or brand"
            className={fieldClass}
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="repair-year" className={labelClass}>
            Year <span className="normal-case tracking-normal">(optional)</span>
          </label>
          <input
            id="repair-year"
            name="year"
            type="text"
            inputMode="numeric"
            placeholder="e.g. 1974"
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="repair-photos" className={labelClass}>
            Upload Photos
          </label>
          <input
            id="repair-photos"
            name="photos"
            type="file"
            multiple
            accept="image/*"
            className={`${fieldClass} file:mr-4 file:border-0 file:bg-brass/15 file:px-4 file:py-1 file:font-sans file:text-xs file:uppercase file:tracking-wider2 file:text-espresso`}
          />
        </div>
      </div>

      <div>
        <label htmlFor="repair-problem" className={labelClass}>
          Problem
        </label>
        <textarea
          id="repair-problem"
          name="problem"
          required
          rows={6}
          placeholder="Tell us what the instrument needs — what it does, what it used to do, and what you hope for."
          className={`${fieldClass} resize-y`}
        />
      </div>

      <fieldset>
        <legend className={labelClass}>Preferred contact method</legend>
        <div className="flex flex-wrap gap-6 pt-1">
          <label className="flex cursor-pointer items-center gap-3 font-sans text-ink">
            <input
              type="radio"
              name="contactMethod"
              value="email"
              defaultChecked
              className="h-4 w-4 accent-brass"
            />
            Email
          </label>
          <label className="flex cursor-pointer items-center gap-3 font-sans text-ink">
            <input
              type="radio"
              name="contactMethod"
              value="phone"
              className="h-4 w-4 accent-brass"
            />
            Phone
          </label>
        </div>
      </fieldset>

      <BrassRule className="!my-8 opacity-60" />

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-sm text-sm leading-relaxed text-ink-muted text-pretty">
          Messages are sent to the workshop at{" "}
          <a href={`mailto:${SITE.email}`} className="link-underline text-espresso">
            <span>{SITE.email}</span>
          </a>
          .
        </p>
        <button type="submit" className="btn-primary">
          Send Inquiry
        </button>
      </div>
    </form>
  );
}
