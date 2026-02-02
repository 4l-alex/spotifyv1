import { useEffect, useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { usePlayer } from '@/contexts/PlayerContext';
import { Input } from '@/components/ui/input';
import SongCard from '@/components/SongCard';

interface Song {
  id: string;
  title: string;
  artist: string;
  cover_url: string | null;
  audio_url: string;
  duration: number | null;
  lyrics: unknown;
}

export default function Search() {
  const { playQueue } = usePlayer();
  const [query, setQuery] = useState('');
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [results, setResults] = useState<Song[]>([]);

  useEffect(() => {
    const fetchAllSongs = async () => {
      const { data } = await supabase
        .from('songs')
        .select('*')
        .order('title');

      if (data) {
        setAllSongs(data);
        setResults(data);
      }
    };

    fetchAllSongs();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults(allSongs);
      return;
    }

    const filtered = allSongs.filter(
      (song) =>
        song.title.toLowerCase().includes(query.toLowerCase()) ||
        song.artist.toLowerCase().includes(query.toLowerCase())
    );
    setResults(filtered);
  }, [query, allSongs]);

  return (
    <div className="p-4 pb-32 space-y-6">
      {/* Header */}
      <h1 className="text-2xl font-bold">Cerca</h1>

      {/* Search Input */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Cerca brani, artisti..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 bg-muted/50"
        />
      </div>

      {/* Results */}
      <section>
        <p className="text-sm text-muted-foreground mb-3">
          {results.length} {results.length === 1 ? 'risultato' : 'risultati'}
        </p>
        {results.length > 0 ? (
          <div className="space-y-1">
            {results.map((song, index) => (
              <SongCard
                key={song.id}
                song={song}
                onPlay={() => playQueue(results as any, index)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <SearchIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nessun risultato trovato</p>
            <p className="text-sm mt-1">Prova con altri termini</p>
          </div>
        )}
      </section>
    </div>
  );
}
