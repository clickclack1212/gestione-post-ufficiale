import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Tab, AppScreen, Config, Counter, CalendarEvent } from '../types';
import { getConfig, getCounter } from '../services/storage';
import { getActiveModelIdx, setPreferredModelIdx as setGeminiPreferred } from '../services/gemini';

export interface ToastMsg {
  text: string;
  type: 'info' | 'error' | 'success';
}

interface AppContextValue {
  screen: AppScreen;
  setScreen: (s: AppScreen) => void;

  activeTab: Tab;
  setActiveTab: (t: Tab) => void;

  config: Config;
  setConfig: (c: Config) => void;

  counter: Counter;
  setCounter: (c: Counter) => void;

  activeModelIdx: number;
  setActiveModelIdx: (i: number) => void;

  preferredModelIdx: number;
  setPreferredModelIdx: (i: number) => void;

  calendarEvents: CalendarEvent[];
  setCalendarEvents: (ev: CalendarEvent[]) => void;

  toast: ToastMsg | null;
  showToast: (text: string, type?: ToastMsg['type']) => void;
  hideToast: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [screen, setScreenState] = useState<AppScreen>(() =>
    (sessionStorage.getItem('xauusd_screen') as AppScreen) ?? 'landing'
  );
  const setScreen = (s: AppScreen) => {
    sessionStorage.setItem('xauusd_screen', s);
    setScreenState(s);
  };

  const [activeTab, setActiveTab] = useState<Tab>('generate');
  const [config, setConfig] = useState<Config>(getConfig);
  const [counter, setCounter] = useState<Counter>(getCounter);
  const [activeModelIdx, setActiveModelIdx] = useState<number>(getActiveModelIdx);
  const [preferredModelIdx, setPreferredModelIdxState] = useState<number>(0);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [toast, setToast] = useState<ToastMsg | null>(null);

  const setPreferredModelIdx = useCallback((i: number) => {
    setPreferredModelIdxState(i);
    setGeminiPreferred(i);
    setActiveModelIdx(i);
  }, []);

  const showToast = useCallback((text: string, type: ToastMsg['type'] = 'info') => {
    setToast({ text, type });
  }, []);

  const hideToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(hideToast, 3500);
    return () => clearTimeout(t);
  }, [toast, hideToast]);

  return (
    <AppContext.Provider
      value={{
        screen, setScreen,
        activeTab, setActiveTab,
        config, setConfig,
        counter, setCounter,
        activeModelIdx, setActiveModelIdx,
        preferredModelIdx, setPreferredModelIdx,
        calendarEvents, setCalendarEvents,
        toast, showToast, hideToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
