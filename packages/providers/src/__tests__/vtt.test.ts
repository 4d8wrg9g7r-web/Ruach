import { describe, expect, it } from "vitest";
import { parseVttToText } from "../vtt";

describe("parseVttToText", () => {
  it("strips the header, timing lines, and cue numbers", () => {
    const vtt = [
      "WEBVTT",
      "",
      "1",
      "00:00:00.000 --> 00:00:02.500",
      "Hello and welcome.",
      "",
      "2",
      "00:00:02.500 --> 00:00:05.000",
      "Today we're talking about anxiety.",
    ].join("\n");

    expect(parseVttToText(vtt)).toBe("Hello and welcome. Today we're talking about anxiety.");
  });

  it("strips inline timing tags", () => {
    const vtt = [
      "WEBVTT",
      "",
      "00:00:00.000 --> 00:00:02.000",
      "<00:00:00.500><c>Hello</c> <00:00:01.000><c>world</c>",
    ].join("\n");

    expect(parseVttToText(vtt)).toBe("Hello world");
  });

  it("skips NOTE blocks", () => {
    const vtt = ["WEBVTT", "", "NOTE This is a comment", "", "00:00:00.000 --> 00:00:01.000", "Actual text"].join("\n");

    expect(parseVttToText(vtt)).toBe("Actual text");
  });

  it("dedupes consecutive identical lines (common in rolling captions)", () => {
    const vtt = [
      "WEBVTT",
      "",
      "00:00:00.000 --> 00:00:01.000",
      "repeated line",
      "",
      "00:00:01.000 --> 00:00:02.000",
      "repeated line",
      "",
      "00:00:02.000 --> 00:00:03.000",
      "new line",
    ].join("\n");

    expect(parseVttToText(vtt)).toBe("repeated line new line");
  });

  it("returns an empty string for empty input", () => {
    expect(parseVttToText("")).toBe("");
  });
});
