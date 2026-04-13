# Lenis 스크롤 애니메이션 강화 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lenis를 활용해 패럴랙스(A1-A3)와 스크롤 진행률 연동(B4-B7) 총 7가지 애니메이션 효과를 landing.html에 추가한다.

**Architecture:** 추가 라이브러리 없이 기존 Lenis CDN만 사용. `lenis.on('scroll', {scroll, progress, velocity})` 콜백에서 DOM 요소의 `style.transform` / `style.width`를 직접 조작. float 애니메이션은 CSS 키프레임 제거 후 rAF 내 Math.sin 합산으로 전환해 parallax와 단일 transform으로 합성.

**Tech Stack:** Lenis 1.1.14 (CDN, 이미 탑재), Vanilla JS, CSS custom properties

---

## 변경 파일 맵

| 파일 | 변경 내용 |
|------|-----------|
| `public/landing.html` | ① `<body>` 최상단 scroll-progress-bar div 추가 ② 폰 목업 래퍼 id 추가 ③ 글로우 div id 추가 ④ 플로팅 태그 `data-parallax` 속성 추가 ⑤ metrics `data-counter` 속성 추가 ⑥ 섹션 h2 클래스 `reveal` → `reveal reveal-heading` 변경 ⑦ 메인 JS 블록 교체 |
| `public/landing.css` | ① `@keyframes float` 제거 ② `.animate-float` 수정 ③ `#scroll-progress-bar` 스타일 추가 ④ `.reveal-heading` 클래스 추가 |

---

## Task 1: CSS 준비 — float 분리 + 새 클래스

**Files:**
- Modify: `public/landing.css`

- [ ] **Step 1: `@keyframes float`와 `.animate-float` 교체**

`landing.css`에서 아래 블록을 찾아:
```css
@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}
```
```css
.animate-float {
  animation: float 5s ease-in-out infinite;
}
```

다음으로 교체 (float 애니메이션을 JS로 이전, CSS 키프레임 제거):
```css
/* float 키프레임은 JS(rAF + Math.sin)로 이전 */
.animate-float {
  will-change: transform;
}
```

- [ ] **Step 2: `#scroll-progress-bar` 스타일 추가**

`landing.css` 파일 맨 끝에 추가:
```css
/* =====================================================
   SCROLL PROGRESS BAR
   ===================================================== */
#scroll-progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 0%;
  height: 2px;
  background: linear-gradient(90deg, #10b981, #34d399);
  z-index: 9999;
  pointer-events: none;
  transform-origin: left;
  transition: none;
}

/* =====================================================
   REVEAL HEADING (수평 슬라이드 강화)
   ===================================================== */
.reveal-heading {
  opacity: 0;
  transform: translateY(1rem) translateX(-12px);
  transition:
    opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.75s cubic-bezier(0.16, 1, 0.3, 1);
}

.reveal-heading.in {
  opacity: 1;
  transform: translateY(0) translateX(0);
}

.rd1.reveal-heading.in { transition-delay: 0.06s; }
.rd2.reveal-heading.in { transition-delay: 0.12s; }
.rd3.reveal-heading.in { transition-delay: 0.18s; }
```

- [ ] **Step 3: parallax 대상 요소 `will-change` 추가**

`landing.css` 맨 끝에 이어서 추가:
```css
/* =====================================================
   PARALLAX TARGETS
   ===================================================== */
#hero-glow,
[data-parallax] {
  will-change: transform;
}

#hero-left {
  will-change: opacity, transform;
}
```

- [ ] **Step 4: 브라우저에서 CSS 파일 확인 (빌드 없음, 저장만)**

변경 저장 후 완료.

---

## Task 2: HTML 마크업 — id/data 속성 추가

**Files:**
- Modify: `public/landing.html`

- [ ] **Step 1: `<body>` 태그 바로 다음에 scroll-progress-bar 삽입**

현재 코드:
```html
<body class="gradient-page antialiased">
  <div class="noise-overlay"></div>
```
교체:
```html
<body class="gradient-page antialiased">
  <div id="scroll-progress-bar"></div>
  <div class="noise-overlay"></div>
```

- [ ] **Step 2: 히어로 좌측 텍스트 블록에 id 추가**

현재 코드 (line ~70):
```html
        <!-- Left -->
        <div class="max-w-2xl">
```
교체:
```html
        <!-- Left -->
        <div id="hero-left" class="max-w-2xl">
```

- [ ] **Step 3: 히어로 글로우 div에 id 추가**

현재 코드 (line ~124):
```html
            <!-- Ambient glow -->
            <div class="absolute -inset-8 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none"></div>
```
교체:
```html
            <!-- Ambient glow -->
            <div id="hero-glow" class="absolute -inset-8 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none"></div>
```

