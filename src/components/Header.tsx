import { useApp } from '../context/AppContext';
import { GEMINI_MODELS } from '../constants/data';
import type { Tab } from '../types';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'generate',  label: 'Genera',         icon: '⚡' },
  { id: 'prog',      label: 'Programmazione',  icon: '📅' },
  { id: 'calendar',  label: 'Calendario',      icon: '📰' },
  { id: 'optimize',  label: 'Ottimizza',       icon: '✨' },
  { id: 'translate', label: 'Traduci',         icon: '🌐' },
  { id: 'settings',  label: 'Config',          icon: '⚙' },
];

export function Header() {
  const { activeTab, setActiveTab, config, counter, activeModelIdx } = useApp();
  const model = GEMINI_MODELS[activeModelIdx] ?? GEMINI_MODELS[0];
  const hasKey = !!config.apiKey;

  return (
    <header className="sticky top-0 z-30 bg-[var(--bg)]/95 backdrop-blur border-b border-[var(--bg3)]">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        {/* Logo */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[var(--gold)] text-xl leading-none">◈</span>
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
          {/* Model badge */}
          <span className="badge text-xs hidden sm:inline-flex">
            {model.label}
          </span>

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

      {/* Counter bar */}
      <div className="px-4 pb-2 flex items-center gap-3">
        <span className="text-[10px] text-[var(--text3)]">Oggi:</span>
        <div className="flex gap-2">
          <span className="text-[10px] bg-[var(--bg3)] px-2 py-0.5 rounded-full text-[var(--text2)]">
            {GEMINI_MODELS[0]?.label ?? 'Model 1'}: <strong className="text-[var(--gold)]">{counter.pro3}</strong>
          </span>
          <span className="text-[10px] bg-[var(--bg3)] px-2 py-0.5 rounded-full text-[var(--text2)]">
            {GEMINI_MODELS[1]?.label ?? 'Model 2'}: <strong className="text-[var(--gold)]">{counter.pro25}</strong>
          </span>
          <span className="text-[10px] bg-[var(--bg3)] px-2 py-0.5 rounded-full text-[var(--text2)]">
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
            <span className="text-sm">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </nav>
    </header>
  );
}
