# 화물통관 조회 Design System — Token Reference

> Always read this file first. For component specs see [design-components.md](design-components.md). For accessibility and do's/don'ts see [design-guidelines.md](design-guidelines.md).

Korean-first maritime cargo tracking PWA. Core architecture: Tailwind CSS utility classes with HSL CSS custom properties, dark-mode default, Pretendard primary typeface, 4px base spacing unit. Covers web app (Next.js) and standalone landing page. Two modes co-exist: **App Mode** (light/dark adaptive, Navy-blue primary) and **Landing Mode** (dark-only, Emerald accent).

---

## Colors

### App Mode — Light Theme

| Role | HSL | Hex (approx.) | Usage |
|------|-----|----------------|-------|
| background | `210 20% 98%` | `#F5F8FC` | Page canvas |
| foreground | `220 30% 12%` | `#141D2E` | Primary text |
| primary | `214 85% 35%` | `#0E5FA1` | CTAs, links, progress fills |
| primary-foreground | `0 0% 100%` | `#FFFFFF` | Text on primary |
| secondary | `210 20% 94%` | `#EBF1F7` | Subtle fills |
| secondary-foreground | `220 30% 20%` | `#233041` | Text on secondary |
| muted | `210 20% 94%` | `#EBF1F7` | Disabled, placeholder bg |
| muted-foreground | `220 15% 50%` | `#707B8C` | Captions, timestamps |
| card | `0 0% 100%` | `#FFFFFF` | Card surfaces |
| card-foreground | `220 30% 12%` | `#141D2E` | Text on cards |
| border | `214 20% 88%` | `#D4DEE9` | Dividers, input borders |
| input | `214 20% 88%` | `#D4DEE9` | Input border color |
| ring | `214 85% 35%` | `#0E5FA1` | Focus ring |
| destructive | `0 84% 55%` | `#EF4444` | Errors, rejected state |
| destructive-foreground | `0 0% 100%` | `#FFFFFF` | Text on destructive |

### App Mode — Dark Theme

| Role | HSL | Hex (approx.) | Usage |
|------|-----|----------------|-------|
| background | `222 30% 9%` | `#0D1117` | Page canvas |
| foreground | `210 20% 95%` | `#F0F5F9` | Primary text |
| primary | `214 80% 55%` | `#56B3F1` | CTAs, links (lighter for contrast) |
| primary-foreground | `0 0% 100%` | `#FFFFFF` | Text on primary |
| secondary | `222 22% 18%` | `#252D3D` | Subtle fills |
| muted | `222 22% 18%` | `#252D3D` | Disabled, placeholder bg |
| muted-foreground | `215 15% 55%` | `#8A92A0` | Captions, timestamps |
| card | `222 25% 13%` | `#1C2333` | Card surfaces |
| card-foreground | `210 20% 95%` | `#F0F5F9` | Text on cards |
| border | `222 20% 22%` | `#3D4556` | Dividers, input borders |
| ring | `214 80% 55%` | `#56B3F1` | Focus ring |
| destructive | `0 70% 50%` | `#EF4444` | Errors |

### Landing Mode — Dark Only

| Role | Hex / CSS | Usage |
|------|-----------|-------|
| page-bg | `#09090b` (zinc-950) | Page canvas |
| card-bg | `rgba(24,24,27,0.70)` | Card surfaces |
| card-border | `rgba(63,63,70,0.60)` | Card borders |
| glass-bg | `rgba(255,255,255,0.04)` | Frosted glass elements |
| glass-border | `rgba(255,255,255,0.07)` | Frosted glass borders |
| accent | `#10b981` (emerald-500) | CTAs, icons, highlights |
| accent-hover | `#34d399` (emerald-400) | Hover state on accent |
| accent-muted | `rgba(16,185,129,0.10)` | Tinted backgrounds |
| accent-border | `rgba(16,185,129,0.20)` | Tinted borders |
| text-primary | `#fafafa` (zinc-50) | Headlines |
| text-secondary | `#a1a1aa` (zinc-400) | Body text |
| text-muted | `#71717a` (zinc-500) | Captions |

### Status / Semantic Colors (Both Modes)

