import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "화물통관 조회 - 관세청 화물 통관 상태 실시간 조회";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "linear-gradient(135deg, #0d3a7a 0%, #1B4F91 40%, #1a6bc4 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 배경 장식 원 */}
        <div
          style={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -150,
            left: -50,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
          }}
        />

        {/* 물결 효과 */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 120,
            background: "rgba(255,255,255,0.06)",
            borderRadius: "60% 60% 0 0",
          }}
        />

        {/* 메인 콘텐츠 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
          }}
        >
          {/* 아이콘 */}
          <div
            style={{
              width: 120,
              height: 120,
              background: "rgba(255,255,255,0.15)",
              borderRadius: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid rgba(255,255,255,0.3)",
            }}
          >
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 17L5 8H19L21 17"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <rect x="8" y="4" width="8" height="4" rx="1" fill="white" opacity="0.9" />
              <path
                d="M1 20C3.5 20 4.5 19 7 19s3.5 1 6 1 4.5-1 7-1"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* 타이틀 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                fontSize: 64,
                fontWeight: 800,
                color: "white",
                letterSpacing: "-2px",
              }}
            >
              화물통관 조회
            </div>
            <div
              style={{
                fontSize: 26,
                color: "rgba(255,255,255,0.75)",
                fontWeight: 400,
              }}
            >
              관세청 공공 API · 실시간 통관 상태 확인
            </div>
          </div>

          {/* 기능 배지들 */}
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            {["화물관리번호", "B/L번호", "마스터 B/L"].map((label) => (
              <div
                key={label}
                style={{
                  padding: "8px 20px",
                  background: "rgba(255,255,255,0.15)",
                  borderRadius: 100,
                  color: "rgba(255,255,255,0.9)",
                  fontSize: 18,
                  border: "1px solid rgba(255,255,255,0.25)",
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* 하단 텍스트 */}
        <div
          style={{
            position: "absolute",
            bottom: 32,
            color: "rgba(255,255,255,0.5)",
            fontSize: 16,
          }}
        >
          관세청 유니패스 화물통관진행정보 조회서비스
        </div>
      </div>
    ),
    { ...size }
  );
}
