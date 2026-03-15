# Procedure: Calendar Lock & Story Card Reset Pattern

> Portable pattern for locking a date picker during async pipelines and providing a full app reset via a closeable content card.

---

## Problem

In apps that run expensive async pipelines (API calls, AI generation, TTS, etc.) triggered by a date/item selection:

1. **Rapid clicks waste resources** — users can fire multiple pipelines by clicking dates while one is running
2. **No way to start over** — once content loads, the user is stuck without a clear path to reset
3. **Stale state leaks** — audio keeps playing, old content persists, or loading indicators get stuck when switching context

## Solution Overview

Two complementary mechanisms:

| Mechanism | Purpose |
|-----------|---------|
| **Calendar Lock** | Disables the picker reactively based on active pipeline/playback state signals |
| **Close Button + Full Reset** | Lets the user dismiss loaded content and return to the initial empty state |

---

## Part 1: Calendar Lock (Reactive Disable)

### Concept

The calendar/picker component accepts a `disabled` prop. Instead of a single boolean flag, compose multiple state signals with `||` so the picker locks whenever *any* active process is running.

### Implementation

**Picker component** — accepts a `disabled` prop and applies visual + interaction blocking:

```tsx
// CalendarPicker.tsx (or any picker/selector component)
interface PickerProps {
  selected: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  disabled?: boolean;
}

export default function Picker({ selected, onSelect, disabled = false }: PickerProps) {
  return (
    <div className={`${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Your picker UI here */}
    </div>
  );
}
```

**Key CSS classes:**
- `opacity-50` — visual dimming so the user sees it's inactive
- `pointer-events-none` — blocks all mouse/touch interaction at the CSS level

**Parent page** — composes the disabled condition from state signals:

```tsx
<Picker
  selected={selectedDate}
  onSelect={handleSelect}
  disabled={
    pipelineRunning       // async pipeline in-flight
    || content.data !== null // content has loaded — only close button unlocks
  }
/>
```

### Why Close-Gated (Not Reactive)

Tying the lock to playback signals (audio.playing, audio.loading, etc.) creates coupling — every new button or feature can accidentally unlock the picker. Instead, lock the picker once content exists and only unlock via the explicit close action. This is simpler to reason about: **the close button is the single unlock mechanism**.

### Handler Guard (Belt + Suspenders)

Even with `pointer-events-none`, add an early return in the selection handler as a safety net. This catches edge cases like programmatic triggers or accessibility tools that bypass CSS:

```tsx
const handleSelect = async (date: Date | undefined) => {
  if (pipelineRunning) return; // Guard against race conditions
  setSelected(date);
  if (date) await runPipeline(date);
};
```

---

## Part 2: Close Button + Full Reset

### Concept

Add a close/dismiss button to the content card. When clicked, it aborts any in-flight work, destroys all runtime resources (audio elements, object URLs, abort controllers), and resets every piece of state back to its initial value.

### Content Card — Add `onClose` Prop

```tsx
// ContentCard.tsx
interface ContentCardProps {
  // ... your existing props
  onClose?: () => void;
  spinning?: boolean; // true while pipeline is actively loading
}

