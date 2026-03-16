import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useGemini } from '../hooks/useGemini';
import { ToneSelector } from '../components/ToneSelector';
import { PhotoUploader } from '../components/PhotoUploader';
import { PlanCard } from '../components/PlanCard';
import { buildDailyPrompt, parseBilingual, todayItalian } from '../services/prompts';
import { DAILY_SLOTS } from '../constants/data';
import { ClipboardList, Copy, Globe, Zap, Camera, Icon } from '../components/Icon';
import type { PlanCardData } from '../components/PlanCard';
import type { Tone } from '../types';

type GenMode = 'single' | 'day';

function Field({
  label, name, value, onChange, placeholder = '',
}: {
  label: string; name: string; value: string;
  onChange: (k: string, v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-xs text-[var(--text3)] uppercase tracking-widest">{label}</label>
      <input value={value} placeholder={placeholder} onChange={e => onChange(name, e.target.value)} />
    </div>
  );
}

function DailySlotFields({
  slotId, fields, setField,
}: {
  slotId: string;
  fields: Record<string, string>;
  setField: (k: string, v: string) => void;
}) {
  const f = (k: string) => fields[k] ?? '';

  switch (slotId) {
    case 'd_risultati_ieri':
      return (
        <div className="space-y-3">
          <div>
            <p className="text-[10px] text-[var(--text3)] uppercase tracking-widest mb-2">VIP Room</p>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Pips VIP"     name="vip_pips"    value={f('vip_pips')}    onChange={setField} placeholder="85" />
              <Field label="Ops VIP"      name="vip_trades"  value={f('vip_trades')}  onChange={setField} placeholder="5" />
              <Field label="Win Rate VIP" name="vip_winrate" value={f('vip_winrate')} onChange={setField} placeholder="80%" />
            </div>
          </div>
          <div>
            <p className="text-[10px] text-[var(--text3)] uppercase tracking-widest mb-2">CopyTrading</p>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Pips Copy"   name="copy_pips"   value={f('copy_pips')}   onChange={setField} placeholder="72" />
              <Field label="Ops Copy"    name="copy_trades" value={f('copy_trades')} onChange={setField} placeholder="4" />
              <Field label="Performance" name="copy_perf"   value={f('copy_perf')}   onChange={setField} placeholder="+3.2%" />
            </div>
          </div>
        </div>
      );

    case 'd_primi_risultati':
      return (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Pips"       name="pips"   value={f('pips')}   onChange={setField} placeholder="+40" />
          <Field label="Operazioni" name="trades" value={f('trades')} onChange={setField} placeholder="3" />
        </div>
      );

    case 'd_segnale':
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="block text-xs text-[var(--text3)] uppercase tracking-widest">Direzione</label>
              <select value={f('dir') || 'BUY'} onChange={e => setField('dir', e.target.value)}>
                <option value="BUY">BUY 🟢</option>
                <option value="SELL">SELL 🔴</option>
              </select>
            </div>
            <Field label="Entry"     name="entry" value={f('entry')} onChange={setField} placeholder="2345.00" />
            <Field label="Stop Loss" name="sl"    value={f('sl')}    onChange={setField} placeholder="2335.00" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="TP1" name="tp1" value={f('tp1')} onChange={setField} placeholder="2355" />
            <Field label="TP2" name="tp2" value={f('tp2')} onChange={setField} placeholder="2365" />
            <Field label="TP3" name="tp3" value={f('tp3')} onChange={setField} placeholder="2375" />
          </div>
        </div>
      );

    case 'd_risultato_segn':
      return (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-xs text-[var(--text3)] uppercase tracking-widest">Esito</label>
            <select value={f('esito') || 'WIN'} onChange={e => setField('esito', e.target.value)}>
              <option value="WIN">WIN ✅</option>
              <option value="LOSS">LOSS ❌</option>
              <option value="BE">BREAK EVEN ⚖</option>
            </select>
          </div>
          <Field label="Pips" name="pips" value={f('pips')} onChange={setField} placeholder="+45" />
        </div>
      );

    case 'd_copy_live':
      return (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Pips Copy Live" name="copy_pips"   value={f('copy_pips')}   onChange={setField} placeholder="+60" />
          <Field label="Ops Chiuse"     name="copy_trades" value={f('copy_trades')} onChange={setField} placeholder="4" />
        </div>
      );

    case 'd_notizie':
      return (
        <div className="space-y-1">
          <label className="block text-xs text-[var(--text3)] uppercase tracking-widest">Note Calendario</label>
          <textarea className="w-full" rows={2} placeholder="CPI USA 14:30, Fed 20:00..."
            value={f('note')} onChange={e => setField('note', e.target.value)} />
        </div>
      );

    case 'd_copy_postnews':
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Notizia di Riferimento" name="news_ref"      value={f('news_ref')}      onChange={setField} placeholder="NFP uscito a 200k" />
          <Field label="Pips Post-News"         name="pips_postnews" value={f('pips_postnews')} onChange={setField} placeholder="+55" />
        </div>
      );

    case 'd_educativo':
      return (
        <Field label="Topic (opz.)" name="topic" value={f('topic')} onChange={setField} placeholder="Zone di liquidità, gestione SL..." />
      );

    case 'd_recensioni':
      return (
        <Field label="Nota (opz.)" name="nota" value={f('nota')} onChange={setField} placeholder="Note aggiuntive..." />
      );

    default:
      return null;
  }
}