- [ ] **Step 4: 플로팅 태그 3개에 `data-parallax` 속성 추가**

현재 코드 (line ~264):
```html
            <div class="absolute -right-6 top-24 glass rounded-2xl px-3 py-2.5">
```
교체:
```html
            <div data-parallax="0.12" class="absolute -right-6 top-24 glass rounded-2xl px-3 py-2.5">
```

현재 코드 (line ~270):
```html
            <div class="absolute -left-8 bottom-40 glass rounded-2xl px-3 py-2.5">
```
교체:
```html
            <div data-parallax="0.18" class="absolute -left-8 bottom-40 glass rounded-2xl px-3 py-2.5">
```

현재 코드 (line ~276):
```html
            <div class="absolute -left-4 top-16 glass rounded-2xl px-3 py-2.5">
```
교체:
```html
            <div data-parallax="0.25" class="absolute -left-4 top-16 glass rounded-2xl px-3 py-2.5">
```

- [ ] **Step 5: Metrics 숫자 p 태그에 `data-counter` 속성 추가**

현재 코드 (line ~293):
```html
          <p class="text-4xl md:text-5xl font-bold text-emerald-400 mb-2">8단계</p>
```
교체:
```html
          <p class="text-4xl md:text-5xl font-bold text-emerald-400 mb-2" data-counter="8" data-suffix="단계">8단계</p>
```

현재 코드 (line ~297):
```html
          <p class="text-4xl md:text-5xl font-bold text-emerald-400 mb-2">3가지</p>
```
교체:
```html
          <p class="text-4xl md:text-5xl font-bold text-emerald-400 mb-2" data-counter="3" data-suffix="가지">3가지</p>
```

현재 코드 (line ~301):
```html
          <p class="text-4xl md:text-5xl font-bold text-emerald-400 mb-2">100%</p>
```
교체:
```html
          <p class="text-4xl md:text-5xl font-bold text-emerald-400 mb-2" data-counter="100" data-suffix="%">100%</p>
```

(네 번째 "무료"는 숫자가 아니므로 건너뜀)

- [ ] **Step 6: 섹션 h2에 `reveal-heading` 클래스 추가**

`#how`, `#status`, `#features`, `#pwa` 섹션의 `<h2 class="reveal ...">` 에 `reveal-heading` 추가.

총 4곳을 찾아 `class="reveal ` → `class="reveal reveal-heading ` 로 교체:
```html
<!-- 예시 — how 섹션 -->
<h2 class="reveal reveal-heading text-4xl md:text-5xl font-bold text-zinc-50 mb-5 leading-tight">딱 3단계로 끝나는<br>간편한 통관 조회</h2>
```
나머지 3개 h2도 동일하게 `reveal reveal-heading`으로 수정.

---

## Task 3: JS — 메인 스크롤 애니메이션 블록 교체

**Files:**
- Modify: `public/landing.html` (line 1036 근처 `<script>` 블록)

- [ ] **Step 1: 메인 스크립트 블록 전체 교체**

현재 코드:
```html
  <script>
    // Lenis smooth scroll 초기화
    const lenis = new Lenis({
      duration: 1.2,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    (function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    })(0);

    // Intersection observer for reveal animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // Smooth scroll (앵커 클릭 → Lenis scrollTo)
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        lenis.scrollTo(a.getAttribute('href'), { offset: 0 });
      });
    });

    // Nav background on scroll (Lenis 이벤트 사용)
    const nav = document.querySelector('nav');
    function updateNavBg(scroll) {
      const el = nav.querySelector('div > div');
      if (scroll > 60) {
        el.style.background = getComputedStyle(document.documentElement).getPropertyValue('--c-nav-scroll').trim();
      } else {
        el.style.background = '';
      }
    }
    lenis.on('scroll', ({ scroll }) => updateNavBg(scroll));
  </script>
```