export default function ContentCard({ onClose, spinning, ...props }: ContentCardProps) {
  return (
    <div className="card">
      <div className="card-header">
        <div className="flex-1">{/* Title / status */}</div>

        {/* Close button — hidden during active loading to prevent partial state */}
        {onClose && !spinning && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-300
                       hover:bg-stone-800 transition-colors cursor-pointer"
            title="Close and start over"
            aria-label="Close"
          >
            {/* X icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4"
              viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
      <div className="card-body">{/* Content */}</div>
    </div>
  );
}
```

**Key detail:** `!spinning` hides the close button while the pipeline is actively running. This prevents the user from closing mid-generation, which could leave orphaned server-side processes or partial state.

### Parent Page — Full Reset Handler

```tsx
// page.tsx
const handleClose = () => {
  // 1. Abort any in-flight network requests
  if (abortRef.current) abortRef.current.abort();

  // 2. Destroy audio resources (pause, revoke URLs, null refs)
  tts.cleanup();
  bgMusic.stop();

  // 3. Clear all content state back to initial values
  contentHook.clear();           // story, metadata, genre → null
  setSelectedDate(undefined);    // deselect picker
  setPipelineStart(null);        // clear pipeline tracking
  setPhases([]);                 // clear loading phase UI
  setTiming({ a: null, b: null }); // clear performance metrics
  setCostData(null);             // clear cost estimation
};
```

### Reset Checklist

When implementing your reset handler, ensure you clear **every** category:

| Category | What to Reset | Why |
|----------|--------------|-----|
| **Network** | Abort in-flight requests via `AbortController` | Prevents late responses from updating cleared state |
| **Audio** | Pause playback, revoke object URLs, null element refs | Prevents orphaned audio, memory leaks from blob URLs |
| **Content** | Clear story/data, metadata, active filters | Returns UI to empty/initial state |
| **Selection** | Clear selected date/item | Picker shows no selection |
| **Pipeline** | Null out pipeline start timestamp | Unlocks the picker (reactive disable sees `null`) |
| **UI phases** | Clear loading phase array | Removes loading progress indicators |
| **Metrics** | Clear timing and cost data | Removes stale performance labels |

### Conditional Rendering

The content card should only render when there's content to show. This means closing (which clears content) naturally removes the card from the DOM:

```tsx
{content.story && selectedDate && (
  <ContentCard
    story={content.story}
    onClose={handleClose}
    spinning={content.loading || audio.loading}
    {/* ... other props */}
  />
)}

{/* Empty state — shows when nothing is selected */}
{!selectedDate && !content.loading && (
  <p>Select something to get started.</p>
)}
```

---

## Integration Sequence

```
User picks date
  → handleSelect fires
  → pipelineRunning = true
  → Calendar locks (opacity-50, pointer-events-none)
  → Pipeline streams content → audio
  → pipelineRunning = false, content.data is set
  → Calendar stays locked (content.data !== null)
  → User interacts with content (play, pause, replay, download, random)
  → Calendar remains locked through all interactions
  → ONLY unlocks when user clicks X (close button)

User clicks X on content card
  → handleClose fires
  → Aborts pipeline, stops audio, clears all state
  → content.data = null → Calendar unlocks
  → selectedDate = undefined → Calendar deselects
  → App returns to initial "pick a date" state
  → User can now pick a new date
```

---

## Porting Checklist

When adapting this pattern to a new project:

- [ ] Add `disabled` prop to your picker/selector component
- [ ] Apply `opacity-50 pointer-events-none` CSS classes when disabled
- [ ] Compose `disabled` from all relevant async state signals
- [ ] Add early-return guard in the selection handler
- [ ] Add `onClose` prop to your content/card component
- [ ] Add X button (hidden during `spinning` state)
- [ ] Implement full reset handler covering all state categories
- [ ] Wire `onClose` from parent to content card
- [ ] Verify content card conditionally renders only when content exists
- [ ] Test: rapid clicks during pipeline are blocked
- [ ] Test: close button resets to initial state
- [ ] Test: calendar re-enables after audio/process completes

---

## File Reference (This Project)

| File | Role |
|------|------|
| `src/components/CalendarPicker.tsx` | Picker with `disabled` prop |
| `src/components/StoryCard.tsx` | Content card with `onClose` + X button |
| `src/app/page.tsx` | Orchestrator: `handleCloseStory`, disabled composition |
| `src/hooks/useHistoryStory.ts` | Content state + `setErrorState('')` for clearing |
| `src/hooks/useTextToSpeech.ts` | Audio lifecycle: `cleanup()`, `playing`, `loading` |
| `src/hooks/useBackgroundMusic.ts` | Background audio: `stop()`, `warmUp()` |
