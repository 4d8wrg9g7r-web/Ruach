import { ImageResponse } from "next/og";

export const OG_IMAGE_SIZE = { width: 1200, height: 630 };

/** Shared by opengraph-image.tsx and twitter-image.tsx -- one render function so the two conventions can't visually drift apart. */
export function renderOgImage(subtitle: string) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(160deg, #090d11 0%, #0c1116 60%, #090d11 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 30, letterSpacing: 10, color: "#e5bd83", fontWeight: 600, marginBottom: 28 }}>
          RUACH
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 54,
            fontWeight: 600,
            color: "white",
            textAlign: "center",
            maxWidth: 920,
            lineHeight: 1.15,
          }}
        >
          {subtitle}
        </div>
      </div>
    ),
    { ...OG_IMAGE_SIZE },
  );
}
