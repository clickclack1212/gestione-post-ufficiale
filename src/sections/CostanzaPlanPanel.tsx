import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useGemini } from '../hooks/useGemini';
import { ToneSelector } from '../components/ToneSelector';
import { PhotoUploader } from '../components/PhotoUploader';
import { PlanCard } from '../components/PlanCard';
import { buildCostanzaPrompt, parseBilingual, todayItalian } from '../services/prompts';
import { COSTANZA_SLOTS } from '../constants/data';
import { Icon, TrendingUp, Copy, Globe, Zap, Camera } from '../components/Icon';
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

function CostanzaSlotFields({
  slotId, fields, setField,
}: {
  slotId: string;
  fields: Record<string, string>;
  setField: (k: string, v: string) => void;
}) {
  const f = (k: string) => fields[k] ?? '';

  switch (slotId) {
    case 'cv_vip_mattina':
      return (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Pips VIP"      name="pips_vip"   value={f('pips_vip')}   onChange={setField} placeholder="+65" />
          <Field label="Operazioni"    name="trades_vip"  value={f('trades_vip')} onChange={setField} placeholder="3" />
        </div>
      );

    case 'cv_recap_ieri':
      return (
        <Field label="Note (opz.)" name="nota" value={f('nota')} onChange={setField} placeholder="Es. ieri due operazioni in VIP, copy +42 pips..." />
      );

    case 'cv_segnale_free':
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
          <Field label="Take Profit" name="tp" value={f('tp')} onChange={setField} placeholder="2360.00" />
        </div>
      );

    case 'cv_fine_segnale':
      return (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Pips Risultato" name="pips" value={f('pips')} onChange={setField} placeholder="+45" />
          <Field label="Nota (opz.)"    name="nota"  value={f('nota')} onChange={setField} placeholder="Target colpito esatto..." />
        </div>
      );

    case 'cv_calendario':
      return (
        <div className="space-y-1">
          <label className="block text-xs text-[var(--text3)] uppercase tracking-widest">Dati Attesi (opz.)</label>
          <textarea className="w-full" rows={2}
            placeholder="Es. NFP alle 14:30, CPI alle 16:00..."
            value={f('news_note')} onChange={e => setField('news_note', e.target.value)} />
        </div>
      );

    case 'cv_risultati_live':
      return (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Pips"        name="pips"   value={f('pips')}   onChange={setField} placeholder="+85" />
          <Field label="Operazioni"  name="trades"  value={f('trades')} onChange={setField} placeholder="4" />
        </div>
      );

    case 'cv_recap_finale':
      return (
        <Field label="Nota (opz.)" name="nota" value={f('nota')} onChange={setField} placeholder="Es. giornata solida, tre target consecutivi..." />
      );

    default:
      return null;
  }
}

