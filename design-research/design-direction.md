# YapSesh Design Direction

A design direction document for evolving YapSesh's visual identity. The goal: modern, clean, slightly playful -- a creative/personal tool for exploring your own speech patterns, not corporate software.

---

## Color Palette

### Light Theme (Primary)

The current zinc palette is solid but too neutral. We should keep zinc as the structural base but introduce a warmer, more distinctive accent system.

#### Background & Surface

| Role | Current | Proposed | Hex |
|------|---------|----------|-----|
| Page background | `bg-zinc-50` | Warm off-white | `#FAFAF8` |
| Card/panel surface | `white` | Soft warm white | `#FFFFFF` |
| Canvas background | `#f4f4f5` (zinc-100) | Very faint warm gray | `#F7F7F5` |
| Canvas dot grid | `#e2e8f0` | Softer, lower contrast | `#E8E8E4` |

The shift: move from cool zinc grays toward warmer stone/neutral tones. This subtle change makes the app feel less like a dashboard and more like a notebook.

#### Text

| Role | Current | Proposed | Hex |
|------|---------|----------|-----|
| Primary text | `text-zinc-800` | Slightly warmer dark | `#1C1917` (stone-900) |
| Secondary text | `text-zinc-400` | Warmer mid gray | `#78716C` (stone-500) |
| Muted/timestamp | `text-zinc-300` | Subtle warm gray | `#A8A29E` (stone-400) |

#### Accent Colors

Replace the single indigo accent with a richer, more expressive palette.

| Role | Current | Proposed | Hex |
|------|---------|----------|-----|
| Primary accent | `indigo-500` | Warm violet | `#7C3AED` (violet-600) |
| Primary accent hover | `indigo-600` | Deeper violet | `#6D28D9` (violet-700) |
| Active/recording | `emerald-500` | Keep emerald | `#10B981` |
| Active glow | `emerald-200/300` | Softer teal | `#5EEAD4` (teal-300) |
| Destructive | `red-500` | Warm red | `#EF4444` (keep) |
| Topic color 1 | -- | Soft coral | `#FB923C` (orange-400) |
| Topic color 2 | -- | Sky blue | `#38BDF8` (sky-400) |
| Topic color 3 | -- | Lavender | `#A78BFA` (violet-400) |
| Topic color 4 | -- | Mint | `#34D399` (emerald-400) |
| Topic color 5 | -- | Rose | `#FB7185` (rose-400) |

The topic colors are used to tint topic nodes and their corresponding transcript entries, creating a visual thread between the canvas and the transcript panel. Each new topic gets the next color in the rotation.

#### Borders

| Role | Current | Proposed | Hex |
|------|---------|----------|-----|
| Default border | `border-zinc-200` | Warmer, softer | `#E7E5E4` (stone-200) |
| Subtle border | `border-zinc-100` | Nearly invisible | `#F5F5F4` (stone-100) |

### Dark Theme (Future)

When implementing dark mode, follow Linear's approach -- define three variables (base, accent, contrast) and derive everything else.

| Role | Hex | Notes |
|------|-----|-------|
| Page background | `#0C0A09` (stone-950) | Not pure black -- warmer |
| Card/panel surface | `#1C1917` (stone-900) | Elevated surface |
| Hover/elevated | `#292524` (stone-800) | Interactive states |
| Border | `#44403C` (stone-700) | Subtle dividers |
| Text primary | `#FAFAF9` (stone-50) | High contrast |
| Text secondary | `#A8A29E` (stone-400) | Muted content |
| Accent | `#8B5CF6` (violet-500) | Brighter in dark mode |

---

## Typography

### Current State

- Geist Sans (variable) via Next.js font loading
- Geist Mono (variable) for monospace
- Body fallback: Arial, Helvetica, sans-serif
- Sizes: text-base (16px) for headings, text-sm (14px) for content, text-xs (12px) for body, text-[10px] for metadata

### Recommended Changes

#### Primary Font: Keep Geist Sans

Geist is an excellent choice and well-integrated with Next.js. No reason to change it. It's geometric, clean, and slightly more distinctive than Inter while serving the same purpose.

