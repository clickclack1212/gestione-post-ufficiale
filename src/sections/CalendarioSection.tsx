import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useGemini } from '../hooks/useGemini';
import { ToneSelector } from '../components/ToneSelector';
import { PhotoUploader } from '../components/PhotoUploader';
import { BilingualResult } from '../components/BilingualResult';
import {
  buildCalV1Prompt, buildCalV2Prompt, buildCalV3Prompt,
  buildCalRisultatiV1Prompt, buildCalRisultatiV2Prompt, buildCalRisultatiV3Prompt,
  parseBilingual,
} from '../services/prompts';
import { Newspaper, Zap, TrendingUp } from '../components/Icon';
import type { Tone } from '../types';

type CalResults = {
  v1: { it: string; en: string } | null;
  v2: { it: string; en: string } | null;
  v3: { it: string; en: string } | null;
};

type CalMode = 'economico' | 'risultati';

// ── Calendario Economico ─────────────────────────────────────────────────────
function EconomicoPanel() {
  const { config } = useApp();
  const { loading, elapsed, run } = useGemini();

  const [photo, setPhoto] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [tone, setTone] = useState<Tone>('assertivo');
  const [results, setResults] = useState<CalResults>({ v1: null, v2: null, v3: null });
  const [genStep, setGenStep] = useState(0);

  async function handleGenerate() {
    if (!photo) return;
    setResults({ v1: null, v2: null, v3: null });

    setGenStep(1);
    const p1 = buildCalV1Prompt(config, tone, notes);
    const t1 = await run(p1, 0.88, photo);
    if (t1) setResults(prev => ({ ...prev, v1: parseBilingual(t1) }));

    setGenStep(2);
    const p2 = buildCalV2Prompt(config, tone, notes);
    const t2 = await run(p2, 0.88, photo);
    if (t2) setResults(prev => ({ ...prev, v2: parseBilingual(t2) }));

    setGenStep(3);
    const p3 = buildCalV3Prompt(config, tone, notes);
    const t3 = await run(p3, 0.88, photo);
    if (t3) setResults(prev => ({ ...prev, v3: parseBilingual(t3) }));

    setGenStep(0);
  }

  const hasAnyResult = !!(results.v1 || results.v2 || results.v3);

  return (
    <>
      <div className="card">
        <div className="card-title flex items-center gap-1.5">
          <Newspaper size={14} /> Analisi Calendario Economico
        </div>
        <p className="text-[var(--text3)] text-xs mb-4">
          Allega lo screenshot del calendario (ForexFactory, Investing.com…) — l&apos;AI genera 3 versioni di post ottimizzate per il canale.
        </p>

        <PhotoUploader
          label="Screenshot Calendario (obbligatorio)"
          preview={photoPreview}
          onPhoto={(b64) => { setPhoto(b64); setPhotoPreview(`data:image/jpeg;base64,${b64}`); }}
          onClear={() => { setPhoto(null); setPhotoPreview(null); }}
        />

        <div className="mt-4 space-y-1">
          <label className="block text-xs text-[var(--text3)] uppercase tracking-widest">Note Aggiuntive (opz.)</label>
          <textarea
            className="w-full"
            rows={2}
            placeholder="Contesto geopolitico, focus settimana, eventi extra..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>

        <div className="mt-4">
          <ToneSelector value={tone} onChange={setTone} />
        </div>

        <button
          className="btn-generate w-full mt-5"
          onClick={handleGenerate}
          disabled={!photo || loading}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="spinner" /> Versione {genStep}/3... {elapsed}s
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Zap size={14} /> Genera 3 Versioni
            </span>
          )}
        </button>

        {!photo && (
          <p className="text-center text-[10px] text-[var(--text3)] mt-2">
            Allega uno screenshot del calendario per abilitare la generazione
          </p>
        )}
      </div>

      {results.v1 && (
        <div className="card animate-[slideUp_0.3s_ease]">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base">🚨</span>
            <span className="card-title mb-0">Market Mover</span>
          </div>
          <BilingualResult it={results.v1.it} en={results.v1.en} />
        </div>
      )}

      {results.v2 && (
        <div className="card animate-[slideUp_0.3s_ease]">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base">📊</span>
            <span className="card-title mb-0">Analisi Macro &amp; Tecnica</span>
          </div>
          <BilingualResult it={results.v2.it} en={results.v2.en} />
        </div>
      )}

      {results.v3 && (
        <div className="card animate-[slideUp_0.3s_ease]">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base">⚡</span>
            <span className="card-title mb-0">Flash Report</span>
          </div>
          <BilingualResult it={results.v3.it} en={results.v3.en} />
        </div>
      )}

      {loading && genStep > 0 && !hasAnyResult && (
        <div className="card opacity-50">
          <div className="flex items-center gap-2">
            <span className="mini-spinner" />
            <span className="text-xs text-[var(--text3)]">Generando versione {genStep} di 3...</span>
          </div>
        </div>
      )}
    </>
  );
}

