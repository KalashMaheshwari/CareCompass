import React, { createContext, useContext, useState, useEffect } from 'react';
import { getTranslation } from '../translations';
import { dataService, initLocalStorageData } from '../services/supabase';
import { speechService } from '../services/speech';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  // Initialize storage seeds
  useEffect(() => {
    initLocalStorageData();
  }, []);

  // 1. Language state: 'hi' | 'en' | 'hinglish'
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem('carecompass_language');
    if (saved) return saved;
    // Auto-detect browser language
    if (typeof navigator !== 'undefined' && navigator.language && navigator.language.startsWith('hi')) {
      return 'hi';
    }
    return 'hinglish';
  });

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem('carecompass_language', lang);
  };

  // 2. Text Size (Accessibility 5.4): 'normal' | 'large' | 'xl'
  const [fontSize, setFontSizeState] = useState(() => {
    return localStorage.getItem('carecompass_fontsize') || 'normal';
  });

  const setFontSize = (size) => {
    setFontSizeState(size);
    localStorage.setItem('carecompass_fontsize', size);
  };

  // 3. Read Aloud global toggle (5.3)
  const [readAloud, setReadAloudState] = useState(() => {
    return localStorage.getItem('carecompass_read_aloud') === 'true';
  });

  const setReadAloud = (enabled) => {
    setReadAloudState(enabled);
    localStorage.setItem('carecompass_read_aloud', String(enabled));
    if (!enabled) {
      speechService.stopSpeaking();
    }
  };

  // 3b. Speech playback rate (0.85 | 1.0 | 1.25)
  const [speechRate, setSpeechRateState] = useState(() => {
    return parseFloat(localStorage.getItem('carecompass_speech_rate') || '1.0');
  });

  const setSpeechRate = (rate) => {
    setSpeechRateState(rate);
    localStorage.setItem('carecompass_speech_rate', String(rate));
  };

  // 4. Current User & Active Profile
  const [user, setUser] = useState(() => dataService.getCurrentUser());
  const [members, setMembers] = useState([]);
  const [activePatient, setActivePatient] = useState(null);

  const loadMembers = async () => {
    const mems = await dataService.getMembers(user?.id);
    setMembers(mems);
    if (!activePatient && mems.length > 0) {
      // Default to the first member or 'Papa' for demo
      const papa = mems.find(m => m.relationship === 'father');
      setActivePatient(papa || mems[0]);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [user]);

  // 5. Active Triage Session state (Section 8.1)
  const [triageData, setTriageData] = useState({
    user_input: '',
    detected_language: 'auto',
    conversation_history: [],
    latest_response: null,
    sessionId: null
  });

  // 6. Selected Caregiver & Booking
  const [selectedCaregiver, setSelectedCaregiver] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [activeBooking, setActiveBooking] = useState(null);

  // 7. Navigation router state
  const [currentRoute, setCurrentRoute] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      return window.location.hash.replace('#', '') || '/';
    }
    return '/';
  });

  const [routeParams, setRouteParams] = useState({});

  const navigate = (path, params = {}) => {
    speechService.stopSpeaking();
    setRouteParams(params);
    setCurrentRoute(path);
    if (typeof window !== 'undefined') {
      window.location.hash = path;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Sync hash changes (e.g. browser back button)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || '/';
      setCurrentRoute(hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // 8. Offline status (Section 5.5, 10)
  const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 9. DPDP Consent state
  const [hasConsented, setHasConsented] = useState(() => {
    return localStorage.getItem('carecompass_consent') === 'true';
  });

  const setConsent = (granted) => {
    setHasConsented(granted);
    localStorage.setItem('carecompass_consent', String(granted));
  };

  // Helper for translated strings
  const t = (key, params) => getTranslation(language, key, params);

  // Auto-speak utility with user check
  const autoSpeak = (text) => {
    if (readAloud && text) {
      speechService.speak(text, { language: language === 'hi' ? 'hi' : 'en', rate: speechRate });
    }
  };

  const value = {
    language,
    setLanguage,
    fontSize,
    setFontSize,
    readAloud,
    setReadAloud,
    speechRate,
    setSpeechRate,
    user,
    setUser,
    members,
    setMembers,
    loadMembers,
    activePatient,
    setActivePatient,
    triageData,
    setTriageData,
    selectedCaregiver,
    setSelectedCaregiver,
    selectedSlot,
    setSelectedSlot,
    activeBooking,
    setActiveBooking,
    currentRoute,
    routeParams,
    navigate,
    isOffline,
    hasConsented,
    setConsent,
    t,
    autoSpeak
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
