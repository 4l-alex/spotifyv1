import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePlayer } from '@/contexts/PlayerContext';
import SongCard from '@/components/SongCard';
import { Skeleton } from '@/components/ui/skeleton';
import logo from '@/assets/logo.jpg';

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
  const { playQueue } = usePlayer();
  const [songs, setSongs] = useState<Song[]>([]);
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buongiorno!';
    if (hour < 18) return 'Buon pomeriggio!';
    return 'Buonasera!';
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
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full overflow-hidden">
          <img src={logo} alt="Logo" className="w-full h-full object-cover" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">
            {getGreeting()}
          </h1>
          <p className="text-muted-foreground">
            Cosa vuoi ascoltare oggi?
          </p>
        </div>
      </div>

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
            <p>Nessuna canzone disponibile</p>
          </div>
        )}
      </section>
    </div>
  );
}
