import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useGemini } from '../hooks/useGemini';
import { ToneSelector } from '../components/ToneSelector';
import { BilingualResult } from '../components/BilingualResult';
import { buildOptPrompt, buildAnalisiPrompt, parseBilingual } from '../services/prompts';
import { Sparkles, BarChart2 } from '../components/Icon';
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

const TF_OPTIONS = ['M5', 'M15', 'M30', 'H1', 'H4', 'D1', 'Multi-TF'];

type Mode = 'messaggio' | 'analisi';

// ── Panel: Ottimizza Messaggio ───────────────────────────────────────────────
function MessaggioPanel() {
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
    <>
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
    </>
  );
}

// ── Panel: Ottimizza Analisi XAUUSD ─────────────────────────────────────────
function AnalisiPanel() {
  const { config } = useApp();
  const { loading, elapsed, run } = useGemini();
  const [tone, setTone] = useState<Tone>('assertivo');
  const [rawAnalysis, setRawAnalysis] = useState('');
  const [timeframe, setTimeframe] = useState('H1');
  const [note, setNote] = useState('');
  const [result, setResult] = useState({ it: '', en: '' });

  async function handleGenerate() {
    if (!rawAnalysis.trim()) return;
    const prompt = buildAnalisiPrompt(rawAnalysis, config, tone, timeframe, note);
    const text = await run(prompt, 0.82);
    if (text) setResult(parseBilingual(text));
  }

  return (
    <>
      <div className="card">
        <div className="card-title flex items-center gap-1.5">
          <BarChart2 size={14} /> Ottimizza Analisi XAUUSD
        </div>
        <p className="text-[var(--text3)] text-sm mb-4">
          Incolla un&apos;analisi XAUUSD trovata online o scritta in bozza — l&apos;AI la riscrive come post Telegram con il tuo brand, mantenendo tutti i livelli tecnici originali.
        </p>

        {/* Timeframe chips */}
        <div className="space-y-2 mb-4">
          <label className="block text-xs text-[var(--text3)] uppercase tracking-widest">Timeframe</label>
          <div className="flex flex-wrap gap-2">
            {TF_OPTIONS.map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-medium border transition-colors
                  ${timeframe === tf
                    ? 'bg-[rgba(254,153,32,0.15)] border-[rgba(254,153,32,0.4)] text-[var(--gold)]'
                    : 'border-[var(--bg3)] text-[var(--text3)] hover:border-[var(--bg4)] hover:text-[var(--text2)]'
                  }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        <ToneSelector value={tone} onChange={setTone} />

        {/* Raw analysis */}
        <div className="space-y-1 mt-4">
          <label className="block text-xs text-[var(--text3)] uppercase tracking-widest">
            Analisi originale
          </label>
          <textarea
            className="result-textarea min-h-[160px]"
            placeholder={"Incolla qui l'analisi XAUUSD trovata online o scritta in bozza...\n\nEs: \"XAUUSD — possibile BUY da zona 2320-2325 con conferma H1. SL sotto 2310. TP1 2340, TP2 2355. RSI in oversold su M30.\""}
            value={rawAnalysis}
            onChange={e => setRawAnalysis(e.target.value)}
            rows={8}
          />
        </div>

        {/* Note aggiuntive */}
        <div className="space-y-1 mt-3">
          <label className="block text-xs text-[var(--text3)] uppercase tracking-widest">
            Note aggiuntive <span className="normal-case text-[var(--text3)] font-normal">(opzionale)</span>
          </label>
          <textarea
            className="result-textarea min-h-[60px]"
            placeholder="Es: contesto geopolitico, news in arrivo, tuo commento personale sul setup..."
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={3}
          />
        </div>

        <button
          className="btn-generate w-full mt-4"
          onClick={handleGenerate}
          disabled={loading || !rawAnalysis.trim()}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="spinner" /> Riscrivendo analisi... {elapsed}s
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <BarChart2 size={14} /> Genera Post Analisi
            </span>
          )}
        </button>
      </div>

      {(result.it || result.en) && (
        <BilingualResult it={result.it} en={result.en} />
      )}
    </>
  );
}

// ── Main section ─────────────────────────────────────────────────────────────
export function OttimizzaSection() {
  const [mode, setMode] = useState<Mode>('messaggio');

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Mode toggle */}
      <div className="flex gap-1 p-1 rounded-[var(--radius)] bg-[var(--bg2)] border border-[var(--border)]">
        <button
          onClick={() => setMode('messaggio')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-[var(--radius-sm)] text-sm font-semibold transition-all
            ${mode === 'messaggio'
              ? 'bg-[rgba(254,153,32,0.15)] text-[var(--gold)] border border-[rgba(254,153,32,0.35)]'
              : 'text-[var(--text3)] hover:text-[var(--text2)]'}`}
        >
          <Sparkles size={13} /> Ottimizza Messaggio
        </button>
        <button
          onClick={() => setMode('analisi')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-[var(--radius-sm)] text-sm font-semibold transition-all
            ${mode === 'analisi'
              ? 'bg-[rgba(254,153,32,0.15)] text-[var(--gold)] border border-[rgba(254,153,32,0.35)]'
              : 'text-[var(--text3)] hover:text-[var(--text2)]'}`}
        >
          <BarChart2 size={13} /> Analisi XAUUSD
        </button>
      </div>

      {mode === 'messaggio' ? <MessaggioPanel /> : <AnalisiPanel />}
    </div>
  );
}
