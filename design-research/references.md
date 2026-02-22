# YapSesh Design References

Visual and interaction references organized by category. Each entry describes what is specifically inspiring and applicable to YapSesh.

---

## 1. Otter.ai -- Voice Transcription UI

**Category:** Voice/Audio App
**URL:** https://otter.ai
**Screenshots/Galleries:** https://nicelydone.club/apps/otter | https://mobbin.com (search "Otter.ai")

### What's Inspiring

- **Live transcript as primary content.** Otter treats the transcript as the main stage, not a sidebar. Text flows in real-time with speaker labels and timestamps, creating a sense of "the conversation is happening here." YapSesh could learn from this: the transcript panel should feel alive, not like a log dump.
- **Speaker color coding.** Each speaker gets a subtle color tag next to their name. This is immediately parseable without being loud. Our transcript panel currently uses a single indigo accent for speaker names -- introducing per-speaker colors would add clarity.
- **Minimal chrome around the recording state.** The recording indicator is small and persistent but never dominates. Otter keeps the focus on content, not controls. YapSesh's current record button is already good here, but we could push further with a subtler ambient recording indicator (e.g., a gentle pulsing border rather than a red button).
- **Clean calendar/meeting list.** While YapSesh doesn't have sessions yet, Otter's session list is a model for a future "session history" view -- simple cards with date, duration, and topic count.

---

## 2. Descript -- Text-Based Audio/Video Editing

**Category:** Voice/Audio App
**URL:** https://descript.com
**Screenshots/Galleries:** https://www.descript.com/video-editing | https://mobbin.com (search "Descript")

### What's Inspiring

- **Script-first editing paradigm.** Descript's radical idea is that your transcript IS your editor. You edit words, not waveforms. This resonates deeply with YapSesh's concept -- our flowchart is essentially a visual "edit" of the conversation's structure. We should lean into this connection: clicking a topic node could highlight the corresponding transcript segments.
- **Side-by-side layout.** Descript places the script on the left, the visual preview on the right. This is essentially what YapSesh already does (canvas + transcript), but Descript makes the two panels feel deeply connected. When you select text, the video scrubs. We should explore similar cross-panel highlighting.
- **Understated toolbar.** Descript's toolbars are thin, mostly icon-based, and use muted colors. Tools appear contextually. This is a good model for our TopBar -- keep it minimal, let the content breathe.
- **AI features surfaced inline.** Descript's Underlord AI appears as suggestions within the editing flow, not as a separate modal or panel. If YapSesh ever surfaces AI suggestions (e.g., "these topics might be related"), they should appear as subtle inline prompts near the relevant nodes.

---

## 3. Whimsical -- Flowcharts & Mind Maps

**Category:** Flowchart/Mind-Map Tool
**URL:** https://whimsical.com
**Screenshots/Galleries:** https://whimsical.com/flowcharts | https://whimsical.com/mind-maps

### What's Inspiring

- **Node card design.** Whimsical's flowchart nodes are clean rectangles with soft rounded corners, subtle shadows, and clear hierarchy (title bold, description smaller). Our TopicNode already follows this pattern but could benefit from Whimsical's tighter spacing and more confident typography.
- **Edge/connector styling.** Whimsical uses smooth bezier curves with subtle arrowheads. The connections feel organic, not rigid. Our TopicEdge could adopt smoother curves and perhaps animated flow indicators (a subtle dot traveling along the edge to show conversation flow direction).
- **Canvas feel.** Whimsical's canvas has a very faint dot grid, generous whitespace, and a sense of calm. The background never competes with the content. Our current `#e2e8f0` dots on zinc-50 are close but could be even more subtle.
- **Auto-layout.** Whimsical automatically arranges nodes in a clean tree/flow structure. Our `computeLayout` already does this, but we could study Whimsical's spacing ratios -- they give nodes generous breathing room.
- **Predictive connections.** When you drag near another node, Whimsical suggests a connection. This kind of intelligence in the canvas makes the tool feel alive.

---

## 4. Are.na -- Minimal Creative Research Tool

**Category:** Minimal Creative Tool
**URL:** https://are.na
**Screenshots/Galleries:** https://are.na (the site itself is the reference) | https://ixd.prattsi.org/2025/02/design-critique-are-na-ios-app/

### What's Inspiring