export function CostanzaPlanPanel() {
  const { config } = useApp();
  const { loading, elapsed, run } = useGemini();

  const [tone, setTone] = useState<Tone>('assertivo');
  const [mode, setMode] = useState<GenMode>('single');
  const [selectedSlot, setSelectedSlot] = useState(COSTANZA_SLOTS[0].id);
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

  const ctx = (withExtra = false) => ({
    cfg: config,
    date: todayItalian(),
    tone,
    fields,
    extra: withExtra ? extraNote.trim() : '',
  });

  async function handleSingle() {
    const slot = COSTANZA_SLOTS.find(s => s.id === selectedSlot)!;
    const prompt = buildCostanzaPrompt(slot, ctx(true));
    if (!prompt) return;
    const usePhoto = slot.shot && photo ? photo : null;
    const text = await run(prompt, 0.88, usePhoto);
    if (text) setSingleResult(parseBilingual(text));
  }

  async function handleDay() {
    setDayResults([]);
    const results: PlanCardData[] = [];
    for (const slot of COSTANZA_SLOTS) {
      const prompt = buildCostanzaPrompt(slot, ctx());
      if (!prompt) continue;
      const usePhoto = slot.shot && photo ? photo : null;
      const text = await run(prompt, 0.88, usePhoto);
      if (!text) continue;
      const { it, en } = parseBilingual(text);
      results.push({ id: slot.id, time: slot.time, label: slot.label, shot: slot.shot, tag: slot.tag, it, en });
      setDayResults([...results]);
    }
  }

  const activeSlot = COSTANZA_SLOTS.find(s => s.id === selectedSlot)!;
  const tagColors: Record<string, string> = {
    metodo:  '#22c55e',
    proof:   '#3b82f6',
    segnale: '#FE9920',
  };

  return (
    <div className="space-y-5">
      <div className="card">
        <div className="card-title flex items-center gap-1.5" style={{ color: '#22c55e' }}>
          <TrendingUp size={14} /> Piano Costanza &amp; Metodo · {COSTANZA_SLOTS.length} Slot
        </div>
        <p className="text-[var(--text3)] text-xs mb-4">
          Ogni messaggio costruisce fiducia duratura — tono calmo e autorevole, empatia reale, fatti concreti. CTA con link diretto.
        </p>

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
          <div className="mt-2 space-y-2">
            <label className="block text-xs text-[var(--text3)] uppercase tracking-widest">Slot</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {COSTANZA_SLOTS.map(s => (
                <button
                  key={s.id}
                  onClick={() => { setSelectedSlot(s.id); setSingleResult({ it: '', en: '' }); setFieldsState({}); setExtraOpen(false); setExtraNote(''); }}
                  className={`alt-plan-btn text-left ${selectedSlot === s.id ? 'active' : ''}`}
                  style={selectedSlot === s.id && s.tag ? { borderColor: (tagColors[s.tag] || '#22c55e') + '80', background: (tagColors[s.tag] || '#22c55e') + '14' } : {}}
                >
                  <span className="font-mono text-[11px]" style={{ color: (s.tag ? tagColors[s.tag] : undefined) || '#22c55e' }}>{s.time}</span>
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

        {/* Slot-specific fields */}
        {mode === 'single' && (
          <div className="mt-4">
            <CostanzaSlotFields slotId={selectedSlot} fields={fields} setField={setField} />
          </div>
        )}

        {/* Photo uploader */}
        {(mode === 'day' || activeSlot?.shot) && (
          <div className="mt-4">
            <PhotoUploader
              label="Screenshot (opz. — per slot che lo richiedono)"
              preview={photoPreview}
              onPhoto={(b64) => { setPhoto(b64); setPhotoPreview(`data:image/jpeg;base64,${b64}`); }}
              onClear={() => { setPhoto(null); setPhotoPreview(null); }}
            />
          </div>
        )}

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
                  placeholder="Aggiungi contesto, dettagli o istruzioni extra..."
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
          style={{ background: loading ? undefined : 'linear-gradient(135deg, #22c55e, #16a34a)' }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="spinner" /> Generando... {elapsed}s
            </span>
          ) : mode === 'single' ? (
            <span className="flex items-center justify-center gap-2">
              <Zap size={14} /> Genera ✅ {activeSlot?.time}
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <TrendingUp size={14} /> Genera Intera Giornata ({COSTANZA_SLOTS.length} slot)
            </span>
          )}
        </button>
      </div>

      {/* Single result */}
      {mode === 'single' && (singleResult.it || singleResult.en) && (
        <div className="card animate-[slideUp_0.3s_ease]">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-mono text-sm" style={{ color: tagColors[activeSlot?.tag || ''] || '#22c55e' }}>{activeSlot?.time}</span>
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
            <span className="text-sm text-[var(--text2)]">{dayResults.length} / {COSTANZA_SLOTS.length} slot generati</span>
            {loading && (
              <span className="flex items-center gap-2 text-xs text-[#22c55e]">
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
