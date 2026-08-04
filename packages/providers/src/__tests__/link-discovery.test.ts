import { describe, expect, it } from "vitest";
import { extractCandidateLinks } from "../link-discovery";

describe("extractCandidateLinks", () => {
  it("returns an empty array for no description", () => {
    expect(extractCandidateLinks(null)).toEqual([]);
    expect(extractCandidateLinks(undefined)).toEqual([]);
    expect(extractCandidateLinks("")).toEqual([]);
  });

  it("extracts a plain https link", () => {
    expect(extractCandidateLinks("Notes: https://example.org/sermon-notes")).toEqual([
      "https://example.org/sermon-notes",
    ]);
  });

  it("strips trailing sentence punctuation", () => {
    expect(extractCandidateLinks("Read more here: https://example.org/notes.")).toEqual([
      "https://example.org/notes",
    ]);
  });

  it("ignores http (non-https) links", () => {
    expect(extractCandidateLinks("Old site: http://example.org/notes")).toEqual([]);
  });

  it("filters out known non-content domains", () => {
    const description = [
      "Follow us: https://facebook.com/ourchurch",
      "Give: https://pushpay.com/g/ourchurch",
      "Watch more: https://youtube.com/@ourchurch",
      "Notes: https://example.org/notes",
    ].join("\n");
    expect(extractCandidateLinks(description)).toEqual(["https://example.org/notes"]);
  });

  it("deduplicates repeated links", () => {
    const description = "https://example.org/notes and again https://example.org/notes";
    expect(extractCandidateLinks(description)).toEqual(["https://example.org/notes"]);
  });

  it("caps the number of candidates at maxLinks", () => {
    const description = Array.from({ length: 10 }, (_, i) => `https://example.org/page-${i}`).join(" ");
    expect(extractCandidateLinks(description, null, 3)).toHaveLength(3);
  });

  it("skips unparseable fragments without throwing", () => {
    expect(() => extractCandidateLinks("https://")).not.toThrow();
  });

  describe("title-based relevance ranking", () => {
    it("ranks a link whose surrounding line shares words with the title above an unrelated one", () => {
      const description = [
        "Follow along on Instagram for behind the scenes.",
        "https://example.org/unrelated",
        "Notes for this week's message on hope in hard seasons: https://example.org/hope-notes",
      ].join("\n");
      const result = extractCandidateLinks(description, "Hope in Hard Seasons", 1);
      expect(result).toEqual(["https://example.org/hope-notes"]);
    });

    it("does not exclude a zero-overlap link when under the cap -- ranking only, never hard exclusion", () => {
      const description = "https://example.org/notes";
      expect(extractCandidateLinks(description, "Completely Unrelated Title")).toEqual([
        "https://example.org/notes",
      ]);
    });

    it("ignores case when matching title words", () => {
      const description = "HOPE resources: https://example.org/hope-notes\nother: https://example.org/other";
      const result = extractCandidateLinks(description, "hope in hard seasons", 1);
      expect(result).toEqual(["https://example.org/hope-notes"]);
    });

    it("falls back to description order when no title is given", () => {
      const description = "https://example.org/first\nhttps://example.org/second";
      expect(extractCandidateLinks(description)).toEqual([
        "https://example.org/first",
        "https://example.org/second",
      ]);
    });
  });
});
