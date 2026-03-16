import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useGemini } from '../hooks/useGemini';
import { ToneSelector } from '../components/ToneSelector';
import { PhotoUploader } from '../components/PhotoUploader';
import { BilingualResult } from '../components/BilingualResult';
import { buildPrompt, parseBilingual } from '../services/prompts';
import { TYPES, NO_FIELDS_MAIN } from '../constants/data';
import { Icon, Zap, Camera, Diamond, Rocket } from '../components/Icon';
import type { Tone } from '../types';

type ResultSubType = 'primi' | 'durante' | 'conclusi';

const SUB_TYPES: { id: ResultSubType; label: string }[] = [
  { id: 'primi',    label: 'Primi Risultati' },
  { id: 'durante',  label: 'Durante'         },
  { id: 'conclusi', label: 'Conclusi'        },
];

const RESULT_PARENT_IDS = ['vip_risultati', 'copy_risultati'];

function Field({
  label, name, value, onChange, placeholder = '', type = 'text',
}: {
  label: string; name: string; value: string;
  onChange: (k: string, v: string) => void;
  placeholder?: string; type?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-xs text-[var(--text3)] uppercase tracking-widest">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(name, e.target.value)}
      />
    </div>
  );
}

function FieldsForType({
  typeId, fields, setField,
}: {
  typeId: string;
  fields: Record<string, string>;
  setField: (k: string, v: string) => void;
}) {
  if (NO_FIELDS_MAIN.includes(typeId)) return null;

  switch (typeId) {

    // ── VIP Risultati ────────────────────────────────────────────────────────
    case 'vip_risultati_primi':
      return (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Pips"       name="pips_vip"   value={fields.pips_vip   ?? ''} onChange={setField} placeholder="+65" />
          <Field label="Operazioni" name="trades_vip" value={fields.trades_vip ?? ''} onChange={setField} placeholder="3" />
        </div>
      );

    case 'vip_risultati_durante':
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="block text-xs text-[var(--text3)] uppercase tracking-widest">Situazione</label>
              <select value={fields.status_vip ?? 'in profitto'} onChange={e => setField('status_vip', e.target.value)}>
                <option value="in profitto">In profitto ✅</option>
                <option value="in perdita">In perdita ⚠</option>
                <option value="in breakeven">Breakeven ⚖</option>
                <option value="in attesa">In attesa ⏳</option>
              </select>
            </div>
            <Field label="Pips attuali" name="pips_vip" value={fields.pips_vip ?? ''} onChange={setField} placeholder="+40" />
            <Field label="Ops aperte"   name="ops_vip"  value={fields.ops_vip  ?? ''} onChange={setField} placeholder="2" />
          </div>
          <div className="space-y-1">
            <label className="block text-xs text-[var(--text3)] uppercase tracking-widest">Note (opz.)</label>
            <input value={fields.note_vip ?? ''} onChange={e => setField('note_vip', e.target.value)} placeholder="TP1 colpito, gestione in corso..." />
          </div>
        </div>
      );

    case 'vip_risultati_conclusi':
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <Field label="Pips totali"  name="pips_vip"     value={fields.pips_vip     ?? ''} onChange={setField} placeholder="+120" />
            <Field label="Operazioni"   name="trades_vip"   value={fields.trades_vip   ?? ''} onChange={setField} placeholder="5" />
            <Field label="Win Rate"     name="winrate_vip"  value={fields.winrate_vip  ?? ''} onChange={setField} placeholder="80%" />
          </div>
          <div className="space-y-1">
            <label className="block text-xs text-[var(--text3)] uppercase tracking-widest">Note giornata (opz.)</label>
            <input value={fields.note_vip ?? ''} onChange={e => setField('note_vip', e.target.value)} placeholder="Setup tecnico, contesto, commento..." />
          </div>
        </div>
      );

    // ── Copy Risultati ───────────────────────────────────────────────────────
    case 'copy_risultati_primi':
      return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Field label="Pips / Profitto" name="pips_copy"   value={fields.pips_copy   ?? ''} onChange={setField} placeholder="+55" />
          <Field label="Operazioni"      name="trades_copy" value={fields.trades_copy ?? ''} onChange={setField} placeholder="2" />
          <Field label="Orario"          name="ora_copy"    value={fields.ora_copy    ?? ''} onChange={setField} placeholder="stamattina" />
          <Field label="Contesto"        name="ctx_copy"    value={fields.ctx_copy    ?? ''} onChange={setField} placeholder="Note..." />
        </div>
      );

    case 'copy_risultati_durante':
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Field label="Pips attuali"   name="pips_copy" value={fields.pips_copy ?? ''} onChange={setField} placeholder="+35" />
            <Field label="Ops in corso"   name="ops_copy"  value={fields.ops_copy  ?? ''} onChange={setField} placeholder="1" />
            <Field label="Profitto %"     name="perf_copy" value={fields.perf_copy ?? ''} onChange={setField} placeholder="+1.8%" />
          </div>
          <div className="space-y-1">
            <label className="block text-xs text-[var(--text3)] uppercase tracking-widest">Note (opz.)</label>
            <input value={fields.note_copy ?? ''} onChange={e => setField('note_copy', e.target.value)} placeholder="Direzione, notizia in arrivo..." />
          </div>
        </div>
      );

    case 'copy_risultati_conclusi':
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <Field label="Pips totali"  name="pips_copy"   value={fields.pips_copy   ?? ''} onChange={setField} placeholder="+98" />
            <Field label="Operazioni"   name="trades_copy" value={fields.trades_copy ?? ''} onChange={setField} placeholder="4" />
            <Field label="Performance"  name="perf_copy"   value={fields.perf_copy   ?? ''} onChange={setField} placeholder="+3.5%" />
          </div>
          <div className="space-y-1">
            <label className="block text-xs text-[var(--text3)] uppercase tracking-widest">Note giornata (opz.)</label>
            <input value={fields.note_copy ?? ''} onChange={e => setField('note_copy', e.target.value)} placeholder="Contesto mercato, commento sessione..." />
          </div>
        </div>
      );

    // ── Altri tipi ───────────────────────────────────────────────────────────
    case 'risultati_ieri':
      return (
        <div className="space-y-3">
          <div>
            <p className="text-[10px] text-[var(--text3)] uppercase tracking-widest mb-2">VIP Room</p>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Pips VIP"    name="vip_pips"    value={fields.vip_pips    ?? ''} onChange={setField} placeholder="85" />
              <Field label="Ops VIP"     name="vip_trades"  value={fields.vip_trades  ?? ''} onChange={setField} placeholder="5" />
              <Field label="Win Rate VIP" name="vip_winrate" value={fields.vip_winrate ?? ''} onChange={setField} placeholder="80%" />
            </div>
          </div>
          <div>
            <p className="text-[10px] text-[var(--text3)] uppercase tracking-widest mb-2">CopyTrading</p>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Pips Copy"   name="copy_pips"   value={fields.copy_pips  ?? ''} onChange={setField} placeholder="72" />
              <Field label="Ops Copy"    name="copy_trades" value={fields.copy_trades ?? ''} onChange={setField} placeholder="4" />
              <Field label="Performance" name="copy_perf"   value={fields.copy_perf  ?? ''} onChange={setField} placeholder="+3.2%" />
            </div>
          </div>
        </div>
      );

    case 'segnale_xauusd':
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="block text-xs text-[var(--text3)] uppercase tracking-widest">Direzione</label>
              <select value={fields.dir ?? 'BUY'} onChange={e => setField('dir', e.target.value)}>
                <option value="BUY">BUY 🟢</option>
                <option value="SELL">SELL 🔴</option>
              </select>
            </div>
            <Field label="Entry"       name="entry" value={fields.entry ?? ''} onChange={setField} placeholder="2345.00" />
            <Field label="Stop Loss"   name="sl"    value={fields.sl    ?? ''} onChange={setField} placeholder="2335.00" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="TP1" name="tp1" value={fields.tp1 ?? ''} onChange={setField} placeholder="2355" />
            <Field label="TP2" name="tp2" value={fields.tp2 ?? ''} onChange={setField} placeholder="2365" />
            <Field label="TP3" name="tp3" value={fields.tp3 ?? ''} onChange={setField} placeholder="2375" />
          </div>
        </div>
      );

    case 'risultato_segnale':
      return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="space-y-1">
            <label className="block text-xs text-[var(--text3)] uppercase tracking-widest">Esito</label>
            <select value={fields.result ?? 'WIN'} onChange={e => setField('result', e.target.value)}>
              <option value="WIN">WIN ✅</option>
              <option value="LOSS">LOSS ❌</option>
              <option value="BE">BREAK EVEN ⚖</option>
            </select>
          </div>
          <Field label="Entry"  name="entry" value={fields.entry ?? ''} onChange={setField} placeholder="2345" />
          <Field label="Uscita" name="exit"  value={fields.exit  ?? ''} onChange={setField} placeholder="2360" />
          <Field label="Pips"   name="pips"  value={fields.pips  ?? ''} onChange={setField} placeholder="+45" />
        </div>
      );

    case 'notizie_giorno':
      return (
        <div className="space-y-1">
          <label className="block text-xs text-[var(--text3)] uppercase tracking-widest">Note Aggiuntive (opz.)</label>
          <textarea
            className="w-full"
            value={fields.news ?? ''}
            placeholder="Note, eventi del giorno, dati macro..."
            rows={2}
            onChange={e => setField('news', e.target.value)}
          />
        </div>
      );

    case 'risultati_clienti':
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Descrizione Risultati" name="clienti" value={fields.clienti ?? ''} onChange={setField} placeholder="Profitti membri..." />
          <Field label="Periodo"               name="periodo" value={fields.periodo ?? ''} onChange={setField} placeholder="settimana / mese" />
        </div>
      );

    case 'aggiornamento':
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="block text-xs text-[var(--text3)] uppercase tracking-widest">Situazione</label>
            <select value={fields.status ?? 'in profitto'} onChange={e => setField('status', e.target.value)}>
              <option value="in profitto">In profitto ✅</option>
              <option value="in perdita">In perdita ⚠</option>
              <option value="breakeven">Breakeven ⚖</option>
              <option value="in attesa">In attesa ⏳</option>
            </select>
          </div>
          <Field label="Pips Attuali" name="pips"    value={fields.pips    ?? ''} onChange={setField} placeholder="+30" />
          <Field label="Note"         name="comment" value={fields.comment ?? ''} onChange={setField} placeholder="TP1 colpito..." />
        </div>
      );

    default:
      return null;
  }
}

