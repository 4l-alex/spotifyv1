import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'it' | 'en' | 'fr';

interface Translations {
  home: string;
  search: string;
  library: string;
  profile: string;
  settings: string;
  language: string;
  songs: string;
  space: string;
  adminPanel: string;
  goodMorning: string;
  goodAfternoon: string;
  goodEvening: string;
  whatToListen: string;
  noSongs: string;
  allSongs: string;
  favorites: string;
  playlists: string;
  history: string;
  yourMusic: string;
}

const translations: Record<Language, Translations> = {
  it: {
    home: 'Home',
    search: 'Cerca',
    library: 'Libreria',
    profile: 'Profilo',
    settings: 'Impostazioni',
    language: 'Lingua',
    songs: 'Brani',
    space: 'Spazio',
    adminPanel: 'Pannello Admin',
    goodMorning: 'Buongiorno',
    goodAfternoon: 'Buon pomeriggio',
    goodEvening: 'Buonasera',
    whatToListen: 'Cosa vuoi ascoltare oggi?',
    noSongs: 'Nessuna canzone disponibile',
    allSongs: 'Tutte le canzoni',
    favorites: 'Preferiti',
    playlists: 'Playlist',
    history: 'Cronologia',
    yourMusic: 'La tua musica, ovunque',
  },
  en: {
    home: 'Home',
    search: 'Search',
    library: 'Library',
    profile: 'Profile',
    settings: 'Settings',
    language: 'Language',
    songs: 'Songs',
    space: 'Space',
    adminPanel: 'Admin Panel',
    goodMorning: 'Good morning',
    goodAfternoon: 'Good afternoon',
    goodEvening: 'Good evening',
    whatToListen: 'What do you want to listen to today?',
    noSongs: 'No songs available',
    allSongs: 'All songs',
    favorites: 'Favorites',
    playlists: 'Playlists',
    history: 'History',
    yourMusic: 'Your music, everywhere',
  },
  fr: {
    home: 'Accueil',
    search: 'Rechercher',
    library: 'Bibliothèque',
    profile: 'Profil',
    settings: 'Paramètres',
    language: 'Langue',
    songs: 'Titres',
    space: 'Espace',
    adminPanel: 'Panneau Admin',
    goodMorning: 'Bonjour',
    goodAfternoon: 'Bon après-midi',
    goodEvening: 'Bonsoir',
    whatToListen: "Qu'est-ce que tu veux écouter aujourd'hui?",
    noSongs: 'Aucune chanson disponible',
    allSongs: 'Toutes les chansons',
    favorites: 'Favoris',
    playlists: 'Playlists',
    history: 'Historique',
    yourMusic: 'Ta musique, partout',
  },
};

const languageNames: Record<Language, string> = {
  it: 'Italiano',
  en: 'English',
  fr: 'Français',
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  languageNames: Record<Language, string>;
  availableLanguages: Language[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem('language');
    return (stored as Language) || 'it';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: translations[language],
        languageNames,
        availableLanguages: ['it', 'en', 'fr'],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
