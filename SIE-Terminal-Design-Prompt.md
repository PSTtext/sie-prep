# SIE TERMINAL — UI Design Prompt

Design a desktop web UI for **"SIE Terminal"** — a Securities Industry Essentials exam study app styled as a professional financial trading terminal, not a consumer study app. The reference aesthetic is a Bloomberg Terminal crossed with a modern analytics platform (Token Terminal / Koyfin / OpenBB): dense, data-forward, dark, and unmistakably built for finance professionals. A finance recruiter should glance at it and think it's an internal trading tool.

---

## Mood board references

1. **Bloomberg Terminal (dual monitor, futures table + VWAP dashboard)** — attached image. Core density, orange-on-black labels, tabular data.
2. **Token Terminal dashboard** — attached image. Modern dark analytics: stacked bar chart, left-rail ranked lists, hairline separators.
3. **Order-entry / DOM ladder** — NinjaTrader SuperDOM: https://ninjatrader.com/futures/blogs/how-to-use-the-superdom-price-ladder-for-order-entry/ — pattern for the quiz "execute answer" screen (price ladder rows, green/red buy-sell columns).
4. **Koyfin custom dashboard** — https://www.koyfin.com/features/custom-dashboards/ — modern terminal density that still feels current.
5. **OpenBB Workspace** — https://openbb.co/products/workspace/ — open-source Bloomberg alternative; widget grid layout.
6. **IBM Plex Mono in use** — https://fontsinuse.com/typefaces/48061/ibm-plex-mono — typography target.
7. **Webull mobile** — https://apps.apple.com/us/app/webull-tablet-advanced-trading/id6449725458 — how terminal density collapses onto small screens.

---

## Visual language

- Near-black background (#0a0e12), not pure black. Panels separated by 1px hairline borders (#1e2530) — no drop shadows, no rounded floating cards, no glassmorphism, no gradients, no emojis, no illustrations. Flat, flush, grid-locked, information-dense.
- **Primary accent:** amber/orange (#f5a623) for labels and panel title bars (Bloomberg orange-on-black).
- **Semantic colors:** terminal green (#00c805) for gains/correct, red (#ff433d) for losses/incorrect, cyan (#4fc3f7) for interactive elements/links.
- **Typography:** IBM Plex Mono (or JetBrains Mono) for all numbers, tickers, and data — tabular numerals mandatory. IBM Plex Sans or Inter for body text. Small sizes (11–13px). Uppercase micro-labels with letter-spacing for column headers.

## Layout — treat study data like market data

**Persistent top bar** styled like a terminal command line: app name as a ticker (SIE:US), live date/time, session timer, command/search input with ⌘K shortcut hint.

**Main dashboard** is a multi-panel grid; each panel has an orange uppercase title bar:

- **PORTFOLIO** — mastery across SIE topic sections displayed as a holdings table: topic tickers (REG, PRD, TRD, PRH), mastery %, day change (+2.3% green), sparkline trend, questions answered.
- **ACTIVITY (volume chart)** — stacked bar chart of daily study activity over 90 days, colored by topic (like Token Terminal's fees chart).
- **WATCHLIST** — weakest subtopics ranked with red day-change styling, flagged for review.
- **TAPE** — scrolling feed of recent quiz results/streaks formatted like trade confirmations: `11:04:32  QUIZ FILLED  25/30  +83.3%`.
- **RISK (VaR-style)** — predicted exam-readiness score with confidence band, framed as a risk metric.

**Quiz mode** = order-entry screen (see NinjaTrader DOM reference): question in a bordered panel, answer choices as selectable ladder rows, green EXECUTE submit button, side rail with running session stats (accuracy, pace, streak).

**Function-key menu numbers** on panels as a Bloomberg nod: `1) QUIZ  2) REVIEW  3) ANALYTICS`.

## Responsive

On mobile, follow the Webull pattern: collapse the grid to a single column, keep the top ticker bar, keep monospace numbers and density — do not switch to a spacious consumer layout.

## Anti-goals

No Duolingo/Quizlet energy. No pastels, no mascots, no progress rings with confetti, no large rounded buttons, no generic SaaS dashboard template look. Dense over spacious, precise over friendly, monospace over rounded. Every stat rendered like a market quote.
