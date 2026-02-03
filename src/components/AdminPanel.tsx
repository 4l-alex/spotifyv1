import { useState, useRef, useEffect } from 'react';
import { Upload, Music, Image, FileText, Trash2, Edit2, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Song {
  id: string;
  title: string;
  artist: string;
  cover_url: string | null;
  audio_url: string;
  duration: number | null;
  file_size: number | null;
  lyrics: LyricLine[] | null;
}

interface LyricLine {
  time: number;
  text: string;
}

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const ADMIN_PIN = '310108';
const ADMIN_PASSWORD = '._deltaaa101109_.';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 60000; // 1 minute

export default function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authInput, setAuthInput] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);

  const [songs, setSongs] = useState<Song[]>([]);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [lyricsText, setLyricsText] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const audioPreviewRef = useRef<HTMLAudioElement>(null);

  // Check lockout
  useEffect(() => {
    if (lockoutUntil && Date.now() < lockoutUntil) {
      const timer = setTimeout(() => {
        setLockoutUntil(null);
        setAttempts(0);
      }, lockoutUntil - Date.now());
      return () => clearTimeout(timer);
    }
  }, [lockoutUntil]);

  // Fetch songs
  useEffect(() => {
    if (isAuthenticated) {
      fetchSongs();
    }
  }, [isAuthenticated]);

  const fetchSongs = async () => {
    const { data } = await supabase
      .from('songs')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      const mappedSongs: Song[] = data.map((s) => ({
        id: s.id,
        title: s.title,
        artist: s.artist,
        cover_url: s.cover_url,
        audio_url: s.audio_url,
        duration: s.duration,
        file_size: s.file_size,
        lyrics: Array.isArray(s.lyrics) ? (s.lyrics as unknown as LyricLine[]) : null,
      }));
      setSongs(mappedSongs);
    }
  };

  const handleAuth = () => {
    if (lockoutUntil && Date.now() < lockoutUntil) {
      const secondsLeft = Math.ceil((lockoutUntil - Date.now()) / 1000);
      toast.error(`Bloccato. Riprova tra ${secondsLeft} secondi`);
      return;
    }

    if (authInput === ADMIN_PIN || authInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setAuthInput('');
      if ('vibrate' in navigator) {
        navigator.vibrate([50, 50, 50]);
      }
      toast.success('Accesso admin consentito');
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= MAX_ATTEMPTS) {
        setLockoutUntil(Date.now() + LOCKOUT_DURATION);
        toast.error('Troppi tentativi. Bloccato per 1 minuto');
      } else {
        toast.error(`PIN/Password errata. Tentativi: ${newAttempts}/${MAX_ATTEMPTS}`);
      }
      setAuthInput('');
    }
  };

  const parseLyrics = (text: string): LyricLine[] => {
    const lines = text.split('\n').filter((line) => line.trim());
    return lines.map((line) => {
      const match = line.match(/\[(\d+):?(\d+)?\.?(\d+)?\]\s*(.*)/);
      if (match) {
        const minutes = parseInt(match[1]) || 0;
        const seconds = parseInt(match[2]) || 0;
        const time = minutes * 60 + seconds;
        return { time, text: match[4] || '' };
      }
      return { time: 0, text: line };
    });
  };

  const handleSave = async () => {
    if (!title || !artist) {
      toast.error('Titolo e artista sono obbligatori');
      return;
    }

    setIsUploading(true);

    try {
      let audioUrl = editingSong?.audio_url || '';
      let coverUrl = editingSong?.cover_url || '';
      let duration: number | null = editingSong?.duration || null;

      // Upload audio/video
      if (audioFile) {
        const audioPath = `${Date.now()}-${audioFile.name}`;
        const { error: audioError } = await supabase.storage
          .from('music')
          .upload(audioPath, audioFile);

        if (audioError) throw audioError;

        const { data: audioData } = supabase.storage
          .from('music')
          .getPublicUrl(audioPath);

        audioUrl = audioData.publicUrl;

        if (audioPreviewRef.current) {
          duration = Math.floor(audioPreviewRef.current.duration) || null;
        }
      }

      // Upload cover
      if (coverFile) {
        const coverPath = `${Date.now()}-${coverFile.name}`;
        const { error: coverError } = await supabase.storage
          .from('covers')
          .upload(coverPath, coverFile);

        if (coverError) throw coverError;

        const { data: coverData } = supabase.storage
          .from('covers')
          .getPublicUrl(coverPath);

        coverUrl = coverData.publicUrl;
      }

      const lyricsData = lyricsText.trim() ? parseLyrics(lyricsText) : null;

      if (editingSong) {
        const { error } = await supabase
          .from('songs')
          .update({
            title,
            artist,
            audio_url: audioUrl,
            cover_url: coverUrl || null,
            duration,
            file_size: audioFile?.size || editingSong?.file_size || 0,
            lyrics: lyricsData as any,
          })
          .eq('id', editingSong.id);

        if (error) throw error;
        toast.success('Canzone aggiornata!');
      } else {
        if (!audioUrl) {
          toast.error('File audio/video obbligatorio per nuove canzoni');
          setIsUploading(false);
          return;
        }

        const { error } = await supabase.from('songs').insert({
          title,
          artist,
          audio_url: audioUrl,
          cover_url: coverUrl || null,
          duration,
          file_size: audioFile?.size || 0,
          lyrics: lyricsData as any,
        });
        if (error) throw error;
        toast.success('Canzone aggiunta!');
      }

      resetForm();
      fetchSongs();
    } catch (error: any) {
      toast.error(error.message || 'Errore durante il salvataggio');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (song: Song) => {
    if (!confirm(`Eliminare "${song.title}"?`)) return;

    try {
      const { error } = await supabase.from('songs').delete().eq('id', song.id);
      if (error) throw error;
      toast.success('Canzone eliminata');
      fetchSongs();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const startEdit = (song: Song) => {
    setEditingSong(song);
    setTitle(song.title);
    setArtist(song.artist);
    setLyricsText(
      song.lyrics
        ? song.lyrics.map((l) => `[${Math.floor(l.time / 60)}:${(l.time % 60).toString().padStart(2, '0')}] ${l.text}`).join('\n')
        : ''
    );
    setAudioFile(null);
    setCoverFile(null);
    setIsAddingNew(true);
  };

  const resetForm = () => {
    setEditingSong(null);
    setIsAddingNew(false);
    setTitle('');
    setArtist('');
    setLyricsText('');
    setAudioFile(null);
    setCoverFile(null);
  };

  const handleClose = () => {
    setIsAuthenticated(false);
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🔐 {isAuthenticated ? 'Admin Panel' : 'Autenticazione'}
          </DialogTitle>
        </DialogHeader>

        {!isAuthenticated ? (
          <div className="space-y-4 pt-4">
            <Input
              type="password"
              placeholder="PIN o Password"
              value={authInput}
              onChange={(e) => setAuthInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
              autoFocus
            />
            <Button onClick={handleAuth} className="w-full">
              Accedi
            </Button>
            {lockoutUntil && Date.now() < lockoutUntil && (
              <p className="text-sm text-destructive text-center">
                Bloccato. Riprova tra {Math.ceil((lockoutUntil - Date.now()) / 1000)}s
              </p>
            )}
          </div>
        ) : isAddingNew ? (
          <div className="space-y-4 pt-4">
            <Input
              placeholder="Titolo *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Input
              placeholder="Artista *"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
            />

            {/* Audio/Video Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Music className="w-4 h-4" /> File Audio/Video
              </label>
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*,video/mp4,video/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setAudioFile(file);
                }}
              />
              <Button
                variant="outline"
                className="w-full"
                onClick={() => audioInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                {audioFile ? audioFile.name : editingSong?.audio_url ? 'Sostituisci file' : 'Carica audio/video'}
              </Button>
              {audioFile && (
                <audio
                  ref={audioPreviewRef}
                  src={URL.createObjectURL(audioFile)}
                  controls
                  className="w-full mt-2"
                />
              )}
            </div>

            {/* Cover Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Image className="w-4 h-4" /> Copertina
              </label>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setCoverFile(file);
                }}
              />
              <Button
                variant="outline"
                className="w-full"
                onClick={() => coverInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                {coverFile ? coverFile.name : editingSong?.cover_url ? 'Sostituisci copertina' : 'Carica copertina'}
              </Button>
              {(coverFile || editingSong?.cover_url) && (
                <img
                  src={coverFile ? URL.createObjectURL(coverFile) : editingSong?.cover_url || ''}
                  alt="Preview"
                  className="w-24 h-24 rounded-lg object-cover mt-2"
                />
              )}
            </div>

            {/* Lyrics */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <FileText className="w-4 h-4" /> Testi sincronizzati
              </label>
              <Textarea
                placeholder="[0:00] Prima riga
[0:15] Seconda riga
[0:30] Terza riga"
                value={lyricsText}
                onChange={(e) => setLyricsText(e.target.value)}
                rows={6}
              />
              <p className="text-xs text-muted-foreground">
                Formato: [minuti:secondi] testo
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={resetForm}>
                Annulla
              </Button>
              <Button
                className="flex-1"
                onClick={handleSave}
                disabled={isUploading}
              >
                <Save className="w-4 h-4 mr-2" />
                {isUploading ? 'Salvataggio...' : 'Salva'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-4">
            <Button onClick={() => setIsAddingNew(true)} className="w-full">
              <Upload className="w-4 h-4 mr-2" />
              Aggiungi nuova canzone
            </Button>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {songs.map((song) => (
                <div
                  key={song.id}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                >
                  <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                    {song.cover_url ? (
                      <img src={song.cover_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        🎵
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{song.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                  </div>
                  <button
                    onClick={() => startEdit(song)}
                    className="p-2 text-muted-foreground hover:text-foreground"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(song)}
                    className="p-2 text-destructive hover:text-destructive/80"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {songs.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Nessuna canzone caricata
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