#### Display/Heading Option: Instrument Serif or Fraunces

For topic node titles and the "YapSesh" wordmark, consider pairing Geist with a characterful serif:

- **Instrument Serif** (Google Fonts) -- Elegant, slightly condensed serif with personality. Free. Would give topic names a "written thought" quality that contrasts nicely with the UI's sans-serif.
- **Fraunces** (Google Fonts) -- A "wonky" soft serif with optical size axis. More playful, less formal. The variable font has an axis called "WONK" that can be dialed from formal to expressive. This would be the more adventurous choice.
- **Fallback/Conservative:** Just use Geist at heavier weights. The current approach works; a serif is a nice-to-have, not a must.

#### Type Scale Adjustments

The current type scale is too compressed at the small end. Everything below 14px is hard to distinguish.

| Role | Current | Proposed |
|------|---------|----------|
| App title ("YapSesh") | text-base (16px) font-bold | text-lg (18px) font-bold, optional serif |
| Section headings | text-sm (14px) font-semibold | text-sm (14px) font-semibold (keep) |
| Topic node title | text-sm (14px) font-semibold | text-base (16px) font-semibold, optional serif |
| Body/transcript text | text-xs (12px) | text-[13px] leading-relaxed |
| Key points in nodes | text-xs (12px) | text-xs (12px) (keep) |
| Metadata/timestamps | text-[10px] | text-[11px] tracking-wide |
| Counters/badges | text-[10px] | text-[11px] font-medium |

The key change: bump the smallest text from 10px to 11px. At 10px, text becomes difficult to read on many displays. The 1px increase is nearly invisible aesthetically but meaningfully improves readability.

#### Monospace

Keep Geist Mono for any future code-like displays (e.g., JSON export preview, API key fields in settings). It pairs naturally with Geist Sans.

---

## Layout Concepts

### Current Layout

```
+----------------------------------------------+
| TopBar (recording controls, actions)          |
+---------------------------+------------------+
|                           |                  |
|   FlowChart Canvas        | Transcript Panel |
|   (ReactFlow)             | (320px fixed)    |
|                           |                  |
+---------------------------+------------------+
| Timeline (topic dots on a line)               |
+----------------------------------------------+
```

### Proposed Evolution

The core three-panel layout (canvas + transcript + timeline) is correct. Changes should refine, not restructure.

#### Canvas Area

- **Remove the minimap by default.** It adds visual noise on small sessions. Show it only when there are 8+ topics, or let users toggle it. When shown, tuck it into the bottom-left corner with more transparency.
- **Soften the ReactFlow controls.** The default controls are functional but look generic. Custom-style them to match the app: rounded, same border radius as other elements, use the app's icon style.
- **Empty state upgrade.** The current microphone emoji + text is functional. Replace with a more designed illustration -- a simple line drawing of sound waves flowing into connected nodes. Keep it single-color (stone-300) and lightweight.
- **Canvas background.** Switch from dot grid to a very subtle cross-hatch or remove the pattern entirely. A blank warm-white canvas with just the nodes feels more like a thinking space. If keeping dots, reduce their opacity by 50%.

#### Transcript Panel

- **Resizable width.** Currently fixed at 320px on desktop. Add a drag handle on the left edge so users can widen it when they want to focus on the transcript. Save the preference.
- **Collapsible.** Add a small toggle button to collapse the panel entirely, giving the canvas full width. Useful when you just want to see the map.
- **Topic color threading.** Each transcript entry should have a small color indicator (2px left border or a colored dot) matching its associated topic's color. This creates a visual thread between transcript and canvas.
- **Scroll-to-topic.** Clicking a topic node on the canvas should auto-scroll the transcript to the relevant utterances and briefly highlight them.
- **Section headers.** When a new topic begins in the transcript, insert a subtle divider with the topic name. This breaks up the wall of text.

#### Timeline Bar

- **Richer timeline.** The current single-pixel line with dots is too minimal. Evolve it into a thin "swimlane" view:
  - Each topic gets a colored bar spanning its active duration.
  - Bars are stacked vertically (2-3px tall each) to show overlapping topics.
  - Hovering a bar highlights the corresponding node and transcript entries.