// ── Calendario Risultati ─────────────────────────────────────────────────────
function RisultatiPanel() {
  const { config } = useApp();
  const { loading, elapsed, run } = useGemini();

  const [photo, setPhoto] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [tone, setTone] = useState<Tone>('assertivo');
  const [results, setResults] = useState<CalResults>({ v1: null, v2: null, v3: null });
  const [genStep, setGenStep] = useState(0);

  async function handleGenerate() {
    if (!photo) return;
    setResults({ v1: null, v2: null, v3: null });

    setGenStep(1);
    const p1 = buildCalRisultatiV1Prompt(config, tone, notes);
    const t1 = await run(p1, 0.88, photo);
    if (t1) setResults(prev => ({ ...prev, v1: parseBilingual(t1) }));

    setGenStep(2);
    const p2 = buildCalRisultatiV2Prompt(config, tone, notes);
    const t2 = await run(p2, 0.88, photo);
    if (t2) setResults(prev => ({ ...prev, v2: parseBilingual(t2) }));

    setGenStep(3);
    const p3 = buildCalRisultatiV3Prompt(config, tone, notes);
    const t3 = await run(p3, 0.88, photo);
    if (t3) setResults(prev => ({ ...prev, v3: parseBilingual(t3) }));

    setGenStep(0);
  }

  const hasAnyResult = !!(results.v1 || results.v2 || results.v3);

  return (
    <>
      <div className="card">
        <div className="card-title flex items-center gap-1.5">
          <TrendingUp size={14} /> Calendario Risultati
        </div>
        <p className="text-[var(--text3)] text-xs mb-4">
          Allega lo screenshot del calendario dei tuoi risultati — l&apos;AI genera 3 strategie di contenuto per massimizzare conversioni e fiducia.
        </p>

        <PhotoUploader
          label="Screenshot Risultati (obbligatorio)"
          preview={photoPreview}
          onPhoto={(b64) => { setPhoto(b64); setPhotoPreview(`data:image/jpeg;base64,${b64}`); }}
          onClear={() => { setPhoto(null); setPhotoPreview(null); }}
        />

        <div className="mt-4 space-y-1">
          <label className="block text-xs text-[var(--text3)] uppercase tracking-widest">Note / Istruzioni (opz.)</label>
          <textarea
            className="w-full"
            rows={2}
            placeholder="Es: focalizzati sulla settimana del 20-24 gen, evidenzia il +8% del mercoledì..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>

        <div className="mt-4">
          <ToneSelector value={tone} onChange={setTone} />
        </div>

        <button
          className="btn-generate w-full mt-5"
          onClick={handleGenerate}
          disabled={!photo || loading}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="spinner" /> Strategia {genStep}/3... {elapsed}s
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <TrendingUp size={14} /> Genera 3 Strategie
            </span>
          )}
        </button>

        {!photo && (
          <p className="text-center text-[10px] text-[var(--text3)] mt-2">
            Allega uno screenshot dei risultati per abilitare la generazione
          </p>
        )}
      </div>

      {results.v1 && (
        <div className="card animate-[slideUp_0.3s_ease]">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base">🏛️</span>
            <span className="card-title mb-0">Autorità &amp; Trasparenza</span>
          </div>
          <BilingualResult it={results.v1.it} en={results.v1.en} />
        </div>
      )}

      {results.v2 && (
        <div className="card animate-[slideUp_0.3s_ease]">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base">🚀</span>
            <span className="card-title mb-0">Hype / FOMO</span>
          </div>
          <BilingualResult it={results.v2.it} en={results.v2.en} />
        </div>
      )}

      {results.v3 && (
        <div className="card animate-[slideUp_0.3s_ease]">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base">🌍</span>
            <span className="card-title mb-0">Report Internazionale</span>
          </div>
          <BilingualResult it={results.v3.it} en={results.v3.en} />
        </div>
      )}

      {loading && genStep > 0 && !hasAnyResult && (
        <div className="card opacity-50">
          <div className="flex items-center gap-2">
            <span className="mini-spinner" />
            <span className="text-xs text-[var(--text3)]">Generando strategia {genStep} di 3...</span>
          </div>
        </div>
      )}
    </>
  );
}

// ── Main section ─────────────────────────────────────────────────────────────
export function CalendarioSection() {
  const [mode, setMode] = useState<CalMode>('economico');

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Mode toggle */}
      <div className="flex gap-1 p-1 rounded-[var(--radius)] bg-[var(--bg2)] border border-[var(--border)]">
        <button
          onClick={() => setMode('economico')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-[var(--radius-sm)] text-sm font-semibold transition-all
            ${mode === 'economico'
              ? 'bg-[rgba(254,153,32,0.15)] text-[var(--gold)] border border-[rgba(254,153,32,0.35)]'
              : 'text-[var(--text3)] hover:text-[var(--text2)]'}`}
        >
          <Newspaper size={13} /> Calendario Economico
        </button>
        <button
          onClick={() => setMode('risultati')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-[var(--radius-sm)] text-sm font-semibold transition-all
            ${mode === 'risultati'
              ? 'bg-[rgba(254,153,32,0.15)] text-[var(--gold)] border border-[rgba(254,153,32,0.35)]'
              : 'text-[var(--text3)] hover:text-[var(--text2)]'}`}
        >
          <TrendingUp size={13} /> Calendario Risultati
        </button>
      </div>

      {mode === 'economico' ? <EconomicoPanel /> : <RisultatiPanel />}
    </div>
  );
}
