'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import CalendarPicker from '@/components/CalendarPicker';
import StoryCard from '@/components/StoryCard';
import LoadingState from '@/components/LoadingState';
import useHistoryStory from '@/hooks/useHistoryStory';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useBackgroundMusic } from '@/hooks/useBackgroundMusic';
import { getRandomGenre } from '@/lib/genres';

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [audioGenerating, setAudioGenerating] = useState(false);
  const { story, metadata, loading, error, activeGenre, fetchStory } = useHistoryStory();
  const { speak, togglePlayPause, replay, cleanup, download, loading: audioLoading, playing: audioPlaying, paused: audioPaused, hasAudio } = useTextToSpeech();
  const bgMusic = useBackgroundMusic();

  const generateAudioForStory = async (storyText: string, date: Date, eventTitle: string | null, eventYear: string | null) => {
    const dateStr = format(date, 'MMMM d');
    setAudioGenerating(true);
    try {
      await speak({
        text: storyText,
        eventTitle,
        eventDate: dateStr,
        eventYear,
        onStart: () => bgMusic.play(),
        onEnd: () => bgMusic.stop(),
      });
    } finally {
      setAudioGenerating(false);
    }
  };

  const handleDateSelect = async (date: Date | undefined) => {
    // Full reset — destroy audio, stop music, clear state
    cleanup();
    bgMusic.stop();
    setAudioGenerating(false);
    setSelectedDate(date);

    if (date) {
      // Phase 1: "Uncovering history..." (loading=true from fetchStory)
      const data = await fetchStory(date);
      if (!data) return;

      // Phase 2: "Finding our history professor..." → auto-play audio
      await generateAudioForStory(data.story, date, data.metadata.eventTitle, data.metadata.eventYear);
    }
  };

  const handleRandomHistory = async () => {
    if (!selectedDate) return;

    // Full reset — destroy audio, stop music, clear state
    cleanup();
    bgMusic.stop();
    setAudioGenerating(false);

    // Phase 1: "Uncovering history..."
    const data = await fetchStory(selectedDate, getRandomGenre());
    if (!data) return;

    // Phase 2: "Finding our history professor..." → auto-play audio
    await generateAudioForStory(data.story, selectedDate, data.metadata.eventTitle, data.metadata.eventYear);
  };

  const handleTogglePlayPause = () => {
    togglePlayPause();
    if (audioPlaying) {
      bgMusic.pause();
    } else {
      bgMusic.resume();
    }
  };

  const handleReplay = () => {
    replay();
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
        {loading && <LoadingState message="Uncovering history..." />}
        {audioGenerating && !loading && <LoadingState message="Finding our history professor..." />}

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
            spinning={loading || audioGenerating}
            onTogglePlayPause={handleTogglePlayPause}
            onReplay={handleReplay}
            onDownloadAudio={() => {
              const title = metadata.eventTitle || 'story';
              const safeName = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
              download(`this-moment-in-history-${safeName}.mp3`);
            }}
            audioPlaying={audioPlaying}
            audioPaused={audioPaused}
            hasAudio={hasAudio}
            musicMuted={bgMusic.muted}
            onToggleMusic={bgMusic.toggleMute}
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