export function GeneraSection() {
  const { config } = useApp();
  const { loading, elapsed, run } = useGemini();

  const [selectedType, setSelectedType] = useState(TYPES[0].id);
  const [subType, setSubType] = useState<ResultSubType>('primi');
  const [tone, setTone] = useState<Tone>('assertivo');
  const [fields, setFields] = useState<Record<string, string>>({});
  const [newsPhoto, setNewsPhoto] = useState<string | null>(null);
  const [newsPhotoPreview, setNewsPhotoPreview] = useState<string | null>(null);
  const [result, setResult] = useState({ it: '', en: '' });
  const [extraOpen, setExtraOpen] = useState(false);
  const [extraNote, setExtraNote] = useState('');

  const isResultsType = RESULT_PARENT_IDS.includes(selectedType);
  // Compose effective type ID: for result types, append sub-type
  const effectiveTypeId = isResultsType ? `${selectedType}_${subType}` : selectedType;

  const activeType = TYPES.find(t => t.id === selectedType)!;
  const needsPhoto = activeType?.shot;
  const showPhotoUpload = selectedType === 'notizie_giorno' || needsPhoto;

  function setField(k: string, v: string) {
    setFields(prev => ({ ...prev, [k]: v }));
  }

  function selectType(id: string) {
    setSelectedType(id);
    setResult({ it: '', en: '' });
    setFields({});
    setExtraOpen(false);
    setExtraNote('');
    if (!RESULT_PARENT_IDS.includes(id)) setSubType('primi');
  }

  async function handleGenerate() {
    const fieldsWithExtra = extraNote.trim()
      ? { ...fields, extra: extraNote.trim() }
      : fields;
    const prompt = buildPrompt(effectiveTypeId, config, tone, fieldsWithExtra, newsPhoto);
    if (!prompt) return;
    const text = await run(prompt, 0.88, newsPhoto ? newsPhoto : null);
    if (text) setResult(parseBilingual(text));
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="card">
        <div className="card-title flex items-center gap-1.5">
          <Zap size={14} /> Genera Messaggio
        </div>

        {/* Type grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-5">
          {TYPES.map(t => (
            <button
              key={t.id}
              onClick={() => selectType(t.id)}
              className={`type-card ${selectedType === t.id ? 'selected' : ''}`}
            >
              <span className="mb-1 flex justify-center text-[var(--gold)]">
                <Icon name={t.icon} size={18} strokeWidth={1.5} />
              </span>
              <span className="text-[10px] leading-tight text-center whitespace-pre-line">{t.name}</span>
              <span className="text-[9px] text-[var(--text3)] mt-0.5">{t.time}</span>
              {t.shot && (
                <span className="badge-photo text-[9px] mt-1 flex items-center gap-0.5">
                  <Camera size={9} /> Screenshot
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Type description */}
        {activeType?.desc && (
          <p className="text-xs text-[var(--text3)] leading-relaxed mb-4 px-0.5">
            {activeType.desc}
          </p>
        )}

        {/* Sub-type selector for result types */}
        {isResultsType && (
          <div className="mb-4">
            <div className="flex items-center gap-1.5 mb-2">
              {selectedType === 'vip_risultati'
                ? <Diamond size={12} className="text-[var(--gold)]" />
                : <Rocket  size={12} className="text-[var(--gold)]" />}
              <span className="text-xs text-[var(--text3)] uppercase tracking-widest font-semibold">
                {selectedType === 'vip_risultati' ? 'Sala VIP —' : 'CopyTrading —'} fase
              </span>
            </div>
            <div className="flex gap-2">
              {SUB_TYPES.map(s => (
                <button
                  key={s.id}
                  onClick={() => { setSubType(s.id); setFields({}); setResult({ it: '', en: '' }); }}
                  className={`flex-1 py-2 rounded-[var(--radius-sm)] text-xs font-semibold border transition-all
                    ${subType === s.id
                      ? 'bg-[rgba(254,153,32,0.15)] border-[rgba(254,153,32,0.4)] text-[var(--gold)]'
                      : 'border-[var(--bg3)] text-[var(--text3)] hover:border-[var(--bg4)] hover:text-[var(--text2)]'
                    }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tone */}
        <ToneSelector value={tone} onChange={setTone} />

        {/* Dynamic fields */}
        {!NO_FIELDS_MAIN.includes(effectiveTypeId) && (
          <div className="mt-4">
            <FieldsForType typeId={effectiveTypeId} fields={fields} setField={setField} />
          </div>
        )}

        {/* Photo upload */}
        {showPhotoUpload && (
          <div className="mt-4">
            <PhotoUploader
              label={selectedType === 'notizie_giorno' ? 'Foto Notizie / Calendario' : 'Screenshot Risultati'}
              preview={newsPhotoPreview}
              onPhoto={(b64) => {
                setNewsPhoto(b64);
                setNewsPhotoPreview(`data:image/jpeg;base64,${b64}`);
              }}
              onClear={() => { setNewsPhoto(null); setNewsPhotoPreview(null); }}
            />
          </div>
        )}

        {/* Optional extra note — all types */}
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
              <div className="mt-2 space-y-1">
                <textarea
                  className="w-full text-sm"
                  rows={2}
                  value={extraNote}
                  placeholder="Es: oggi abbiamo notizie alle 15:00 — costruisci hype attorno a quello..."
                  onChange={e => setExtraNote(e.target.value)}
                />
              </div>
            )}
          </div>

        <button
          className="btn-generate w-full mt-5"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="spinner" /> Generando... {elapsed}s
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Zap size={14} /> Genera{isResultsType ? ` — ${SUB_TYPES.find(s => s.id === subType)?.label}` : ` ${activeType?.name ?? ''}`}
            </span>
          )}
        </button>
      </div>

      {(result.it || result.en) && (
        <BilingualResult it={result.it} en={result.en} />
      )}
    </div>
  );
}