| Status | Light bg | Light text | Dark bg | Dark text | Korean label |
|--------|----------|------------|---------|-----------|--------------|
| cleared | `#dcfce7` | `#166534` | `rgba(16,185,129,.12)` | `#34d399` | 통관완료 |
| declared | `#dbeafe` | `#1d4ed8` | `rgba(59,130,246,.12)` | `#60a5fa` | 신고접수 |
| inspection | `#fef9c3` | `#92400e` | `rgba(245,158,11,.12)` | `#fbbf24` | 검사진행 / 심사진행 |
| duty | `#ffedd5` | `#9a3412` | `rgba(249,115,22,.12)` | `#fb923c` | 납세대기 |
| rejected | `#fee2e2` | `#b91c1c` | `rgba(239,68,68,.12)` | `#f87171` | 반송·취하 |
| pending | `#f1f5f9` | `#475569` | `rgba(113,113,122,.12)` | `#a1a1aa` | 신고전 / 상태미확인 |

---

## Typography

**Font stack:** `'Pretendard', -apple-system, BlinkMacSystemFont, 'system-ui', sans-serif`  
**Rendering:** `-webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale`  
**Feature settings:** `"rlig" 1, "calt" 1`  
**Korean text rule:** `word-break: keep-all` on all Korean text blocks (prevents mid-word line breaks)

| Style | Size | Weight | Line Height | Tracking | Usage |
|-------|------|--------|-------------|----------|-------|
| Display XL | 4.5rem (72px) | 700 | 1.1 | `tight` | Landing hero max size |
| Display L | 3.75rem (60px) | 700 | 1.1 | `tight` | Landing section headlines |
| Display M | 3rem (48px) | 700 | 1.15 | `tight` | Landing sub-headlines |
| Heading 1 | 2.25rem (36px) | 700 | `tight` | `tight` | Page-level titles |
| Heading 2 | 1.875rem (30px) | 700 | `snug` | normal | Section headings |
| Heading 3 | 1.5rem (24px) | 700 | `snug` | normal | Card/component titles |
| Title | 1.25rem (20px) | 600–700 | `snug` | normal | Card titles, feature titles |
| Body L | 1.125rem (18px) | 400–500 | `relaxed` | normal | Hero descriptions |
| Body M | 1rem (16px) | 400 | `normal` | normal | Default body text |
| Body S | 0.875rem (14px) | 400–500 | `relaxed` | normal | Secondary text, form labels |
| Caption | 0.75rem (12px) | 400–600 | `normal` | normal | Timestamps, badges |
| Micro | 0.6875rem (11px) | 400–600 | `normal` | normal | In-mockup small text |
| Mono | 0.75–0.875rem | 400 | normal | `wide` | Cargo numbers, codes |

---

## Shape

| Token | Radius | Tailwind Class | Components |
|-------|--------|----------------|------------|
| xs | 6px | `rounded-md` | Small chips, skeleton |
| sm | 8px | `rounded-lg` | Input fields, select |
| md | 12px | `rounded-xl` | Buttons, inner cards, badges |
| lg | 16px | `rounded-2xl` | Cards, search form, nav bar |
| xl | 24px | `rounded-3xl` | Landing feature cards, phone elements |
| full | 9999px | `rounded-full` | Pills, status badges, dot indicators |
| phone-screen | 40px | custom | Phone screen inset |
| phone-shell | 48px | custom | Phone outer frame |
| css-var | `0.75rem` (12px) | `--radius` | Radix UI base |

---

## Elevation

| Level | Shadow | Usage |
|-------|--------|-------|
| 0 | `none` | Default page surface |
| 1 | `shadow-sm` `0 1px 2px rgba(0,0,0,.05)` | App cards (light) |
| 2 | `shadow` `0 1px 3px rgba(0,0,0,.1), 0 1px 2px -1px rgba(0,0,0,.1)` | Raised cards |
| 3 | `shadow-md` `0 4px 6px -1px rgba(0,0,0,.1)` | Dropdowns, popovers |
| 4 | `shadow-lg` `0 10px 15px -3px rgba(0,0,0,.1)` | Dialogs (light) |
| glass | `inset 0 1px 0 rgba(255,255,255,.06)` | Glass cards (landing) |
| card-hover | `0 16px 40px rgba(0,0,0,.35)` | Hovered landing cards |
| btn-glow | `0 14px 36px rgba(16,185,129,.28)` | Primary button hover |
| emerald-glow | `0 0 40px rgba(16,185,129,.18), 0 0 80px rgba(16,185,129,.06)` | Hero CTA glow |
| phone | `0 50px 100px rgba(0,0,0,.65), 0 25px 50px rgba(0,0,0,.4)` | Phone mockup |

