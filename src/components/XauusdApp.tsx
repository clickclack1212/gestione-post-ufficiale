import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { GEMINI_MODELS } from '../constants/data';
import { Toast } from './Toast';
import { Diamond, ChevronLeft, ChevronDown, Icon } from './Icon';
import type { XauusdTab } from '../types';
import { XauusdBiasSection }     from '../sections/xauusd/XauusdBiasSection';
import { XauusdMacroSection }    from '../sections/xauusd/XauusdMacroSection';
import { XauusdWeekCalSection }  from '../sections/xauusd/XauusdWeekCalSection';
import { XauusdPatternSection }  from '../sections/xauusd/XauusdPatternSection';
import { XauusdJournalSection }  from '../sections/xauusd/XauusdJournalSection';
import { XauusdGoNoGoSection }   from '../sections/xauusd/XauusdGoNoGoSection';
import { XauusdRiskSection }     from '../sections/xauusd/XauusdRiskSection';
import { XauusdDebriefSection }  from '../sections/xauusd/XauusdDebriefSection';
import { XauusdFreeChatSection } from '../sections/xauusd/XauusdFreeChatSection';

const TABS: { id: XauusdTab; label: string; icon: string }[] = [
  { id: 'bias',     label: 'Bias',          icon: 'TrendingUp'    },
  { id: 'macro',    label: 'Macro',         icon: 'Globe'         },
  { id: 'calendar', label: 'Calendario',    icon: 'CalendarDays'  },
  { id: 'pattern',  label: 'Pattern',       icon: 'Brain'         },
  { id: 'journal',  label: 'Journal',       icon: 'BookOpen'      },
  { id: 'gonogo',   label: 'Go/No-Go',      icon: 'Shield'        },
  { id: 'risk',     label: 'Rischio',       icon: 'ClipboardList' },
  { id: 'debrief',  label: 'Debrief',       icon: 'CheckCircle'   },
  { id: 'chat',     label: 'Chat',          icon: 'MessageSquare' },
];

export function XauusdApp() {
  const { setScreen, preferredModelIdx, setPreferredModelIdx } = useApp();
  const [activeTab, setActiveTab] = useState<XauusdTab>('bias');
  const [modelOpen, setModelOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const model = GEMINI_MODELS[preferredModelIdx] ?? GEMINI_MODELS[0];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setModelOpen(false);
      }
    }
    if (modelOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [modelOpen]);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 bg-[var(--bg)]/95 backdrop-blur border-b border-[var(--bg3)]">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          {/* Sinistra: torna indietro + logo */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => setScreen('landing')}
              className="w-7 h-7 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--text3)] hover:text-[var(--gold)] hover:bg-[rgba(254,153,32,0.08)] transition-colors shrink-0"
              title="Torna alla Home"
            >
              <ChevronLeft size={14} />
            </button>
            <Diamond size={17} className="text-[var(--gold)] shrink-0" strokeWidth={1.5} />
            <div className="min-w-0">
              <div className="font-semibold text-sm text-[var(--text)] leading-tight tracking-tight">
                Gestione XAUUSD
              </div>
              <div className="text-[10px] text-[var(--text3)]">AI Trading Prompt Kit</div>
            </div>
          </div>

          {/* Destra: selettore modello */}
          <div className="relative shrink-0" ref={dropRef}>
            <button
              onClick={() => setModelOpen(v => !v)}
              className="flex items-center gap-1 px-2 py-1 rounded-[var(--radius-sm)] border border-[rgba(254,153,32,0.3)] text-[var(--gold)] bg-[rgba(254,153,32,0.08)] hover:bg-[rgba(254,153,32,0.15)] text-xs font-medium transition-colors"
              title="Seleziona modello AI"
            >
              <span className="hidden sm:inline">{model.label}</span>
              <span className="sm:hidden">AI</span>
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
              </div>
            )}
          </div>
        </div>

        {/* Tab di navigazione */}
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
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </header>

      {/* Contenuto */}
      <main className="px-4 py-6 max-w-3xl mx-auto">
        {activeTab === 'bias'     && <XauusdBiasSection />}
        {activeTab === 'macro'    && <XauusdMacroSection />}
        {activeTab === 'calendar' && <XauusdWeekCalSection />}
        {activeTab === 'pattern'  && <XauusdPatternSection />}
        {activeTab === 'journal'  && <XauusdJournalSection />}
        {activeTab === 'gonogo'   && <XauusdGoNoGoSection />}
        {activeTab === 'risk'     && <XauusdRiskSection />}
        {activeTab === 'debrief'  && <XauusdDebriefSection />}
        {activeTab === 'chat'     && <XauusdFreeChatSection />}
      </main>

      <Toast />
    </div>
  );
}
