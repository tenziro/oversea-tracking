# Lenis 스크롤 애니메이션 강화 설계

**날짜:** 2026-04-13  
**대상 파일:** `public/landing.html`, `public/landing.css`  
**의존성 추가 없음** — Lenis CDN(이미 탑재)만 사용

---

## 목표

기존 IntersectionObserver 기반 단순 fadeInUp reveal을 유지하면서,  
Lenis의 scroll 이벤트(progress, velocity)를 활용해 **패럴랙스**와 **스크롤 진행률 연동** 효과를 추가한다.

---

## 구현할 7가지 효과

### A — 패럴랙스

#### A1. 히어로 폰 목업 패럴랙스
- **대상:** `.animate-float` 래퍼 (폰 쉘 전체)
- **동작:** `translateY(scroll * 0.2)` — 스크롤보다 20% 느리게 이동해 배경과 깊이 차이 생성
- **범위:** hero 섹션 내 (scroll 0 ~ ~800px), 섹션 벗어나면 고정
- **CSS 변환:** `style.transform`에 float 애니메이션과 합성 필요 → `--parallax-y` CSS 변수로 분리하고 CSS에서 `translateY(calc(var(--parallax-y) + ...))`로 합성

#### A2. 히어로 배경 글로우 패럴랙스
- **대상:** hero 섹션 내부 `.absolute.-inset-8` glow div
- **동작:** `translateY(scroll * 0.08)` — 미세한 상승으로 원근감 강조

#### A3. 플로팅 태그 3개 개별 패럴랙스
- **대상:** 폰 우상단 "실시간 조회", 좌하단 "공식 API", 좌상단 "PWA 설치" 태그
- **계수:** 각각 `0.12 / 0.18 / 0.25` — 서로 다른 속도로 입체감 부여
- **마크업:** 각 태그에 `data-parallax="0.12"` 등 속성 부여 후 JS에서 읽음

---

### B — 스크롤 진행률 연동

#### B4. 히어로 섹션 Exit 애니메이션
- **대상:** hero `<section>` 내 좌측 텍스트 블록 (`.max-w-2xl`)
- **동작:** hero 섹션 scroll progress 0→1 구간에서
  - `opacity`: 1 → 0.2
  - `scale`: 1 → 0.97
  - `translateY`: 0 → -20px
- **계산:** `heroProgress = clamp((scroll - heroTop) / heroHeight, 0, 1)`
- **한계:** progress > 0.6 부터 시작해 과하지 않게 조절

#### B5. Metrics 숫자 카운터
- **대상:** "8단계", "3가지", "100%", "24/7" 텍스트 노드
- **동작:** IntersectionObserver 진입 시 0→최종값 숫자 카운트업 (1.5초)
- **단위 처리:** 숫자 부분만 애니메이션, 단위(단계/가지/%/7)는 고정
- **easing:** `easeOutExpo` 커브 적용
- **마크업:** `<p data-counter="8" data-suffix="단계">8단계</p>` 형태로 data 속성 추가

#### B6. 섹션 헤딩 강화 reveal
- **대상:** 각 섹션 `<h2>` 및 배지 (`.reveal` 중 섹션 첫 요소)
- **기존과 차이:** 기존 reveal은 순수 위→아래 fade. 추가로 `translateX(-12px→0)` 수평 슬라이드 합성
- **CSS:** `.reveal-heading` 클래스 추가, 기존 `.reveal`과 별도 관리

#### B7. 전역 스크롤 진행 바
- **위치:** 페이지 최상단 고정 (nav 위), 높이 2px, z-index: 50
- **색상:** emerald-400 → emerald-500 그라디언트
- **동작:** `lenis.progress` 0→1 → `width` 0→100%
- **마크업:** `<div id="scroll-progress-bar">` body 최상단에 추가

---

## 기술 구현 방식

### Lenis 이벤트 활용
```js
lenis.on('scroll', ({ scroll, progress, velocity }) => {
  updateParallax(scroll);
  updateHeroExit(scroll);
  updateScrollBar(progress);
});
```

### float 애니메이션과 패럴랙스 합성
CSS `float` 애니메이션(`translateY`)과 JS 패럴랙스(`translateY`)가 충돌하므로,  
float 애니메이션을 CSS 변수 `--float-y`로 추출하고, JS는 `--parallax-y`만 건드림.  
실제 transform은 CSS에서: `transform: translateY(calc(var(--float-y, 0px) + var(--parallax-y, 0px)))`  
→ 단순화: float 애니메이션을 JS `Math.sin(time)` 기반으로 rAF 안에서 직접 계산해 합산.

### 성능
- 모든 transform은 `will-change: transform` 처리
- `lenis.on('scroll')` 콜백은 이미 rAF-throttled이므로 별도 throttle 불필요
- 카운터는 `requestAnimationFrame` 기반으로 구현

---

## 변경 파일 요약

| 파일 | 변경 내용 |
|------|-----------|
| `landing.html` | data 속성 추가 (parallax 계수, counter 값), scroll-progress-bar div 추가, JS 블록 확장 |
| `landing.css` | `.reveal-heading` 클래스, `#scroll-progress-bar` 스타일, `will-change` 추가 |
