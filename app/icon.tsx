import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512
};

export const contentType = "image/png";

export default function Icon(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "radial-gradient(circle at top right, #8b5cf6 0%, #4c1d95 35%, #080b12 75%)",
          borderRadius: 120,
          display: "flex",
          height: "100%",
          justifyContent: "center",
          width: "100%"
        }}
      >
        <div
          style={{
            color: "#f7f8fa",
            fontSize: 280,
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
