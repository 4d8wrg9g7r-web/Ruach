import { describe, expect, it } from "vitest";
import { tokenize } from "../LocalRetrievalProvider";

describe("tokenize", () => {
  it("lowercases and splits on non-alphanumeric characters", () => {
    expect(tokenize("Do you have anything about anxiety?")).toEqual([
      "do",
      "you",
      "have",
      "anything",
      "about",
      "anxiety",
    ]);
  });

  it("dedupes repeated words", () => {
    expect(tokenize("anxiety anxiety Anxiety")).toEqual(["anxiety"]);
  });

  it("returns an empty array for input with no word characters", () => {
    expect(tokenize("???...")).toEqual([]);
  });
});
