# 화물통관 조회 Components

> Full specifications for all 28 components. Grouped by workflow.
> For tokens see [design.md](design.md). For rules & accessibility see [design-guidelines.md](design-guidelines.md).

---

## Actions

### Button

**Variants:** Filled Primary > Ghost > Outline > Destructive > Icon  
Height 40dp (default), 44dp (lg), 36dp (sm). Min touch target 48dp. Label: 14px/500, sentence case.

| Property | Filled Primary | Ghost | Outline |
|----------|---------------|-------|---------|
| bg | `bg-primary` / `#10b981` (landing) | `rgba(255,255,255,.04)` | transparent |
| text | `text-primary-foreground` / `#052e16` | `text-zinc-200` | `text-foreground` |
| border | none | `1px solid rgba(255,255,255,.08)` | `border-input` |
| hover bg | `bg-primary/90` / `#34d399` | `rgba(255,255,255,.07)` | `bg-accent` |
| hover transform | `scale(1.025) translateY(-2px)` | none | none |
| hover shadow | `0 14px 36px rgba(16,185,129,.28)` | none | none |
| active | `scale(0.975)` | — | — |
| focus | `ring-2 ring-ring ring-offset-2` | same | same |
| disabled | `opacity-50 cursor-not-allowed` | same | same |

**Sizes:**

| Size | Height | Padding | Font | Rounded |
|------|--------|---------|------|---------|
| sm | 36px | `px-3 py-1.5` | 13px | `rounded-md` |
| default | 40px | `px-4 py-2` | 14px | `rounded-md` (app) |
| lg | 44px | `px-8 py-3` | 16px | `rounded-2xl` |
| landing CTA | 52–56px | `px-10 py-4` / `px-12 py-5` | 18px | `rounded-2xl` |
| icon | 40×40px | `p-0` | — | `rounded-md` |

**Do:** Pair a leading icon with `gap-2.5`. Keep labels 1–4 words.  
**Don't:** Use filled primary for more than one action per view.

---

### Floating CTA (Landing only)

Fixed-position bar or inline hero CTA. Always uses filled primary variant at landing lg size.  
Must include leading icon + label + trailing arrow icon for directional affordance.

---

## Input

### Search Form

The primary entry point for cargo number lookup. Wraps a `<select>` and `<input>` in a container card.

| Property | Value |
|----------|-------|
| Container | `bg-zinc-800/60 rounded-2xl p-3 border border-zinc-700/40` (dark) |
| Select trigger | `h-10 w-full rounded-xl border border-zinc-700/30 bg-zinc-900/70 px-3 py-2.5 text-sm` |
| Input | `flex-1 h-10 rounded-xl border border-zinc-700/30 bg-zinc-900/70 px-3 font-mono text-sm` |
| Input placeholder | `text-muted-foreground uppercase` |
| Input max length | 50 characters |
| Allowed characters | `[A-Z0-9\-_/]` — enforced with regex on change |
| Auto-transform | Force uppercase on input |
| Clear button | Icon-only (`IconX`), `h-8 w-8`, appears when value present |
| Submit button | Filled primary icon button `h-10 w-10 rounded-xl` adjacent to input |
| Loading state | Submit button shows spinner (`IconLoader2 animate-spin`), disabled |
| Sticky behavior | `sticky top-0 z-10 bg-background/95 backdrop-blur-sm` after scroll |

**States:**
- Empty: Select shows "번호 유형 선택" placeholder; Input shows type-specific placeholder
- Filled: Clear button appears, submit enabled
- Loading: Spinner in submit button, input disabled
- Error: Toast shown, form re-enabled

---

### Text Field (Shadcn Input)

General-purpose text input used in non-search contexts.

| Property | Value |
|----------|-------|
| Height | `h-10` (40px) |
| Border | `border border-input` |
| Background | `bg-background` |
| Padding | `px-3 py-2` |
| Font | `text-sm` |
| Border radius | `rounded-md` |
| Focus | `ring-2 ring-ring ring-offset-2` |
| Disabled | `opacity-50 cursor-not-allowed` |

---

### Select / Dropdown

Used for search type selection. Built on Radix UI Select.

| Property | Value |
|----------|-------|
| Trigger height | `h-10` |
| Content max-height | `max-h-96` |
| Item padding | `pl-8 pr-2 py-1.5` |
| Viewport padding | `p-1` |
| Animation | `animate-in fade-in zoom-in-95` (open), `zoom-out-95` (close) |
| Check icon | `h-4 w-4` absolute at `pl-2` for selected item |
| Separator | `bg-muted h-px -mx-1 my-1` |
| Label | `text-sm font-semibold py-1.5 pl-8 pr-2` |

