import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useGemini } from '../hooks/useGemini';
import { ToneSelector } from '../components/ToneSelector';
import { EmojiSelector } from '../components/EmojiSelector';
import { BilingualResult } from '../components/BilingualResult';
import { buildSettimanaPrompt, parseBilingual, todayItalian } from '../services/prompts';
import { CalendarRange, Zap, PlayCircle } from '../components/Icon';
import type { Tone, EmojiLevel } from '../types';

// ── 10 slot fissi — uguali ogni giorno ───────────────────────────────────────
interface SlotDef {
  id: string;
  time: string;
  label: string;
}

const SLOTS: SlotDef[] = [
  { id: 'buongiorno',       time: '07:30', label: 'Buongiorno' },
  { id: 'risultati_vip_mat',time: '08:00', label: 'Risultati VIP mattutini' },
  { id: 'recap_ieri',       time: '09:00', label: 'Recap giorno precedente' },
  { id: 'segnale_gratis',   time: '10:00', label: 'Segnale gratis XAUUSD' },
  { id: 'fine_segnale',     time: '11:00', label: 'Fine segnale' },
  { id: 'screen_clienti',   time: '12:00', label: 'Screen risultati clienti' },
  { id: 'calendario_eco',   time: '13:00', label: 'Calendario economico' },
  { id: 'passaggio_vip',    time: '14:00', label: 'Passaggio esclusivo al VIP' },
  { id: 'risultati_usa',    time: '15:30', label: 'Risultati USA (Copy + VIP)' },
  { id: 'recap_finale',     time: '18:00', label: 'Recap finale del giorno' },
];

// ── Definizione giorni ────────────────────────────────────────────────────────
interface DayDef {
  id: string;
  label: string;
  short: string;
  color: string;
  theme: string;
  vibe: string;
}

const DAYS: DayDef[] = [
  { id: 'lun', label: 'Lunedì',    short: 'Lun', color: '#FFAD47', theme: "L'Antidoto alla Routine",       vibe: 'Energico, controtendenza. I mercati riaprono, la massa è in ufficio.' },
  { id: 'mar', label: 'Martedì',   short: 'Mar', color: '#3b82f6', theme: 'La Conferma del Metodo',        vibe: 'Freddo, razionale. Ieri era metodo, non fortuna. Oggi si replica.' },
  { id: 'mer', label: 'Mercoledì', short: 'Mer', color: '#a855f7', theme: 'Il Giro di Boa — 3 su 3',       vibe: 'Inarrestabile. La macchina non conosce fatica. Lun ✓ Mar ✓ Mer ✓.' },
  { id: 'gio', label: 'Giovedì',   short: 'Gio', color: '#22c55e', theme: "L'Efficienza Automatica",       vibe: 'Sforzo zero. Mentre sei in riunione, il sistema lavora al posto tuo.' },
  { id: 'ven', label: 'Venerdì',   short: 'Ven', color: '#ef4444', theme: 'Il Payday e il Lifestyle',      vibe: 'Celebrativo + urgenza serale. Stipendio vs rendita. Setup prima di lunedì.' },
];

// ── Stato per slot ────────────────────────────────────────────────────────────
interface SlotState {
  extra: string;
  tone: Tone;
  emojiLevel: EmojiLevel;
  result: { it: string; en: string } | null;
}

function initSlotStates(): Record<string, SlotState> {
  return Object.fromEntries(
    SLOTS.map(s => [s.id, { extra: '', tone: 'assertivo' as Tone, emojiLevel: '2-4' as EmojiLevel, result: null }])
  );
}