---

## Interaction States

| State | Overlay Opacity | Transform | Notes |
|-------|----------------|-----------|-------|
| Enabled | 0% | none | Resting state |
| Hover | 8% primary overlay | `scale(1.025) translateY(-2px)` on primary btn | Color shift + lift |
| Focus | `ring-2 ring-ring ring-offset-2` | none | Keyboard accessibility |
| Pressed / Active | 10% | `scale(0.975)` | Subtle compression |
| Disabled | 38% content opacity, 12% container | none | `cursor-not-allowed opacity-50` |
| Loading | Shimmer animation | none | Skeleton pulse on card content |

---

## Layout

| Breakpoint | Min Width | Container | Navigation | Columns |
|-----------|----------|-----------|-----------|---------|
| Mobile | < 640px | `max-w-lg mx-auto px-4` | Bottom nav bar (fixed) | 1 |
| Small | 640–767px | `px-6` | Bottom nav bar | 1–2 |
| Medium | 768–1023px | `px-6` | Bottom nav bar | 2–3 |
| Desktop | 1024–1279px | `max-w-7xl mx-auto px-6` | Top nav (floating pill) | 2–3 |
| Wide | 1280px+ | `max-w-7xl mx-auto` | Top nav | 3+ |

**App content max-width:** `max-w-lg` (512px) — single-column mobile-first layout  
**Landing max-width:** `max-w-7xl` (1280px) — wide multi-column layout  
**Safe area:** `env(safe-area-inset-top/bottom)` applied on header and bottom nav

---

## Motion

| Token | Value | Usage |
|-------|-------|-------|
| easing-default | `cubic-bezier(0.16, 1, 0.3, 1)` | Primary spring-like easing |
| easing-standard | `cubic-bezier(0.4, 0, 0.2, 1)` | Standard UI transitions |
| easing-ease-out | `cubic-bezier(0, 0, 0.2, 1)` | Exit animations |
| duration-fast | `200ms` | Color transitions, hover |
| duration-standard | `300ms` | Transform transitions |
| duration-reveal | `700ms` | Scroll-triggered reveal |
| duration-enter | `800ms` | Hero stagger entries |
| duration-float | `5000ms` | Ambient floating elements |
| duration-shimmer | `4000ms` | Gradient text shimmer |
| delay-stagger | `0.1s, 0.2s, 0.3s … 0.65s` | Sequential entrance delays |

**Animations defined:**
- `fadeInUp` — page entrance (opacity 0→1, translateY 20px→0)
- `float` — ambient element bob (translateY 0→-10px→0, infinite)
- `pulse-soft` — live indicator pulse (opacity 1→0.4→1, infinite)
- `shimmer` — gradient text sweep (background-position -200%→200%, infinite)
- `progress-fill` — bar animation (width 0%→100%, delayed)
- `accordion-down / accordion-up` — Radix height transitions
- `fade-in` — small component entrance

---

## Icons

**Library:** Tabler Icons React (`@tabler/icons-react`) for app components.  
**Library:** Iconify Solar set for landing page (`solar:*` prefix).  
**Style:** Line / Bold filled. Stroke weight ~1.5px at 24dp.  
**Default size:** 20–24px app, 14–24px landing inline.  
**Sizes used:** 12, 13, 14, 15, 18, 20, 22, 24px.

| Context | Size | Weight | Class |
|---------|------|--------|-------|
| Bottom nav | 22px | Line | `text-[22px]` |
| Card feature icon | 22–24px | Bold | `text-2xl` |
| Inline text | 13–15px | Line | `text-sm` |
| Button leading | 18–20px | Bold | `text-lg` |
| Badge / tag | 13–14px | Bold | `text-sm` |

---

## Design Tokens — Naming Convention

```
CSS custom property:  --[role]: [hsl values]
Tailwind semantic:    bg-[role], text-[role], border-[role]
Status badge class:   badge-[status]        → badge-green, badge-amber, badge-blue …
Reveal animation:     reveal rd[n]          → reveal rd1, reveal rd2 (stagger delays)
Entry animation:      anim-in d[n]          → anim-in d1 … d6 (hero stagger)
```