**Search type options:**
- `화물관리번호` — placeholder: `화물관리번호를 입력하세요`
- `B/L번호` — placeholder: `B/L번호를 입력하세요`
- `마스터 B/L번호` — placeholder: `마스터 B/L번호를 입력하세요`

---

### Switch

Used in Settings for theme toggle.

| Property | Value |
|----------|-------|
| Track (off) | `bg-input` |
| Track (on) | `bg-primary` |
| Thumb | `bg-background` |
| Size | `h-6 w-11` (track), `h-5 w-5` (thumb) |
| Focus | `focus-visible:ring-2 ring-ring ring-offset-2` |
| Transition | `transition-all` |

---

## Navigation

### Bottom Navigation Bar

Fixed to viewport bottom. Three equal-width tabs.

| Property | Value |
|----------|-------|
| Position | `fixed bottom-0 left-0 right-0 z-40` |
| Height | `h-14` (56px) |
| Safe area | `pb-[env(safe-area-inset-bottom)]` |
| Background | `bg-background/95 backdrop-blur-sm` |
| Border | `border-t border-border` |
| Layout | `flex items-stretch` |
| Item | `flex flex-1 flex-col items-center justify-center gap-1` |
| Icon size | 22px |
| Label | `text-[10px] font-medium` |
| Active icon | `text-primary` |
| Active label | `text-primary text-[10px] font-semibold` |
| Inactive | `text-muted-foreground` |

**Tabs:** 조회 (`IconSearch`) · 기록 (`IconHistory`) · 설정 (`IconSettings`)

---

### Floating Nav (Landing)

Pinned top nav with glass pill effect.

| Property | Value |
|----------|-------|
| Position | `fixed top-0 left-0 right-0 z-40 pt-4 px-4` |
| Pill | `glass rounded-2xl px-5 py-3 flex items-center justify-between` |
| On scroll | `background: rgba(9,9,11,.85)` applied via JS |
| Logo | `w-8 h-8 rounded-xl` icon + brand name |
| Links (desktop) | `hidden md:flex gap-7 text-sm text-zinc-400` |
| CTA | Filled primary button `text-sm px-5 py-2.5 rounded-xl` |

---

### App Header

Sticky top bar for app pages.

| Property | Value |
|----------|-------|
| Position | `sticky top-0 z-40` |
| Height | `h-14` (56px) |
| Safe area | `pt-[env(safe-area-inset-top)]` |
| Background | `bg-background/95 backdrop-blur-sm` |
| Border | `border-b border-border` |
| Content | Ship icon + title left; Settings link right |
| Title | `text-base font-bold` |

---

## Containment

### Card (App)

Standard container for cargo result, history items.

| Property | Value |
|----------|-------|
| Border radius | `rounded-xl` |
| Border | `border border-border` |
| Background | `bg-card` |
| Shadow | `shadow-sm` |
| Padding | `p-5` (header + content) |
| Header spacing | `space-y-1.5` |
| Title | `text-base font-semibold leading-none tracking-tight` |
| Description | `text-sm text-muted-foreground` |

---

### Card (Landing Feature)

Premium dark card used in bento grid.

| Property | Value |
|----------|-------|
| Background | `rgba(24,24,27,.70)` |
| Border | `1px solid rgba(63,63,70,.60)` |
| Border radius | `rounded-3xl` (24px) |
| Padding | `p-8` default, `p-10` on wide cards |
| Hover | `translateY(-3px)`, border → `rgba(16,185,129,.22)`, deeper shadow |
| Icon box | `w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/25` |
| Icon | `text-emerald-400 text-2xl` |

---

### Glass Card / Pill

Frosted glass treatment for floating elements, nav, badges.

| Property | Value |
|----------|-------|
| Background | `rgba(255,255,255,.04)` |
| Backdrop filter | `blur(20px) saturate(180%)` |
| Border | `1px solid rgba(255,255,255,.07)` |
| Inner top edge | `box-shadow: inset 0 1px 0 rgba(255,255,255,.06)` |
| Border radius | `rounded-2xl` (floating badges), `rounded-full` (pills) |

---

### Dialog / Modal

Full-screen overlay for confirmations and detail views.