- **Recording progress.** When recording, show a subtle animated progress indicator -- a soft glow or a thin line that slowly fills from left to right.
- **Wider touch targets.** The current 24px tall timeline is tight on mobile. Increase to 36-40px with larger dot hit areas.

#### TopBar

- **Slim it down.** The current TopBar has many icon buttons that are hard to distinguish at 16x16. Group them:
  - Left: "YapSesh" wordmark + topic count
  - Center: Recording controls (the record button, desktop audio toggle, processing indicator)
  - Right: Overflow menu (three dots) containing Export, Reset, About, Settings, GitHub, Feedback
- **Recording state prominence.** When recording, the TopBar could get a very subtle top border glow (2px, emerald/teal) to create an ambient "we're live" feeling without being distracting.

#### Mobile Layout

The current responsive layout stacks canvas on top, transcript on bottom. This is correct. Refinements:

- Make the transcript panel swipeable -- swipe up to expand it over the canvas, swipe down to minimize.
- The timeline can move to the top of the transcript panel on mobile since the bottom is harder to reach.
- Recording controls should float as a persistent mini-bar, similar to a music player's "now playing" bar.

---

## Component Style Recommendations

### Cards (Topic Nodes)

**Current:** White bg, zinc-200 border, rounded-xl, shadow-md. Active state: emerald border + ring.

**Proposed:**
- Keep the white bg and rounded-xl corners -- they work well.
- Reduce shadow from `shadow-md` to `shadow-sm` at rest. Elevate to `shadow-md` on hover. Active nodes get `shadow-lg` with a tinted shadow matching their topic color.
- Add a 3px left border in the topic's assigned color. This creates a strong visual identifier without overwhelming the card.
- The status indicator (green dot + "Active"/"Discussed" label) could be replaced by the colored left border alone. Active topics get a subtly pulsing border; discussed topics get a static one. This removes one line of visual noise.
- Corner radius: keep `rounded-xl` (12px). This is friendlier than sharp corners and matches the "not corporate" goal.

### Buttons

**Primary (Record):**
- Current: `bg-zinc-900 text-white rounded-full`. This is good but generic.
- Proposed: `bg-stone-900 text-white rounded-full` with a slight gradient on hover (`from-stone-800 to-stone-900`). Keep it dark and confident.
- Recording state: Keep the red. Add a subtle radial pulse animation around the button (not just the inner dot).

**Secondary (Icon buttons in TopBar):**
- Current: `p-2 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100`.
- Proposed: `p-2 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100`. Same pattern, warmer palette.
- Consider using 18px icons instead of 16px for better legibility and larger hit targets.

**Pill buttons (Desktop Audio toggle):**
- Current: rounded-full with bg-indigo-100/bg-zinc-100 toggle.
- Proposed: Keep the pill shape. Switch indigo to violet to match the new accent. Add a tiny icon transition (rotate or color shift) when toggling.

**Text buttons (Show more, Add point):**
- Current: text-indigo-500, text-zinc-400.
- Proposed: text-violet-600, text-stone-400. Slightly increase font size to 11px.

### Modals (Settings, About)

- Add a subtle backdrop blur (`backdrop-blur-sm`) behind the overlay. This modern touch makes the modal feel like it floats above the content rather than simply covering it.
- Modal corners: `rounded-2xl` (16px) to feel softer and more app-like.
- Modal width: max-w-md is fine. Ensure consistent padding (p-6).
- Close button: top-right, use an X icon rather than a text "Close".
- Transition: slide up + fade in (200ms). Currently likely just appears/disappears.

### Scrollbars

- Current custom scrollbar (4px, zinc-colored) is good. Keep it.
- Consider auto-hiding scrollbars that only appear when actively scrolling. More minimal.

### Tooltips

- Current: `bg-zinc-800 text-white text-[10px]` on timeline dots.
- Proposed: `bg-stone-800 text-stone-50 text-[11px] rounded-lg shadow-lg`. Add a very subtle arrow/caret pointing to the trigger element. Animate with a quick fade (100ms delay, 150ms duration).

