'use client';

import { useState, useRef } from 'react';
import { format } from 'date-fns';
import CalendarPicker from '@/components/CalendarPicker';
import StoryCard from '@/components/StoryCard';
import LoadingState from '@/components/LoadingState';
import useHistoryStory from '@/hooks/useHistoryStory';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useBackgroundMusic } from '@/hooks/useBackgroundMusic';
import { getRandomGenre } from '@/lib/genres';

interface PipelineTiming {
  storyMs: number | null;
  audioMs: number | null;
}

const formatMs = (ms: number) => `${(ms / 1000).toFixed(1)}s`;

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [pipelineStart, setPipelineStart] = useState<number | null>(null);
  const [timing, setTiming] = useState<PipelineTiming>({ storyMs: null, audioMs: null });
  const phaseStartRef = useRef<number>(0);

  const { story, metadata, loading, error, activeGenre, fetchStory } = useHistoryStory();
  const tts = useTextToSpeech();
  const bgMusic = useBackgroundMusic();

  // Unified pipeline: reset → warmUp → fetch story → generate audio → auto-play
  const runPipeline = async (date: Date, genre?: string) => {
    // Full reset — destroy audio, stop music, clear timing
    tts.cleanup();
    bgMusic.stop();
    setTiming({ storyMs: null, audioMs: null });

    const now = Date.now();
    setPipelineStart(now);
    phaseStartRef.current = now;

    // Warm up audio element during user click to satisfy autoplay policy
    tts.warmUp();

    // Phase 1: "Uncovering history..."
    const data = await fetchStory(date, genre);
    const storyMs = Date.now() - phaseStartRef.current;
    setTiming(prev => ({ ...prev, storyMs }));
    if (!data) { setPipelineStart(null); return; }

    // Phase 2: "Finding our history professor..." → auto-play audio
    phaseStartRef.current = Date.now();
    try {
      await tts.speak({
        text: data.story,
        eventTitle: data.metadata.eventTitle,
        eventDate: format(date, 'MMMM d'),
        eventYear: data.metadata.eventYear,
        onStart: () => bgMusic.play(),
        onEnd: () => bgMusic.stop(),
      });
      const audioMs = Date.now() - phaseStartRef.current;
      setTiming(prev => ({ ...prev, audioMs }));
    } finally {
      setPipelineStart(null);
    }
  };

  const handleDateSelect = async (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) await runPipeline(date);
  };

  const handleRandomHistory = async () => {
    if (!selectedDate) return;
    await runPipeline(selectedDate, getRandomGenre());
  };

  const handleTogglePlayPause = () => {
    tts.togglePlayPause();
    if (tts.playing) {
      bgMusic.pause();
    } else {
      bgMusic.resume();
    }
  };

  const handleReplay = () => {
    tts.replay();
    bgMusic.play();
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      {/* Header */}
      <header className="border-b border-stone-800 py-6">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-amber-400 tracking-tight">
            This Moment in History
          </h1>
          <p className="text-stone-400 mt-2">
            Pick a date. Step into the past.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Calendar */}
        <CalendarPicker
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
        />

        {/* Story Area */}
        {loading && <LoadingState message="Uncovering history..." startTime={pipelineStart} />}
        {tts.loading && !loading && <LoadingState message="Finding our history professor..." startTime={pipelineStart} />}

        {error && (
          <div className="bg-red-900/30 border border-red-800 rounded-xl p-4 max-w-2xl mx-auto text-center">
            <p className="text-red-400">{error}</p>
            <button
              onClick={() => selectedDate && fetchStory(selectedDate)}
              className="mt-2 text-sm text-red-300 underline hover:text-red-200"
            >
              Try again
            </button>
          </div>
        )}

        {story && selectedDate && !loading && (
          <StoryCard
            story={story}
            date={selectedDate}
            eventTitle={metadata.eventTitle}
            eventYear={metadata.eventYear}
            mlaCitation={metadata.mlaCitation}
            genre={activeGenre}
            onRandomHistory={handleRandomHistory}
            spinning={loading || tts.loading}
            onTogglePlayPause={handleTogglePlayPause}
            onReplay={handleReplay}
            onDownloadAudio={() => {
              const title = metadata.eventTitle || 'story';
              const safeName = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
              tts.download(`this-moment-in-history-${safeName}.mp3`);
            }}
            audioPlaying={tts.playing}
            hasAudio={tts.hasAudio}
            musicMuted={bgMusic.muted}
            onToggleMusic={bgMusic.toggleMute}
            timingLabel={
              timing.storyMs !== null && timing.audioMs !== null
                ? `Story ${formatMs(timing.storyMs)} · Audio ${formatMs(timing.audioMs)} · Total ${formatMs(timing.storyMs + timing.audioMs)}`
                : timing.storyMs !== null
                  ? `Story ${formatMs(timing.storyMs)}`
                  : undefined
            }
          />
        )}

        {/* Empty state */}
        {!selectedDate && !loading && (
          <div className="text-center py-12">
            <p className="text-stone-500 text-lg">
              Select a date from the calendar above to uncover a moment in history.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-800 py-4 mt-auto">
        <div className="max-w-4xl mx-auto px-4 text-center text-stone-600 text-sm">
          Built with Kajiro IQ Pro | Powered by Anthropic Claude
        </div>
      </footer>
    </div>
  );
}
