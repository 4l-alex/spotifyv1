import { useEffect, useState } from 'react';

export default function LoadingScreen() {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center">
      {/* Animated stars */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Logo */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-primary animate-pulse">
          <span className="text-5xl">🎵</span>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-glow">MusicApp</h1>
          <p className="text-muted-foreground mt-2">
            Caricamento{dots}
          </p>
        </div>
      </div>
    </div>
  );
}
