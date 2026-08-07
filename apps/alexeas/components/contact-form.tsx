"use client";

import { useState, type FormEvent } from "react";
import { BrassRule } from "@/components/ui";
import { SITE } from "@/lib/site";

const labelClass =
  "block font-sans text-xs uppercase tracking-wider2 text-ink-muted mb-2";
const fieldClass =
  "w-full bg-warmwhite border border-brass/30 px-4 py-3 font-sans text-ink placeholder:text-ink-muted/60 focus:border-brass outline-none transition-colors";

export function ContactForm() {
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
          Your message has been noted, and a copy also reaches{" "}
          <a href={`mailto:${SITE.email}`} className="link-underline text-espresso">
            <span>{SITE.email}</span>
          </a>
          . {SITE.maker} reads every note personally and will write back — this
          is the beginning of a conversation, not a transaction.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className={labelClass}>
            Name
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="contact-email" className={labelClass}>
            Email
          </label>
          <input
            id="contact-email"
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
          <label htmlFor="contact-phone" className={labelClass}>
            Phone{" "}
            <span className="normal-case tracking-normal">(optional)</span>
          </label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="contact-country" className={labelClass}>
            Country
          </label>
          <input
            id="contact-country"
            name="country"
            type="text"
            autoComplete="country-name"
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-interest" className={labelClass}>
          What are you drawn to?
        </label>
        <select
          id="contact-interest"
          name="interest"
          required
          defaultValue="guitar"
          className={fieldClass}
        >
          <option value="guitar">A guitar</option>
          <option value="mandolin">A mandolin</option>
          <option value="repair">A repair</option>
          <option value="unsure">Not sure yet</option>
        </select>
      </div>

      <div>
        <label htmlFor="contact-message" className={labelClass}>
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={6}
          placeholder="Tell us what you have in mind — the sound you hear, how you play, or simply where to begin."
          className={`${fieldClass} resize-y`}
        />
      </div>

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
          Send Message
        </button>
      </div>
    </form>
  );
}
