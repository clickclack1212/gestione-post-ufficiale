import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useGemini } from '../hooks/useGemini';
import { ToneSelector } from '../components/ToneSelector';
import { PhotoUploader } from '../components/PhotoUploader';
import { PlanCard } from '../components/PlanCard';
import { buildNSPrompt, parseBilingual, todayItalian } from '../services/prompts';
import { DAILY_SLOTS_NS } from '../constants/data';
import { ClipboardList, Copy, Globe, Zap, Camera } from '../components/Icon';
import type { PlanCardData } from '../components/PlanCard';
import type { Tone } from '../types';

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

function NSSlotFields({
  slotId, fields, setField,
}: {
  slotId: string;
  fields: Record<string, string>;
  setField: (k: string, v: string) => void;
}) {
  const f = (k: string) => fields[k] ?? '';

  switch (slotId) {
    case 'ns_risultati_ieri':
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

    case 'ns_copy_mattina':
      return (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Pips Copy"  name="copy_pips"   value={f('copy_pips')}   onChange={setField} placeholder="+35" />
          <Field label="Ops Chiuse" name="copy_trades" value={f('copy_trades')} onChange={setField} placeholder="2" />
        </div>
      );

    case 'ns_vip_mattina':
      return (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Pips VIP"  name="vip_pips"   value={f('vip_pips')}   onChange={setField} placeholder="+50" />
          <Field label="Ops Chiuse" name="vip_trades" value={f('vip_trades')} onChange={setField} placeholder="3" />
        </div>
      );

    case 'ns_calendario':
      return (
        <div className="space-y-1">
          <label className="block text-xs text-[var(--text3)] uppercase tracking-widest">Note Calendario</label>
          <textarea className="w-full" rows={2} placeholder="CPI USA 14:30, Fed 20:00..."
            value={f('note')} onChange={e => setField('note', e.target.value)} />
        </div>
      );

    case 'ns_post_news':
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Notizia di Riferimento" name="news_ref"      value={f('news_ref')}      onChange={setField} placeholder="NFP uscito a 200k" />
          <Field label="Pips Post-News"         name="pips_postnews" value={f('pips_postnews')} onChange={setField} placeholder="+55" />
        </div>
      );

    case 'ns_recensioni':
      return (
        <Field label="Nota (opz.)" name="nota" value={f('nota')} onChange={setField} placeholder="Note aggiuntive..." />
      );

    case 'ns_recap':
      return (
        <Field label="Note Finali (opz.)" name="nota_finale" value={f('nota_finale')} onChange={setField} placeholder="Riepilogo giornata..." />
      );

    default:
      return null;
  }
}

