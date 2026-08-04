import { describe, expect, it } from "vitest";
import { parseVimeoUrl, parseYouTubeChannelUrl, parseYouTubeUrl } from "../url-parsing";

describe("parseYouTubeUrl", () => {
  it("parses watch URLs", () => {
    expect(parseYouTubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("parses youtu.be short URLs", () => {
    expect(parseYouTubeUrl("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("parses embed URLs", () => {
    expect(parseYouTubeUrl("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("parses shorts URLs", () => {
    expect(parseYouTubeUrl("https://www.youtube.com/shorts/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("handles www and bare hostnames", () => {
    expect(parseYouTubeUrl("https://youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("returns null for non-YouTube URLs", () => {
    expect(parseYouTubeUrl("https://vimeo.com/12345")).toBeNull();
  });

  it("returns null for a YouTube URL with no video id", () => {
    expect(parseYouTubeUrl("https://www.youtube.com/watch")).toBeNull();
    expect(parseYouTubeUrl("https://www.youtube.com/")).toBeNull();
  });

  it("returns null for malformed input", () => {
    expect(parseYouTubeUrl("not a url")).toBeNull();
  });
});

describe("parseYouTubeChannelUrl", () => {
  it("parses /channel/ID URLs", () => {
    expect(parseYouTubeChannelUrl("https://www.youtube.com/channel/UCabc123")).toEqual({
      type: "id",
      value: "UCabc123",
    });
  });

  it("parses /@handle URLs", () => {
    expect(parseYouTubeChannelUrl("https://www.youtube.com/@somechannel")).toEqual({
      type: "handle",
      value: "@somechannel",
    });
  });

  it("parses legacy /c/ and /user/ URLs as username lookups", () => {
    expect(parseYouTubeChannelUrl("https://www.youtube.com/c/SomeChannel")).toEqual({
      type: "username",
      value: "SomeChannel",
    });
    expect(parseYouTubeChannelUrl("https://www.youtube.com/user/LegacyName")).toEqual({
      type: "username",
      value: "LegacyName",
    });
  });

  it("returns null for a single-video URL", () => {
    expect(parseYouTubeChannelUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBeNull();
  });

  it("returns null for non-YouTube URLs", () => {
    expect(parseYouTubeChannelUrl("https://vimeo.com/123")).toBeNull();
  });
});

describe("parseVimeoUrl", () => {
  it("parses standard vimeo.com URLs", () => {
    expect(parseVimeoUrl("https://vimeo.com/76979871")).toBe("76979871");
  });

  it("parses player.vimeo.com embed URLs", () => {
    expect(parseVimeoUrl("https://player.vimeo.com/video/76979871")).toBe("76979871");
  });

  it("returns null for non-numeric vimeo paths", () => {
    expect(parseVimeoUrl("https://vimeo.com/watch")).toBeNull();
  });

  it("returns null for non-Vimeo URLs", () => {
    expect(parseVimeoUrl("https://youtube.com/watch?v=abc")).toBeNull();
  });

  it("returns null for malformed input", () => {
    expect(parseVimeoUrl("not a url")).toBeNull();
  });
});
