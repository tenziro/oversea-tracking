import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: "linear-gradient(135deg, #1B4F91 0%, #0d3a7a 100%)",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Ship hull */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 17L5 8H19L21 17"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect x="8" y="4" width="8" height="4" rx="1" fill="white" opacity="0.9" />
          <path
            d="M1 20C3.5 20 4.5 19 7 19s3.5 1 6 1 4.5-1 7-1 3.5 1 3 1"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
