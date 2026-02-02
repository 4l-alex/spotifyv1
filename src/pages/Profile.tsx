import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Moon, Sun, Edit2, Camera } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function Profile() {
  const navigate = useNavigate();
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [stats, setStats] = useState({ songsCount: 0, totalSize: 0 });
  const [isEditingName, setIsEditingName] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [daysUntilChange, setDaysUntilChange] = useState<number | null>(null);

  useEffect(() => {
    // Fetch stats
    const fetchStats = async () => {
      const { count } = await supabase
        .from('songs')
        .select('*', { count: 'exact', head: true });

      const { data: sizeData } = await supabase
        .from('songs')
        .select('file_size');

      const totalSize = sizeData?.reduce((acc, song) => acc + (song.file_size || 0), 0) || 0;

      setStats({
        songsCount: count || 0,
        totalSize,
      });
    };

    fetchStats();
  }, []);

  useEffect(() => {
    if (profile?.last_name_change) {
      const lastChange = new Date(profile.last_name_change);
      const nextChangeDate = new Date(lastChange);
      nextChangeDate.setDate(nextChangeDate.getDate() + 15);

      const now = new Date();
      const diffDays = Math.ceil(
        (nextChangeDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays > 0) {
        setDaysUntilChange(diffDays);
      } else {
        setDaysUntilChange(null);
      }
    }
  }, [profile?.last_name_change]);

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleUpdateUsername = async () => {
    if (!user || !newUsername.trim()) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        username: newUsername.trim(),
        last_name_change: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (error) {
      toast.error('Errore durante l\'aggiornamento');
      return;
    }

    toast.success('Nome aggiornato!');
    setIsEditingName(false);
    refreshProfile();
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatListenTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  return (
    <div className="p-4 pb-32 space-y-6">
      {/* Header */}
      <h1 className="text-2xl font-bold">Profilo</h1>

      {/* Profile Card */}
      <div className="bg-muted/30 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-muted">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-accent">
                  <span className="text-3xl">👤</span>
                </div>
              )}
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">
                {profile?.username || 'Utente'}
              </h2>
              {daysUntilChange === null && (
                <button
                  onClick={() => {
                    setNewUsername(profile?.username || '');
                    setIsEditingName(true);
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            {daysUntilChange !== null && (
              <p className="text-xs text-muted-foreground mt-1">
                Puoi cambiare nome tra {daysUntilChange} giorni
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-muted/30 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-primary">{stats.songsCount}</p>
          <p className="text-xs text-muted-foreground">Brani</p>
        </div>
        <div className="bg-muted/30 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-primary">
            {formatBytes(stats.totalSize)}
          </p>
          <p className="text-xs text-muted-foreground">Spazio</p>
        </div>
        <div className="bg-muted/30 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-primary">
            {formatListenTime(profile?.total_listen_time || 0)}
          </p>
          <p className="text-xs text-muted-foreground">Ascoltato</p>
        </div>
      </div>

      {/* Settings */}
      <div className="space-y-4">
        <h3 className="font-semibold">Impostazioni</h3>

        {/* Theme Toggle */}
        <div className="flex items-center justify-between bg-muted/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            {theme === 'dark' ? (
              <Moon className="w-5 h-5 text-primary" />
            ) : (
              <Sun className="w-5 h-5 text-primary" />
            )}
            <span>Tema {theme === 'dark' ? 'Scuro' : 'Chiaro'}</span>
          </div>
          <Switch
            checked={theme === 'light'}
            onCheckedChange={toggleTheme}
          />
        </div>

        {/* Logout */}
        <Button
          variant="destructive"
          className="w-full"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Esci
        </Button>
      </div>

      {/* Edit Username Dialog */}
      <Dialog open={isEditingName} onOpenChange={setIsEditingName}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifica nome</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Nuovo nome"
            />
            <p className="text-xs text-muted-foreground">
              ⚠️ Potrai cambiare nome di nuovo tra 15 giorni
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsEditingName(false)}
              >
                Annulla
              </Button>
              <Button
                className="flex-1"
                onClick={handleUpdateUsername}
                disabled={!newUsername.trim()}
              >
                Salva
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
