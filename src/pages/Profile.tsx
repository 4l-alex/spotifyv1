import { useState, useEffect } from 'react';
import { Moon, Sun, Settings } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import logo from '@/assets/logo.jpg';

interface ProfileProps {
  onOpenAdmin: () => void;
}

export default function Profile({ onOpenAdmin }: ProfileProps) {
  const { theme, toggleTheme } = useTheme();

  const [stats, setStats] = useState({ songsCount: 0, totalSize: 0 });

  useEffect(() => {
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

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-4 pb-32 space-y-6">
      {/* Header */}
      <h1 className="text-2xl font-bold">Profilo</h1>

      {/* Profile Card */}
      <div className="bg-muted/30 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="w-20 h-20 rounded-full overflow-hidden glow-primary">
            <img
              src={logo}
              alt="Logo"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Info */}
          <div className="flex-1">
            <h2 className="text-xl font-bold">MusicApp</h2>
            <p className="text-sm text-muted-foreground">La tua musica, ovunque</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
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

        {/* Admin Button */}
        <Button
          variant="outline"
          className="w-full"
          onClick={onOpenAdmin}
        >
          <Settings className="w-4 h-4 mr-2" />
          Pannello Admin
        </Button>
      </div>
    </div>
  );
}
