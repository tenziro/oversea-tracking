// 화물통관 진행 상태 타입
export type ClearanceStatus =
  | "PRE_DECLARATION"   // 신고전
  | "DECLARED"          // 신고
  | "INSPECTION"        // 검사
  | "EXAMINATION"       // 심사
  | "DUTY_PAYMENT"      // 납세
  | "CLEARED"           // 통관완료
  | "REJECTED"          // 반송/취하
  | "UNKNOWN";

// 통관 진행 단계 아이템
export interface ClearanceProgressItem {
  snIdx?: string;           // 순번
  csclPrgsSttsNm?: string;  // 통관진행상태명
  dclrNo?: string;          // 신고번호
  prgsStts: string;         // 진행상태 코드
  prgsSttsNm?: string;      // 진행상태명
  prcsDt?: string;          // 처리일시 (이전 필드명)
  prcsDttm?: string;        // 처리일시 (API 가이드 필드명)
  shedSgn?: string;         // 장치장부호
  shedNm?: string;          // 장치장명
  rlbrCn?: string;          // 반출입내용
  bfnnGdncCn?: string;      // 사전안내내용
  rlbrBssNo?: string;       // 반출입근거번호
}

// 화물 기본 정보
export interface CargoInfo {
  cargMtNo?: string;        // 화물관리번호
  hblNo?: string;           // House B/L번호
  mblNo?: string;           // 마스터 B/L번호
  cargNm?: string;          // 화물명
  prnm?: string;            // 품명
  cargSttus?: string;       // 화물상태
  cargTp?: string;          // 화물구분
  pckGcnt?: string;         // 포장개수
  pckUt?: string;           // 포장단위
  ttwg?: string;            // 총중량
  wghtUt?: string;          // 중량단위
  ldprCd?: string;          // 적재항코드
  ldprNm?: string;          // 적재항명
  dsprCd?: string;          // 양륙항코드
  dsprNm?: string;          // 양륙항명
  shipNm?: string;          // 선박명
  shipNat?: string;         // 선박국적코드
  shipNatNm?: string;       // 선박국적명
  cntrGcnt?: string;        // 컨테이너개수
  cntrNo?: string;          // 컨테이너번호
  frwrEntsConm?: string;    // 포워더명
  etprCstm?: string;        // 입항세관
  etprDt?: string;          // 입항일시
  csclPrgsStts: ClearanceProgressItem[];  // 통관진행상태 목록
}

// API 응답 타입
export interface CargoApiResponse {
  success: boolean;
  data?: CargoInfo;
  error?: string;
  errorCode?: string;
}

// 검색 타입
export type SearchType = "cargMtNo" | "hblNo" | "mblNo";

// 최근 검색 기록
export interface RecentSearch {
  id: string;
  query: string;
  searchType: SearchType;
  timestamp: number;
  cargoName?: string;
  lastStatus?: string;
}

// 테마 타입
export type Theme = "light" | "dark" | "system";

// 통관 진행상태 코드 → 한국어 매핑
export const CLEARANCE_STATUS_MAP: Record<string, { label: string; status: ClearanceStatus }> = {
  "11": { label: "신고전", status: "PRE_DECLARATION" },
  "12": { label: "신고전(P/L)", status: "PRE_DECLARATION" },
  "21": { label: "수입신고", status: "DECLARED" },
  "22": { label: "화물검사", status: "INSPECTION" },
  "23": { label: "서류제출", status: "EXAMINATION" },
  "24": { label: "심사진행", status: "EXAMINATION" },
  "25": { label: "납세심사", status: "DUTY_PAYMENT" },
  "26": { label: "세액결정", status: "DUTY_PAYMENT" },
  "31": { label: "수리(통관완료)", status: "CLEARED" },
  "41": { label: "반송", status: "REJECTED" },
  "42": { label: "취하", status: "REJECTED" },
};

// 화물상태 코드 → 한국어 매핑
export const CARGO_STATUS_MAP: Record<string, string> = {
  "11": "적재확정",
  "12": "적재취소",
  "21": "입항적재",
  "22": "입항적재취소",
  "31": "하선(기)신고",
  "32": "하선(기)신고취소",
  "41": "화물반입",
  "42": "화물반입취소",
  "51": "보세운송신고",
  "61": "수입신고수리",
  "71": "반송",
};
