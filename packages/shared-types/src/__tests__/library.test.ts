import { describe, expect, it } from "vitest";
import {
  EMPTY_LIBRARY_FILTERS,
  buildLibraryFacets,
  filterLibraryItems,
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
  }),
  item({
    id: "b",
    title: "Love Never Fails",
    speakerName: "Pastor Ben",
    seriesTitle: "Unshaken",
    topics: ["Love"],
    scriptures: ["1 Corinthians 13:4-8", "1 John 4:8"],
    resourceType: "VIDEO",
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
