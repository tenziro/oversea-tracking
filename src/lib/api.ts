import type { CargoApiResponse, CargoInfo, ClearanceProgressItem, SearchType } from "./types";

// XML 파싱 헬퍼 - xml2js 없이 순수 정규식으로 간단 파싱
function extractXmlValue(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([^<]*)<\/${tag}>`));
  return match ? match[1].trim() : "";
}

function extractXmlArray(xml: string, itemTag: string): string[] {
  const matches = xml.match(new RegExp(`<${itemTag}[\\s\\S]*?<\/${itemTag}>`, "g"));
  return matches ?? [];
}

function parseProgressItem(itemXml: string): ClearanceProgressItem {
  return {
    snIdx: extractXmlValue(itemXml, "snIdx"),
    csclPrgsSttsNm: extractXmlValue(itemXml, "csclPrgsSttsNm"),
    dclrNo: extractXmlValue(itemXml, "dclrNo") || undefined,
    prgsStts: extractXmlValue(itemXml, "prgsStts"),
    prgsSttsNm: extractXmlValue(itemXml, "prgsSttsNm"),
    prcsDt: extractXmlValue(itemXml, "prcsDt"),
  };
}

// 서버 사이드 API 호출 (API 키 숨김)
export async function fetchCargoStatus(
  query: string,
  searchType: SearchType
): Promise<CargoApiResponse> {
  try {
    const params = new URLSearchParams({ query, searchType });
    const res = await fetch(`/api/cargo?${params}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "네트워크 오류가 발생했습니다." }));
      return { success: false, error: err.error ?? "서버 오류가 발생했습니다." };
    }

    return await res.json();
  } catch {
    return { success: false, error: "네트워크 연결을 확인해 주세요." };
  }
}

// 서버 사이드: 관세청 API 직접 호출 (route.ts에서 사용)
export async function fetchFromCustomsAPI(
  query: string,
  searchType: SearchType,
  apiKey: string
): Promise<CargoApiResponse> {
  const BASE_URL =
    "https://unipass.customs.go.kr:38010/ext/rest/cargCsclPrgsInfoQry/retrieveCargCsclPrgsInfo";

  const params = new URLSearchParams({ crkyCd: apiKey });

  switch (searchType) {
    case "cargMtNo":
      params.append("cargMtNo", query);
      break;
    case "blNo":
      params.append("blNo", query);
      break;
    case "mblNo":
      params.append("mblNo", query);
      break;
  }

  const url = `${BASE_URL}?${params}`;

  const res = await fetch(url, {
    headers: {
      Accept: "application/xml",
      "User-Agent": "CargoTracker/1.0",
    },
    next: { revalidate: 60 }, // 1분 캐시
  });

  if (!res.ok) {
    return {
      success: false,
      error: `관세청 API 오류: ${res.status}`,
      errorCode: String(res.status),
    };
  }

  const xml = await res.text();

  // 오류 응답 체크
  const errCode = extractXmlValue(xml, "errCode");
  if (errCode && errCode !== "00" && errCode !== "000") {
    const errMsg = extractXmlValue(xml, "errMsg") || "조회 결과가 없습니다.";
    return { success: false, error: errMsg, errorCode: errCode };
  }

  // 데이터 없음 체크
  const totalCount = extractXmlValue(xml, "tCnt");
  if (totalCount === "0") {
    return { success: false, error: "조회된 화물 정보가 없습니다.", errorCode: "NO_DATA" };
  }

  // 화물 정보 파싱
  const items = extractXmlArray(xml, "item");
  const progressItems: ClearanceProgressItem[] = items.map(parseProgressItem);

  const data: CargoInfo = {
    cargMtNo: extractXmlValue(xml, "cargMtNo") || undefined,
    blNo: extractXmlValue(xml, "blNo") || undefined,
    mblNo: extractXmlValue(xml, "mblNo") || undefined,
    cargNm: extractXmlValue(xml, "cargNm") || undefined,
    cargSttus: extractXmlValue(xml, "cargSttus") || undefined,
    pckGcnt: extractXmlValue(xml, "pckGcnt") || undefined,
    wghtUt: extractXmlValue(xml, "wghtUt") || undefined,
    ldprCd: extractXmlValue(xml, "ldprCd") || undefined,
    ldprNm: extractXmlValue(xml, "ldprNm") || undefined,
    dsprCd: extractXmlValue(xml, "dsprCd") || undefined,
    dsprNm: extractXmlValue(xml, "dsprNm") || undefined,
    etprDt: extractXmlValue(xml, "etprDt") || undefined,
    csclPrgsStts: progressItems,
  };

  return { success: true, data };
}
