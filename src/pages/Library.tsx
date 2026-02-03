import { useEffect, useState } from 'react';
import { Plus, Heart, Clock, Music } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
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
  const { playQueue } = usePlayer();
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  useEffect(() => {
    const fetchSongs = async () => {
      const { data } = await supabase
        .from('songs')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        setAllSongs(data);
      }
    };

    const fetchPlaylists = async () => {
      const { data } = await supabase
        .from('playlists')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        setPlaylists(data);
      }
    };

    fetchSongs();
    fetchPlaylists();
  }, []);

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
      <Tabs defaultValue="songs" className="w-full">
        <TabsList className="w-full grid grid-cols-2 bg-muted/50">
          <TabsTrigger value="songs" className="gap-2">
            <Music className="w-4 h-4" />
            Brani
          </TabsTrigger>
          <TabsTrigger value="playlists" className="gap-2">
            <Heart className="w-4 h-4" />
            Playlist
          </TabsTrigger>
        </TabsList>

        {/* All Songs */}
        <TabsContent value="songs" className="mt-4">
          {allSongs.length > 0 ? (
            <div className="space-y-1">
              {allSongs.map((song, index) => (
                <SongCard
                  key={song.id}
                  song={song}
                  onPlay={() => playQueue(allSongs as any, index)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nessun brano</p>
              <p className="text-sm mt-1">Aggiungi brani dal Pannello Admin</p>
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
              <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nessuna playlist</p>
              <p className="text-sm mt-1">Crea la tua prima playlist</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