export function DailyNoSignalPanel() {
  const { config } = useApp();
  const { loading, elapsed, run } = useGemini();

  const [tone, setTone] = useState<Tone>('assertivo');
  const [mode, setMode] = useState<'single' | 'day'>('single');
  const [selectedSlot, setSelectedSlot] = useState(DAILY_SLOTS_NS[0].id);
  const [fields, setFieldsState] = useState<Record<string, string>>({});
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [singleResult, setSingleResult] = useState({ it: '', en: '' });
  const [dayResults, setDayResults] = useState<PlanCardData[]>([]);

  function setField(k: string, v: string) {
    setFieldsState(prev => ({ ...prev, [k]: v }));
  }

  const ctx = () => ({
    cfg: config,
    date: todayItalian(),
    tone,
    news: fields.note || '',
    extra: '',
    hasPhoto: !!photo,
    fields,
  });

  async function handleSingle() {
    const slot = DAILY_SLOTS_NS.find(s => s.id === selectedSlot)!;
    const prompt = buildNSPrompt(slot, ctx());
    if (!prompt) return;
    const usePhoto = slot.id === 'ns_calendario' && photo ? photo : null;
    const text = await run(prompt, 0.88, usePhoto);
    if (text) setSingleResult(parseBilingual(text));
  }

  async function handleDay() {
    setDayResults([]);
    const results: PlanCardData[] = [];

    for (const slot of DAILY_SLOTS_NS) {
      const prompt = buildNSPrompt(slot, ctx());
      if (!prompt) continue;
      const usePhoto = slot.id === 'ns_calendario' && photo ? photo : null;
      const text = await run(prompt, 0.88, usePhoto);
      if (!text) continue;
      const { it, en } = parseBilingual(text);
      results.push({ id: slot.id, time: slot.time, label: slot.label, shot: slot.shot, it, en });
      setDayResults([...results]);
    }
  }

  const activeSlot = DAILY_SLOTS_NS.find(s => s.id === selectedSlot)!;
  const slotNeedsPhoto = activeSlot?.shot || activeSlot?.id === 'ns_calendario';

  return (
    <div className="space-y-5">
      <div className="card">
        <div className="card-title flex items-center gap-1.5">
          <ClipboardList size={14} /> Giornaliera Senza Segnale · {DAILY_SLOTS_NS.length} Slot
        </div>
        <p className="text-[var(--text3)] text-xs mb-4">
          Piano per giorni senza segnale gratuito sul canale. Focus su VIP Room e CopyTrading.
        </p>

        <div className="flex gap-2 mb-4">
          <button className={`alt-mode-btn ${mode === 'single' ? 'active' : ''}`} onClick={() => setMode('single')}>
            Singolo Slot
          </button>
          <button className={`alt-mode-btn ${mode === 'day' ? 'active' : ''}`} onClick={() => setMode('day')}>
            Intera Giornata
          </button>
        </div>

        <ToneSelector value={tone} onChange={setTone} />

        {mode === 'single' && (
          <div className="mt-4 space-y-2">
            <label className="block text-xs text-[var(--text3)] uppercase tracking-widest">Slot</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DAILY_SLOTS_NS.map(s => (
                <button
                  key={s.id}
                  onClick={() => { setSelectedSlot(s.id); setSingleResult({ it: '', en: '' }); setFieldsState({}); }}
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
            <NSSlotFields slotId={selectedSlot} fields={fields} setField={setField} />
          </div>
        )}

        {(mode === 'day' || slotNeedsPhoto) && (
          <div className="mt-4">
            <PhotoUploader
              label={activeSlot?.id === 'ns_calendario' ? 'Screenshot Calendario Economico' : 'Screenshot Risultati'}
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
          ) : mode === 'single' ? (
            <span className="flex items-center justify-center gap-2">
              <Zap size={14} /> Genera Slot {activeSlot?.time}
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Zap size={14} /> Genera Intera Giornata ({DAILY_SLOTS_NS.length} slot)
            </span>
          )}
        </button>
      </div>

      {mode === 'single' && (singleResult.it || singleResult.en) && (
        <div className="card animate-[slideUp_0.3s_ease]">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[var(--gold)] font-mono text-sm">{activeSlot?.time}</span>
            <span className="text-[var(--text2)] text-sm">{activeSlot?.label}</span>
          </div>
          <div className="flex gap-2 flex-wrap mb-3">
            <button className="btn-sec text-sm flex items-center gap-1.5" onClick={() => navigator.clipboard.writeText(singleResult.it)}>
              <Copy size={12} /> IT
            </button>
            <button className="btn-sec text-sm flex items-center gap-1.5" onClick={() => navigator.clipboard.writeText(singleResult.en)}>
              <Copy size={12} /> EN
            </button>
            <button className="btn-sec text-sm flex items-center gap-1.5" onClick={() => navigator.clipboard.writeText(`${singleResult.it}\n\n──────────────\n\n${singleResult.en}`)}>
              <Globe size={12} /> Bilingue
            </button>
          </div>
          <pre className="text-xs text-[var(--text2)] whitespace-pre-wrap leading-relaxed">{singleResult.it}</pre>
        </div>
      )}

      {mode === 'day' && dayResults.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--text2)]">{dayResults.length} / {DAILY_SLOTS_NS.length} slot generati</span>
            {loading && <span className="flex items-center gap-2 text-xs text-[var(--gold)]"><span className="mini-spinner" /> {elapsed}s</span>}
          </div>
          {dayResults.map((card, i) => <PlanCard key={card.id} card={card} index={i} />)}
        </div>
      )}
    </div>
  );
}
