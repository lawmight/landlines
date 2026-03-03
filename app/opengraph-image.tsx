import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630
};

export const contentType = "image/png";

export default function OpengraphImage(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "flex-start",
          background: "linear-gradient(135deg, #080b12 0%, #151c30 55%, #2a1f3d 100%)",
          color: "#f7f8fa",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "space-between",
          padding: "72px",
          width: "100%"
        }}
      >
        <div style={{ fontSize: 32, letterSpacing: "0.24em", opacity: 0.75, textTransform: "uppercase" }}>Landlines</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.05, maxWidth: 900 }}>
            Private voice and video for your inner circle.
          </div>
          <div style={{ color: "#c2ccdf", fontSize: 34, maxWidth: 860 }}>
            Invite-only calling with presence-aware reachability.
          </div>
        </div>
      </div>
    ),
    {
      ...size
    }
  );
}
