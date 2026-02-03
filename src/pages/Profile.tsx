import { useState, useEffect } from 'react';
import { Settings, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import logo from '@/assets/logo.jpg';

interface ProfileProps {
  onOpenAdmin: () => void;
}

export default function Profile({ onOpenAdmin }: ProfileProps) {
  const { language, setLanguage, t, languageNames, availableLanguages } = useLanguage();
  const [settingsOpen, setSettingsOpen] = useState(false);
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
      <h1 className="text-2xl font-bold">{t.profile}</h1>

      {/* Profile Card */}
      <div className="bg-muted/30 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="w-20 h-20 rounded-full overflow-hidden">
            <img
              src={logo}
              alt="Logo"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Info */}
          <div className="flex-1">
            <h2 className="text-xl font-bold">
              Spotify <span className="line-through text-muted-foreground">ads</span>
            </h2>
            <p className="text-sm text-muted-foreground">{t.yourMusic}</p>
          </div>
        </div>
      </div>

      {/* Settings Collapsible */}
      <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between bg-muted/30 rounded-xl p-4 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-primary" />
              <span className="font-semibold">{t.settings}</span>
            </div>
            {settingsOpen ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 space-y-3">
          {/* Stats */}
          <div className="bg-muted/20 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t.songs}</span>
              <span className="font-semibold text-primary">{stats.songsCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t.space}</span>
              <span className="font-semibold text-primary">{formatBytes(stats.totalSize)}</span>
            </div>
          </div>

          {/* Language Selector */}
          <div className="bg-muted/20 rounded-xl p-4">
            <p className="text-muted-foreground mb-3">{t.language}</p>
            <div className="space-y-2">
              {availableLanguages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <span className={language === lang ? 'text-primary font-medium' : ''}>
                    {languageNames[lang]}
                  </span>
                  {language === lang && <Check className="w-5 h-5 text-primary" />}
                </button>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Admin Button */}
      <Button
        variant="outline"
        className="w-full"
        onClick={onOpenAdmin}
      >
        <Settings className="w-4 h-4 mr-2" />
        {t.adminPanel}
      </Button>
    </div>
  );
}
