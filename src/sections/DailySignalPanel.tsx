import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useGemini } from '../hooks/useGemini';
import { ToneSelector } from '../components/ToneSelector';
import { PhotoUploader } from '../components/PhotoUploader';
import { PlanCard } from '../components/PlanCard';
import { buildDailyPrompt, parseBilingual, todayItalian } from '../services/prompts';
import { DAILY_SLOTS } from '../constants/data';
import type { PlanCardData } from '../components/PlanCard';
import type { Tone } from '../types';

type GenMode = 'single' | 'day';

export function DailySignalPanel() {
  const { config, calendarEvents } = useApp();
  const { loading, elapsed, run } = useGemini();

  const [tone, setTone] = useState<Tone>('assertivo');
  const [mode, setMode] = useState<GenMode>('single');
  const [selectedSlot, setSelectedSlot] = useState(DAILY_SLOTS[0].id);
  const [news, setNews] = useState('');
  const [extra, setExtra] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [singleResult, setSingleResult] = useState({ it: '', en: '' });
  const [dayResults, setDayResults] = useState<PlanCardData[]>([]);

  const calEventsStr = calendarEvents.length > 0
    ? calendarEvents.map(e => `${e.time} ${e.currency}: ${e.title} (${e.impact})`).join('\n')
    : '';

  const ctx = () => ({
    cfg: config,
    date: todayItalian(),
    tone,
    news,
    extra,
    hasPhoto: !!photo,
    calEvents: calEventsStr,
  });

  async function handleSingle() {
    const slot = DAILY_SLOTS.find(s => s.id === selectedSlot)!;
    const prompt = buildDailyPrompt(slot, ctx());
    if (!prompt) return;
    const text = await run(prompt, 0.88, slot.id === 'd_notizie' && photo ? photo : null);
    if (text) setSingleResult(parseBilingual(text));
  }

  async function handleDay() {
    setDayResults([]);
    const results: PlanCardData[] = [];

    for (const slot of DAILY_SLOTS) {
      const prompt = buildDailyPrompt(slot, ctx());
      if (!prompt) continue;

      const usePhoto = slot.id === 'd_notizie' && photo ? photo : null;
      const text = await run(prompt, 0.88, usePhoto);
      if (!text) continue;

      const { it, en } = parseBilingual(text);
      results.push({
        id: slot.id,
        time: slot.time,
        label: slot.label,
        shot: slot.shot,
        tag: slot.tag,
        it,
        en,
      });
      setDayResults([...results]);
    }
  }

  const activeSlot = DAILY_SLOTS.find(s => s.id === selectedSlot)!;

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="card">
        <div className="card-title">📋 Giornaliera con Segnale · {DAILY_SLOTS.length} Slot</div>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-4">
          <button className={`alt-mode-btn ${mode === 'single' ? 'active' : ''}`} onClick={() => setMode('single')}>
            Singolo Slot
          </button>
          <button className={`alt-mode-btn ${mode === 'day' ? 'active' : ''}`} onClick={() => setMode('day')}>
            Intera Giornata
          </button>
        </div>

        <ToneSelector value={tone} onChange={setTone} />

        {/* Slot selector (single mode only) */}
        {mode === 'single' && (
          <div className="mt-4 space-y-2">
            <label className="block text-xs text-[var(--text3)] uppercase tracking-widest">Slot</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DAILY_SLOTS.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSlot(s.id)}
                  className={`alt-plan-btn text-left ${selectedSlot === s.id ? 'active' : ''}`}
                >
                  <span className="text-[var(--gold)] font-mono text-[11px]">{s.time}</span>
                  <span className="block text-xs mt-0.5 leading-tight">{s.label}</span>
                  {s.shot && <span className="badge-photo text-[9px] mt-1">📸</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Context fields */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="mb-0 text-xs text-[var(--text3)] uppercase tracking-widest">Notizie del Giorno</label>
              <button className="btn-paste text-[10px] py-1 px-2"
                onClick={async () => { try { const t = await navigator.clipboard.readText(); if (t) setNews(t); } catch {} }}>
                📋 Incolla
              </button>
            </div>
            <textarea className="w-full" rows={2} placeholder="CPI USA 14:30, NFP..."
              value={news} onChange={e => setNews(e.target.value)} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="mb-0 text-xs text-[var(--text3)] uppercase tracking-widest">Contesto Mercato</label>
              <button className="btn-paste text-[10px] py-1 px-2"
                onClick={async () => { try { const t = await navigator.clipboard.readText(); if (t) setExtra(t); } catch {} }}>
                📋 Incolla
              </button>
            </div>
            <textarea className="w-full" rows={2} placeholder="Gold in area 2350, trend rialzista..."
              value={extra} onChange={e => setExtra(e.target.value)} />
          </div>
        </div>

        {/* Photo (for notizie slot) */}
        {(mode === 'day' || activeSlot?.id === 'd_notizie') && (
          <div className="mt-4">
            <PhotoUploader
              label="Screenshot Calendario (slot Notizie)"
              preview={photoPreview}
              onPhoto={(b64) => { setPhoto(b64); setPhotoPreview(`data:image/jpeg;base64,${b64}`); }}
              onClear={() => { setPhoto(null); setPhotoPreview(null); }}
            />
          </div>
        )}

        <button
          className="btn-generate w-full mt-5"
          onClick={mode === 'single' ? handleSingle : handleDay}
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="spinner" /> Generando... {elapsed}s
            </span>
          ) : mode === 'single'
            ? `⚡ Genera Slot ${activeSlot?.time}`
            : `⚡ Genera Intera Giornata (${DAILY_SLOTS.length} slot)`
          }
        </button>
      </div>

      {/* Single result */}
      {mode === 'single' && (singleResult.it || singleResult.en) && (
        <div className="card animate-[slideUp_0.3s_ease]">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[var(--gold)] font-mono text-sm">{activeSlot?.time}</span>
            <span className="text-[var(--text2)] text-sm">{activeSlot?.label}</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button className="btn-sec text-sm" onClick={() => navigator.clipboard.writeText(singleResult.it)}>
              📋 Copia IT
            </button>
            <button className="btn-sec text-sm" onClick={() => navigator.clipboard.writeText(singleResult.en)}>
              📋 Copia EN
            </button>
            <button className="btn-sec text-sm" onClick={() => navigator.clipboard.writeText(`${singleResult.it}\n\n──────────────\n\n${singleResult.en}`)}>
              🌐 Copia Bilingue
            </button>
          </div>
          <pre className="mt-3 text-xs text-[var(--text2)] whitespace-pre-wrap leading-relaxed">
            {singleResult.it}
          </pre>
        </div>
      )}

      {/* Day results */}
      {mode === 'day' && dayResults.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--text2)]">{dayResults.length} / {DAILY_SLOTS.length} slot generati</span>
            {loading && (
              <span className="flex items-center gap-2 text-xs text-[var(--gold)]">
                <span className="mini-spinner" /> {elapsed}s
              </span>
            )}
          </div>
          {dayResults.map((card, i) => (
            <PlanCard key={card.id} card={card} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
