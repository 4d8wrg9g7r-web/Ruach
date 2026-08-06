"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Input, Select, Textarea } from "../ui/Input";
import { buttonClasses } from "../ui/Button";
import { useToast } from "../ui/Toast";
import {
  ATTENDANCE_OPTIONS,
  CONTACT_METHOD_OPTIONS,
  PLATFORM_OPTIONS,
  demoRequestSchema,
  type DemoRequestInput,
} from "../../lib/marketing/demo-request-schema";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-danger">{message}</p>;
}

export function ContactForm() {
  const { showToast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DemoRequestInput>({ resolver: zodResolver(demoRequestSchema) });

  const onSubmit = async (data: DemoRequestInput) => {
    try {
      const res = await fetch("/api/demo-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Request failed");
      setSubmitted(true);
      reset();
      showToast("Thanks -- we'll be in touch soon.", "success");
    } catch {
      showToast("Something went wrong. Please try again.", "error");
    }
  };

  if (submitted) {
    return (
      <div className="rounded-lg border border-success-bg bg-success-bg/60 p-6 text-center">
        <p className="text-sm font-medium text-success">Thanks for reaching out.</p>
        <p className="mt-1 text-sm text-ink-secondary">Someone from our team will follow up shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm text-ink-secondary">
          Name
          <Input {...register("name")} aria-invalid={!!errors.name} className="mt-1" />
          <FieldError message={errors.name?.message} />
        </label>
        <label className="text-sm text-ink-secondary">
          Church name
          <Input {...register("churchName")} aria-invalid={!!errors.churchName} className="mt-1" />
          <FieldError message={errors.churchName?.message} />
        </label>
        <label className="text-sm text-ink-secondary">
          Role
          <Input {...register("role")} placeholder="e.g. Communications Director" aria-invalid={!!errors.role} className="mt-1" />
          <FieldError message={errors.role?.message} />
        </label>
        <label className="text-sm text-ink-secondary">
          Email
          <Input type="email" {...register("email")} aria-invalid={!!errors.email} className="mt-1" />
          <FieldError message={errors.email?.message} />
        </label>
        <label className="text-sm text-ink-secondary">
          Church website <span className="text-ink-muted">(optional)</span>
          <Input {...register("churchWebsite")} placeholder="https://" className="mt-1" />
        </label>
        <label className="text-sm text-ink-secondary">
          Average weekly attendance
          <Select {...register("attendanceRange")} aria-invalid={!!errors.attendanceRange} defaultValue="" className="mt-1">
            <option value="" disabled>
              Select a range
            </option>
            {ATTENDANCE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
          <FieldError message={errors.attendanceRange?.message} />
        </label>
        <label className="text-sm text-ink-secondary">
          Number of campuses <span className="text-ink-muted">(optional)</span>
          <Input {...register("campusCount")} placeholder="1" className="mt-1" />
        </label>
        <label className="text-sm text-ink-secondary">
          Current website platform <span className="text-ink-muted">(optional)</span>
          <Select {...register("currentPlatform")} defaultValue="" className="mt-1">
            <option value="">Select a platform</option>
            {PLATFORM_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </label>
      </div>

      <label className="text-sm text-ink-secondary">
        Main content platforms <span className="text-ink-muted">(optional -- e.g. YouTube, Podcast, Blog)</span>
        <Input {...register("contentPlatforms")} className="mt-1" />
      </label>

      <label className="text-sm text-ink-secondary">
        What would you like Ruach to help with? <span className="text-ink-muted">(optional)</span>
        <Textarea {...register("message")} rows={3} className="mt-1" />
      </label>

      <label className="text-sm text-ink-secondary">
        Preferred contact method <span className="text-ink-muted">(optional)</span>
        <Select {...register("preferredContact")} defaultValue="" className="mt-1">
          <option value="">No preference</option>
          {CONTACT_METHOD_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      </label>

      <button type="submit" disabled={isSubmitting} className={`${buttonClasses("primary", "md")} mt-2 justify-center`}>
        {isSubmitting ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Sending...
          </>
        ) : (
          "Request a Demo"
        )}
      </button>
    </form>
  );
}