| Property | Value |
|----------|-------|
| Overlay | `fixed inset-0 z-50 bg-black/80 backdrop-blur-sm` |
| Content | `fixed top-[50%] left-[50%] translate-[-50%,-50%] z-50` |
| Border radius | `rounded-lg` |
| Padding | `p-6` |
| Animation | `animate-in fade-in zoom-in-95` / `zoom-out-95` |
| Close button | Top-right `absolute right-4 top-4` icon button |
| Title | `text-lg font-semibold leading-none tracking-tight` |
| Description | `text-sm text-muted-foreground` |

---

### Accordion

Used in settings or detail expansion. Built on Radix UI Accordion.

| Property | Value |
|----------|-------|
| Item border | `border-b border-border` |
| Trigger | `flex w-full items-center justify-between py-4 text-sm font-medium hover:underline` |
| Chevron | `h-4 w-4 transition-transform duration-200 [data-state=open]:rotate-180` |
| Content | `text-sm overflow-hidden transition-all` |
| Content animation | `animate-accordion-down` (open), `animate-accordion-up` (close) |
| Content padding | `pb-4 pt-0` |

**Only use** when ≥ 2 collapsible sections exist in the same context.

---

### Separator

| Property | Value |
|----------|-------|
| Horizontal | `h-[1px] w-full bg-border` |
| Vertical | `h-full w-[1px] bg-border` |
| Shrink | `shrink-0` to prevent flex compression |

---

## Data Display

### Cargo Detail Card

Top-level result component shown after successful search.

| Region | Content | Styling |
|--------|---------|---------|
| Header | Cargo management number (mono), cargo name, status badge | `font-mono text-[10px] text-muted-foreground`; name `font-bold text-base` |
| Progress | Label + percentage + filled bar | Bar: `h-1.5 bg-muted rounded-full`; fill: `bg-gradient-to-r from-primary-600 to-primary-400` |
| Port info | Origin → destination with `IconMapPoint` | `text-sm text-muted-foreground` |
| Metadata | Package count, weight, entry date | `text-sm` grid 2-col |

---

### Status Badge

Compact label for clearance state. Used in results and history.

| Status | Class | Background | Text | Border |
|--------|-------|-----------|------|--------|
| 통관완료 | `badge-green` | `rgba(16,185,129,.12)` | `#34d399` | `rgba(16,185,129,.28)` |
| 신고접수 | `badge-blue` | `rgba(59,130,246,.12)` | `#60a5fa` | `rgba(59,130,246,.28)` |
| 검사·심사진행 | `badge-amber` | `rgba(245,158,11,.12)` | `#fbbf24` | `rgba(245,158,11,.28)` |
| 납세대기 | `badge-orange` | `rgba(249,115,22,.12)` | `#fb923c` | `rgba(249,115,22,.28)` |
| 반송·취하 | `badge-red` | `rgba(239,68,68,.12)` | `#f87171` | `rgba(239,68,68,.28)` |
| 신고전·미확인 | `badge-gray` | `rgba(113,113,122,.12)` | `#a1a1aa` | `rgba(113,113,122,.20)` |

**Base:** `text-[10px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1`

---

### Status Timeline

Ordered list of clearance processing events, newest first.

| Property | Value |
|----------|-------|
| Container | `<ol>` semantic list |
| Item layout | `flex items-start gap-2.5` relative positioned |
| Icon box | `w-5 h-5 rounded-full` with status-colored bg/border |
| Icon size | 10–12px |
| Current item | Highlighted bg + `现재 상태` badge + `animate-pulse` dot |
| Date format | `YYYY.MM.DD · HH:mm` |
| Declaration number | Shown below date when present; `font-mono text-xs` |
| Connector line | `absolute left-[11px] top-6 w-[2px] h-[calc(100%-8px)]` gradient from status color to bg |

**Status → Icon mapping:**
- 신고전 → `solar:clock-circle-bold`
- 신고접수 → `solar:document-add-bold`
- 검사진행 → `solar:eye-scan-bold`
- 심사진행 → `solar:microscope-bold`
- 납세대기 → `solar:dollar-minimalistic-bold`
- 통관완료 → `solar:check-circle-bold`
- 반송·취하 → `solar:close-circle-bold`
- 미확인 → `solar:question-circle-bold`

---

### Progress Bar

Linear indicator for overall clearance completion (0–100%).

