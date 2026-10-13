import { describe, expect, it } from "vitest";
import { MockAIProvider } from "../MockAIProvider";
import { normalizeSpeakerName } from "../SpeakerService";

describe("normalizeSpeakerName", () => {
  const known = ["Mitch Horton", "Festus Nsoha"];

  it("drops titles and reuses a known spelling", () => {
    expect(normalizeSpeakerName("Pastor Mitch Horton", known)).toBe("Mitch Horton");
    expect(normalizeSpeakerName("guest speaker festus nsoha", known)).toBe("Festus Nsoha");
    expect(normalizeSpeakerName("Dr. Jane Smith", known)).toBe("Jane Smith");
  });

  it("maps a first name to the one known speaker who has it", () => {
    expect(normalizeSpeakerName("Pastor Mitch", known)).toBe("Mitch Horton");
    expect(normalizeSpeakerName("Mitch", ["Mitch Horton", "Mitch Jones"])).toBe("Mitch");
  });

  it("rejects answers that aren't a person", () => {
    expect(normalizeSpeakerName(null, known)).toBeNull();
    expect(normalizeSpeakerName("Unknown", known)).toBeNull();
    expect(normalizeSpeakerName("Pastor", known)).toBeNull();
    expect(normalizeSpeakerName("Episode 12", known)).toBeNull();
    expect(normalizeSpeakerName("  ", known)).toBeNull();
    expect(normalizeSpeakerName(42, known)).toBeNull();
  });
});

describe("MockAIProvider.detectSpeaker", () => {
  const provider = new MockAIProvider();
  const detect = (title: string) =>
    provider.detectSpeaker({ title, description: null, excerpt: null, knownSpeakers: [] }).then((r) => r.speakerName);

  it("reads a name from the title suffix", async () => {
    expect(await detect("Jesus Wants ALL of You | Mitch Horton")).toBe("Mitch Horton");
    expect(await detect("The Foundation for Faith - Festus Nsoha")).toBe("Festus Nsoha");
  });

  it("ignores suffixes that aren't names", async () => {
    expect(await detect("Emotional Healing (Part 2) | Breaking the Cycle (Part 12)")).toBeNull();
    expect(await detect("Victory Church Raleigh Livestream")).toBeNull();
  });
});
