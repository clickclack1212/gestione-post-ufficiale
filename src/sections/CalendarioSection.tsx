import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useGemini } from '../hooks/useGemini';
import { ToneSelector } from '../components/ToneSelector';
import { PhotoUploader } from '../components/PhotoUploader';
import { BilingualResult } from '../components/BilingualResult';
import { buildCalV1Prompt, buildCalV2Prompt, buildCalV3Prompt, parseBilingual } from '../services/prompts';
import { Newspaper, Zap } from '../components/Icon';
import type { Tone } from '../types';

type CalResults = {
  v1: { it: string; en: string } | null;
  v2: { it: string; en: string } | null;
  v3: { it: string; en: string } | null;
};

export function CalendarioSection() {
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

    // Step 1 — Market Mover
    setGenStep(1);
    const p1 = buildCalV1Prompt(config, tone, notes);
    const t1 = await run(p1, 0.88, photo);
    if (t1) setResults(prev => ({ ...prev, v1: parseBilingual(t1) }));

    // Step 2 — Analisi Macro & Tecnica
    setGenStep(2);
    const p2 = buildCalV2Prompt(config, tone, notes);
    const t2 = await run(p2, 0.88, photo);
    if (t2) setResults(prev => ({ ...prev, v2: parseBilingual(t2) }));

    // Step 3 — Flash Report
    setGenStep(3);
    const p3 = buildCalV3Prompt(config, tone, notes);
    const t3 = await run(p3, 0.88, photo);
    if (t3) setResults(prev => ({ ...prev, v3: parseBilingual(t3) }));

    setGenStep(0);
  }

  const hasAnyResult = !!(results.v1 || results.v2 || results.v3);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Input card */}
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

      {/* Result cards — appear progressively as each version is generated */}
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

      {/* In-progress placeholder while generating first result */}
      {loading && genStep > 0 && !hasAnyResult && (
        <div className="card opacity-50">
          <div className="flex items-center gap-2">
            <span className="mini-spinner" />
            <span className="text-xs text-[var(--text3)]">Generando versione {genStep} di 3...</span>
          </div>
        </div>
      )}
    </div>
  );
}
