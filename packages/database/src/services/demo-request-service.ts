import { rawDb } from "../client";

export interface CreateDemoRequestParams {
  name: string;
  churchName: string;
  role: string;
  email: string;
  churchWebsite?: string | null;
  attendanceRange: string;
  campusCount?: string | null;
  currentPlatform?: string | null;
  contentPlatforms?: string | null;
  message?: string | null;
  preferredContact?: string | null;
}

/** Pre-account lead capture (marketing "Request a Demo" form) -- not tenant-scoped, uses rawDb like FreeTierAccessCode. */
export async function createDemoRequest(params: CreateDemoRequestParams) {
  return rawDb.demoRequest.create({ data: params });
}
