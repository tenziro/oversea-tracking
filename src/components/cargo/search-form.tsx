"use client";

import * as React from "react";
import { IconSearch, IconLoader2, IconX, IconClipboard } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { SEARCH_TYPE_LABELS } from "@/lib/utils";
import type { SearchType } from "@/lib/types";
import { BarcodeScanner } from "./barcode-scanner";

interface SearchFormProps {
  onSearch: (query: string, searchType: SearchType) => void;
  isLoading?: boolean;
  initialQuery?: string;
  initialSearchType?: SearchType;
  className?: string;
}

export function SearchForm({
  onSearch,
  isLoading = false,
  initialQuery = "",
  initialSearchType = "cargMtNo",
  className,
}: SearchFormProps) {
  const [query, setQuery] = React.useState(initialQuery);
  const [searchType, setSearchType] = React.useState<SearchType>(initialSearchType);
  const [hasClipboard, setHasClipboard] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setHasClipboard(
      typeof navigator !== "undefined" &&
        "clipboard" in navigator &&
        typeof navigator.clipboard.readText === "function"
    );
  }, []);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const cleaned = text.trim().toUpperCase().replace(/[^A-Z0-9\-]/g, "");
      if (cleaned) {
        setQuery(cleaned);
        inputRef.current?.focus();
      }
    } catch {
      // 권한 거부 또는 미지원
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed || isLoading) return;
    onSearch(trimmed, searchType);
  };

  const handleClear = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  // 입력값 패턴으로 검색 유형 자동 감지
  const detectSearchType = (value: string): SearchType | null => {
    const v = value.trim().toUpperCase();
    // 화물관리번호: 2자리 국가코드 + 3자리 항구코드 + 숫자, 총 16~18자
    if (/^[A-Z]{2}[A-Z]{3}\d{11,13}$/.test(v)) return "cargMtNo";
    // B/L번호: 4자리 영문 + 숫자, 10~14자
    if (/^[A-Z]{4}\d{6,10}$/.test(v)) return "hblNo";
    return null;
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const upper = e.target.value.toUpperCase();
    setQuery(upper);
    const detected = detectSearchType(upper);
    if (detected) setSearchType(detected);
  };

  const placeholders: Record<SearchType, string> = {
    cargMtNo: "예: KRPUS12345678901",
    hblNo: "예: ABCD12345678",
    mblNo: "예: ABCD12345678",
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-3", className)}>
      {/* 검색 유형 선택 */}
      <div className="flex gap-2">
        <Select
          value={searchType}
          onValueChange={(val) => setSearchType(val as SearchType)}
        >
          <SelectTrigger className="w-[160px] flex-shrink-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.entries(SEARCH_TYPE_LABELS) as [SearchType, string][]).map(
              ([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
      </div>

      {/* 검색 입력 */}
      <div className="relative flex gap-2">
        <BarcodeScanner
          onResult={(value) => {
            // 바코드 스캔 결과 자동 입력 + 검색 유형 추정 + 즉시 검색
            let detectedType: SearchType = searchType;
            if (/^[A-Z]{2}/.test(value) && value.length >= 16) {
              detectedType = "cargMtNo";
            }
            setQuery(value);
            setSearchType(detectedType);
            onSearch(value, detectedType);
          }}
        />
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleQueryChange}
            placeholder={placeholders[searchType]}
            className="pr-9 font-mono text-sm"
            aria-label={SEARCH_TYPE_LABELS[searchType]}
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            disabled={isLoading}
          />
          {query ? (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="입력 지우기"
            >
              <IconX size={15} />
            </button>
          ) : hasClipboard ? (
            <button
              type="button"
              onClick={handlePaste}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="클립보드에서 붙여넣기"
              disabled={isLoading}
            >
              <IconClipboard size={15} />
            </button>
          ) : null}
        </div>
        <Button
          type="submit"
          disabled={!query.trim() || isLoading}
          className="shrink-0 px-4"
          aria-label="검색"
        >
          {isLoading ? (
            <IconLoader2 size={18} className="animate-spin" />
          ) : (
            <IconSearch size={18} />
          )}
          <span className="ml-1 hidden sm:inline">검색</span>
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        * 관세청 유니패스에 등록된 화물 정보를 조회합니다.
      </p>
    </form>
  );
}
