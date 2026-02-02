import { Play, Pause, SkipForward } from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';
import { cn } from '@/lib/utils';

export default function MiniPlayer() {
  const {
    currentSong,
    isPlaying,
    togglePlay,
    nextSong,
    setFullscreen,
    currentTime,
    duration,
  } = usePlayer();

  if (!currentSong) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSwipeUp = () => {
    setFullscreen(true);
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  return (
    <div
      className="fixed bottom-16 left-0 right-0 z-30 safe-area-bottom"
      onClick={handleSwipeUp}
    >
      {/* Progress bar */}
      <div className="h-0.5 bg-muted">
        <div
          className="h-full bg-primary transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="glass-strong border-t border-border px-4 py-3">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          {/* Cover */}
          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 glow-primary">
            {currentSong.cover_url ? (
              <img
                src={currentSong.cover_url}
                alt={currentSong.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <span className="text-xl">🎵</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate text-sm">{currentSong.title}</p>
            <p className="text-xs text-muted-foreground truncate">
              {currentSong.artist}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:opacity-90 transition-opacity"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextSong();
              }}
              className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
