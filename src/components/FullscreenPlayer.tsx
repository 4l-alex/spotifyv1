import { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  ChevronDown,
  Heart,
} from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';

interface FullscreenPlayerProps {
  onSecretGesture?: () => void;
}

export default function FullscreenPlayer({ onSecretGesture }: FullscreenPlayerProps) {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    isShuffle,
    repeatMode,
    isFullscreen,
    currentLyricIndex,
    togglePlay,
    nextSong,
    previousSong,
    seekTo,
    toggleShuffle,
    toggleRepeat,
    setFullscreen,
  } = usePlayer();
  const { user } = useAuth();

  const [isFavorite, setIsFavorite] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const lyricsRef = useRef<HTMLDivElement>(null);

  // Secret gesture state
  const [tapCount, setTapCount] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);
  const [waitingForLongPress, setWaitingForLongPress] = useState(false);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check favorite status
  useEffect(() => {
    if (!user || !currentSong) return;

    const checkFavorite = async () => {
      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('song_id', currentSong.id)
        .maybeSingle();

      setIsFavorite(!!data);
    };

    checkFavorite();
  }, [user, currentSong?.id]);

  // Auto-scroll lyrics
  useEffect(() => {
    if (!lyricsRef.current || currentLyricIndex < 0) return;

    const container = lyricsRef.current;
    const activeLine = container.querySelector(`[data-index="${currentLyricIndex}"]`);

    if (activeLine) {
      activeLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentLyricIndex]);

  // Handle secret gesture - 7 taps
  const handleCoverTap = () => {
    const now = Date.now();

    if (now - lastTapTime > 1000) {
      // Reset if too slow
      setTapCount(1);
    } else {
      setTapCount((prev) => prev + 1);
    }

    setLastTapTime(now);

    if (tapCount + 1 >= 7) {
      setWaitingForLongPress(true);
      setTapCount(0);

      // Auto-reset after 5 seconds
      setTimeout(() => {
        setWaitingForLongPress(false);
      }, 5000);
    }
  };

  // Handle long press for secret gesture
  const handleCoverMouseDown = () => {
    if (!waitingForLongPress) return;

    longPressTimerRef.current = setTimeout(() => {
      if ('vibrate' in navigator) {
        navigator.vibrate([50, 50, 50]);
      }
      setWaitingForLongPress(false);
      onSecretGesture?.();
    }, 3000);
  };

  const handleCoverMouseUp = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const toggleFavorite = async () => {
    if (!user || !currentSong) return;

    if (isFavorite) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('song_id', currentSong.id);
      setIsFavorite(false);
    } else {
      await supabase.from('favorites').insert({
        user_id: user.id,
        song_id: currentSong.id,
      });
      setIsFavorite(true);
    }

    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isFullscreen || !currentSong) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between p-4 safe-area-top">
        <button
          onClick={() => setFullscreen(false)}
          className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
        <p className="text-sm font-medium text-muted-foreground">In riproduzione</p>
        <button
          onClick={toggleFavorite}
          className={cn(
            "w-10 h-10 flex items-center justify-center transition-colors",
            isFavorite ? "text-red-500" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Heart className={cn("w-6 h-6", isFavorite && "fill-current")} />
        </button>
      </div>

      {/* Cover or Lyrics */}
      <div className="flex-1 px-8 py-4 overflow-hidden">
        {showLyrics && currentSong.lyrics ? (
          <div
            ref={lyricsRef}
            className="h-full overflow-y-auto no-scrollbar py-20"
          >
            {currentSong.lyrics.map((line, index) => (
              <p
                key={index}
                data-index={index}
                className={cn(
                  "text-xl font-medium py-2 transition-all duration-300",
                  index === currentLyricIndex
                    ? "text-foreground text-glow scale-105"
                    : "text-muted-foreground/50"
                )}
              >
                {line.text}
              </p>
            ))}
          </div>
        ) : (
          <div
            className="h-full flex items-center justify-center"
            onClick={handleCoverTap}
            onMouseDown={handleCoverMouseDown}
            onMouseUp={handleCoverMouseUp}
            onTouchStart={handleCoverMouseDown}
            onTouchEnd={handleCoverMouseUp}
          >
            <div
              className={cn(
                "w-full max-w-xs aspect-square rounded-2xl overflow-hidden shadow-2xl transition-all duration-500",
                isPlaying && "glow-primary animate-glow"
              )}
            >
              {currentSong.cover_url ? (
                <img
                  src={currentSong.cover_url}
                  alt={currentSong.title}
                  className={cn(
                    "w-full h-full object-cover transition-transform duration-[20s] ease-linear",
                    isPlaying && "animate-spin"
                  )}
                  style={{ animationDuration: '20s' }}
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <span className="text-8xl">🎵</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Song Info */}
      <div className="px-8 mb-4">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold truncate">{currentSong.title}</h2>
            <p className="text-muted-foreground truncate">{currentSong.artist}</p>
          </div>
          {currentSong.lyrics && (
            <button
              onClick={() => setShowLyrics(!showLyrics)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                showLyrics
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              Testi
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-8 mb-4">
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={1}
          onValueChange={([value]) => seekTo(value)}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="px-8 pb-8 safe-area-bottom">
        <div className="flex items-center justify-between">
          <button
            onClick={toggleShuffle}
            className={cn(
              "w-10 h-10 flex items-center justify-center transition-colors",
              isShuffle ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Shuffle className="w-5 h-5" />
          </button>

          <button
            onClick={previousSong}
            className="w-14 h-14 flex items-center justify-center text-foreground"
          >
            <SkipBack className="w-8 h-8" />
          </button>

          <button
            onClick={togglePlay}
            className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:opacity-90 transition-opacity glow-primary"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8" />
            ) : (
              <Play className="w-8 h-8 ml-1" />
            )}
          </button>

          <button
            onClick={nextSong}
            className="w-14 h-14 flex items-center justify-center text-foreground"
          >
            <SkipForward className="w-8 h-8" />
          </button>

          <button
            onClick={toggleRepeat}
            className={cn(
              "w-10 h-10 flex items-center justify-center transition-colors",
              repeatMode !== 'off' ? "text-primary" : "text-muted-foreground"
            )}
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-5 h-5" />
            ) : (
              <Repeat className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
