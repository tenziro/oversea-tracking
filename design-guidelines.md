# 화물통관 조회 Guidelines — Accessibility & Do's/Don'ts

> See [design.md](design.md) for token values. See [design-components.md](design-components.md) for component specs.

---

## Accessibility

### Contrast Requirements

| Requirement | Ratio |
|-------------|-------|
| Normal text (< 18px) | 4.5:1 minimum |
| Large text (≥ 18px or 14px bold) | 3:1 minimum |
| UI components & borders | 3:1 against adjacent background |
| Focus indicators | 3:1 against adjacent background |
| Decorative / disabled | Exempt |

| Component | Target contrast | Notes |
|-----------|----------------|-------|
| Primary button text (on `#10b981`) | 4.5:1 | Use `#052e16` (dark green) not black |
| Status badge text | 4.5:1 | Each status has tuned light/dark values |
| Muted-foreground on background | 4.5:1 | `#707B8C` light / `#8A92A0` dark — verify at final contrast |
| Shimmer/gradient text | Not required | Purely decorative; never conveys meaning alone |
| Timeline connector lines | 3:1 | Decorative — lower threshold applies |

### Touch Targets

| Rule | Value |
|------|-------|
| Minimum tap target size | 44×44px (iOS) / 48×48dp (Material) |
| Bottom nav items | Min 44px height, full-flex-1 width |
| Primary CTA button | `py-4` or `py-5` = 48–56px height |
| Icon-only buttons | Minimum `h-10 w-10` (40px) with `p-0` |
| Badge / tag (non-interactive) | No requirement |
| Spacing between targets | 8px minimum |
| Input fields | `h-10` (40px) — minimum; `h-11` preferred |

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Move focus forward through interactive elements |
| `Shift+Tab` | Move focus backward |
| `Enter` | Activate button, submit form, open link |
| `Space` | Toggle switch, activate button |
| `Escape` | Close dialog, bottom sheet, dropdown |
| `Arrow keys` | Navigate select options, tabs, radio groups |
| `Home` / `End` | Jump to first/last item in list/select |

All interactive elements must display `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`. The ring color matches `--ring` (Navy blue in app, emerald in landing).

### Assistive Technology

| Rule | Implementation |
|------|----------------|
| Form inputs | Always pair with `<label>` or `aria-label` |
| Icon-only buttons | `aria-label` describing the action |
| Status badges | Do not rely on color alone — include text label |
| Loading states | `aria-busy="true"` on container; skeleton accessible |
| Timeline items | Use `<ol>` with `<li>` for ordered clearance steps |
| Progress bar | `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` |
| Toast / Snackbar | `role="status"` or `role="alert"` depending on urgency |
| Search form | `role="search"` on wrapping element |
| Cargo number inputs | `autocomplete="off"` — numbers change per shipment |

---

## Gestures

| Gesture | Use |
|---------|-----|
| Tap | Activate button, navigate, select item |
| Double tap | Not used — avoid accidental activation |
| Long press | Not used in current version |
| Vertical scroll | Browse results, timeline, history list |
| Horizontal swipe | Not used — single column layout |
| Drag | Not used |
| Pinch / zoom | Browser default — do not prevent |
| Pull-to-refresh | Planned native gesture for future versions |

---

## Content Design

### Writing Rules

| Rule | Detail |
|------|--------|
| Language | Korean (합쇼체/합니다 form). No 반말. |
| Tone | Direct, informative, neutral — not marketing-y |
| Capitalization | Korean: sentence case. English labels/codes: ALL CAPS or Title Case per convention |
| Cargo numbers | Always `font-mono` and uppercase. Never lowercase |
| Status labels | Use official Korean customs terminology: `신고전`, `신고접수`, `검사진행`, `심사진행`, `납세대기`, `통관완료`, `반송·취하` |
| Body line length | `max-w-[65ch]` — approximately 65 characters |
| CTA copy | Action-forward: `조회하기`, `저장`, `다시 조회` — never `확인`, `클릭` |
| Error messages | Specific cause + action: `번호 형식이 올바르지 않습니다. 영문·숫자만 입력하세요` |
| Empty states | Encouraging, actionable: icon + reason + CTA button |
| Timestamps | `YYYY.MM.DD HH:mm` format — Korean convention |
| Numbers | Use comma separators for 4+ digits |

