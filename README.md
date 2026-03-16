# This Moment in Strange History

AI-powered strange history storytelling with voice narration. Pick a date. Discover the weird, bizarre, and unexplained.

[Wiki](https://github.com/SeasonalHawk/this-moment-in-strange-history/wiki) | [Issues](https://github.com/SeasonalHawk/this-moment-in-strange-history/issues)

## How It Works

1. **Pick a date** from the calendar
2. **Read** the AI-generated creative nonfiction vignette (150-200 words, literary journalism)
3. **Listen** — narration auto-generates with Adam's voice and strange history-themed music
4. **Control** — Play/Pause, Replay, Download MP3, Mute Music
5. **Discover** — click "Strange Encounter" for a genre-themed story (Cryptids, Cursed Objects, Bizarre Deaths, and 17 more)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| AI Storytelling | Anthropic Claude API (Haiku 4.5) |
| Voice Narration | ElevenLabs TTS API (Adam voice, Flash v2.5) |
| Background Music | This Moment Is Wrong Somehow — Strange History ambient soundtrack (static asset) |
| Calendar | react-day-picker, date-fns |
| Testing | Vitest, React Testing Library |
| Prompt Framework | Kajiro IQ Pro |
| Deployment | Vercel |

## Quick Start

**Prerequisites:** Node.js 18+, pnpm, [Anthropic API key](https://console.anthropic.com), [ElevenLabs API key](https://elevenlabs.io)

```bash
git clone https://github.com/SeasonalHawk/this-moment-in-strange-history.git
cd this-moment-in-strange-history
pnpm install
```

Create `.env.local`:

```env
ANTHROPIC_API_KEY=your-anthropic-key
ELEVENLABS_API_KEY=your-elevenlabs-key
```

```bash
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key for story generation |
| `ELEVENLABS_API_KEY` | Yes | ElevenLabs API key for voice narration |
| `RATE_LIMIT_MAX` | No | Max requests per IP per window (default: 10) |
| `RATE_LIMIT_WINDOW_MS` | No | Rate limit window in ms (default: 60000) |

## Testing

```bash
pnpm test          # Run all 234+ tests
pnpm build         # Production build
pnpm test:watch    # Watch mode
```

## Project Structure

```
this-moment-in-strange-history/
├── public/          # Static assets (audio, logos, favicons, PWA manifest)
├── src/app/         # Next.js App Router (pages + API routes)
├── src/components/  # React components (CalendarPicker, Collapsible, LoadingState, StoryCard)
├── src/hooks/       # Custom hooks (useHistoryStory, useTextToSpeech, useBackgroundMusic)
├── src/lib/         # Shared utilities (costs, genres, prompts, rateLimit, validation)
└── src/__tests__/   # 14 test files, 234+ tests
```

See [Wiki > Architecture](https://github.com/SeasonalHawk/this-moment-in-strange-history/wiki/Architecture) for the complete file map.

## Documentation

| Topic | Link |
|-------|------|
| Architecture & Data Flow | [Wiki: Architecture](https://github.com/SeasonalHawk/this-moment-in-strange-history/wiki/Architecture) |
| Developer Guide | [Wiki: Guide](https://github.com/SeasonalHawk/this-moment-in-strange-history/wiki/Guide) |
| API Costs & Security | [Wiki: Operations](https://github.com/SeasonalHawk/this-moment-in-strange-history/wiki/Operations) |
| Release History | [Wiki: Releases](https://github.com/SeasonalHawk/this-moment-in-strange-history/wiki/Releases) |
| Product Roadmap | [Wiki: Roadmap](https://github.com/SeasonalHawk/this-moment-in-strange-history/wiki/Roadmap) |
| Assets & Branding | [Wiki: Assets](https://github.com/SeasonalHawk/this-moment-in-strange-history/wiki/Assets) |
| Contributing | [Wiki: Contributing](https://github.com/SeasonalHawk/this-moment-in-strange-history/wiki/Contributing) |
| Getting Started (detailed) | [Wiki: Getting Started](https://github.com/SeasonalHawk/this-moment-in-strange-history/wiki/Getting-Started) |

## License

MIT

---

*Built with Kajiro IQ Pro | Powered by Anthropic Claude + ElevenLabs | Kenneth Benavides*
