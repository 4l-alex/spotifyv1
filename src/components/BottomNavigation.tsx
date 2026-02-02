import { Home, Search, Library, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavItem {
  icon: typeof Home;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Search, label: 'Cerca', path: '/search' },
  { icon: Library, label: 'Libreria', path: '/library' },
  { icon: User, label: 'Profilo', path: '/profile' },
];

interface BottomNavigationProps {
  className?: string;
}

export default function BottomNavigation({ className }: BottomNavigationProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    navigate(path);
  };

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 z-40 glass-strong border-t border-border safe-area-bottom",
      className
    )}>
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-4">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => handleNavigation(path)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-200",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "w-6 h-6 transition-transform duration-200",
                  isActive && "scale-110"
                )}
              />
              <span className={cn(
                "text-xs font-medium",
                isActive && "text-glow"
              )}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
