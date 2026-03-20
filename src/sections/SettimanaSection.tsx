import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useGemini } from '../hooks/useGemini';
import { ToneSelector } from '../components/ToneSelector';
import { EmojiSelector } from '../components/EmojiSelector';
import { BilingualResult } from '../components/BilingualResult';
import { buildSettimanaPrompt, parseBilingual, todayItalian } from '../services/prompts';
import { CalendarRange, Zap, PlayCircle } from '../components/Icon';
import type { Tone, EmojiLevel } from '../types';

// ── Slot definitions ──────────────────────────────────────────────────────────
interface SlotDef {
  id: string;
  time: string;
  label: string;
  tag: string;
  color: string;
}

interface DayDef {
  id: string;
  label: string;
  short: string;
  color: string;
  slots: SlotDef[];
}

const DAYS: DayDef[] = [
  {
    id: 'lun', label: 'Lunedì', short: 'Lun', color: '#FFAD47',
    slots: [
      { id: 'lun_mattina',  time: '07:30', label: "L'Antidoto al Lunedì", tag: 'Mattina',  color: '#f59e0b' },
      { id: 'lun_sera',     time: '19:00', label: 'Si Fa Sul Serio',       tag: 'Sera',     color: '#d97706' },
    ],
  },
  {
    id: 'mar', label: 'Martedì', short: 'Mar', color: '#3b82f6',
    slots: [
      { id: 'mar_mattina', time: '08:00', label: 'La Conferma del Metodo', tag: 'Mattina', color: '#3b82f6' },
      { id: 'mar_sera',    time: '19:00', label: 'Zero Emozioni',          tag: 'Sera',    color: '#1d4ed8' },
    ],
  },
  {
    id: 'mer', label: 'Mercoledì', short: 'Mer', color: '#a855f7',
    slots: [
      { id: 'mer_mattina', time: '08:00', label: '3 su 3 — Giro di Boa',   tag: 'Mattina', color: '#a855f7' },
      { id: 'mer_sera',    time: '19:00', label: 'FOMO del Mercoledì',      tag: 'Sera',    color: '#7c3aed' },
    ],
  },
  {
    id: 'gio', label: 'Giovedì', short: 'Gio', color: '#22c55e',
    slots: [
      { id: 'gio_mattina', time: '08:00', label: 'Efficienza Automatica', tag: 'Mattina', color: '#22c55e' },
      { id: 'gio_sera',    time: '19:00', label: 'Lavora al Posto Tuo',   tag: 'Sera',    color: '#16a34a' },
    ],
  },
  {
    id: 'ven', label: 'Venerdì', short: 'Ven', color: '#ef4444',
    slots: [
      { id: 'ven_mattina',    time: '08:00', label: 'Payday',              tag: 'Mattina',    color: '#ef4444' },
      { id: 'ven_pomeriggio', time: '13:30', label: 'Allerta Dati USA',    tag: 'Pomeriggio', color: '#dc2626' },
      { id: 'ven_sera',       time: '19:00', label: 'Lifestyle Recap',     tag: 'Sera',       color: '#b91c1c' },
      { id: 'ven_chiusura',   time: '21:00', label: 'Urgenza Pre-Lunedì',  tag: 'Chiusura',   color: '#991b1b' },
    ],
  },
];

// ── Per-slot state ────────────────────────────────────────────────────────────
interface SlotState {
  extra: string;
  tone: Tone;
  emojiLevel: EmojiLevel;
  result: { it: string; en: string } | null;
}

function defaultSlotStates(slots: SlotDef[]): Record<string, SlotState> {
  return Object.fromEntries(
    slots.map(s => [s.id, { extra: '', tone: 'assertivo' as Tone, emojiLevel: '2-4' as EmojiLevel, result: null }])
  );
}

