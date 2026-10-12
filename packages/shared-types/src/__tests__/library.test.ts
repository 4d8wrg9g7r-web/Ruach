import { describe, expect, it } from "vitest";
import {
  DEFAULT_LIBRARY_FILTERS,
  EMPTY_LIBRARY_FILTERS,
  buildLibraryFacets,
  filterLibraryItems,
  findLibraryFont,
  libraryFormat,
  libraryFontStylesheetUrl,
  parseLibraryFilters,
  scriptureBook,
  type LibraryItem,
} from "../library";

function item(overrides: Partial<LibraryItem> & { id: string }): LibraryItem {
  return {
    title: "Untitled",
    resourceType: "SERMON",
    speakerName: null,
    seriesTitle: null,
    publishedAt: null,
    durationSeconds: null,
    thumbnailUrl: null,
    publicUrl: "https://example.com",
    summary: null,
    topics: [],
    scriptures: [],
    messageTypes: [],
    ...overrides,
  };
}

const CATALOG: LibraryItem[] = [
  item({
    id: "a",
    title: "Peace in the Storm",
    speakerName: "Pastor Ana",
    seriesTitle: "Unshaken",
    topics: ["Anxiety", "Peace"],
    scriptures: ["Philippians 4:6-7", "Mark 4:39"],
    messageTypes: ["Sunday Service"],
  }),
  item({
    id: "b",
    title: "Love Never Fails",
    speakerName: "Pastor Ben",
    seriesTitle: "Unshaken",
    topics: ["Love"],
    scriptures: ["1 Corinthians 13:4-8", "1 John 4:8"],
    resourceType: "VIDEO",
    messageTypes: ["Guest Speaker", "sunday service"],
  }),
  item({
    id: "c",
    title: "Anxious for Nothing",
    speakerName: "pastor ana ",
    topics: ["anxiety"],
    scriptures: ["Philippians 4:6"],
    resourceType: "PODCAST",
  }),
];

describe("scriptureBook", () => {
  it("extracts the book from common reference shapes", () => {
    expect(scriptureBook("1 John 4:8")).toBe("1 John");
    expect(scriptureBook("1John 4:8")).toBe("1 John");
    expect(scriptureBook("II Corinthians 5:17")).toBe("2 Corinthians");
    expect(scriptureBook("Psalm 23")).toBe("Psalms");
    expect(scriptureBook("Song of Songs 2:4")).toBe("Song of Solomon");
    expect(scriptureBook("Romans")).toBe("Romans");
    expect(scriptureBook("romans 8:28")).toBe("Romans");
  });

  it("returns null when there is no book name", () => {
    expect(scriptureBook("3:16")).toBeNull();
    expect(scriptureBook("")).toBeNull();
  });
});

describe("filterLibraryItems", () => {
  it("returns everything with no filters", () => {
    expect(filterLibraryItems(CATALOG, EMPTY_LIBRARY_FILTERS)).toHaveLength(3);
  });

  it("matches speaker case- and whitespace-insensitively", () => {
    const result = filterLibraryItems(CATALOG, { ...EMPTY_LIBRARY_FILTERS, speaker: "pastor ana" });
    expect(result.map((r) => r.id)).toEqual(["a", "c"]);
  });

  it("filters by book and then by exact verse", () => {
    const byBook = filterLibraryItems(CATALOG, { ...EMPTY_LIBRARY_FILTERS, book: "philippians" });
    expect(byBook.map((r) => r.id)).toEqual(["a", "c"]);
    const byVerse = filterLibraryItems(CATALOG, {
      ...EMPTY_LIBRARY_FILTERS,
      book: "philippians",
      verse: "philippians 4:6",
    });
    expect(byVerse.map((r) => r.id)).toEqual(["c"]);
  });

  it("combines type, series and keyword search", () => {
    expect(filterLibraryItems(CATALOG, { ...EMPTY_LIBRARY_FILTERS, type: "VIDEO" }).map((r) => r.id)).toEqual(["b"]);
    expect(filterLibraryItems(CATALOG, { ...EMPTY_LIBRARY_FILTERS, series: "unshaken" })).toHaveLength(2);
    expect(filterLibraryItems(CATALOG, { ...EMPTY_LIBRARY_FILTERS, query: "storm peace" }).map((r) => r.id)).toEqual([
      "a",
    ]);
  });
});

describe("message types", () => {
  it("filters and counts staff-defined message types case-insensitively", () => {
    const result = filterLibraryItems(CATALOG, { ...EMPTY_LIBRARY_FILTERS, messageType: "sunday service" });
    expect(result.map((r) => r.id)).toEqual(["a", "b"]);
    const facets = buildLibraryFacets(CATALOG, EMPTY_LIBRARY_FILTERS);
    expect(facets.messageTypes).toEqual([
      { value: "sunday service", label: "Sunday Service", count: 2 },
      { value: "guest speaker", label: "Guest Speaker", count: 1 },
    ]);
  });
});