export function DailySignalPanel() {
  const { config, calendarEvents } = useApp();
  const { loading, elapsed, run } = useGemini();

  const [tone, setTone] = useState<Tone>('assertivo');
  const [mode, setMode] = useState<GenMode>('single');
  const [selectedSlot, setSelectedSlot] = useState(DAILY_SLOTS[0].id);
  const [fields, setFieldsState] = useState<Record<string, string>>({});
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [singleResult, setSingleResult] = useState({ it: '', en: '' });
  const [dayResults, setDayResults] = useState<PlanCardData[]>([]);
  const [extraOpen, setExtraOpen] = useState(false);
  const [extraNote, setExtraNote] = useState('');

  function setField(k: string, v: string) {
    setFieldsState(prev => ({ ...prev, [k]: v }));
  }

  const calEventsStr = calendarEvents.length > 0
    ? calendarEvents.map(e => `${e.time} ${e.currency}: ${e.title} (${e.impact})`).join('\n')
    : '';

  const ctx = (withExtra = false) => ({
    cfg: config,
    date: todayItalian(),
    tone,
    news: fields.note || '',
    extra: withExtra ? extraNote.trim() : '',
    hasPhoto: !!photo,
    calEvents: calEventsStr,
    fields,
  });

  async function handleSingle() {
    const slot = DAILY_SLOTS.find(s => s.id === selectedSlot)!;
    const prompt = buildDailyPrompt(slot, ctx(true));
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
  const slotNeedsPhoto = activeSlot?.shot || activeSlot?.id === 'd_notizie';

  return (
    <div className="space-y-5">
      <div className="card">
        <div className="card-title flex items-center gap-1.5">
          <ClipboardList size={14} /> Giornaliera con Segnale · {DAILY_SLOTS.length} Slot
        </div>

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

        {/* Slot selector (single mode) */}
        {mode === 'single' && (
          <div className="mt-4 space-y-2">
            <label className="block text-xs text-[var(--text3)] uppercase tracking-widest">Slot</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DAILY_SLOTS.map(s => (
                <button
                  key={s.id}
                  onClick={() => { setSelectedSlot(s.id); setSingleResult({ it: '', en: '' }); setFieldsState({}); setExtraOpen(false); setExtraNote(''); }}
                  className={`alt-plan-btn text-left ${selectedSlot === s.id ? 'active' : ''}`}
                >
                  <span className="text-[var(--gold)] font-mono text-[11px]">{s.time}</span>
                  <span className="block text-xs mt-0.5 leading-tight">{s.label}</span>
                  {s.shot && (
                    <span className="badge-photo text-[9px] mt-1 flex items-center gap-0.5">
                      <Camera size={9} /> Screenshot
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Slot-specific fields (single mode) */}
        {mode === 'single' && (
          <div className="mt-4">
            <DailySlotFields slotId={selectedSlot} fields={fields} setField={setField} />
          </div>
        )}

        {/* Photo uploader */}
        {(mode === 'day' || slotNeedsPhoto) && (
          <div className="mt-4">
            <PhotoUploader
              label={activeSlot?.id === 'd_notizie' ? 'Screenshot Calendario' : 'Screenshot Risultati'}
              preview={photoPreview}
              onPhoto={(b64) => { setPhoto(b64); setPhotoPreview(`data:image/jpeg;base64,${b64}`); }}
              onClear={() => { setPhoto(null); setPhotoPreview(null); }}
            />
          </div>
        )}

        {/* Optional extra note — single mode only */}
        {mode === 'single' && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setExtraOpen(o => !o)}
              className="flex items-center gap-1.5 text-xs text-[var(--text3)] hover:text-[var(--text2)] transition-colors"
            >
              <Icon name={extraOpen ? 'ChevronUp' : 'ChevronDown'} size={12} />
              Vuoi aggiungere qualcosa in più per questa generazione?
            </button>
            {extraOpen && (
              <div className="mt-2">
                <textarea
                  className="w-full text-sm"
                  rows={2}
                  value={extraNote}
                  placeholder="Aggiungi contesto, dettagli o istruzioni extra per questo slot..."
                  onChange={e => setExtraNote(e.target.value)}
                />
              </div>
            )}
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
          ) : mode === 'single' ? (
            <span className="flex items-center justify-center gap-2">
              <Zap size={14} /> Genera Slot {activeSlot?.time}
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Zap size={14} /> Genera Intera Giornata ({DAILY_SLOTS.length} slot)
            </span>
          )}
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
            <button className="btn-sec text-sm flex items-center gap-1.5" onClick={() => navigator.clipboard.writeText(singleResult.it)}>
              <Copy size={12} /> Copia IT
            </button>
            <button className="btn-sec text-sm flex items-center gap-1.5" onClick={() => navigator.clipboard.writeText(singleResult.en)}>
              <Copy size={12} /> Copia EN
            </button>
            <button className="btn-sec text-sm flex items-center gap-1.5" onClick={() => navigator.clipboard.writeText(`${singleResult.it}\n\n──────────────\n\n${singleResult.en}`)}>
              <Globe size={12} /> Copia Bilingue
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