// ── DayPanel ──────────────────────────────────────────────────────────────────
function DayPanel({ day }: { day: DayDef }) {
  const { config } = useApp();
  const { loading, elapsed, run } = useGemini();
  const [slotStates, setSlotStates] = useState<Record<string, SlotState>>(() => defaultSlotStates(day.slots));
  const [generatingSlot, setGeneratingSlot] = useState<string | null>(null);
  const [generatingAll, setGeneratingAll] = useState(false);

  const update = (id: string, patch: Partial<SlotState>) =>
    setSlotStates(p => ({ ...p, [id]: { ...p[id], ...patch } }));

  async function generateOne(slotId: string) {
    const s = slotStates[slotId];
    setGeneratingSlot(slotId);
    const prompt = buildSettimanaPrompt(slotId, {
      cfg: config,
      date: todayItalian(),
      tone: s.tone,
      extra: s.extra,
      emojiLevel: s.emojiLevel,
    });
    const text = await run(prompt, 0.88);
    if (text) update(slotId, { result: parseBilingual(text) });
    setGeneratingSlot(null);
  }

  async function generateAll() {
    setGeneratingAll(true);
    for (const slot of day.slots) {
      setGeneratingSlot(slot.id);
      const s = slotStates[slot.id];
      const prompt = buildSettimanaPrompt(slot.id, {
        cfg: config,
        date: todayItalian(),
        tone: s.tone,
        extra: s.extra,
        emojiLevel: s.emojiLevel,
      });
      const text = await run(prompt, 0.88);
      if (text) update(slot.id, { result: parseBilingual(text) });
    }
    setGeneratingSlot(null);
    setGeneratingAll(false);
  }

  const isRunning = loading || generatingAll;

  return (
    <div className="space-y-5">
      {/* Generate all button */}
      <button
        className="btn-generate w-full"
        onClick={generateAll}
        disabled={isRunning}
      >
        {isRunning && generatingAll ? (
          <span className="flex items-center justify-center gap-2">
            <span className="spinner" />
            Generando slot... {elapsed}s
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Zap size={14} /> Genera Tutti i Post di {day.label}
          </span>
        )}
      </button>

      {/* Slot cards */}
      {day.slots.map(slot => {
        const s = slotStates[slot.id];
        const isThisSlot = generatingSlot === slot.id;
        return (
          <div key={slot.id} className="space-y-3">
            <div className="card">
              {/* Slot header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: slot.color + '22', color: slot.color, border: `1px solid ${slot.color}44` }}
                  >
                    {slot.tag}
                  </span>
                  <span className="text-[10px] text-[var(--text3)] font-mono">{slot.time}</span>
                </div>
                <span className="text-xs font-semibold text-[var(--text)]">{slot.label}</span>
              </div>

              {/* Extra description */}
              <div className="space-y-1 mb-4">
                <label className="block text-xs text-[var(--text3)] uppercase tracking-widest">
                  Descrizione aggiuntiva <span className="normal-case font-normal">(opz.)</span>
                </label>
                <textarea
                  className="result-textarea min-h-[60px]"
                  rows={2}
                  placeholder="Es: oggi abbiamo chiuso +82 pip su XAUUSD con entry a 2345, mostra entusiasmo..."
                  value={s.extra}
                  onChange={e => update(slot.id, { extra: e.target.value })}
                />
              </div>

              {/* Tone + Emoji */}
              <ToneSelector value={s.tone} onChange={v => update(slot.id, { tone: v })} />
              <div className="mt-3">
                <EmojiSelector value={s.emojiLevel} onChange={v => update(slot.id, { emojiLevel: v })} />
              </div>

              {/* Generate button */}
              <button
                className="btn-generate w-full mt-4"
                onClick={() => generateOne(slot.id)}
                disabled={isRunning}
              >
                {isThisSlot ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="spinner" /> Generando... {elapsed}s
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <PlayCircle size={13} /> Genera {slot.label}
                  </span>
                )}
              </button>
            </div>

            {s.result && (s.result.it || s.result.en) && (
              <BilingualResult it={s.result.it} en={s.result.en} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main Section ──────────────────────────────────────────────────────────────
export function SettimanaSection() {
  const [activeDay, setActiveDay] = useState<string>('lun');
  const day = DAYS.find(d => d.id === activeDay) ?? DAYS[0];

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="card">
        <div className="card-title flex items-center gap-1.5">
          <CalendarRange size={14} /> Programmazione Settimanale
        </div>
        <p className="text-[var(--text3)] text-sm mb-4">
          Matrice psicologica giornaliera — ogni giorno della settimana ha la sua leva emotiva e il suo obiettivo specifico. Genera i post di ogni slot o l'intera giornata in un click.
        </p>

        {/* Day tabs */}
        <div className="flex gap-1.5 flex-wrap">
          {DAYS.map(d => (
            <button
              key={d.id}
              onClick={() => setActiveDay(d.id)}
              className={`flex-1 min-w-[52px] py-2 px-1 rounded-[var(--radius-sm)] text-xs font-semibold transition-all border
                ${activeDay === d.id
                  ? 'text-[var(--bg)] border-transparent'
                  : 'text-[var(--text3)] border-[var(--bg3)] hover:text-[var(--text2)] hover:border-[var(--bg4)]'
                }`}
              style={activeDay === d.id ? { background: d.color, borderColor: d.color } : {}}
            >
              {d.short}
            </button>
          ))}
        </div>

        {/* Day description */}
        <div
          className="mt-3 px-3 py-2 rounded-[var(--radius-sm)] text-xs"
          style={{ background: day.color + '12', border: `1px solid ${day.color}30`, color: day.color }}
        >
          {day.label} — {day.slots.length} slot
          {day.id === 'lun' && ' · Energico, controtendenza. Leva: disgusto per la routine.'}
          {day.id === 'mar' && ' · Freddo, razionale. Leva: costanza e metodo — non è fortuna.'}
          {day.id === 'mer' && ' · Inarrestabile. Leva: fatica vs l\'instancabilità della macchina.'}
          {day.id === 'gio' && ' · Relax, delega. Leva: sforzo zero mentre la gente è stanca.'}
          {day.id === 'ven' && ' · Celebrativo, esclusivo. Leva: stipendio vs rendita settimanale.'}
        </div>
      </div>

      {/* Active day panel */}
      <DayPanel key={activeDay} day={day} />
    </div>
  );
}
