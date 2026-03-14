# This Moment in History -- User & Developer Guide

**Author:** Kenneth Benavides
**Built with:** Claude Code + Kajiro IQ Pro
**Version:** MVP 8 (March 2026)

---

## Table of Contents

1. [What This Project Is](#what-this-project-is)
2. [Why It Exists](#why-it-exists)
3. [Core Capabilities](#core-capabilities)
4. [Tech Stack -- What and Why](#tech-stack----what-and-why)
5. [Architecture Deep Dive](#architecture-deep-dive)
6. [The AI Pipeline](#the-ai-pipeline)
7. [Prompt Engineering Philosophy](#prompt-engineering-philosophy)
8. [The Kajiro IQ Pro Methodology](#the-kajiro-iq-pro-methodology)
9. [The MVP Development Approach](#the-mvp-development-approach)
10. [Security Model](#security-model)
11. [Testing Strategy](#testing-strategy)
12. [How to Run It](#how-to-run-it)
13. [How to Extend It](#how-to-extend-it)
14. [Lessons Learned](#lessons-learned)

---

## What This Project Is

This Moment in History is an AI-powered creative nonfiction storytelling application with voice narration. You pick any calendar date. The app generates a vivid 150-200 word historical vignette -- not a Wikipedia summary, but an immersive second-person narrative that drops you into a real moment from the past. A narrator reads the story aloud over soft ambient piano music. The entire experience -- story, audio, music -- generates on demand in under 12 seconds.

Every story is grounded in historical fact. Every story is written like literary journalism. Every story comes with an event title, year, and MLA 9th edition citation.

The app is a full-stack Next.js application deployed on Vercel, powered by Anthropic's Claude API for story generation and ElevenLabs' TTS API for voice narration. It was designed, built, and shipped by Kenneth Benavides as a portfolio project demonstrating AI-native application architecture, prompt engineering, and rapid MVP development.

---

## Why It Exists

History doesn't have to read like a textbook.

Most "this day in history" apps give you a list of bullet points. A sentence about a treaty. A date next to a name. Facts without feeling.

This project started from a different premise: every date has a story worth *feeling*. Not as a list, but as a moment. The smell of gunpowder. The sound of a crowd. The weight of a decision made in a room with bad lighting. The AI system prompt enforces literary journalism rules -- sensory details, real people, real places, present tense, second person. The result reads like the opening paragraph of a magazine feature, not an encyclopedia entry.

The technical goal was equally specific: build a production-quality AI application from zero to deployed in a 3-day sprint, using Claude Code and the Kajiro IQ Pro prompt optimization framework. What was estimated to take 8-11 hours was completed in approximately 6 hours across two evening sessions, shipping 8 MVPs with 92 passing tests.

---

## Core Capabilities

| Capability | Description |
|-----------|-------------|
| **Date-Based Storytelling** | Pick any date from the calendar. Receive a historically accurate creative nonfiction vignette set on that date. |
| **Voice Narration** | Every story is automatically narrated by Adam -- a deep, authoritative voice via ElevenLabs TTS. |
| **Background Music** | Soft dreamscape piano loop plays during narration at 15% volume with a 2-second fade-in. |
| **Genre Discovery** | "Random History" picks a random date and applies one of 20 genre lenses (True Crime, Espionage, Science, Love, War, and 15 more). |
| **Audio Controls** | Play/Pause, Replay from start, Download as MP3, Mute/Unmute background music. |
| **Real-Time Timing** | Pipeline timing breakdown shows exactly how long story generation and audio generation take. |
| **Streaming Pipeline** | Unified server endpoint overlaps story and audio generation. Story displays while audio is still being created. |
| **Branding Outro** | Every audio file ends with the event title, date, year, and "This audio is created by This Moment in History. Copyright 2026." |

---

## Tech Stack -- What and Why

Every tool in this stack was chosen for a specific reason. Here's the decision logic behind each one.

### Framework: Next.js 16 (App Router)

**Why:** Server-side API routes protect API keys from browser exposure. The App Router provides file-based routing, React Server Components, and streaming support out of the box. The `/api/pipeline` endpoint uses the Web Streams API (`ReadableStream`) for NDJSON streaming -- something the App Router handles natively.

**Alternative considered:** A separate Express backend. Rejected because it adds deployment complexity, CORS configuration, and a second hosting target. Next.js keeps everything in one deployable unit.

### UI: React 19 + Tailwind CSS 4

**Why React 19:** Hooks-first architecture. The app uses `useState`, `useRef`, `useCallback`, and `useEffect` extensively. `useRef` is critical for timing accuracy (synchronous reads in async code) and audio element lifecycle management. React 19's improved rendering pipeline handles the frequent state updates during streaming without jank.

**Why Tailwind 4:** Utility-first CSS means zero context-switching between component files and stylesheet files. The amber/stone dark theme is expressed entirely in class names -- no CSS files to maintain. Responsive design (audio controls wrap on mobile) is handled with `flex-wrap` and `gap` utilities.

### AI Storytelling: Anthropic Claude API (Haiku)

**Why Claude:** The system prompt for this app is 400+ words of nuanced creative writing instructions with anti-patterns, voice rules, factual integrity constraints, and structural requirements. Claude follows complex multi-constraint instructions with high fidelity. The `tool_use` feature with `tool_choice` forces structured output (story + metadata) in a single API call -- no post-processing or regex parsing needed.

**Why Haiku 4.5 over Sonnet:** MVP 8 switched from `claude-sonnet-4-20250514` to `claude-haiku-4-5-20251001` for speed. Haiku 4.5 delivers similar coding performance to Sonnet 4 at one-third the cost and more than twice the speed. For 150-200 word creative vignettes, the quality difference is negligible -- both models follow the system prompt faithfully. The speed improvement directly impacts user experience. Note: The original target was `claude-3-5-haiku-20241022`, but that model was retired by Anthropic on February 19, 2026. The `STORY_MODEL` constant in `src/lib/prompts.ts` serves as a single source of truth -- if Anthropic retires another model, you update one line.

**Why `tool_use` instead of plain text:** Structured output. The `publish_vignette` tool forces Claude to return `story`, `eventTitle`, `eventYear`, and `mlaCitation` as typed JSON fields. No regex parsing, no "please format your response as JSON" prompt hacking. The `tool_choice: { type: 'tool', name: 'publish_vignette' }` parameter guarantees the tool is always called.

### Voice Narration: ElevenLabs TTS API (Flash v2.5)

**Why ElevenLabs:** High-quality neural voice synthesis with multiple model tiers. The Adam voice (`pNInz6obpgDQGcFmaJgB`) provides a deep, authoritative narrator tone that matches the literary journalism style of the stories.

**Why Flash v2.5:** ElevenLabs offers three model tiers:

| Model | Latency | Quality | Used In |
|-------|---------|---------|---------|
| `eleven_multilingual_v2` | Slowest | Highest | MVP 1-6 |
| `eleven_turbo_v2_5` | Medium | High | MVP 7 |
| `eleven_flash_v2_5` | Fastest | Good | MVP 8 |

Flash v2.5 generates audio for a 150-word story in approximately 5-8 seconds versus 18+ seconds with the multilingual model. For a narrator reading historical vignettes, the quality is more than sufficient.

**Voice settings rationale:**

| Setting | Value | Reasoning |
|---------|-------|-----------|
| `stability` | 0.5 | Balanced -- not robotic, not erratic |
| `similarity_boost` | 0.75 | Strong voice consistency across stories |
| `style` | 0 | Disabled -- reduces latency with minimal audible difference for narrator-style speech |

### Background Music: Static Asset

**Why not generated per request:** The ambient piano loop is generated once via ElevenLabs Sound Effects API and saved as a static asset (`public/audio/ambient-bg.mp3`). This means zero per-request cost, zero latency, and consistent audio across sessions. The music loops infinitely at 15% volume -- subtle enough to enhance without distracting.

### Calendar: react-day-picker + date-fns

**Why react-day-picker:** Lightweight, accessible, and fully customizable. The dark theme (amber/stone) is applied via CSS class overrides -- no theming library needed. Future dates are disabled with a single `toDate={new Date()}` prop.

**Why date-fns:** Tree-shakeable date formatting. The app only imports `format` -- no moment.js-sized bundle penalty.

### Testing: Vitest + React Testing Library

**Why Vitest over Jest:** Native TypeScript support, faster execution (2.5 seconds for 92 tests), and first-class Vite integration. The `jsdom` environment simulates browser APIs for component testing without a real browser.

**Why React Testing Library:** Tests user-visible behavior, not implementation details. Tests query by text content ("Random History", "Pause"), not by CSS classes or component internals.

---

## Architecture Deep Dive

### Data Flow

```
User clicks a date (or "Random History")
    |
    v
page.tsx: runPipeline(date, genre?)
    |
    |-- tts.cleanup()           // Destroy previous audio
    |-- bgMusic.stop()          // Stop previous music
    |-- tts.warmUp()            // Create Audio element (autoplay policy)
    |-- history.startLoading()  // Show "Uncovering history..."
    |
    v
fetch('/api/pipeline', { month, day, genre })
    |
    v
pipeline/route.ts (server):
    |
    |-- validateRequest()       // month 1-12, day 1-31, genre in GENRES
    |-- rateLimit(ip)           // 10 req/IP/60s
    |
    |-- Phase 1: Claude Haiku   // ~3-4 seconds
    |   |-- System prompt + tool_choice
    |   |-- Returns: story, eventTitle, eventYear, mlaCitation
    |   |-- STREAM: {"type":"story", ...}\n  --> client displays story
    |
    |-- Phase 2: ElevenLabs Flash  // ~5-8 seconds (starts immediately)
    |   |-- story + outro text --> audio bytes
    |   |-- STREAM: {"type":"audio", "audio":"<base64>"}\n
    |
    v
page.tsx (client reads NDJSON stream):
    |
    |-- "story" event:
    |   |-- history.setResult()      // Display story immediately
    |   |-- tts.setLoadingState(true) // "Finding our history professor..."
    |
    |-- "audio" event:
    |   |-- Decode base64 --> Blob
    |   |-- tts.playBlob(blob)       // Auto-play narration
    |   |-- bgMusic.play()           // Fade in ambient music
    |
    v
User hears narration with background music.
Controls available: Play/Pause, Replay, Download, Mute Music, Random History.
```

### The NDJSON Streaming Protocol

The pipeline endpoint returns a streaming response with `Content-Type: application/x-ndjson`. Each line is a self-contained JSON object terminated by `\n`:

```
Line 1: {"type":"story","story":"The air smells of...","eventTitle":"...","eventYear":"1945","mlaCitation":"...","date":{"month":3,"day":14},"genre":null}
Line 2: {"type":"audio","audio":"SUQzBAAAAAAAI1RTU0UAAA..."}
```

**Why NDJSON over SSE or WebSockets:**

| Protocol | Complexity | Bi-Directional | Fits This Use Case |
|----------|------------|----------------|-------------------|
| SSE (`EventSource`) | Medium | No | Overkill -- we only send 2 events |
| WebSockets | High | Yes | Way overkill -- no real-time chat needed |
| NDJSON over `fetch()` | Low | No | Two events, standard fetch, no polyfills |

The client reads the stream with `response.body.getReader()` and splits on newlines. No `EventSource` API needed, no WebSocket handshake, no special libraries.

### The Browser Autoplay Problem (and How It's Solved)

Modern browsers block `audio.play()` unless it's called within the synchronous call stack of a user gesture (click, tap). The problem: our audio is generated by async API calls that happen *after* the click.

**The `warmUp()` pattern:**

```
1. User clicks a date              --> synchronous click handler fires
2. tts.warmUp() runs              --> creates new Audio() element (gesture chain intact)
3. Async API calls happen          --> story + TTS generation (seconds later)
4. tts.playBlob(blob) runs        --> sets .src on the SAME Audio element, calls .play()
5. Browser allows playback         --> because the Audio element was created in step 2
```

The key insight: the browser tracks which `Audio` elements were created during a user gesture. By creating the element synchronously during the click, then reusing it later, we satisfy the autoplay policy without any workarounds.

### Audio Element Lifecycle

The `useTextToSpeech` hook manages a single `Audio` element across its entire lifecycle:

```
warmUp()   --> new Audio(), addEventListener('ended', handler)
playBlob() --> set .src, .play(), track blob for download
pause()    --> .pause(), keep state for resume
resume()   --> .play()
replay()   --> .currentTime = 0, .play()
download() --> URL.createObjectURL(blob), trigger <a> click
cleanup()  --> .pause(), removeEventListener, revokeObjectURL, null refs
```

The `handleEndedRef` pattern uses `useRef` for the event handler to maintain stable identity across renders. Without this, `addEventListener` and `removeEventListener` would receive different function references, causing ghost listeners that fire multiple times.

---

## The AI Pipeline

### Story Generation

The system prompt is a 400+ word instruction set that enforces a specific literary style. Here's what it controls:

**Voice rules:**
- Second person ("you") -- places the reader inside the moment
- Present tense -- creates immediacy ("You hear the crack of..." not "The crowd heard...")
- Opens with sensory detail -- never with "On this day in [year]"
- Literary journalism -- real facts, fictional prose style

**Quality gates:**
- Every event, date, person, and location must be historically accurate
- No invented events -- if multiple events occurred, choose the most compelling
- No speculation about thoughts or dialogue unless sourced from historical record
- One scene, one moment -- not a timeline

**Anti-patterns (explicit prohibitions):**
- No "On this day in [year]..." openings
- No Wikipedia-style summaries
- No bullet points or lists
- No meta-commentary about the writing
- No "and that's why this matters" endings

### Genre System

When "Random History" is clicked, one of 20 curated genres is applied as a thematic lens:

> True Crime, Conspiracy & Mystery, War & Military, Science & Discovery, Love & Romance, Betrayal & Revenge, Survival & Exploration, Rise & Fall of Empires, Innovation & Invention, Art & Culture, Sports & Competition, Espionage & Spies, Natural Disasters, Revolution & Rebellion, Medicine & Plague, Money & Economics, Religion & Faith, Women Who Changed History, Unsolved Mysteries, Food & Cuisine

The genre doesn't change the factual requirements -- it shapes the *angle*. A War & Military lens on March 14 might surface a battlefield moment. A Food & Cuisine lens on the same date might surface the day a food safety law was signed. Same date, different story, both historically accurate.

The genre instruction in the user message tells Claude to adopt the tone, pacing, and atmosphere that the genre demands, and to lead with the sensory details that genre thrives on.

### Audio Generation

The narrator reads:
1. The full story text (150-200 words)
2. A brief pause (`\n\n`)
3. The event title
4. The date and year
5. Branding: "This audio is created by This Moment in History. Copyright 2026."

This creates a self-contained audio file. If someone downloads the MP3, the audio itself identifies what event it describes and who created it.

---

## Prompt Engineering Philosophy

This project demonstrates a specific approach to prompt engineering that goes beyond "tell the AI what to do."

### Constraint-Based Prompting

The system prompt doesn't just say "write a good story." It defines:

1. **What to do** (voice rules, structure requirements)
2. **What NOT to do** (anti-patterns, explicit prohibitions)
3. **How to verify quality** (sensory details count, word count range)
4. **Edge cases** (what to do when a date has no famous event)

This constraint-based approach produces more consistent output than open-ended instructions. The anti-patterns section is particularly important -- without it, Claude defaults to encyclopedic openings like "On this day in 1945..." which is exactly what this app avoids.

### Structured Output via Tool Use

Instead of asking Claude to return JSON (which can fail, produce malformed output, or require retry logic), the app uses Claude's `tool_use` feature:

```typescript
tools: [VIGNETTE_TOOL],
tool_choice: { type: 'tool', name: 'publish_vignette' }
```

This guarantees:
- The response always includes `story`, `eventTitle`, `eventYear`, `mlaCitation`
- All fields are properly typed strings
- No JSON parsing errors, no regex extraction, no retry loops
- The model is forced to call the tool -- it cannot respond with plain text

### Genre as a Lens, Not a Filter

The genre system doesn't filter a database of pre-written stories. It instructs Claude to *find* a real event on the given date that fits the genre, then *tell* that story through the genre's lens. This means:

- Every genre + date combination produces a unique story
- The same date can yield 20 different stories (one per genre)
- All stories are historically accurate regardless of genre
- The genre affects tone, pacing, and which details are emphasized -- not factual content

---

## The Kajiro IQ Pro Methodology

This project was built using Kajiro IQ Pro, a proprietary prompt optimization framework created by Kenneth Benavides. Kajiro IQ Pro operates on the K-A-J-I-R-O framework:

**K -- Kindle:** Define the exact deliverable, format, audience, and success criteria.
**A -- Architect:** Design the workflow with sequenced steps, inputs/outputs, and dependencies.
**J -- Judge:** Establish verification methods, good/bad examples, and review checkpoints.
**I -- Instruct:** Set the expert role, tone, quality standards, and interaction rules.
**R -- Refine:** Iterate based on evaluation results.
**O -- Optimize:** Final polish for production quality.

Every prompt in this project -- from the system prompt to the build instructions to the code review requests -- was evaluated against Kajiro's 21 diagnostic questions and optimized to 14/14 before execution. This methodology is why the system prompt has explicit anti-patterns, why the tool schema has detailed descriptions for every field, and why the build completed in approximately 6 hours instead of the estimated 8-11.

Kajiro IQ Pro is a proprietary methodology for AI Fluency and prompt optimization by Kenneth Benavides. (C) 2025-2026 Kenneth Benavides. All Rights Reserved.

Learn more: [https://kajiro.org](https://kajiro.org)

---

## The MVP Development Approach

The project was built in 8 incremental MVPs, each adding a distinct capability layer. Every MVP was committed, tested, and pushed before the next began.

### Why MVPs Matter

Each MVP produces a *working application*. If development stopped at MVP 1, you'd have a functional story generator. If it stopped at MVP 5, you'd have automatic audio narration. This approach:

- Reduces risk (every commit is deployable)
- Creates clear git history (each feature is one commit)
- Forces clean interfaces (each layer must work with what exists)
- Makes code review tractable (small, focused diffs)

### The 8 Layers

| MVP | Name | What It Added | Key Technical Decision |
|-----|------|---------------|----------------------|
| 1 | Core Story Engine | Calendar + AI stories + citations | Claude tool_use for structured output |
| 2 | Voice Narration | ElevenLabs TTS + play/stop | Audio element lifecycle management |
| 3 | Background Music | Ambient piano loop + mute toggle | Static asset (zero per-request cost) |
| 4 | Random History | 20 genre lenses + random date | Genre as prompt modifier, not data filter |
| 5 | Auto-TTS Pipeline | Automatic audio generation | Unified pipeline replacing manual buttons |
| 6 | Autoplay Fix + Timing | Browser autoplay compliance + timers | `warmUp()` pattern + `useRef` for timing |
| 7 | Efficiency Review | Bug fixes + code cleanup | `handleEndedRef` identity fix, dead prop removal |
| 8 | Streaming Pipeline | NDJSON streaming + faster models | Server-side overlap, Haiku + Flash |

### How Each Layer Built on the Last

MVP 1 established the data model (story + metadata). MVP 2 consumed that data model for narration. MVP 3 synced with MVP 2's playback events. MVP 4 extended MVP 1's API with genre support. MVP 5 unified MVPs 1-4 into an automatic pipeline. MVP 6 fixed a browser-level bug from MVP 5. MVP 7 cleaned up technical debt from MVPs 1-6. MVP 8 replaced the sequential architecture from MVP 5 with a streaming pipeline.

Each MVP's interface contract was preserved. `StoryCard` still accepts the same props it has since MVP 6. `useTextToSpeech` still exposes `speak()` even though the pipeline now uses `playBlob()`. Backward compatibility was maintained at every layer.

---

## Security Model

### API Key Protection

Both the Anthropic and ElevenLabs API keys are stored in `.env.local` (gitignored) and only accessed in server-side API routes. The browser never sees the keys. The pipeline endpoint runs entirely on the server -- the client only receives story text and audio bytes.

### Rate Limiting

An in-memory rate limiter tracks requests per IP address:

- **Default limit:** 10 requests per IP per 60-second window
- **Shared across endpoints:** `/api/history`, `/api/pipeline`, and `/api/tts` all share the same limiter
- **Configurable:** `RATE_LIMIT_MAX` and `RATE_LIMIT_WINDOW_MS` environment variables
- **Response:** 429 status with `retryAfter` seconds in the JSON body

### Input Validation

Every API request is validated before any external API call:

- `month` must be an integer 1-12
- `day` must be an integer 1-31
- `genre` (if provided) must exactly match one of the 20 curated genres
- TTS text is capped at 5,000 characters

### HTTP Security Headers

Deployed via `vercel.json`:

| Header | Value | Purpose |
|--------|-------|---------|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Forces HTTPS for 2 years |
| `X-Content-Type-Options` | `nosniff` | Prevents MIME-type sniffing |
| `X-Frame-Options` | `DENY` | Blocks iframe embedding |
| `X-XSS-Protection` | `1; mode=block` | Browser XSS filter |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limits referrer data leakage |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Disables unused browser APIs |
| `Content-Security-Policy` | `default-src 'self'; connect-src 'self' https://api.anthropic.com` | Restricts resource loading |

---

## Testing Strategy

### 92 Tests Across 7 Test Files

| File | Tests | What It Covers |
|------|-------|----------------|
| `validation.test.ts` | 18 | Input validation for month, day, genre. Month name mapping. User message construction with and without genre. |
| `rateLimit.test.ts` | 5 | Allow/block logic, per-IP tracking, window reset after expiration. |
| `StoryCard.test.tsx` | 29 | Story rendering, date formatting, event title/year display, MLA citation, genre badge, all audio controls (play/pause/replay/download), music mute toggle, timing label, spinning state. |
| `LoadingState.test.tsx` | 5 | Default message, custom message, skeleton lines, elapsed timer with startTime, no timer without startTime. |
| `genres.test.ts` | 5 | Genre list has 20 entries, all are non-empty strings, `getRandomGenre()` returns a valid genre. |
| `ttsRoute.test.ts` | 16 | Voice ID matches Adam, model is Flash v2.5, API URL construction, text validation (empty, null, whitespace, length limits), voice settings ranges. |
| `pipelineConfig.test.ts` | 14 | Pipeline models (Haiku + Flash), shared system prompt content (voice rules, tense, anti-patterns, word count), vignette tool schema (name, required fields, property types). |

### Testing Philosophy

Tests verify user-visible behavior, not implementation details:

```typescript
// Good: tests what the user sees
expect(screen.getByText('Random History')).toBeInTheDocument();

// Good: tests interaction behavior
fireEvent.click(screen.getByText('Pause'));
expect(onTogglePlayPause).toHaveBeenCalledOnce();

// Avoided: testing internal state or CSS classes
// expect(component.state.isPlaying).toBe(true);  // Never do this
```

Configuration tests verify that hardcoded constants match expected values -- catching accidental changes to model IDs, voice IDs, or prompt content.

---

## How to Run It

### Prerequisites

- Node.js 18+
- An Anthropic API key ([console.anthropic.com](https://console.anthropic.com))
- An ElevenLabs API key ([elevenlabs.io](https://elevenlabs.io)) with `text_to_speech` permission

### Setup

```bash
git clone https://github.com/SeasonalHawk/this-moment-in-history.git
cd this-moment-in-history
npm install
```

Create `.env.local`:

```env
ANTHROPIC_API_KEY=your-anthropic-key
ELEVENLABS_API_KEY=your-elevenlabs-key
```

### Run

```bash
npm run dev        # Start development server on http://localhost:3000
npm test           # Run all 92 tests
npm run build      # Production build
```

### Optional Configuration

```env
RATE_LIMIT_MAX=10           # Max requests per IP per window (default: 10)
RATE_LIMIT_WINDOW_MS=60000  # Rate limit window in milliseconds (default: 60000)
```

---

## How to Extend It

### Add a New Genre

1. Open `src/lib/genres.ts`
2. Add your genre string to the `GENRES` array
3. The genre is automatically available in Random History -- no other changes needed
4. Update the genre count in tests (`genres.test.ts`)

### Change the AI Model

Edit `src/lib/prompts.ts` for the system prompt, or the model string in:
- `src/app/api/pipeline/route.ts` (streaming pipeline -- primary)
- `src/app/api/history/route.ts` (standalone fallback)

### Change the Narrator Voice

1. Find the voice ID on [ElevenLabs](https://elevenlabs.io/voice-library)
2. Update `ELEVENLABS_VOICE_ID` in:
   - `src/app/api/pipeline/route.ts`
   - `src/app/api/tts/route.ts`
3. Adjust `voice_settings` (stability, similarity_boost) to match the new voice's characteristics

### Add a New Loading Phase

1. Add a new NDJSON event type in `pipeline/route.ts` (e.g., `{"type":"enrichment", ...}`)
2. Handle the event in `page.tsx`'s NDJSON reader loop
3. Add a new `LoadingState` message for that phase

### Replace Background Music

1. Replace `public/audio/ambient-bg.mp3` with your audio file
2. Ensure it loops cleanly (the `<audio>` element has `loop: true`)
3. Adjust `TARGET_VOLUME` in `src/hooks/useBackgroundMusic.ts` if needed

---

## Lessons Learned

### 1. Autoplay Policy Is Not Optional

Browsers will silently reject `audio.play()` if the call isn't in a user gesture's synchronous stack. The fix (creating the `Audio` element during the click, reusing it later) is non-obvious but reliable. This is the kind of bug that only appears in production browsers, never in tests.

### 2. Event Listener Identity Matters

Using a plain function as an event handler in a React component creates a new function reference on every render. `removeEventListener` silently fails if the reference doesn't match the one passed to `addEventListener`. The fix: `useRef` for stable handler identity.

### 3. Faster Models Are Usually Good Enough

Switching from Sonnet to Haiku for 150-word stories produced no noticeable quality drop. The system prompt's constraint-based design means even smaller models follow the rules. Don't pay for model capability you don't need.

### 4. Server-Side Overlap Beats Client-Side Parallelism

Running TTS on the server immediately after story generation (one endpoint, zero round-trip) is faster than having the client fetch the story, parse it, then fire a separate TTS request. The saved round-trip is only 100-200ms, but the architectural simplicity is worth more.

### 5. Structured Output Eliminates an Entire Class of Bugs

Claude's `tool_use` with `tool_choice` guarantees typed JSON output. No regex parsing, no "the model returned markdown instead of JSON" bugs, no retry logic for malformed responses. If you're building with Claude and need structured data, always use tools.

### 6. MVPs Compound

Each MVP took less time than the one before because the interfaces were already defined. MVP 8 (streaming pipeline) reused the same `StoryCard` component from MVP 1, the same `useTextToSpeech` hook from MVP 2, and the same validation logic from MVP 1. The hooks just gained new methods (`playBlob`, `setLoadingState`) without breaking existing ones.

---

## Credits

**Created by:** Kenneth Benavides
**Prompt Framework:** Kajiro IQ Pro (C) 2025-2026 Kenneth Benavides
**AI Tools:** Anthropic Claude (story generation), ElevenLabs (voice narration)
**Development Tool:** Claude Code
**License:** MIT

---

*This guide was written as part of the project's documentation to demonstrate the technical decisions, architectural patterns, and development methodology behind This Moment in History. Every line of code, every prompt, and every architectural decision in this project was conceived and directed by Kenneth Benavides.*
