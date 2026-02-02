import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePlayer } from '@/contexts/PlayerContext';
import { useAuth } from '@/contexts/AuthContext';
import SongCard from '@/components/SongCard';
import { Skeleton } from '@/components/ui/skeleton';

interface Song {
  id: string;
  title: string;
  artist: string;
  cover_url: string | null;
  audio_url: string;
  duration: number | null;
  lyrics: unknown;
}

export default function Home() {
  const { profile } = useAuth();
  const { playQueue } = usePlayer();
  const [songs, setSongs] = useState<Song[]>([]);
  const [recentSongs, setRecentSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSongs = async () => {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error && data) {
        setSongs(data);
      }
      setIsLoading(false);
    };

    fetchSongs();
  }, []);

  useEffect(() => {
    const fetchRecentHistory = async () => {
      const { data: history } = await supabase
        .from('listening_history')
        .select('song_id')
        .order('played_at', { ascending: false })
        .limit(10);

      if (history && history.length > 0) {
        const songIds = [...new Set(history.map((h) => h.song_id))];
        const { data: recentData } = await supabase
          .from('songs')
          .select('*')
          .in('id', songIds);

        if (recentData) {
          // Maintain order from history
          const orderedSongs = songIds
            .map((id) => recentData.find((s) => s.id === id))
            .filter(Boolean) as Song[];
          setRecentSongs(orderedSongs.slice(0, 5));
        }
      }
    };

    fetchRecentHistory();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buongiorno';
    if (hour < 18) return 'Buon pomeriggio';
    return 'Buonasera';
  };

  if (isLoading) {
    return (
      <div className="p-4 pb-32 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-32 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          {getGreeting()}{profile?.username ? `, ${profile.username}` : ''}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Cosa vuoi ascoltare oggi?
        </p>
      </div>

      {/* Recent Songs */}
      {recentSongs.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Ascoltati di recente</h2>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {recentSongs.map((song) => (
              <button
                key={song.id}
                onClick={() => playQueue(songs as any, songs.findIndex((s) => s.id === song.id))}
                className="flex-shrink-0 w-32"
              >
                <div className="w-32 h-32 rounded-xl overflow-hidden mb-2 hover:glow-primary transition-shadow">
                  {song.cover_url ? (
                    <img
                      src={song.cover_url}
                      alt={song.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-4xl">🎵</span>
                    </div>
                  )}
                </div>
                <p className="font-medium text-sm truncate">{song.title}</p>
                <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* All Songs */}
      <section>
        <h2 className="text-lg font-semibold mb-3">
          {songs.length > 0 ? 'Tutte le canzoni' : 'Nessuna canzone'}
        </h2>
        {songs.length > 0 ? (
          <div className="space-y-1">
            {songs.map((song, index) => (
              <SongCard
                key={song.id}
                song={song}
                onPlay={() => playQueue(songs as any, index)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <span className="text-6xl block mb-4">🎵</span>
            <p>Nessuna canzone disponibile</p>
            <p className="text-sm mt-1">Le canzoni appariranno qui</p>
          </div>
        )}
      </section>
    </div>
  );
}
