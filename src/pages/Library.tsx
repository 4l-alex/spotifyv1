import { useEffect, useState } from 'react';
import { Plus, Heart, Clock, Music } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePlayer } from '@/contexts/PlayerContext';
import SongCard from '@/components/SongCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Song {
  id: string;
  title: string;
  artist: string;
  cover_url: string | null;
  audio_url: string;
  duration: number | null;
  lyrics: unknown;
}

interface Playlist {
  id: string;
  name: string;
  cover_url: string | null;
}

export default function Library() {
  const { user } = useAuth();
  const { playQueue } = usePlayer();
  const [favorites, setFavorites] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [history, setHistory] = useState<Song[]>([]);

  useEffect(() => {
    if (!user) return;

    // Fetch favorites
    const fetchFavorites = async () => {
      const { data } = await supabase
        .from('favorites')
        .select('song_id, songs(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        const songs = data
          .map((f: any) => f.songs)
          .filter(Boolean) as Song[];
        setFavorites(songs);
      }
    };

    // Fetch playlists
    const fetchPlaylists = async () => {
      const { data } = await supabase
        .from('playlists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        setPlaylists(data);
      }
    };

    // Fetch history
    const fetchHistory = async () => {
      const { data } = await supabase
        .from('listening_history')
        .select('song_id, songs(*), played_at')
        .eq('user_id', user.id)
        .order('played_at', { ascending: false })
        .limit(50);

      if (data) {
        // Remove duplicates, keep most recent
        const uniqueSongs = new Map();
        data.forEach((h: any) => {
          if (h.songs && !uniqueSongs.has(h.song_id)) {
            uniqueSongs.set(h.song_id, h.songs);
          }
        });
        setHistory(Array.from(uniqueSongs.values()));
      }
    };

    fetchFavorites();
    fetchPlaylists();
    fetchHistory();
  }, [user]);

  return (
    <div className="p-4 pb-32 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Libreria</h1>
        <Button size="icon" variant="ghost">
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="favorites" className="w-full">
        <TabsList className="w-full grid grid-cols-3 bg-muted/50">
          <TabsTrigger value="favorites" className="gap-2">
            <Heart className="w-4 h-4" />
            Preferiti
          </TabsTrigger>
          <TabsTrigger value="playlists" className="gap-2">
            <Music className="w-4 h-4" />
            Playlist
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <Clock className="w-4 h-4" />
            Cronologia
          </TabsTrigger>
        </TabsList>

        {/* Favorites */}
        <TabsContent value="favorites" className="mt-4">
          {favorites.length > 0 ? (
            <div className="space-y-1">
              {favorites.map((song, index) => (
                <SongCard
                  key={song.id}
                  song={song}
                  onPlay={() => playQueue(favorites as any, index)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nessun preferito</p>
              <p className="text-sm mt-1">Aggiungi brani ai preferiti</p>
            </div>
          )}
        </TabsContent>

        {/* Playlists */}
        <TabsContent value="playlists" className="mt-4">
          {playlists.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {playlists.map((playlist) => (
                <button
                  key={playlist.id}
                  className="text-left group"
                >
                  <div className="aspect-square rounded-xl overflow-hidden bg-muted mb-2 group-hover:glow-primary transition-shadow">
                    {playlist.cover_url ? (
                      <img
                        src={playlist.cover_url}
                        alt={playlist.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <p className="font-medium truncate">{playlist.name}</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nessuna playlist</p>
              <p className="text-sm mt-1">Crea la tua prima playlist</p>
            </div>
          )}
        </TabsContent>

        {/* History */}
        <TabsContent value="history" className="mt-4">
          {history.length > 0 ? (
            <div className="space-y-1">
              {history.map((song, index) => (
                <SongCard
                  key={`${song.id}-${index}`}
                  song={song}
                  onPlay={() => playQueue(history as any, index)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nessuna cronologia</p>
              <p className="text-sm mt-1">I brani ascoltati appariranno qui</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
