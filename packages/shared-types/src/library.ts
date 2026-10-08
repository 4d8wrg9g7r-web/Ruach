/**
 * Sermon library embed (apps/dashboard/app/widget/library/[publicWidgetId]) -- a
 * filterable message archive a church drops onto its own sermon page, for website
 * builders whose built-in sermon engines can't filter by speaker/topic/verse.
 *
 * The whole (slim) catalog is loaded once per campus and cached server-side, then
 * every filter runs in the visitor's browser against that in-memory list -- so
 * clicking filters never hits the database. These helpers are pure for exactly that
 * reason: the same code runs in the client component and in unit tests.
 */

import type { ResourceTypeValue } from "./resource";

/** Resource types that read as "a message" on a sermon page -- the default for
 * WidgetConfiguration.libraryResourceTypes, which staff can change per widget.
 * Articles, documents, courses and generic web pages are off by default but still
 * answerable through the chat assistant. YouTube/Vimeo imports land as VIDEO and RSS
 * podcasts as PODCAST, so both have to be included alongside SERMON. */
export const DEFAULT_LIBRARY_RESOURCE_TYPES = ["SERMON", "VIDEO", "AUDIO", "PODCAST", "DEVOTIONAL"] as const;

/** Shown to visitors as the embed's Format filter and to staff as the toggle labels. */
export const RESOURCE_TYPE_LABELS: Record<ResourceTypeValue, string> = {
  SERMON: "Sermon",
  VIDEO: "Video",
  AUDIO: "Audio",
  PODCAST: "Podcast",
  DEVOTIONAL: "Devotional",
  ARTICLE: "Article",
  DOCUMENT: "Document",
  COURSE: "Course",
  OTHER: "Other",
};

const RESOURCE_TYPES = Object.keys(RESOURCE_TYPE_LABELS) as ResourceTypeValue[];

export interface LibraryItem {
  id: string;
  title: string;
  resourceType: ResourceTypeValue;
  speakerName: string | null;
  seriesTitle: string | null;
  /** ISO string -- the catalog crosses a cache + server/client boundary as JSON. */
  publishedAt: string | null;
  durationSeconds: number | null;
  thumbnailUrl: string | null;
  publicUrl: string;
  /** Short blurb for the card, already truncated server-side to keep the payload small. */
  summary: string | null;
  topics: string[];
  scriptures: string[];
  /** Staff-defined categories (Resource.messageTypes) -- the Message type filter. */
  messageTypes: string[];
}

export interface LibraryFilters {
  query: string;
  speaker: string | null;
  topic: string | null;
  book: string | null;
  verse: string | null;
  messageType: string | null;
  /** The resource type ("format": Sermon, Video, Podcast...). */
  type: ResourceTypeValue | null;
  series: string | null;
}

export const EMPTY_LIBRARY_FILTERS: LibraryFilters = {
  query: "",
  speaker: null,
  topic: null,
  book: null,
  verse: null,
  messageType: null,
  type: null,
  series: null,
};

export interface FacetOption {
  /** Normalized key used for matching (lowercased, whitespace-collapsed). */
  value: string;
  /** Display label -- the first spelling seen in the catalog. */
  label: string;
  count: number;
}

export interface LibraryFacets {
  speakers: FacetOption[];
  topics: FacetOption[];
  books: FacetOption[];
  /** Only populated once a book is chosen -- a flat list of every verse across a
   * whole library is too long to be useful as a dropdown. */
  verses: FacetOption[];
  messageTypes: FacetOption[];
  types: FacetOption[];
  series: FacetOption[];
}

// Canonical Protestant order, so the Scripture dropdown reads Genesis -> Revelation
// instead of alphabetically. Books the parser doesn't recognize still show, after these.
const BIBLE_BOOKS = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth",
  "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra",
  "Nehemiah", "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon",
  "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos",
  "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah",
  "Malachi", "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians",
  "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians",
  "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon",
  "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude",
  "Revelation",
];

const BOOK_ORDER = new Map(BIBLE_BOOKS.map((book, index) => [book.toLowerCase(), index]));

// Common alternate spellings the categorizer (or a human) produces. Keys are
// already normalized (lowercase, single-spaced, numeric prefix).
const BOOK_ALIASES: Record<string, string> = {
  psalm: "Psalms",
  "song of songs": "Song of Solomon",
  songs: "Song of Solomon",
  "revelations": "Revelation",
};