### Banned Korean Copy Patterns
- `혁신적인`, `획기적인`, `차세대` — vague superlatives
- `클릭하세요` — use `탭하세요` on mobile
- `확인` alone as a CTA — add context: `조회 확인`
- Translated-sounding constructs: `시작을 하세요 지금` → `지금 시작하세요`

---

## Do's and Don'ts

### Color

- **Do** use emerald (`#10b981`) for the single primary CTA per screen
- **Do** use status colors consistently — green = cleared, amber = in-progress, red = rejected
- **Don't** use multiple primary-colored buttons in one view
- **Don't** convey status via color alone — always pair with text label
- **Don't** mix warm and cool grays in the same surface
- **Don't** use pure black (`#000000`) — use `zinc-950` (`#09090b`) or `zinc-900`
- **Don't** use saturated purple/blue gradients — the "AI gradient" is forbidden

### Shape

- **Do** use `rounded-3xl` (24px) for landing feature cards and `rounded-2xl` (16px) for app cards
- **Do** use `rounded-full` for status badges, pill nav, and dot indicators
- **Do** keep border radius consistent within a visual layer (all inner items: `rounded-xl`)
- **Don't** mix sharp corners (0px) with large radii in the same card
- **Don't** apply `rounded-3xl` to small inline chips — use `rounded-xl` or `rounded-full`

### Elevation

- **Do** use glass effect only on floating elements (nav, floating badges)
- **Do** apply `backdrop-filter: blur` only to fixed/sticky elements to avoid scroll jank
- **Don't** use multiple overlapping blur layers in a scrollable list
- **Don't** apply box shadows to elements without elevation purpose (decorative borders are sufficient)

### Interaction

- **Do** include all states: hover, focus, pressed, disabled — on every interactive element
- **Do** use `transform: scale()` + `translateY()` for button hover lift effects
- **Do** animate only `transform` and `opacity` — never `top/left/width/height`
- **Don't** use `window.addEventListener('scroll')` — use `IntersectionObserver` instead
- **Don't** remove the focus ring (`outline: none`) without providing a visible replacement
- **Don't** trigger animations on every scroll event — use threshold-based reveals

### Layout

- **Do** wrap all content in `max-w-7xl mx-auto px-4 sm:px-6` on landing
- **Do** wrap app content in `max-w-lg mx-auto px-4` for single-column mobile layout
- **Do** use `min-h-[100dvh]` for full-height sections
- **Don't** use `h-screen` — causes layout jump on iOS Safari with address bar
- **Don't** rely on fixed pixel widths for responsive sections — use `grid` and `flex` with gap
- **Don't** place interactive content below the bottom navigation without `pb-[env(safe-area-inset-bottom)]`

### Typography

- **Do** load Pretendard for all Korean text — it is non-negotiable
- **Do** apply `word-break: keep-all` to all Korean text blocks
- **Do** use `leading-tight` to `leading-snug` on Korean headlines (NOT `leading-none`)
- **Do** use `font-mono` for all cargo numbers, B/L numbers, and declaration numbers
- **Don't** use Inter, Noto Sans KR, Roboto, or Arial — all banned
- **Don't** use gradient text (`shimmer-text`) for informational content — decorative only
- **Don't** exceed one gradient text element per visible screen area

### Motion

- **Do** use `cubic-bezier(0.16, 1, 0.3, 1)` as the primary easing for UI transitions
- **Do** use `IntersectionObserver` with `threshold: 0.08` for scroll reveals
- **Do** stagger entrance animations with 80–150ms delay increments
- **Don't** animate more than 2 properties simultaneously on the same element
- **Don't** use `animation-delay` for critical content (above the fold)
- **Don't** loop ambient animations (`float`, `pulse`) on more than 3 elements per view

### Components

- **Do** use status badges from the defined 6 variants only — never invent new colors
- **Do** show skeleton loaders during API fetch — never blank or spinner-only states
- **Do** display the `현재 상태` badge on the most recent timeline entry
- **Don't** truncate cargo numbers — show full value in monospace font
- **Don't** show the search form sticky header unless content has scrolled past the fold
- **Don't** use accordion for single-item content — only use when ≥ 2 collapsible sections exist
