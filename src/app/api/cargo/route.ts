import { type NextRequest, NextResponse } from "next/server";
import { fetchFromCustomsAPI } from "@/lib/api";
import type { SearchType } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.trim();
  const searchType = searchParams.get("searchType") as SearchType | null;

  // 입력 검증
  if (!query) {
    return NextResponse.json(
      { success: false, error: "검색어를 입력해 주세요." },
      { status: 400 }
    );
  }

  if (!searchType || !["cargMtNo", "blNo", "mblNo"].includes(searchType)) {
    return NextResponse.json(
      { success: false, error: "올바른 검색 유형을 선택해 주세요." },
      { status: 400 }
    );
  }

  // 입력 길이 제한 (보안)
  if (query.length > 50) {
    return NextResponse.json(
      { success: false, error: "검색어가 너무 깁니다." },
      { status: 400 }
    );
  }

  // 허용 문자만 허용 (영문, 숫자, 하이픈)
  if (!/^[A-Za-z0-9\-_/]+$/.test(query)) {
    return NextResponse.json(
      { success: false, error: "올바르지 않은 검색어 형식입니다." },
      { status: 400 }
    );
  }

  const apiKey = process.env.CUSTOMS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        success: false,
        error: "API 키가 설정되지 않았습니다. 관리자에게 문의해 주세요.",
        errorCode: "NO_API_KEY",
      },
      { status: 503 }
    );
  }

  try {
    const result = await fetchFromCustomsAPI(query, searchType, apiKey);

    if (!result.success) {
      return NextResponse.json(result, { status: result.errorCode === "NO_DATA" ? 404 : 500 });
    }

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("[cargo API error]", error);
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 }
    );
  }
}
