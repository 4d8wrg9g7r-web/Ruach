import { z } from "zod";

export const ATTENDANCE_OPTIONS = ["Under 100", "100–299", "300–749", "750–1,499", "1,500–4,999", "5,000+"] as const;

export const PLATFORM_OPTIONS = ["Wix", "Squarespace", "WordPress", "Webflow", "Subsplash", "Custom", "Other", "Not sure"] as const;

export const CONTACT_METHOD_OPTIONS = ["Email", "Phone"] as const;

/** Shared by the client form (react-hook-form + zodResolver) and the /api/demo-request route, so validation can never drift between the two. */
export const demoRequestSchema = z.object({
  name: z.string().trim().min(1, "Enter your name."),
  churchName: z.string().trim().min(1, "Enter your church name."),
  role: z.string().trim().min(1, "Enter your role."),
  email: z.string().trim().email("Enter a valid email address."),
  churchWebsite: z.string().trim().optional().or(z.literal("")),
  attendanceRange: z.enum(ATTENDANCE_OPTIONS, { errorMap: () => ({ message: "Select an attendance range." }) }),
  campusCount: z.string().trim().optional().or(z.literal("")),
  currentPlatform: z.enum(PLATFORM_OPTIONS).optional().or(z.literal("")),
  contentPlatforms: z.string().trim().optional().or(z.literal("")),
  message: z.string().trim().optional().or(z.literal("")),
  preferredContact: z.enum(CONTACT_METHOD_OPTIONS).optional().or(z.literal("")),
});

export type DemoRequestInput = z.infer<typeof demoRequestSchema>;