- **Anti-algorithm, anti-decoration philosophy.** Are.na is radically minimal. No likes, no recommendations, no visual noise. Just content blocks ("Blocks") organized into channels. This is the aesthetic extreme we should be aware of -- YapSesh shouldn't go this far, but should inherit the principle: let the user's speech patterns be the visual interest, not the UI chrome.
- **Block-based content model.** Everything in Are.na is a "Block" -- text, image, link, file. Blocks can exist in multiple channels. This mirrors how a single utterance in YapSesh might relate to multiple topics. The visual treatment of blocks (simple bordered cards with minimal metadata) is a good reference for our topic nodes.
- **Quiet typography.** Are.na uses system fonts and restrained type scales. Nothing shouts. The hierarchy comes from spacing and weight, not size differences. This is aspirational for YapSesh's transcript panel especially.
- **Connection-making as core interaction.** Are.na's primary action is connecting a block to a channel. This is conceptually similar to our topic extraction -- speech becomes connected to topics. The gesture should feel similarly lightweight.

---

## 5. Linear -- Modern Project Tool (Dark Theme Reference)

**Category:** Minimal Creative Tool / Dark Theme
**URL:** https://linear.app
**Screenshots/Galleries:** https://linear.app/changelog/2024-03-20-new-linear-ui | https://linear.style | https://mobbin.com (search "Linear")

### What's Inspiring

- **The gold standard for modern dark UI.** Linear's dark theme uses the LCH color space for perceptually uniform colors. Their system is defined by just three variables: base color, accent color, and contrast. This is exactly the kind of theming system YapSesh should adopt -- it would make adding dark mode trivial and consistent.
- **Inter + Inter Display typography.** Linear uses Inter Display for headings (more expression) and regular Inter for body text. This is a proven, excellent combination that we could adopt directly. It's similar to Geist (which we currently use) but has wider community adoption and recognition.
- **Information density without clutter.** Linear packs a lot of information into each view but it never feels overwhelming. The secret is consistent spacing, clear hierarchy, and restrained color use. Only the accent color (purple/blue) is used for interactive elements. Everything else is neutral.
- **Keyboard-first interaction.** Linear feels fast because it's built for keyboard shortcuts. While YapSesh is primarily a voice tool, the settings/export/navigation flows could benefit from keyboard shortcuts (K for shortcuts menu, R for record, etc.).
- **Subtle animations.** Linear's transitions are fast (150-200ms) and purposeful. No bouncing, no overshooting. Things slide and fade with confidence. Our current 300ms transitions could be tightened to feel snappier.

---

## 6. FigJam -- Playful Collaborative Canvas

**Category:** Flowchart/Mind-Map Tool
**URL:** https://figma.com/figjam
**Screenshots/Galleries:** https://www.figma.com/figjam/ | https://mobbin.com (search "FigJam")

### What's Inspiring

- **Playful without being childish.** FigJam's UI uses friendly colors, rounded shapes, and skeuomorphic tool icons (a pen that looks like a pen). This warmth is what YapSesh needs -- we're a personal creative tool, not enterprise software. The current zinc palette is too neutral; we need moments of delight.
- **Bottom toolbar pattern.** FigJam places its primary tools in a floating bottom bar. Our Timeline already lives at the bottom -- we could evolve it into a more expressive toolbar that combines the timeline with recording controls and tool shortcuts.
- **Stamps and reactions.** While we don't need emoji reactions, the concept of lightweight annotations is relevant. Users might want to "star" or "flag" important topics during a conversation. Small, delightful interactions like this make the tool feel personal.
- **Canvas cursor presence.** FigJam shows other users' cursors with names. While YapSesh is single-user, a similar idea could show the "AI cursor" -- a subtle indicator of where the AI is currently analyzing in the transcript.

---

## 7. Notion -- Content-First Productivity

**Category:** Minimal Creative Tool
**URL:** https://notion.so
**Screenshots/Galleries:** https://mobbin.com (search "Notion") | https://medium.com/design-bootcamp/recreating-notion-6c6ce0b9d959

### What's Inspiring

- **Typography-driven hierarchy.** Notion's UI is almost entirely typographic. Headings, body text, and metadata are distinguished purely by size, weight, and color -- rarely by background fills or borders. This creates an extremely clean look that lets content dominate. Our TranscriptPanel could adopt this approach more aggressively.
- **Slash command pattern.** Notion's "/" menu for inserting blocks is now a universal pattern. While not directly applicable to real-time voice capture, a command palette (Cmd+K) for YapSesh actions (export, reset, settings, jump to topic) would feel natural to users familiar with Notion/Linear.
- **Hover-to-reveal controls.** Notion hides action buttons until you hover over a block. This keeps the UI clean at rest. We already do this partially (the delete button on key points), but could extend it to topic node actions (merge, split, recolor).
- **Serif + sans-serif mixing.** Notion offers both serif and sans-serif options, and many users mix them (serif for headings, sans for body). This creates visual warmth. YapSesh could use a soft serif (like Lora or Spectral) for topic names while keeping sans-serif for everything else.
