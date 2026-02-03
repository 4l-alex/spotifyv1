import { Play, MoreVertical } from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';
import { cn } from '@/lib/utils';

interface Song {
  id: string;
  title: string;
  artist: string;
  cover_url: string | null;
  audio_url: string;
  duration: number | null;
  lyrics: unknown;
}

interface SongCardProps {
  song: Song;
  index?: number;
  showIndex?: boolean;
  onPlay?: () => void;
}

export default function SongCard({ song, index, showIndex, onPlay }: SongCardProps) {
  const { currentSong, isPlaying, playSong } = usePlayer();
  const isCurrentSong = currentSong?.id === song.id;

  const handlePlay = () => {
    if (onPlay) {
      onPlay();
    } else {
      playSong(song as any);
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-muted/50 group cursor-pointer",
        isCurrentSong && "bg-muted/50"
      )}
      onClick={handlePlay}
    >
      {/* Index or Cover */}
      <div className="relative w-12 h-12 flex-shrink-0">
        {showIndex && index !== undefined ? (
          <div className="w-full h-full flex items-center justify-center">
            <span
              className={cn(
                "text-lg font-bold",
                isCurrentSong ? "text-primary" : "text-muted-foreground"
              )}
            >
              {index + 1}
            </span>
          </div>
        ) : (
          <>
            <div
              className={cn(
                "w-full h-full rounded-lg overflow-hidden",
                isCurrentSong && isPlaying && "glow-primary"
              )}
            >
              {song.cover_url ? (
                <img
                  src={song.cover_url}
                  alt={song.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Play className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
              <Play className="w-5 h-5 text-white" />
            </div>
          </>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "font-medium truncate",
            isCurrentSong && "text-primary text-glow"
          )}
        >
          {song.title}
        </p>
        <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
      </div>

      {/* Duration */}
      <span className="text-sm text-muted-foreground">
        {formatDuration(song.duration)}
      </span>

      {/* More button */}
      <button
        onClick={(e) => e.stopPropagation()}
        className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <MoreVertical className="w-5 h-5" />
      </button>
    </div>
  );
}
