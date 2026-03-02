import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Tab, Config, Counter, CalendarEvent } from '../types';
import { getConfig, getCounter } from '../services/storage';
import { getActiveModelIdx } from '../services/gemini';

export interface ToastMsg {
  text: string;
  type: 'info' | 'error' | 'success';
}

interface AppContextValue {
  activeTab: Tab;
  setActiveTab: (t: Tab) => void;

  config: Config;
  setConfig: (c: Config) => void;

  counter: Counter;
  setCounter: (c: Counter) => void;

  activeModelIdx: number;
  setActiveModelIdx: (i: number) => void;

  calendarEvents: CalendarEvent[];
  setCalendarEvents: (ev: CalendarEvent[]) => void;

  toast: ToastMsg | null;
  showToast: (text: string, type?: ToastMsg['type']) => void;
  hideToast: () => void;

  apiModalOpen: boolean;
  setApiModalOpen: (v: boolean) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<Tab>('generate');
  const [config, setConfig] = useState<Config>(getConfig);
  const [counter, setCounter] = useState<Counter>(getCounter);
  const [activeModelIdx, setActiveModelIdx] = useState<number>(getActiveModelIdx);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [toast, setToast] = useState<ToastMsg | null>(null);
  const [apiModalOpen, setApiModalOpen] = useState(false);

  const showToast = useCallback((text: string, type: ToastMsg['type'] = 'info') => {
    setToast({ text, type });
  }, []);

  const hideToast = useCallback(() => setToast(null), []);

  // Auto-hide toast after 3.5 seconds
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(hideToast, 3500);
    return () => clearTimeout(t);
  }, [toast, hideToast]);

  // Show API modal if no API key
  useEffect(() => {
    if (!config.apiKey) setApiModalOpen(true);
  }, []);

  return (
    <AppContext.Provider
      value={{
        activeTab, setActiveTab,
        config, setConfig,
        counter, setCounter,
        activeModelIdx, setActiveModelIdx,
        calendarEvents, setCalendarEvents,
        toast, showToast, hideToast,
        apiModalOpen, setApiModalOpen,
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
