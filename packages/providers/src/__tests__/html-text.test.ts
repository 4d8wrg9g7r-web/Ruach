import { describe, expect, it } from "vitest";
import { extractReadableText } from "../html-text";

describe("extractReadableText", () => {
  it("strips tags and leaves the text", () => {
    expect(extractReadableText("<p>Hello <b>world</b></p>")).toBe("Hello world");
  });

  it("removes script and style content entirely", () => {
    const html = "<html><head><style>.a{color:red}</style></head><body><script>alert(1)</script><p>Real content</p></body></html>";
    expect(extractReadableText(html)).toBe("Real content");
  });

  it("removes HTML comments", () => {
    expect(extractReadableText("<p>Before</p><!-- a comment --><p>After</p>")).toBe("Before\nAfter");
  });

  it("decodes common entities", () => {
    expect(extractReadableText("<p>Tom &amp; Jerry&nbsp;&mdash;&nbsp;a &quot;classic&quot;</p>")).toBe(
      'Tom & Jerry &mdash; a "classic"',
    );
  });

  it("turns block-level closing tags into line breaks", () => {
    const html = "<h1>Title</h1><p>Paragraph one.</p><p>Paragraph two.</p>";
    expect(extractReadableText(html)).toBe("Title\nParagraph one.\nParagraph two.");
  });

  it("collapses excess blank lines", () => {
    const html = "<p>One</p>\n\n\n\n<p>Two</p>";
    const result = extractReadableText(html);
    expect(result).not.toMatch(/\n{3,}/);
  });

  it("truncates to maxChars", () => {
    const html = `<p>${"a".repeat(100)}</p>`;
    expect(extractReadableText(html, 10)).toHaveLength(10);
  });
});