// ── DayPanel ──────────────────────────────────────────────────────────────────
function DayPanel({ day }: { day: DayDef }) {
  const { config } = useApp();
  const { loading, elapsed, run } = useGemini();
  const [slotStates, setSlotStates] = useState<Record<string, SlotState>>(initSlotStates);
  const [generatingSlot, setGeneratingSlot] = useState<string | null>(null);
  const [generatingAll, setGeneratingAll] = useState(false);
  const [genProgress, setGenProgress] = useState(0); // 0..10

  const update = (id: string, patch: Partial<SlotState>) =>
    setSlotStates(p => ({ ...p, [id]: { ...p[id], ...patch } }));

  async function generateOne(slotId: string) {
    const s = slotStates[slotId];
    setGeneratingSlot(slotId);
    const prompt = buildSettimanaPrompt(slotId, day.id, {
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
    setGenProgress(0);
    for (let i = 0; i < SLOTS.length; i++) {
      const slot = SLOTS[i];
      setGeneratingSlot(slot.id);
      setGenProgress(i + 1);
      const s = slotStates[slot.id];
      const prompt = buildSettimanaPrompt(slot.id, day.id, {
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
    setGenProgress(0);
  }

  const isRunning = loading;

  return (
    <div className="space-y-5">
      {/* Generate all */}
      <button
        className="btn-generate w-full"
        onClick={generateAll}
        disabled={isRunning}
      >
        {isRunning && generatingAll ? (
          <span className="flex items-center justify-center gap-2">
            <span className="spinner" />
            Slot {genProgress}/10... {elapsed}s
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Zap size={14} /> Genera Tutti i 10 Post di {day.label}
          </span>
        )}
      </button>

      {/* Slot cards */}
      {SLOTS.map((slot, idx) => {
        const s = slotStates[slot.id];
        const isThisSlot = generatingSlot === slot.id;
        return (
          <div key={slot.id} className="space-y-3">
            <div className="card">
              {/* Slot header */}
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: day.color + '22', color: day.color, border: `1px solid ${day.color}44` }}
                >
                  {idx + 1}
                </span>
                <span
                  className="font-mono text-xs px-2 py-0.5 rounded-[var(--radius-sm)]"
                  style={{ background: day.color + '15', color: day.color }}
                >
                  {slot.time}
                </span>
                <span className="text-sm font-semibold text-[var(--text)]">{slot.label}</span>
                {s.result && (
                  <span className="ml-auto text-[10px] text-[#22c55e] font-medium">✓ Generato</span>
                )}
              </div>

              {/* Extra description */}
              <div className="space-y-1 mb-4">
                <label className="block text-xs text-[var(--text3)] uppercase tracking-widest">
                  Note / dati aggiuntivi <span className="normal-case font-normal">(opz.)</span>
                </label>
                <textarea
                  className="result-textarea min-h-[56px]"
                  rows={2}
                  placeholder={
                    slot.id === 'segnale_gratis'   ? 'Es: BUY da 2345, SL 2330, TP1 2360 TP2 2375' :
                    slot.id === 'fine_segnale'      ? 'Es: TP1 raggiunto, +62 pip, chiuso in profitto' :
                    slot.id === 'risultati_vip_mat' ? 'Es: +48 pip già stamattina, 3 trade chiusi' :
                    slot.id === 'recap_ieri'        ? 'Es: ieri +127 pip totali, 4 trade su 5 in profitto' :
                    slot.id === 'calendario_eco'    ? 'Es: CPI USA alle 14:30, atteso 3.1%, precedente 3.2%' :
                    slot.id === 'risultati_usa'     ? 'Es: sessione USA +84 pip, copy +2.3%' :
                    slot.id === 'recap_finale'      ? 'Es: giornata totale +180 pip, tutti i TP raggiunti' :
                    'Aggiungi contesto, dati reali, dettagli specifici da includere...'
                  }
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
                    <PlayCircle size={13} /> Genera — {slot.time} {slot.label}
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
          <CalendarRange size={14} /> Palinsesto Settimanale
        </div>
        <p className="text-[var(--text3)] text-sm mb-4">
          10 slot fissi ogni giorno (07:30→18:00). Il "tema del giorno" colora il copy di tutti e 10 i post — stesso palinsesto, "sapore" psicologico diverso ogni giorno.
        </p>

        {/* Day tabs */}
        <div className="flex gap-1.5">
          {DAYS.map(d => (
            <button
              key={d.id}
              onClick={() => setActiveDay(d.id)}
              className={`flex-1 py-2 px-1 rounded-[var(--radius-sm)] text-xs font-semibold transition-all border
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

        {/* Active day theme */}
        <div
          className="mt-3 p-3 rounded-[var(--radius-sm)] space-y-1"
          style={{ background: day.color + '10', border: `1px solid ${day.color}28` }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold" style={{ color: day.color }}>{day.label} — {day.theme}</span>
          </div>
          <p className="text-[11px] text-[var(--text3)] leading-relaxed">{day.vibe}</p>
        </div>
      </div>

      {/* Active day panel — key resets state when switching day */}
      <DayPanel key={activeDay} day={day} />
    </div>
  );
}
