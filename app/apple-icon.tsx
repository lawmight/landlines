import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180
};

export const contentType = "image/png";

export default function AppleIcon(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "linear-gradient(145deg, #090d16 0%, #1b2740 55%, #5f3dc4 100%)",
          borderRadius: 42,
          display: "flex",
          height: "100%",
          justifyContent: "center",
          width: "100%"
        }}
      >
        <div
          style={{
            color: "#f7f8fa",
            fontSize: 110,
            fontWeight: 700,
            letterSpacing: "-0.04em",
            lineHeight: 1
          }}
        >
          L
        </div>
      </div>
    ),
    {
      ...size
    }
  );
}
