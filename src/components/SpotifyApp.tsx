import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { GEMINI_MODELS } from '../constants/data';
import { Toast } from './Toast';
import { Music, ChevronLeft, ChevronDown } from './Icon';
import { GestioneSection } from '../sections/GestioneSection';

export function SpotifyApp() {
  const { setScreen, preferredModelIdx, setPreferredModelIdx } = useApp();
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
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-grotesk">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[var(--bg)]/95 backdrop-blur border-b border-[var(--bg3)]">
        <div className="flex items-center justify-between gap-3 px-4 py-3">

          {/* Left: back + logo */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => setScreen('landing')}
              className="w-7 h-7 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--text3)] hover:bg-[rgba(29,185,84,0.1)] transition-colors shrink-0"
              title="Torna alla Home"
              style={{ color: 'var(--text3)' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#1db954')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text3)')}
            >
              <ChevronLeft size={14} />
            </button>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'rgba(29,185,84,0.15)', border: '1px solid rgba(29,185,84,0.3)' }}
            >
              <Music size={14} style={{ color: '#1db954' }} strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-sm text-[var(--text)] leading-tight tracking-tight">
                Gestione Spotify
              </div>
              <div className="text-[10px] text-[var(--text3)]">Post builder · Telegram</div>
            </div>
          </div>

          {/* Right: model selector */}
          <div className="relative shrink-0" ref={dropRef}>
            <button
              onClick={() => setModelOpen(v => !v)}
              className="flex items-center gap-1 px-2 py-1 rounded-[var(--radius-sm)] border text-xs font-medium transition-colors"
              style={{
                borderColor: 'rgba(29,185,84,0.35)',
                color: '#1db954',
                background: 'rgba(29,185,84,0.08)',
              }}
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
                        ? 'text-[#1db954]'
                        : 'text-[var(--text2)] hover:bg-[var(--bg3)] hover:text-[var(--text)]'
                      }`}
                    style={preferredModelIdx === i ? { background: 'rgba(29,185,84,0.1)' } : {}}
                  >
                    <span>{m.label}</span>
                    {preferredModelIdx === i && (
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#1db954' }} />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-6 max-w-2xl mx-auto">
        <GestioneSection />
      </main>

      <Toast />
    </div>
  );
}