### Empty States

- Current: centered text with emoji.
- Proposed: centered text with a simple, single-color SVG illustration. Use the stone-300 color. Keep copy concise. Add a subtle call-to-action ("Press R to start recording" or "Click Record to begin").

---

## What to Keep

These aspects of the current design are working well and should be preserved:

1. **Overall layout structure.** Canvas + sidebar + timeline is the right architecture. Don't restructure.
2. **ReactFlow as the canvas engine.** It works, it's flexible, and the node/edge abstraction fits the domain.
3. **The record button design.** Pill-shaped, dark bg, red dot indicator. Iconic and clear.
4. **Rounded corners everywhere.** The consistent use of rounded-lg and rounded-xl gives the app a friendly, approachable feel.
5. **Minimal header.** The TopBar is thin and doesn't waste space. Keep it thin.
6. **Click-to-edit on nodes.** Inline editing of topic titles and key points is excellent UX. Keep and extend it.
7. **Geist font family.** Good choice, well-integrated with Next.js. No need to replace.
8. **Tailwind CSS as the styling approach.** Fast iteration, consistent spacing, utility-first works for this kind of app.
9. **The opacity-based age indicator on nodes.** Older topics fading is a clever and subtle way to show temporal relevance.
10. **Custom scrollbar styling.** Thin, unobtrusive, consistent.

## What to Change

These are the highest-impact changes, roughly ordered by effort/impact:

### Quick Wins (1-2 hours each)

1. **Warm up the color palette.** Shift from zinc to stone across the board. This is mostly find-and-replace in Tailwind classes. Biggest visual impact for least effort.
2. **Swap indigo accent to violet.** More distinctive, slightly more playful. Another find-and-replace.
3. **Bump minimum text size from 10px to 11px.** Improves readability on all displays.
4. **Add backdrop blur to modals.** One CSS class addition per modal.
5. **Soften canvas dot grid.** Lower the opacity or switch to a warmer color.

### Medium Effort (half day each)

6. **Topic color system.** Assign rotating colors to topics. Apply as left-border on nodes and color indicators in transcript. Requires a small addition to the topic data model (a `colorIndex` field) and CSS changes.
7. **Collapsible transcript panel.** Add a toggle button and animate the panel width. Save state to localStorage.
8. **Consolidate TopBar actions into overflow menu.** Reduce icon button count from 6 to 3 visible + overflow. Improves scannability.
9. **Cross-panel highlighting.** Clicking a topic node scrolls and highlights relevant transcript entries. Clicking a transcript entry pans to the relevant node.
10. **Empty state illustration.** Replace the microphone emoji with a designed SVG.

### Larger Efforts (1-2 days each)

11. **Dark mode.** Using the stone-based dark palette defined above. Requires a theme toggle, CSS variable system, and testing every component.
12. **Richer timeline.** Replace the dot-on-a-line with colored duration bars per topic.
13. **Resizable transcript panel.** Drag handle, minimum/maximum widths, persisted preference.
14. **Serif font for topic titles.** Load Instrument Serif or Fraunces, apply to topic node headings. Requires font loading setup and testing.
15. **Mobile swipe gestures.** Swipeable transcript panel, floating recording controls.

---

## Design Principles (Summary)

Five principles to guide all future design decisions for YapSesh:

1. **Content is the decoration.** The user's speech patterns, topic connections, and conversation flow are inherently visual and interesting. The UI should frame this content, not compete with it.
2. **Warm, not cold.** Stone over zinc. Violet over indigo. Serif accents over pure sans-serif. Every choice should make the app feel like a personal thinking tool, not a business dashboard.
3. **Connected, not siloed.** The canvas, transcript, and timeline should feel like three views of the same living conversation. Color threading, cross-panel highlighting, and synchronized scrolling reinforce this.
4. **Progressive disclosure.** Show the minimum at rest, reveal on interaction. Hover-to-show controls, collapsible panels, auto-hiding minimap. Keep the default view calm.
5. **Snappy, not sluggish.** Transitions under 200ms. No bouncing eases. Immediate response to clicks. The app should feel as fast as thought.
