import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { GEMINI_MODELS } from '../constants/data';
import { Icon, Diamond, ChevronDown } from './Icon';
import type { Tab } from '../types';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'generate',  label: 'Genera',        icon: 'Zap'          },
  { id: 'prog',      label: 'Programmazione', icon: 'CalendarDays' },
  { id: 'weekly',    label: 'Settimana',      icon: 'CalendarRange'},
  { id: 'calendar',  label: 'Calendario',     icon: 'Newspaper'    },
  { id: 'optimize',  label: 'Ottimizza',      icon: 'Sparkles'     },
  { id: 'translate', label: 'Traduci',        icon: 'Globe'        },
  { id: 'settings',  label: 'Config',         icon: 'Settings'     },
];

const MODEL_COUNTS = [
  (c: { pro3: number; pro25: number; m2: number; m3: number }) => c.pro3,
  (c: { pro3: number; pro25: number; m2: number; m3: number }) => c.pro25,
  (c: { pro3: number; pro25: number; m2: number; m3: number }) => c.m2,
  (c: { pro3: number; pro25: number; m2: number; m3: number }) => c.m3,
];

export function Header() {
  const { activeTab, setActiveTab, config, counter, activeModelIdx, preferredModelIdx, setPreferredModelIdx } = useApp();
  const [modelOpen, setModelOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const model = GEMINI_MODELS[activeModelIdx] ?? GEMINI_MODELS[0];
  const preferred = GEMINI_MODELS[preferredModelIdx] ?? GEMINI_MODELS[0];
  const hasKey = !!config.apiKey;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setModelOpen(false);
      }
    }
    if (modelOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [modelOpen]);

  return (
    <header className="sticky top-0 z-30 bg-[var(--bg)]/95 backdrop-blur border-b border-[var(--bg3)]">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        {/* Logo */}
        <div className="flex items-center gap-2 min-w-0">
          <Diamond size={17} className="text-[var(--gold)] shrink-0" strokeWidth={1.5} />
          <div className="min-w-0">
            <div className="font-semibold text-sm text-[var(--text)] leading-tight tracking-tight">
              XAUUSD Post Panel
            </div>
            {config.channelName && (
              <div className="text-[10px] text-[var(--text3)] truncate">{config.channelName}</div>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0">

          {/* Model selector dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setModelOpen(v => !v)}
              className="flex items-center gap-1 px-2 py-1 rounded-[var(--radius-sm)] border border-[rgba(254,153,32,0.3)] text-[var(--gold)] bg-[rgba(254,153,32,0.08)] hover:bg-[rgba(254,153,32,0.15)] text-xs font-medium transition-colors"
              title="Seleziona modello Gemini preferito"
            >
              <span className="hidden sm:inline">{preferred.label}</span>
              <span className="sm:hidden">Gemini</span>
              <ChevronDown size={11} className={`transition-transform ${modelOpen ? 'rotate-180' : ''}`} />
            </button>

            {modelOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-[var(--bg2)] border border-[var(--bg3)] rounded-[var(--radius)] shadow-xl z-50 overflow-hidden">
                {GEMINI_MODELS.map((m, i) => (
                  <button
                    key={m.id}
                    onClick={() => { setPreferredModelIdx(i); setModelOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors
                      ${preferredModelIdx === i
                        ? 'bg-[rgba(254,153,32,0.12)] text-[var(--gold)]'
                        : 'text-[var(--text2)] hover:bg-[var(--bg3)] hover:text-[var(--text)]'
                      }`}
                  >
                    <span>{m.label}</span>
                    {preferredModelIdx === i && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)]" />
                    )}
                  </button>
                ))}
                <div className="px-3 py-1.5 border-t border-[var(--bg3)]">
                  <p className="text-[9px] text-[var(--text3)] leading-tight">
                    Attivo ora: {model.label}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* API status */}
          <button
            className={`flex items-center gap-1.5 px-2 py-1 rounded-[var(--radius-sm)] border text-xs font-medium transition-colors
              ${hasKey
                ? 'border-[rgba(254,153,32,0.3)] text-[var(--gold)] bg-[rgba(254,153,32,0.08)] hover:bg-[rgba(254,153,32,0.15)]'
                : 'border-[rgba(239,68,68,0.3)] text-[var(--red)] bg-[rgba(239,68,68,0.08)] hover:bg-[rgba(239,68,68,0.15)]'
              }`}
            onClick={() => setActiveTab('settings')}
            title={hasKey ? 'API Key configurata — vai a Config' : 'Nessuna API Key — vai a Config'}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${hasKey ? 'bg-[var(--gold)]' : 'bg-[var(--red)]'}`} />
            {hasKey ? 'API OK' : 'API KEY'}
          </button>
        </div>
      </div>

      {/* Counter bar — 4 models */}
      <div className="px-4 pb-2 flex items-center gap-2 overflow-x-auto scrollbar-hide">
        <span className="text-[10px] text-[var(--text3)] shrink-0">Oggi:</span>
        <div className="flex gap-1.5">
          {GEMINI_MODELS.map((m, i) => (
            <span
              key={m.id}
              className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap transition-colors
                ${preferredModelIdx === i
                  ? 'bg-[rgba(254,153,32,0.15)] border border-[rgba(254,153,32,0.35)] text-[var(--gold)]'
                  : 'bg-[var(--bg3)] text-[var(--text2)]'
                }`}
            >
              {m.label}: <strong className={preferredModelIdx === i ? 'text-[var(--gold)]' : 'text-[var(--gold)]'}>{MODEL_COUNTS[i](counter)}</strong>
            </span>
          ))}
          <span className="text-[10px] bg-[var(--bg3)] px-2 py-0.5 rounded-full text-[var(--text2)] whitespace-nowrap">
            Tot: <strong className="text-[var(--gold)]">{counter.total}</strong>
          </span>
        </div>
      </div>

      {/* Tab navigation */}
      <nav className="flex border-t border-[var(--bg3)] overflow-x-auto scrollbar-hide">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap
              transition-colors border-b-2 shrink-0
              ${activeTab === tab.id
                ? 'border-[var(--gold)] text-[var(--gold)] bg-[rgba(254,153,32,0.06)]'
                : 'border-transparent text-[var(--text3)] hover:text-[var(--text2)] hover:bg-[var(--bg2)]'
              }`}
          >
            <Icon name={tab.icon} size={13} />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </nav>
    </header>
  );
}
