# Design Guidelines - Hệ Thống Phân Loại Email Thông Minh

## Design Approach
**Design System: Material Design with Linear-inspired aesthetics**
- Rationale: Productivity-focused tool requiring information density, clear hierarchy, and professional aesthetics
- Reference inspiration: Gmail (familiarity) + Linear (modern clean aesthetics) + Notion (data organization)
- Core principle: Clarity, efficiency, and intelligent data presentation

## Color Palette

**Light Mode:**
- Primary: 220 90% 56% (Trust blue - professional email aesthetic)
- Background: 0 0% 100% (Pure white)
- Surface: 220 14% 96% (Soft gray for cards)
- Border: 220 13% 91% (Subtle divisions)
- Text Primary: 222 47% 11% (Deep readable)
- Text Secondary: 215 16% 47% (Muted information)

**Dark Mode:**
- Primary: 220 90% 56% (Consistent blue)
- Background: 222 47% 11% (Deep base)
- Surface: 217 33% 17% (Elevated cards)
- Border: 217 33% 22% (Subtle divisions)
- Text Primary: 210 40% 98% (High contrast)
- Text Secondary: 215 20% 65% (Muted text)

**Category Colors (Semantic):**
- Spam: 0 84% 60% (Alert red)
- Work: 220 90% 56% (Professional blue)
- Personal: 280 65% 60% (Friendly purple)
- Urgent: 25 95% 53% (Attention orange)
- Archived: 215 16% 47% (Neutral gray)

**Accent (minimal use):**
- Success: 142 76% 36% (Confirmation green)
- Warning: 38 92% 50% (Alert amber)

## Typography

**Font Stack:**
- Primary: 'Inter' (via Google Fonts) - UI elements, email lists
- Secondary: 'JetBrains Mono' (via Google Fonts) - Vector scores, technical data
- Vietnamese support: Ensure proper diacritics rendering

**Scale:**
- Display: text-4xl font-bold (Dashboard headers)
- Heading: text-2xl font-semibold (Section titles)
- Subheading: text-lg font-medium (Card headers, email subjects)
- Body: text-base font-normal (Email content, descriptions)
- Caption: text-sm font-normal (Metadata, timestamps)
- Code: text-sm font-mono (Similarity scores, technical info)

## Layout System

**Spacing Primitives:**
- Core units: 2, 4, 6, 8, 12, 16 (Tailwind)
- Container: max-w-7xl mx-auto px-6
- Card padding: p-6
- Section spacing: py-12
- Grid gaps: gap-4 (lists), gap-6 (cards)

**Grid Structure:**
- Sidebar: 280px fixed (categories, filters)
- Main content: flex-1 (email list/visualization)
- Detail pane: 400px (email preview) - collapsible

**Responsive Breakpoints:**
- Mobile: Single column, collapsible sidebar
- Tablet (md): Sidebar + Main content
- Desktop (lg): Full 3-column layout

## Component Library

**Navigation:**
- Top bar: Gmail-style header with logo, search, user avatar (h-16, sticky)
- Sidebar: Category list with counts, filter controls (bg-surface, border-r)
- Active states: bg-primary/10 text-primary with left border accent

**Email List:**
- List items: Compact cards (p-4, hover:bg-surface/50 transition)
- Display: Subject (font-medium), preview (text-sm text-muted), metadata row
- Category badges: Rounded pills (px-3 py-1 text-xs font-medium) with category colors
- Similarity score: Percentage badge (font-mono text-xs) top-right
- Selection: Checkbox left, multi-select with bulk actions

**Classification Panel:**
- Category cards: Grid layout (grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4)
- Each card: Icon, label, count, percentage bar (h-1 rounded-full bg-primary)
- Click to filter: Active state with shadow-lg

**Data Visualization:**
- Chart container: bg-surface rounded-lg p-6 border
- Chart types: Pie chart (category distribution), line graph (timeline), bar chart (volume)
- Color coding: Match category colors
- Interactive: Tooltips on hover, click to drill down
- Library: Use Chart.js or Recharts via CDN

**Email Detail View:**
- Header: Subject (text-xl font-semibold), from/to/date row
- Body: max-w-prose py-6 (readable width)
- Actions bar: Reclassify dropdown, similarity view toggle, archive/delete
- Similar emails: Collapsed section showing top 5 with scores

**Forms & Inputs:**
- Search: w-full md:w-96 with icon, rounded-lg border focus:ring-2 ring-primary
- Dropdowns: Rounded-lg with shadow-sm, hover states
- Buttons: Primary (bg-primary text-white), Secondary (border), Ghost (hover:bg-surface)
- All inputs: Dark mode aware with proper contrast

**Loading States:**
- Skeleton loaders: Animated gradient (bg-gradient-to-r from-surface via-border to-surface)
- Spinner: Primary color, size-appropriate
- Progressive: Show emails as they load

**Empty States:**
- Centered icon + message + CTA
- Illustrations: Use simple SVG icons from Heroicons
- Helpful text: Guide user to next action

## Interactions & Animations

**Microinteractions (minimal):**
- Hover transitions: 150ms ease-in-out (colors, shadows)
- Category badge pulse: on new classification
- Similarity score count-up: on email select
- NO distracting animations

**Focus States:**
- Ring-2 ring-primary ring-offset-2 for keyboard navigation
- Skip to content link for accessibility

## Dashboard-Specific Elements

**Stats Overview:**
- 4-column grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-4)
- Each stat: Large number (text-3xl font-bold), label (text-sm), trend indicator

**Filters Panel:**
- Collapsible sections (Categories, Date range, Similarity threshold)
- Toggle switches for automated classification on/off
- Clear all filters button

**Vector Space Visualization:**
- Optional: 2D scatter plot showing email clusters
- Points colored by category, hover shows subject
- Zoom/pan controls

## Images

**No hero image** - This is a dashboard application, not a marketing page
**Icons only:**
- Gmail icon: Header logo area
- Category icons: Heroicons (shield for spam, briefcase for work, user for personal, clock for urgent, archive for archived)
- Action icons: Filter, search, settings (all from Heroicons)
- Chart legends: Color-coded squares

## Technical Considerations

- **Vietnamese Typography:** Ensure Inter font renders diacritics correctly
- **Real-time Updates:** WebSocket indicator in header for live classification
- **Accessibility:** WCAG AA contrast ratios, screen reader labels for categories
- **Performance:** Virtual scrolling for large email lists (1000+ emails)
- **Dark Mode:** Persistent user preference, smooth toggle (no flash)