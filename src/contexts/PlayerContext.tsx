import { createContext, useContext, useState, useRef, useEffect, ReactNode, useCallback } from 'react';

interface Song {
  id: string;
  title: string;
  artist: string;
  cover_url: string | null;
  audio_url: string;
  duration: number | null;
  lyrics: LyricLine[] | null;
}

interface LyricLine {
  time: number;
  text: string;
}

interface PlayerContextType {
  currentSong: Song | null;
  queue: Song[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isShuffle: boolean;
  repeatMode: 'off' | 'one' | 'all';
  isFullscreen: boolean;
  currentLyricIndex: number;
  playSong: (song: Song) => void;
  playQueue: (songs: Song[], startIndex?: number) => void;
  togglePlay: () => void;
  nextSong: () => void;
  previousSong: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setFullscreen: (fullscreen: boolean) => void;
  addToQueue: (song: Song) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'one' | 'all'>('off');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(-1);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume;

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play();
      } else {
        nextSong();
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, []);

  // Update current lyric based on time
  useEffect(() => {
    if (!currentSong?.lyrics) {
      setCurrentLyricIndex(-1);
      return;
    }

    const lyrics = currentSong.lyrics;
    let index = -1;

    for (let i = 0; i < lyrics.length; i++) {
      if (currentTime >= lyrics[i].time) {
        index = i;
      } else {
        break;
      }
    }

    setCurrentLyricIndex(index);
  }, [currentTime, currentSong?.lyrics]);

  const playSong = useCallback((song: Song) => {
    if (!audioRef.current) return;

    setCurrentSong(song);
    setQueue([song]);
    setCurrentIndex(0);

    audioRef.current.src = song.audio_url;
    audioRef.current.play().then(() => {
      setIsPlaying(true);
      if ('vibrate' in navigator) {
        navigator.vibrate(5);
      }
    }).catch(console.error);
  }, []);

  const playQueue = useCallback((songs: Song[], startIndex = 0) => {
    if (!audioRef.current || songs.length === 0) return;

    const actualQueue = isShuffle
      ? [...songs].sort(() => Math.random() - 0.5)
      : songs;

    setQueue(actualQueue);
    setCurrentIndex(startIndex);
    const song = actualQueue[startIndex];
    setCurrentSong(song);

    audioRef.current.src = song.audio_url;
    audioRef.current.play().then(() => {
      setIsPlaying(true);
    }).catch(console.error);
  }, [isShuffle]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !currentSong) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(console.error);
    }

    if ('vibrate' in navigator) {
      navigator.vibrate(5);
    }
  }, [isPlaying, currentSong]);

  const nextSong = useCallback(() => {
    if (queue.length === 0) return;

    let nextIndex = currentIndex + 1;

    if (nextIndex >= queue.length) {
      if (repeatMode === 'all') {
        nextIndex = 0;
      } else {
        setIsPlaying(false);
        return;
      }
    }

    setCurrentIndex(nextIndex);
    const song = queue[nextIndex];
    setCurrentSong(song);

    if (audioRef.current) {
      audioRef.current.src = song.audio_url;
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(console.error);
    }

    if ('vibrate' in navigator) {
      navigator.vibrate(5);
    }
  }, [queue, currentIndex, repeatMode]);

  const previousSong = useCallback(() => {
    if (!audioRef.current) return;

    // If more than 3 seconds in, restart song
    if (currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }

    if (queue.length === 0 || currentIndex === 0) return;

    const prevIndex = currentIndex - 1;
    setCurrentIndex(prevIndex);
    const song = queue[prevIndex];
    setCurrentSong(song);

    audioRef.current.src = song.audio_url;
    audioRef.current.play().then(() => {
      setIsPlaying(true);
    }).catch(console.error);

    if ('vibrate' in navigator) {
      navigator.vibrate(5);
    }
  }, [queue, currentIndex, currentTime]);

  const seekTo = useCallback((time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  }, []);

  const setVolume = useCallback((newVolume: number) => {
    if (!audioRef.current) return;
    audioRef.current.volume = newVolume;
    setVolumeState(newVolume);
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffle((prev) => !prev);
    if ('vibrate' in navigator) {
      navigator.vibrate(5);
    }
  }, []);

  const toggleRepeat = useCallback(() => {
    setRepeatMode((prev) => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
    if ('vibrate' in navigator) {
      navigator.vibrate(5);
    }
  }, []);

  const addToQueue = useCallback((song: Song) => {
    setQueue((prev) => [...prev, song]);
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        queue,
        isPlaying,
        currentTime,
        duration,
        volume,
        isShuffle,
        repeatMode,
        isFullscreen,
        currentLyricIndex,
        playSong,
        playQueue,
        togglePlay,
        nextSong,
        previousSong,
        seekTo,
        setVolume,
        toggleShuffle,
        toggleRepeat,
        setFullscreen: setIsFullscreen,
        addToQueue,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
