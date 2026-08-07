import { z } from "zod";

/** Shared inquiry contract — validated on the client and again on the server. */
export const SHOOT_TYPES = [
  "Wedding",
  "Engagement",
  "Couple",
  "Family",
  "Senior",
  "Maternity",
  "Newborn",
  "Branding",
  "Other",
] as const;

export const CONTACT_METHODS = ["Email", "Phone", "Text"] as const;

export const inquirySchema = z.object({
  shootType: z.enum(SHOOT_TYPES),
  date: z.string().max(64).optional().default(""),
  location: z.string().min(2, "Where are we photographing?").max(160),
  story: z.string().min(10, "Tell us a little about what you're imagining.").max(4000),
  name: z.string().min(2, "Your name, please.").max(120),
  email: z.string().email("A valid email so we can reply."),
  phone: z.string().max(40).optional().default(""),
  preferredContact: z.enum(CONTACT_METHODS).default("Email"),
  // Attribution / lead-source metadata (hidden fields).
  referralSource: z.string().max(200).optional().default(""),
  landingPage: z.string().max(400).optional().default(""),
  utm: z.record(z.string(), z.string().max(200)).optional().default({}),
});

export type InquiryInput = z.infer<typeof inquirySchema>;

/** Lead lifecycle statuses (for the CMS / lead management view). */
export const LEAD_STATUSES = [
  "New",
  "Contacted",
  "Consultation Scheduled",
  "Proposal Sent",
  "Booked",
  "Lost",
  "Archived",
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];
