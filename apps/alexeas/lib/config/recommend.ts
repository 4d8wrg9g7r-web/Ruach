/**
 * "Help Me Choose" — turns a short questionnaire into a starting configuration
 * and, just as importantly, into the reasoning behind it. A player who doesn't
 * know a dreadnought from a parlor should never feel lost; they answer plainly
 * about how they play and receive a considered place to begin, which they remain
 * free to change entirely.
 */

import { defaultConfig, type Configuration } from "./engine";

export type PlayStyle = "fingerstyle" | "flatpicking" | "strumming" | "mixed";
export type Touch = "light" | "moderate" | "heavy";
export type Priority = "warmth" | "clarity" | "volume" | "balance" | "complexity";
export type Venue = "home" | "studio" | "stage" | "mixed";
export type ToneGoal = "warm" | "clear" | "rich" | "powerful";

export interface HelpAnswers {
  play: PlayStyle;
  touch: Touch;
  priority: Priority;
  venue: Venue;
  tone: ToneGoal;
}

export interface Recommendation {
  config: Configuration;
  modelSlug: string;
  reasons: string[];
}

export const HELP_QUESTIONS = [
  {
    id: "play" as const,
    title: "What do you play most?",
    options: [
      { value: "fingerstyle", label: "Fingerstyle" },
      { value: "flatpicking", label: "Flatpicking" },
      { value: "strumming", label: "Strumming" },
      { value: "mixed", label: "A bit of everything" },
    ],
  },
  {
    id: "touch" as const,
    title: "How do you play?",
    options: [
      { value: "light", label: "Light touch" },
      { value: "moderate", label: "Moderate" },
      { value: "heavy", label: "Heavy" },
    ],
  },
  {
    id: "priority" as const,
    title: "What matters most?",
    options: [
      { value: "warmth", label: "Warmth" },
      { value: "clarity", label: "Clarity" },
      { value: "volume", label: "Volume" },
      { value: "balance", label: "Balance" },
      { value: "complexity", label: "Complexity" },
    ],
  },
  {
    id: "venue" as const,
    title: "Where do you play?",
    options: [
      { value: "home", label: "Home" },
      { value: "studio", label: "Studio" },
      { value: "stage", label: "Stage" },
      { value: "mixed", label: "Everywhere" },
    ],
  },
  {
    id: "tone" as const,
    title: "Which tone do you gravitate toward?",
    options: [
      { value: "warm", label: "Warm / woody" },
      { value: "clear", label: "Clear / articulate" },
      { value: "rich", label: "Rich / complex" },
      { value: "powerful", label: "Powerful / bold" },
    ],
  },
];

export function recommend(a: HelpAnswers): Recommendation {
  const reasons: string[] = [];

  // ── Model ──────────────────────────────────────────────────────────────────
  let modelSlug = "om-14";
  if (a.play === "flatpicking" || a.play === "strumming" || a.priority === "volume" || a.venue === "stage" || a.tone === "powerful") {
    modelSlug = "dreadnought";
    reasons.push("A Dreadnought gives you the projection and low end that strumming, flatpicking, and the stage ask for.");
  } else if (a.play === "fingerstyle" && (a.priority === "balance" || a.tone === "warm") && a.touch !== "heavy") {
    modelSlug = "grand-concert-12";
    reasons.push("A 12-fret Grand Concert is warm and evenly balanced — a natural fit for fingerstyle and the voice.");
  } else if (a.play === "fingerstyle" && a.touch === "light" && a.venue === "home") {
    modelSlug = "o";
    reasons.push("A small-bodied O is intimate and immediate — ideal for a light touch in a quiet room.");
  } else {
    reasons.push("An OM is the versatile all-rounder — articulate under fingers, responsive under a pick.");
  }

  // ── Top wood ────────────────────────────────────────────────────────────────
  let top = "sitka-spruce";
  if (a.tone === "powerful" || a.priority === "volume" || a.touch === "heavy") {
    top = "adirondack-spruce";
    reasons.push("An Adirondack spruce top keeps its clarity and headroom even when you drive it hard.");
  } else if (a.play === "fingerstyle" && (a.tone === "warm" || a.touch === "light")) {
    top = a.tone === "warm" ? "western-red-cedar" : "european-spruce";
    reasons.push(top === "western-red-cedar"
      ? "A Western Red Cedar top is warm and immediate — lovely under a light fingerstyle touch."
      : "A European spruce top is refined and quick, rewarding a nuanced touch.");
  } else if (a.priority === "clarity" || a.tone === "clear") {
    top = "european-spruce";
    reasons.push("A European spruce top is articulate and responsive, for the clarity you're after.");
  } else {
    reasons.push("A Sitka spruce top is the dependable all-purpose voice with a broad dynamic range.");
  }

  // ── Body wood ──────────────────────────────────────────────────────────────
  let body = "mahogany";
  if (a.tone === "rich" || a.priority === "complexity") {
    body = "east-indian-rosewood";
    reasons.push("East Indian Rosewood back and sides bring depth, overtone, and complexity.");
  } else if (a.priority === "balance") {
    body = "walnut";
    reasons.push("Walnut sits between rosewood and mahogany — warm and clear, and beautifully balanced.");
  } else if (a.venue === "studio" || a.priority === "clarity") {
    body = "maple";
    reasons.push("Maple is transparent and articulate — a recording favorite that lets the top lead.");
  } else {
    reasons.push("Mahogany back and sides give a dry, direct, focused midrange with excellent note clarity.");
  }

  const config = defaultConfig(modelSlug);
  config.top = top;
  config.body = body;

  return { config, modelSlug, reasons };
}