다음 코드로 교체:
```html
  <script>
    // ─── Lenis 초기화 ───────────────────────────────────────
    const lenis = new Lenis({
      duration: 1.2,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    // ─── 패럴랙스 대상 캐싱 ─────────────────────────────────
    const heroSection   = document.querySelector('section');
    const heroLeft      = document.getElementById('hero-left');
    const heroGlow      = document.getElementById('hero-glow');
    const phoneWrapper  = document.querySelector('.animate-float');
    const parallaxTags  = document.querySelectorAll('[data-parallax]');
    const scrollBar     = document.getElementById('scroll-progress-bar');
    const nav           = document.querySelector('nav');

    // ─── float: rAF 기반 sin 애니메이션 (CSS 키프레임 대체) ──
    let floatStartTime = null;
    let floatY = 0; // 현재 float offset (px)

    // ─── RAF 루프 ────────────────────────────────────────────
    function raf(time) {
      lenis.raf(time);

      // float 계산 (5s 주기, -10~0px)
      if (floatStartTime === null) floatStartTime = time;
      const elapsed = (time - floatStartTime) / 1000;
      floatY = -5 + -5 * Math.sin((elapsed / 5) * Math.PI * 2 - Math.PI / 2);

      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // ─── Intersection Observer (reveal + reveal-heading 공용) ─
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal, .reveal-heading').forEach(el => observer.observe(el));

    // ─── 앵커 스크롤 ─────────────────────────────────────────
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        lenis.scrollTo(a.getAttribute('href'), { offset: 0 });
      });
    });

    // ─── Nav 배경 ────────────────────────────────────────────
    function updateNavBg(scroll) {
      const el = nav.querySelector('div > div');
      if (scroll > 60) {
        el.style.background = getComputedStyle(document.documentElement).getPropertyValue('--c-nav-scroll').trim();
      } else {
        el.style.background = '';
      }
    }

    // ─── 스크롤 이벤트 핸들러 ────────────────────────────────
    lenis.on('scroll', ({ scroll, progress }) => {
      // Nav 배경
      updateNavBg(scroll);

      // B7: 전역 스크롤 진행 바
      scrollBar.style.width = (progress * 100) + '%';

      const heroH = heroSection.offsetHeight;

      // A1: 폰 목업 패럴랙스 + float 합성
      if (phoneWrapper) {
        const parallaxOffset = scroll * 0.2;
        phoneWrapper.style.transform = `translateY(${floatY - parallaxOffset}px)`;
      }

      // A2: 글로우 패럴랙스
      if (heroGlow) {
        heroGlow.style.transform = `translateY(${scroll * 0.08}px)`;
      }

      // A3: 플로팅 태그 개별 패럴랙스
      parallaxTags.forEach(tag => {
        const factor = parseFloat(tag.dataset.parallax);
        tag.style.transform = `translateY(${scroll * factor}px)`;
      });

      // B4: 히어로 섹션 exit
      if (heroLeft && heroH > 0) {
        const heroProgress = Math.max(0, Math.min(1, scroll / heroH));
        // 0.5 이상부터 시작
        const t = Math.max(0, (heroProgress - 0.5) / 0.5);
        heroLeft.style.opacity  = 1 - t * 0.8;
        heroLeft.style.transform = `translateY(${-20 * t}px) scale(${1 - 0.03 * t})`;
      }
    });

    // ─── B5: Metrics 숫자 카운터 ─────────────────────────────
    function easeOutExpo(t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function animateCounter(el) {
      const target  = parseInt(el.dataset.counter, 10);
      const suffix  = el.dataset.suffix || '';
      const duration = 1500; // ms
      let startTime = null;

      function step(time) {
        if (!startTime) startTime = time;
        const elapsed = Math.min(time - startTime, duration);
        const t       = easeOutExpo(elapsed / duration);
        el.textContent = Math.round(t * target) + suffix;
        if (elapsed < duration) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    document.querySelectorAll('[data-counter]').forEach(el => counterObserver.observe(el));
  </script>
```

---

## Task 4: 검증 및 커밋

**Files:**
- `public/landing.html`, `public/landing.css`

- [ ] **Step 1: 브라우저에서 동작 확인**

로컬 서버 실행 후 확인 항목:
1. 페이지 최상단에 emerald 진행 바 노출 → 스크롤 시 늘어남
2. 히어로 폰 목업이 float(상하)하면서 스크롤 시 살짝 위로 뜨는 느낌
3. 플로팅 태그 3개가 서로 다른 속도로 이동
4. 스크롤 50% 지점 이후 히어로 텍스트가 서서히 페이드+축소
5. Metrics 섹션 진입 시 "8", "3", "100" 숫자 카운트업
6. `#how`, `#status`, `#features`, `#pwa` h2 등장 시 좌→우 슬라이드

- [ ] **Step 2: 문제 체크리스트**

| 항목 | 확인 |
|------|------|
| 폰 목업 transform 깜빡임 없음 | |
| 히어로 exit이 너무 빠르거나 과하지 않음 | |
| 카운터가 중복 실행되지 않음 | |
| 스크롤 바가 nav를 가리지 않음 | |
| 라이트 테마에서도 모든 효과 정상 | |

- [ ] **Step 3: 커밋**

```bash
git add public/landing.html public/landing.css
git commit -m "feat: Lenis 기반 패럴랙스 및 스크롤 진행률 애니메이션 추가"
```
