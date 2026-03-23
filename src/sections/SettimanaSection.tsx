import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useGemini } from '../hooks/useGemini';
import { ToneSelector } from '../components/ToneSelector';
import { EmojiSelector } from '../components/EmojiSelector';
import { BilingualResult } from '../components/BilingualResult';
import {
  buildSettimanaPrompt, buildScalettaPrompt,
  parseBilingual, todayItalian,
} from '../services/prompts';
import { CalendarRange, Layers, Zap, PlayCircle, Target } from '../components/Icon';
import type { Tone, EmojiLevel } from '../types';

// ── Stato slot ────────────────────────────────────────────────────────────────
interface SlotState {
  extra: string;
  tone: Tone;
  emojiLevel: EmojiLevel;
  result: { it: string; en: string } | null;
}

function initSlots<T extends { id: string }>(defs: T[]): Record<string, SlotState> {
  return Object.fromEntries(
    defs.map(s => [s.id, { extra: '', tone: 'assertivo' as Tone, emojiLevel: '2-4' as EmojiLevel, result: null }])
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PALINSESTO SETTIMANALE
// ═══════════════════════════════════════════════════════════════════════════════

const WEEKLY_SLOTS = [
  { id: 'buongiorno',        time: '07:30', label: 'Buongiorno',
    placeholder: 'Contesto del giorno, meteo, apertura mercati...' },
  { id: 'risultati_vip_mat', time: '08:00', label: 'Risultati VIP mattutini',
    placeholder: 'Es: +48 pip già stamattina, 3 trade chiusi' },
  { id: 'recap_ieri',        time: '09:00', label: 'Recap giorno precedente',
    placeholder: 'Es: ieri +127 pip totali, 4 trade su 5 in profitto' },
  { id: 'segnale_gratis',    time: '10:00', label: 'Segnale gratis XAUUSD',
    placeholder: 'Es: BUY da 2345, SL 2330, TP1 2360 TP2 2375' },
  { id: 'fine_segnale',      time: '11:00', label: 'Fine segnale',
    placeholder: 'Es: TP1 raggiunto, +62 pip, chiuso in profitto' },
  { id: 'screen_clienti',    time: '12:00', label: 'Screen risultati clienti',
    placeholder: 'Descrivi lo screen o il messaggio del cliente...' },
  { id: 'calendario_eco',    time: '13:00', label: 'Calendario economico',
    placeholder: 'Es: CPI USA alle 14:30, atteso 3.1%, precedente 3.2%' },
  { id: 'passaggio_vip',     time: '14:00', label: 'Passaggio esclusivo al VIP',
    placeholder: 'Urgenza, offerta speciale, scadenza...' },
  { id: 'risultati_usa',     time: '15:30', label: 'Risultati USA (Copy + VIP)',
    placeholder: 'Es: sessione USA +84 pip, copy +2.3%' },
  { id: 'recap_finale',      time: '18:00', label: 'Recap finale del giorno',
    placeholder: 'Es: giornata totale +180 pip, tutti i TP raggiunti' },
];

const DAYS = [
  { id: 'lun', label: 'Lunedì',    short: 'Lun', color: '#FFAD47',
    theme: "L'Antidoto alla Routine",
    vibe: 'Energico, controtendenza. I mercati riaprono — la massa è in ufficio.' },
  { id: 'mar', label: 'Martedì',   short: 'Mar', color: '#3b82f6',
    theme: 'La Conferma del Metodo',
    vibe: 'Freddo, razionale. Ieri era metodo, non fortuna. Oggi si replica.' },
  { id: 'mer', label: 'Mercoledì', short: 'Mer', color: '#a855f7',
    theme: 'Il Giro di Boa — 3 su 3',
    vibe: 'Inarrestabile. La macchina non conosce fatica. Lun ✓ Mar ✓ Mer ✓.' },
  { id: 'gio', label: 'Giovedì',   short: 'Gio', color: '#22c55e',
    theme: "L'Efficienza Automatica",
    vibe: 'Sforzo zero. Mentre sei in riunione, il sistema lavora al posto tuo.' },
  { id: 'ven', label: 'Venerdì',   short: 'Ven', color: '#ef4444',
    theme: 'Il Payday e il Lifestyle',
    vibe: 'Celebrativo + urgenza serale. Stipendio vs rendita. Setup pre-lunedì.' },
];

function DayPanel({ day }: { day: typeof DAYS[0] }) {
  const { config } = useApp();
  const { loading, elapsed, run } = useGemini();
  const [slotStates, setSlotStates] = useState<Record<string, SlotState>>(
    () => initSlots(WEEKLY_SLOTS)
  );
  const [generatingSlot, setGeneratingSlot] = useState<string | null>(null);
  const [genProgress, setGenProgress] = useState(0);

  const update = (id: string, patch: Partial<SlotState>) =>
    setSlotStates(p => ({ ...p, [id]: { ...p[id], ...patch } }));

  async function generateOne(slotId: string) {
    const s = slotStates[slotId];
    setGeneratingSlot(slotId);
    const text = await run(
      buildSettimanaPrompt(slotId, day.id, { cfg: config, date: todayItalian(), tone: s.tone, extra: s.extra, emojiLevel: s.emojiLevel }),
      0.88
    );
    if (text) update(slotId, { result: parseBilingual(text) });
    setGeneratingSlot(null);
  }

  async function generateAll() {
    setGenProgress(0);
    for (let i = 0; i < WEEKLY_SLOTS.length; i++) {
      const slot = WEEKLY_SLOTS[i];
      setGeneratingSlot(slot.id);
      setGenProgress(i + 1);
      const s = slotStates[slot.id];
      const text = await run(
        buildSettimanaPrompt(slot.id, day.id, { cfg: config, date: todayItalian(), tone: s.tone, extra: s.extra, emojiLevel: s.emojiLevel }),
        0.88
      );
      if (text) update(slot.id, { result: parseBilingual(text) });
    }
    setGeneratingSlot(null);
    setGenProgress(0);
  }

  return (
    <div className="space-y-5">
      <button className="btn-generate w-full" onClick={generateAll} disabled={loading}>
        {loading && genProgress > 0 ? (
          <span className="flex items-center justify-center gap-2">
            <span className="spinner" /> Slot {genProgress}/10... {elapsed}s
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Zap size={14} /> Genera Tutti i 10 Post di {day.label}
          </span>
        )}
      </button>

      {WEEKLY_SLOTS.map((slot, idx) => {
        const s = slotStates[slot.id];
        const isThisSlot = generatingSlot === slot.id;
        return (
          <div key={slot.id} className="space-y-3">
            <div className="card">
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

              <div className="space-y-1 mb-4">
                <label className="block text-xs text-[var(--text3)] uppercase tracking-widest">
                  Note / dati aggiuntivi <span className="normal-case font-normal">(opz.)</span>
                </label>
                <textarea
                  className="result-textarea min-h-[56px]"
                  rows={2}
                  placeholder={slot.placeholder}
                  value={s.extra}
                  onChange={e => update(slot.id, { extra: e.target.value })}
                />
              </div>

              <ToneSelector value={s.tone} onChange={v => update(slot.id, { tone: v })} />
              <div className="mt-3">
                <EmojiSelector value={s.emojiLevel} onChange={v => update(slot.id, { emojiLevel: v })} />
              </div>

              <button
                className="btn-generate w-full mt-4"
                onClick={() => generateOne(slot.id)}
                disabled={loading}
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

// ═══════════════════════════════════════════════════════════════════════════════
// SCALETTA UFFICIALE
// ═══════════════════════════════════════════════════════════════════════════════

const SCALETTA_SLOTS = [
  {
    id: 'early_morning', time: '06:00–07:30', label: 'Early Morning',
    objective: 'Attivare il pubblico + mindset',
    color: '#f59e0b',
    placeholder: 'Tema del giorno, eventi in arrivo, contesto mercato...',
  },
  {
    id: 'prova_sociale', time: '07:00–09:00', label: 'Prova Sociale',
    objective: 'Credibilità immediata',
    color: '#10b981',
    placeholder: 'Es: screenshot cliente, +84 pip ieri sera, testimonial...',
  },
  {
    id: 'contenuto_valore', time: '09:00–12:00', label: 'Contenuto / Valore',
    objective: 'Educare + aumentare fiducia',
    color: '#3b82f6',
    placeholder: 'Argomento educativo: analisi, spiegazione, concetto di trading...',
  },
  {
    id: 'soft_cta', time: '10:00–12:30', label: 'Soft CTA',
    objective: 'Portare gente nel gruppo / DM',
    color: '#8b5cf6',
    placeholder: 'Offerta, accesso gratuito, numero posti disponibili...',
  },
  {
    id: 'pre_trade_hype', time: '11:30–13:30', label: 'Pre-Trade Hype',
    objective: 'Preparare al segnale',
    color: '#f97316',
    placeholder: 'Cosa stai monitorando, setup che si sta formando, timeframe...',
  },
  {
    id: 'trade_live', time: '13:00–15:00', label: 'Trade Live',
    objective: 'Engagement massimo',
    color: '#ef4444',
    placeholder: 'Es: BUY XAUUSD da 2348, SL 2332, TP1 2365 TP2 2380...',
  },
  {
    id: 'post_trade_proof', time: 'Subito dopo il trade', label: 'Post-Trade Proof',
    objective: 'Rinforzo psicologico',
    color: '#22c55e',
    placeholder: 'Es: TP1 hit, +62 pip, trade chiuso in profitto in 45 min...',
  },
  {
    id: 'cta_forte', time: '15:00–17:00', label: 'CTA Forte',
    objective: 'Conversione',
    color: '#ec4899',
    placeholder: 'Urgenza, posti rimasti, scadenza offerta, bonus...',
  },
  {
    id: 'motivazionale', time: '18:00–21:00', label: 'Contenuto Motivazionale',
    objective: 'Retention + brand',
    color: '#06b6d4',
    placeholder: 'Story personale, riflessione, lifestyle, mentalità vincente...',
  },
  {
    id: 'evening_close', time: '21:00–23:30', label: 'Evening / Close',
    objective: 'Tenere attenzione + FOMO',
    color: '#6366f1',
    placeholder: 'Recap serale, anticipazione di domani, reminder notifiche...',
  },
];

function ScalettaPanel() {
  const { config } = useApp();
  const { loading, elapsed, run } = useGemini();
  const [slotStates, setSlotStates] = useState<Record<string, SlotState>>(
    () => initSlots(SCALETTA_SLOTS)
  );
  const [generatingSlot, setGeneratingSlot] = useState<string | null>(null);
  const [genProgress, setGenProgress] = useState(0);

  const update = (id: string, patch: Partial<SlotState>) =>
    setSlotStates(p => ({ ...p, [id]: { ...p[id], ...patch } }));

  async function generateOne(slotId: string) {
    const s = slotStates[slotId];
    setGeneratingSlot(slotId);
    const text = await run(
      buildScalettaPrompt(slotId, { cfg: config, date: todayItalian(), tone: s.tone, extra: s.extra, emojiLevel: s.emojiLevel }),
      0.88
    );
    if (text) update(slotId, { result: parseBilingual(text) });
    setGeneratingSlot(null);
  }

  async function generateAll() {
    setGenProgress(0);
    for (let i = 0; i < SCALETTA_SLOTS.length; i++) {
      const slot = SCALETTA_SLOTS[i];
      setGeneratingSlot(slot.id);
      setGenProgress(i + 1);
      const s = slotStates[slot.id];
      const text = await run(
        buildScalettaPrompt(slot.id, { cfg: config, date: todayItalian(), tone: s.tone, extra: s.extra, emojiLevel: s.emojiLevel }),
        0.88
      );
      if (text) update(slot.id, { result: parseBilingual(text) });
    }
    setGeneratingSlot(null);
    setGenProgress(0);
  }

  return (
    <div className="space-y-5">
      <button className="btn-generate w-full" onClick={generateAll} disabled={loading}>
        {loading && genProgress > 0 ? (
          <span className="flex items-center justify-center gap-2">
            <span className="spinner" /> Slot {genProgress}/10... {elapsed}s
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Zap size={14} /> Genera Tutta la Scaletta (10 Post)
          </span>
        )}
      </button>

      {SCALETTA_SLOTS.map((slot, idx) => {
        const s = slotStates[slot.id];
        const isThisSlot = generatingSlot === slot.id;
        return (
          <div key={slot.id} className="space-y-3">
            <div className="card">
              {/* Header slot */}
              <div className="flex items-start gap-3 mb-4">
                <span
                  className="text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: slot.color + '22', color: slot.color, border: `1px solid ${slot.color}44` }}
                >
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="font-mono text-[10px] px-1.5 py-0.5 rounded-[var(--radius-sm)]"
                      style={{ background: slot.color + '15', color: slot.color }}
                    >
                      {slot.time}
                    </span>
                    <span className="text-sm font-semibold text-[var(--text)]">{slot.label}</span>
                    {s.result && (
                      <span className="text-[10px] text-[#22c55e] font-medium">✓ Generato</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Target size={10} className="text-[var(--text3)] shrink-0" />
                    <span className="text-[11px] text-[var(--text3)]">{slot.objective}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1 mb-4">
                <label className="block text-xs text-[var(--text3)] uppercase tracking-widest">
                  Note / dati aggiuntivi <span className="normal-case font-normal">(opz.)</span>
                </label>
                <textarea
                  className="result-textarea min-h-[56px]"
                  rows={2}
                  placeholder={slot.placeholder}
                  value={s.extra}
                  onChange={e => update(slot.id, { extra: e.target.value })}
                />
              </div>

              <ToneSelector value={s.tone} onChange={v => update(slot.id, { tone: v })} />
              <div className="mt-3">
                <EmojiSelector value={s.emojiLevel} onChange={v => update(slot.id, { emojiLevel: v })} />
              </div>

              <button
                className="btn-generate w-full mt-4"
                onClick={() => generateOne(slot.id)}
                disabled={loading}
              >
                {isThisSlot ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="spinner" /> Generando... {elapsed}s
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <PlayCircle size={13} /> Genera — {slot.label}
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

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SECTION
// ═══════════════════════════════════════════════════════════════════════════════

type SezMode = 'settimanale' | 'scaletta';

export function SettimanaSection() {
  const [sezMode, setSezMode] = useState<SezMode>('settimanale');
  const [activeDay, setActiveDay] = useState<string>('lun');
  const day = DAYS.find(d => d.id === activeDay) ?? DAYS[0];

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* ── Selezione sezione ────────────────────────────────────────────── */}
      <div className="flex gap-1 p-1 rounded-[var(--radius)] bg-[var(--bg2)] border border-[var(--border)]">
        <button
          onClick={() => setSezMode('settimanale')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-[var(--radius-sm)] text-sm font-semibold transition-all
            ${sezMode === 'settimanale'
              ? 'bg-[rgba(254,153,32,0.15)] text-[var(--gold)] border border-[rgba(254,153,32,0.35)]'
              : 'text-[var(--text3)] hover:text-[var(--text2)]'}`}
        >
          <CalendarRange size={13} /> Palinsesto Settimanale
        </button>
        <button
          onClick={() => setSezMode('scaletta')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-[var(--radius-sm)] text-sm font-semibold transition-all
            ${sezMode === 'scaletta'
              ? 'bg-[rgba(254,153,32,0.15)] text-[var(--gold)] border border-[rgba(254,153,32,0.35)]'
              : 'text-[var(--text3)] hover:text-[var(--text2)]'}`}
        >
          <Layers size={13} /> Scaletta Ufficiale
        </button>
      </div>

      {/* ── PALINSESTO SETTIMANALE ───────────────────────────────────────── */}
      {sezMode === 'settimanale' && (
        <>
          <div className="card">
            <div className="card-title flex items-center gap-1.5">
              <CalendarRange size={14} /> Palinsesto Settimanale
            </div>
            <p className="text-[var(--text3)] text-sm mb-4">
              10 slot fissi ogni giorno (07:30→18:00). Il "tema del giorno" colora il copy di tutti i post — stesso palinsesto, vibe psicologica diversa ogni giorno.
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

            {/* Active day theme badge */}
            <div
              className="mt-3 p-3 rounded-[var(--radius-sm)]"
              style={{ background: day.color + '10', border: `1px solid ${day.color}28` }}
            >
              <span className="text-xs font-bold" style={{ color: day.color }}>
                {day.label} — {day.theme}
              </span>
              <p className="text-[11px] text-[var(--text3)] mt-0.5">{day.vibe}</p>
            </div>
          </div>

          {/* Day panel — key resets state on day switch */}
          <DayPanel key={activeDay} day={day} />
        </>
      )}

      {/* ── SCALETTA UFFICIALE ───────────────────────────────────────────── */}
      {sezMode === 'scaletta' && (
        <>
          <div className="card">
            <div className="card-title flex items-center gap-1.5">
              <Layers size={14} /> Scaletta Ufficiale
            </div>
            <p className="text-[var(--text3)] text-sm">
              10 slot per fascia oraria (06:00→23:30), ognuno con un obiettivo psicologico preciso — dall'attivazione mattutina alla chiusura serale con FOMO. Genera singolarmente o tutti in sequenza.
            </p>
          </div>

          <ScalettaPanel />
        </>
      )}
    </div>
  );
}
