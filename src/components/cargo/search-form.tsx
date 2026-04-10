"use client";

import * as React from "react";
import { IconSearch, IconLoader2, IconX } from "@tabler/icons-react";
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
  const inputRef = React.useRef<HTMLInputElement>(null);

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
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value.toUpperCase())}
            placeholder={placeholders[searchType]}
            className="pr-9 font-mono text-sm"
            aria-label={SEARCH_TYPE_LABELS[searchType]}
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            disabled={isLoading}
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="입력 지우기"
            >
              <IconX size={15} />
            </button>
          )}
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