describe("buildLibraryFacets", () => {
  it("merges spellings and counts by usage", () => {
    const facets = buildLibraryFacets(CATALOG, EMPTY_LIBRARY_FILTERS);
    expect(facets.speakers[0]).toMatchObject({ value: "pastor ana", label: "Pastor Ana", count: 2 });
    expect(facets.topics[0]).toMatchObject({ value: "anxiety", count: 2 });
    expect(facets.verses).toEqual([]);
  });

  it("orders books canonically", () => {
    const facets = buildLibraryFacets(CATALOG, EMPTY_LIBRARY_FILTERS);
    expect(facets.books.map((b) => b.label)).toEqual(["Mark", "1 Corinthians", "Philippians", "1 John"]);
  });

  it("narrows other facets but not the active one", () => {
    const facets = buildLibraryFacets(CATALOG, { ...EMPTY_LIBRARY_FILTERS, speaker: "pastor ben" });
    // Speaker list still offers every speaker so the visitor can switch.
    expect(facets.speakers.map((s) => s.value).sort()).toEqual(["pastor ana", "pastor ben"]);
    expect(facets.topics.map((t) => t.value)).toEqual(["love"]);
  });

  it("lists verses only within the chosen book and maps types to enum values", () => {
    const facets = buildLibraryFacets(CATALOG, { ...EMPTY_LIBRARY_FILTERS, book: "philippians" });
    expect(facets.verses.map((v) => v.label)).toEqual(["Philippians 4:6", "Philippians 4:6-7"]);
    expect(facets.types.map((t) => t.value).sort()).toEqual(["PODCAST", "SERMON"]);
  });
});

describe("library fonts", () => {
  it("only resolves fonts from the fixed list", () => {
    expect(findLibraryFont("Open Sans")?.fallback).toBe("sans-serif");
    expect(findLibraryFont("Comic Sans; } body { display:none")).toBeNull();
    expect(findLibraryFont(null)).toBeNull();
  });

  it("builds a Google Fonts URL", () => {
    expect(libraryFontStylesheetUrl(findLibraryFont("Playfair Display")!)).toBe(
      "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap",
    );
  });
});

describe("library filter settings", () => {
  it("defaults to every filter, speaker first", () => {
    expect(DEFAULT_LIBRARY_FILTERS[0]).toBe("speaker");
    expect(DEFAULT_LIBRARY_FILTERS).toHaveLength(6);
  });

  it("keeps known keys in display order and drops the rest", () => {
    expect(parseLibraryFilters(["series", "speaker", "bogus", "speaker", 3])).toEqual(["speaker", "series"]);
    expect(parseLibraryFilters([])).toEqual([]);
  });
});

describe("libraryFormat", () => {
  const yt = (id: string, durationSeconds: number | null, extra: Partial<LibraryItem> = {}) =>
    item({ id, resourceType: "VIDEO", durationSeconds, publicUrl: `https://www.youtube.com/watch?v=${id}`, ...extra });

  it("treats YouTube videos of three minutes or less as Shorts", () => {
    expect(libraryFormat(yt("a", 45))).toBe("SHORT");
    expect(libraryFormat(yt("b", 180))).toBe("SHORT");
    expect(libraryFormat(yt("c", 181))).toBe("VIDEO");
    expect(libraryFormat(yt("d", null))).toBe("VIDEO");
  });

  it("uses a /shorts/ URL or #shorts tag regardless of length", () => {
    expect(libraryFormat(yt("e", 400, { publicUrl: "https://youtube.com/shorts/e" }))).toBe("SHORT");
    expect(libraryFormat(yt("f", null, { title: "Faith in a minute #shorts" }))).toBe("SHORT");
  });

  it("keeps livestreams, non-YouTube videos and other types as they are", () => {
    expect(libraryFormat(yt("g", 142, { title: "Victory Church Raleigh Livestream" }))).toBe("VIDEO");
    expect(libraryFormat(yt("h", 60, { publicUrl: "https://vimeo.com/123" }))).toBe("VIDEO");
    expect(libraryFormat(item({ id: "i", resourceType: "PODCAST", durationSeconds: 60 }))).toBe("PODCAST");
  });

  it("splits Shorts into their own Format option and filter", () => {
    const items = [yt("s1", 50), yt("s2", 90), yt("v1", 2400), item({ id: "p", resourceType: "PODCAST" })];
    const facets = buildLibraryFacets(items, EMPTY_LIBRARY_FILTERS);
    expect(facets.types.map((t) => [t.value, t.label, t.count])).toEqual([
      ["SHORT", "Short", 2],
      ["PODCAST", "Podcast", 1],
      ["VIDEO", "Video", 1],
    ]);
    expect(filterLibraryItems(items, { ...EMPTY_LIBRARY_FILTERS, type: "SHORT" }).map((i) => i.id)).toEqual(["s1", "s2"]);
    expect(filterLibraryItems(items, { ...EMPTY_LIBRARY_FILTERS, type: "VIDEO" }).map((i) => i.id)).toEqual(["v1"]);
  });
});
