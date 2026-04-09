import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";

export const runtime = "edge";

const ICON_SVG = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="70%" height="70%">
    <path
      d="M15 70L22 40H78L85 70"
      stroke="white"
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <rect x="32" y="20" width="36" height="20" rx="3" fill="white" opacity="0.92" />
    <line x1="50" y1="20" x2="50" y2="40" stroke="#1B4F91" strokeWidth="2" opacity="0.4" />
    <line x1="32" y1="30" x2="68" y2="30" stroke="#1B4F91" strokeWidth="2" opacity="0.4" />
    <path
      d="M8 82C18 82 22 77 32 77s14 5 24 5 20-5 30-5 14 5 24 5 10-2 8-2"
      stroke="white"
      strokeWidth="5.5"
      strokeLinecap="round"
      fill="none"
      opacity="0.88"
    />
  </svg>
);

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ size: string }> }
) {
  const { size: sizeParam } = await params;
  const size = parseInt(sizeParam, 10);

  if (isNaN(size) || size < 16 || size > 1024) {
    return new Response("Invalid size", { status: 400 });
  }

  const radius = Math.round(size * 0.1875); // ~18.75% for rounded corners

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          background: "linear-gradient(135deg, #1B4F91 0%, #0d3a7a 100%)",
          borderRadius: radius,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {ICON_SVG}
      </div>
    ),
    { width: size, height: size }
  );
}
