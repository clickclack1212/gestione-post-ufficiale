import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useGemini } from '../hooks/useGemini';
import { ToneSelector } from '../components/ToneSelector';
import { BilingualResult } from '../components/BilingualResult';
import { buildOptPrompt } from '../services/prompts';
import { parseBilingual } from '../services/prompts';
import { Sparkles } from '../components/Icon';
import type { Tone } from '../types';

const OPT_TYPES = [
  { id: 'auto',         label: 'Auto' },
  { id: 'risultati',    label: 'Risultati' },
  { id: 'segnale',      label: 'Segnale' },
  { id: 'mindset',      label: 'Mindset' },
  { id: 'social_proof', label: 'Social Proof' },
  { id: 'notizie',      label: 'Notizie' },
  { id: 'copytrading',  label: 'CopyTrading' },
  { id: 'chiusura',     label: 'Chiusura' },
  { id: 'engagement',   label: 'Engagement' },
];

export function OttimizzaSection() {
  const { config } = useApp();
  const { loading, elapsed, run } = useGemini();
  const [tone, setTone] = useState<Tone>('assertivo');
  const [typeVal, setTypeVal] = useState('auto');
  const [rawText, setRawText] = useState('');
  const [result, setResult] = useState({ it: '', en: '' });

  async function handleOptimize() {
    if (!rawText.trim()) return;
    const prompt = buildOptPrompt(rawText, typeVal, config, tone);
    const text = await run(prompt);
    if (text) setResult(parseBilingual(text));
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="card">
        <div className="card-title flex items-center gap-1.5">
          <Sparkles size={14} /> Ottimizza Messaggio
        </div>
        <p className="text-[var(--text3)] text-sm mb-4">
          Incolla un testo scritto di getto e l&apos;AI lo riscriverà in modo professionale e ad alto impatto.
        </p>

        {/* Type */}
        <div className="space-y-2 mb-4">
          <label className="block text-xs text-[var(--text3)] uppercase tracking-widest">Tipo messaggio</label>
          <div className="flex flex-wrap gap-2">
            {OPT_TYPES.map(t => (
              <button
                key={t.id}
                onClick={() => setTypeVal(t.id)}
                className={`px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-medium border transition-colors
                  ${typeVal === t.id
                    ? 'bg-[rgba(254,153,32,0.15)] border-[rgba(254,153,32,0.4)] text-[var(--gold)]'
                    : 'border-[var(--bg3)] text-[var(--text3)] hover:border-[var(--bg4)] hover:text-[var(--text2)]'
                  }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <ToneSelector value={tone} onChange={setTone} />

        {/* Raw text */}
        <div className="space-y-1 mt-4">
          <label className="block text-xs text-[var(--text3)] uppercase tracking-widest">Testo grezzo</label>
          <textarea
            className="result-textarea min-h-[120px]"
            placeholder="Scrivi qui il testo da ottimizzare..."
            value={rawText}
            onChange={e => setRawText(e.target.value)}
            rows={6}
          />
        </div>

        <button
          className="btn-generate w-full mt-4"
          onClick={handleOptimize}
          disabled={loading || !rawText.trim()}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="spinner" /> Ottimizzando... {elapsed}s
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Sparkles size={14} /> Ottimizza
            </span>
          )}
        </button>
      </div>

      {(result.it || result.en) && (
        <BilingualResult it={result.it} en={result.en} />
      )}
    </div>
  );
}