| Property | Value |
|----------|-------|
| Track | `h-1.5 bg-muted rounded-full overflow-hidden` |
| Fill | `h-full rounded-full bg-gradient-to-r from-primary-600 to-primary-400` |
| Landing animated | `animation: progress-fill 1.8s cubic-bezier(0.16,1,0.3,1) 0.5s forwards` |
| Label | Percentage value right-aligned `text-xs font-bold text-primary` |
| Accessibility | `role="progressbar" aria-valuenow aria-valuemin="0" aria-valuemax="100"` |

---

### Search History Item

Row in the history list page. Up to 10 items.

| Property | Value |
|----------|-------|
| Layout | Card row `bg-card border rounded-xl p-4` |
| Query | `font-mono text-sm text-foreground` |
| Type badge | Outlined variant with search type label |
| Cargo name | `text-sm text-muted-foreground` (if available) |
| Last status | Status badge (if available) |
| Timestamp | `text-xs text-muted-foreground` Korean locale format |
| Re-search action | Icon button right side `IconRotateClockwise` |
| Delete action | Destructive icon button `IconTrash` |

---

### Avatar

Used for testimonials or user representation (landing).

| Property | Value |
|----------|-------|
| Source | `https://i.pravatar.cc/150?u={unique_name}` |
| Size | `w-10 h-10` (40px) |
| Border radius | `rounded-full` |
| Fallback | Initials in `bg-muted` circle |

---

### Skeleton

Placeholder shown during API fetch on cargo result area.

| Property | Value |
|----------|-------|
| Base | `animate-pulse rounded-md bg-muted` |
| Header skeleton | `h-4 w-[200px]` + `h-4 w-[160px]` |
| Progress skeleton | `h-2 w-full rounded-full` |
| Content block | Multiple `h-3` lines at varying widths |
| Duration | Show until API response resolves |

---

### Metrics Strip (Landing)

Four-column statistics row.

| Property | Value |
|----------|-------|
| Layout | `grid grid-cols-2 md:grid-cols-4 gap-10` |
| Stat value | `text-4xl md:text-5xl font-bold text-emerald-400` |
| Stat label | `text-sm text-zinc-500 leading-snug mt-2` |
| Reveal | `reveal` class (scroll-triggered `IntersectionObserver`) |

---

## Feedback

### Toast / Sonner

Short ephemeral notification for search errors and success states.

| Property | Value |
|----------|-------|
| Position | Top-center on mobile, bottom-right on desktop |
| Duration | 4000ms default, 6000ms for errors |
| Variants | Default, Success (green), Error (red), Warning (amber) |
| Font | `text-sm font-medium` |
| Border radius | `rounded-xl` |
| Max width | `max-w-sm` |

---

### Offline Banner

Full-width notification bar shown when network is unavailable.

| Property | Value |
|----------|-------|
| Position | Top of content area (below header) |
| Background | Amber: `bg-amber-500/15 border-amber-500/30` (offline) |
| Background | Emerald: `bg-emerald-500/15 border-emerald-500/30` (reconnected) |
| Icon | `solar:wifi-off-bold` (offline) / `solar:wifi-bold` (online) |
| Text | Korean status message |
| Auto-dismiss | Reconnected banner dismisses after 3s |
| Accessibility | `role="status"` |

---

### Update Banner

Full-width bar announcing app update availability.

| Property | Value |
|----------|-------|
| Position | `fixed top-0 left-0 right-0 z-50` |
| Background | `bg-emerald-500/15 border-b border-emerald-500/30` |
| Action | `업데이트` button calls `registration.waiting.postMessage({type:'SKIP_WAITING'})` |
| Dismiss | X button to hide for session |
| Accessibility | `role="alert"` |

---

### Install Prompt (PWA)

Bottom sheet encouraging home screen installation.

| Property | Value |
|----------|-------|
| Position | `fixed bottom-0 left-0 right-0 z-50` (above bottom nav) |
| Style | `glass rounded-t-3xl p-6` |
| Content | App icon + title + description + Install button + Dismiss link |
| Trigger | `beforeinstallprompt` event (Android) or manual iOS guidance |
| Dismiss | Stores to `localStorage` to prevent repeated prompt |
| Safe area | `pb-[env(safe-area-inset-bottom)]` |

---

### Loading Spinner

Inline spinner for button loading state and page transitions.

| Property | Value |
|----------|-------|
| Icon | `IconLoader2` with `animate-spin` class |
| Size | Same as button icon (18–20px) |
| Color | Inherits from button foreground |
| Placement | Replaces leading icon in button during loading |