export function normalizeKey(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

/**
 * "1 John 4:8" -> "1 John", "Psalm 23" -> "Psalms", "II Corinthians 5:17" ->
 * "2 Corinthians", "Romans" -> "Romans". Returns null when there's no leading book
 * name at all (e.g. a bare "3:16").
 */
export function scriptureBook(reference: string): string | null {
  const cleaned = reference
    .trim()
    .replace(/\s+/g, " ")
    .replace(/^(iii|ii|i)\s+/i, (roman) => `${roman.trim().length} `)
    .replace(/^([1-3])(?=[a-z])/i, "$1 ");
  const match = cleaned.match(/^((?:[1-3] )?[a-z][a-z .]*?)\.?\s*(?=\d|$)/i);
  if (!match?.[1]) return null;
  const raw = match[1].replace(/\.$/, "").trim();
  if (!raw) return null;
  const key = raw.toLowerCase();
  if (BOOK_ALIASES[key]) return BOOK_ALIASES[key]!;
  const canonical = BIBLE_BOOKS.find((book) => book.toLowerCase() === key);
  if (canonical) return canonical;
  // Unknown book name -- keep it, title-cased, rather than silently dropping the verse.
  return raw.replace(/\b[a-z]/g, (c) => c.toUpperCase());
}

function itemTopics(item: LibraryItem): string[] {
  return item.topics;
}

function matchesQuery(item: LibraryItem, query: string): boolean {
  const words = normalizeKey(query).split(" ").filter(Boolean);
  if (words.length === 0) return true;
  const haystack = [
    item.title,
    item.speakerName ?? "",
    item.seriesTitle ?? "",
    item.summary ?? "",
    ...item.topics,
    ...item.scriptures,
    ...item.messageTypes,
  ]
    .join(" ")
    .toLowerCase();
  return words.every((word) => haystack.includes(word));
}

type FilterKey = Exclude<keyof LibraryFilters, "query">;

function matchesFilter(item: LibraryItem, key: FilterKey, filters: LibraryFilters): boolean {
  switch (key) {
    case "speaker":
      return !filters.speaker || (item.speakerName !== null && normalizeKey(item.speakerName) === filters.speaker);
    case "topic":
      return !filters.topic || itemTopics(item).some((t) => normalizeKey(t) === filters.topic);
    case "book":
      return (
        !filters.book ||
        item.scriptures.some((ref) => {
          const book = scriptureBook(ref);
          return book !== null && normalizeKey(book) === filters.book;
        })
      );
    case "verse":
      return !filters.verse || item.scriptures.some((ref) => normalizeKey(ref) === filters.verse);
    case "messageType":
      return !filters.messageType || item.messageTypes.some((t) => normalizeKey(t) === filters.messageType);
    case "type":
      return !filters.type || item.resourceType === filters.type;
    case "series":
      return !filters.series || (item.seriesTitle !== null && normalizeKey(item.seriesTitle) === filters.series);
  }
}

const FILTER_KEYS: FilterKey[] = ["speaker", "topic", "book", "verse", "messageType", "type", "series"];

function matchesAll(item: LibraryItem, filters: LibraryFilters, except?: FilterKey): boolean {
  if (!matchesQuery(item, filters.query)) return false;
  return FILTER_KEYS.every((key) => key === except || matchesFilter(item, key, filters));
}

export function filterLibraryItems(items: LibraryItem[], filters: LibraryFilters): LibraryItem[] {
  return items.filter((item) => matchesAll(item, filters));
}

class FacetCounter {
  private readonly entries = new Map<string, FacetOption>();

  add(label: string) {
    const value = normalizeKey(label);
    if (!value) return;
    const existing = this.entries.get(value);
    if (existing) existing.count += 1;
    else this.entries.set(value, { value, label: label.trim().replace(/\s+/g, " "), count: 1 });
  }

  /** Most-used first, then alphabetical -- the speakers/topics a church actually
   * preaches on most should be at the top of the dropdown. */
  byCount(): FacetOption[] {
    return [...this.entries.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }

  byLabel(): FacetOption[] {
    return [...this.entries.values()].sort((a, b) => a.label.localeCompare(b.label));
  }

  byBookOrder(): FacetOption[] {
    const order = (option: FacetOption) => BOOK_ORDER.get(option.value) ?? Number.MAX_SAFE_INTEGER;
    return [...this.entries.values()].sort((a, b) => order(a) - order(b) || a.label.localeCompare(b.label));
  }
}

/**
 * Faceted counts: each dropdown's options are counted against the items matching
 * every *other* active filter, so options always reflect what's actually reachable
 * from the current selection (pick a speaker and the Topic list narrows to what
 * they've preached on) without the dropdown emptying itself out on selection.
 */
export function buildLibraryFacets(items: LibraryItem[], filters: LibraryFilters): LibraryFacets {
  const speakers = new FacetCounter();
  const topics = new FacetCounter();
  const books = new FacetCounter();
  const verses = new FacetCounter();
  const messageTypes = new FacetCounter();
  const types = new FacetCounter();
  const series = new FacetCounter();

  for (const item of items) {
    if (!matchesQuery(item, filters.query)) continue;
    if (item.speakerName && matchesAll(item, filters, "speaker")) speakers.add(item.speakerName);
    if (matchesAll(item, filters, "topic")) {
      // A resource listing the same topic twice (primary + secondary) counts once.
      new Set(itemTopics(item).map((t) => t.trim())).forEach((t) => topics.add(t));
    }
    if (matchesAll(item, filters, "book")) {
      new Set(item.scriptures.map(scriptureBook).filter((b): b is string => b !== null)).forEach((b) => books.add(b));
    }
    if (filters.book && matchesAll(item, filters, "verse")) {
      item.scriptures
        .filter((ref) => {
          const book = scriptureBook(ref);
          return book !== null && normalizeKey(book) === filters.book;
        })
        .forEach((ref) => verses.add(ref));
    }
    if (matchesAll(item, filters, "messageType")) {
      new Set(item.messageTypes.map((t) => t.trim())).forEach((t) => messageTypes.add(t));
    }
    if (matchesAll(item, filters, "type")) types.add(RESOURCE_TYPE_LABELS[item.resourceType]);
    if (item.seriesTitle && matchesAll(item, filters, "series")) series.add(item.seriesTitle);
  }

  return {
    speakers: speakers.byCount(),
    topics: topics.byCount(),
    books: books.byBookOrder(),
    verses: verses.byLabel(),
    messageTypes: messageTypes.byCount(),
    // Type options carry the enum value (not the label) so the filter can match
    // resourceType directly.
    types: types.byCount().map((option) => ({
      ...option,
      value: RESOURCE_TYPES.find((t) => normalizeKey(RESOURCE_TYPE_LABELS[t]) === option.value) ?? option.value,
    })),
    series: series.byCount(),
  };
}
