import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useGemini } from '../hooks/useGemini';
import { ToneSelector } from '../components/ToneSelector';
import { PhotoUploader, MultiPhotoUploader } from '../components/PhotoUploader';
import { PlanCard } from '../components/PlanCard';
import { buildWkPrompt, parseBilingual, todayItalian } from '../services/prompts';
import {
  WK_TYPES_SAB, WK_TYPES_DOM, WK_NO_FIELDS,
} from '../constants/data';
import { Icon, Waves, Zap, Copy, Globe } from '../components/Icon';
import type { WkType, Tone } from '../types';
import type { PlanCardData } from '../components/PlanCard';

type WkDay = 'sabato' | 'domenica';
type GenMode = 'single' | 'day';

function WeekendFields({
  typeId, fields, setField,
  wkRecapPhotos, setWkRecapPhotos,
  wkSPPhotos, setWkSPPhotos,
  wkOutlookPhoto, setWkOutlookPhoto, setWkOutlookPreview, wkOutlookPreview,
}: {
  typeId: string;
  fields: Record<string, string>;
  setField: (k: string, v: string) => void;
  wkRecapPhotos: string[];
  setWkRecapPhotos: (p: string[]) => void;
  wkSPPhotos: string[];
  setWkSPPhotos: (p: string[]) => void;
  wkOutlookPhoto: string | null;
  setWkOutlookPhoto: (p: string | null) => void;
  wkOutlookPreview: string | null;
  setWkOutlookPreview: (p: string | null) => void;
}) {
  if (WK_NO_FIELDS.includes(typeId)) return null;

  const f = (k: string) => fields[k] ?? '';
  const inp = (label: string, name: string, ph = '') => (
    <div className="space-y-1">
      <label className="block text-[10px] text-[var(--text3)] uppercase tracking-widest">{label}</label>
      <input type="text" value={f(name)} placeholder={ph} onChange={e => setField(name, e.target.value)} />
    </div>
  );

  if (typeId === 'sab_recap') return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {inp('Prezzo Gold / Livello Chiave', 'wk_gold', '2345')}
        {inp('Note Aggiuntive', 'wk_tech', 'Analisi tecnica...')}
      </div>
      <MultiPhotoUploader
        label="Screenshot Notizie Settimana (Lun→Ven)"
        previews={wkRecapPhotos.map(b => `data:image/jpeg;base64,${b}`)}
        onPhotos={(b64s) => setWkRecapPhotos([...wkRecapPhotos, ...b64s])}
        onRemove={(i) => setWkRecapPhotos(wkRecapPhotos.filter((_, idx) => idx !== i))}
        max={5}
      />
    </div>
  );

  if (typeId === 'sab_offerta') return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {inp('Scadenza', 'wk_scad', 'domenica notte')}
      {inp('Note Offerta', 'wk_offerta_note', 'Accesso speciale...')}
    </div>
  );

  if (typeId === 'sab_risultati') return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {inp('Giorni Operativi', 'wk_giorni', 'Lun-Ven')}
      {inp('Pips Totali', 'wk_pips_tot', '+1300')}
      {inp('Operazioni', 'wk_ops', '12')}
      {inp('Note', 'wk_nota', '')}
    </div>
  );

  if (typeId === 'dom_outlook') return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {inp('Contesto Tecnico', 'wk_ctx_tech', 'Gold area 2350, supporto a...')}
        {inp('Calendario (testuale)', 'wk_cal_next', 'Lun: CPI USA 14:30...')}
        {inp('Scenario / Target', 'wk_target', '2380 / 2310')}
      </div>
      <PhotoUploader
        label="Screenshot Calendario Settimana Prossima"
        preview={wkOutlookPreview}
        onPhoto={(b64) => { setWkOutlookPhoto(b64); setWkOutlookPreview(`data:image/jpeg;base64,${b64}`); }}
        onClear={() => { setWkOutlookPhoto(null); setWkOutlookPreview(null); }}
      />
    </div>
  );

  if (typeId === 'dom_recap') return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {inp('VIP Room (€)', 'wk_vip_eur', '+3.998€')}
      {inp('VIP Room (%)', 'wk_vip_pct', '+7.31%')}
      {inp('VIP Note', 'wk_vip_note', '')}
      {inp('CopyTrading (€)', 'wk_copy_eur', '+329€')}
      {inp('CopyTrading (%)', 'wk_copy_pct', '+1.34%')}
      {inp('Copy Note', 'wk_copy_note', '')}
    </div>
  );

  if (typeId === 'dom_social_proof') return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {inp('Angolo', 'wk_sp_angle', 'fomo / prova sociale / numeri')}
        {inp('Contesto', 'wk_sp_note', 'Screenshot da clienti...')}
      </div>
      <MultiPhotoUploader
        label="Screenshot Risultati Clienti"
        previews={wkSPPhotos.map(b => `data:image/jpeg;base64,${b}`)}
        onPhotos={(b64s) => setWkSPPhotos([...wkSPPhotos, ...b64s])}
        onRemove={(i) => setWkSPPhotos(wkSPPhotos.filter((_, idx) => idx !== i))}
        max={4}
      />
    </div>
  );

  return null;
}

export function WeekendPanel() {
  const { config } = useApp();
  const { loading, elapsed, run } = useGemini();

  const [day, setDay] = useState<WkDay>('sabato');
  const [mode, setMode] = useState<GenMode>('single');
  const [tone, setTone] = useState<Tone>('assertivo');
  const [selectedTypeId, setSelectedTypeId] = useState(WK_TYPES_SAB[0].id);
  const [fields, setFields] = useState<Record<string, string>>({});

  const [wkRecapPhotos, setWkRecapPhotos] = useState<string[]>([]);
  const [wkSPPhotos, setWkSPPhotos] = useState<string[]>([]);
  const [wkOutlookPhoto, setWkOutlookPhoto] = useState<string | null>(null);
  const [wkOutlookPreview, setWkOutlookPreview] = useState<string | null>(null);

  const [singleResult, setSingleResult] = useState({ it: '', en: '' });
  const [dayResults, setDayResults] = useState<PlanCardData[]>([]);
  const [extraOpen, setExtraOpen] = useState(false);
  const [extraNote, setExtraNote] = useState('');

  const types: WkType[] = day === 'sabato' ? WK_TYPES_SAB : WK_TYPES_DOM;

  function setField(k: string, v: string) {
    setFields(prev => ({ ...prev, [k]: v }));
  }

  function buildP(typeId: string, withExtra = false): string | null {
    return buildWkPrompt(typeId, config, tone, fields, wkRecapPhotos, wkSPPhotos, wkOutlookPhoto, { date: todayItalian(), extra: withExtra ? extraNote.trim() : '' });
  }

  function photoForType(typeId: string): string | string[] | null {
    if (typeId === 'sab_recap' && wkRecapPhotos.length > 0) return wkRecapPhotos;
    if (typeId === 'dom_social_proof' && wkSPPhotos.length > 0) return wkSPPhotos;
    if (typeId === 'dom_outlook' && wkOutlookPhoto) return wkOutlookPhoto;
    return null;
  }

  async function handleSingle() {
    const prompt = buildP(selectedTypeId, true);
    if (!prompt) return;
    const text = await run(prompt, 0.88, photoForType(selectedTypeId));
    if (text) setSingleResult(parseBilingual(text));
  }

  async function handleDay() {
    setDayResults([]);
    const results: PlanCardData[] = [];
    for (const t of types) {
      const prompt = buildP(t.id);
      if (!prompt) continue;
      const text = await run(prompt, 0.88, photoForType(t.id));
      if (!text) continue;
      const { it, en } = parseBilingual(text);
      results.push({ id: t.id, time: t.time, label: t.name.replace('\n', ' '), shot: false, color: t.color, icon: t.icon, it, en });
      setDayResults([...results]);
    }
  }

  const activeType = types.find(t => t.id === selectedTypeId)!;

  return (
    <div className="space-y-5">
      <div className="card">
        <div className="card-title flex items-center gap-1.5">
          <Waves size={14} /> Weekend
        </div>

        {/* Day selector */}
        <div className="flex gap-2 mb-4">
          {(['sabato', 'domenica'] as WkDay[]).map(d => (
            <button key={d} onClick={() => {
              setDay(d);
              setSelectedTypeId(d === 'sabato' ? WK_TYPES_SAB[0].id : WK_TYPES_DOM[0].id);
              setSingleResult({ it: '', en: '' });
              setDayResults([]);
            }}
              className={`alt-plan-btn flex-1 capitalize ${day === d ? 'active' : ''}`}
            >{d}</button>
          ))}
        </div>

        <div className="flex gap-2 mb-4">
          <button className={`alt-mode-btn ${mode === 'single' ? 'active' : ''}`} onClick={() => setMode('single')}>Singolo</button>
          <button className={`alt-mode-btn ${mode === 'day' ? 'active' : ''}`} onClick={() => setMode('day')}>Intera Giornata</button>
        </div>

        <ToneSelector value={tone} onChange={setTone} />

        {/* Type grid */}
        {mode === 'single' && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {types.map(t => (
              <button key={t.id}
                onClick={() => { setSelectedTypeId(t.id); setSingleResult({ it: '', en: '' }); setExtraOpen(false); setExtraNote(''); }}
                className={`type-card ${selectedTypeId === t.id ? 'selected' : ''}`}
                style={selectedTypeId === t.id ? { borderColor: t.color + '60', background: t.color + '14' } : {}}
              >
                <span className="mb-1 flex justify-center" style={{ color: t.color }}>
                  <Icon name={t.icon} size={18} strokeWidth={1.5} />
                </span>
                <span className="text-[10px] leading-tight text-center whitespace-pre-line">{t.name}</span>
                <span className="text-[9px] text-[var(--text3)] mt-0.5">{t.time}</span>
              </button>
            ))}
          </div>
        )}

        {/* Fields */}
        <div className="mt-4">
          <WeekendFields
            typeId={mode === 'single' ? selectedTypeId : 'ALL'}
            fields={fields}
            setField={setField}
            wkRecapPhotos={wkRecapPhotos}
            setWkRecapPhotos={setWkRecapPhotos}
            wkSPPhotos={wkSPPhotos}
            setWkSPPhotos={setWkSPPhotos}
            wkOutlookPhoto={wkOutlookPhoto}
            setWkOutlookPhoto={setWkOutlookPhoto}
            wkOutlookPreview={wkOutlookPreview}
            setWkOutlookPreview={setWkOutlookPreview}
          />
        </div>

        {/* In day mode show all photo uploaders */}
        {mode === 'day' && (
          <div className="mt-4 space-y-4">
            {day === 'sabato' && (
              <MultiPhotoUploader
                label="Screenshot Notizie Settimana (per recap)"
                previews={wkRecapPhotos.map(b => `data:image/jpeg;base64,${b}`)}
                onPhotos={(b64s) => setWkRecapPhotos([...wkRecapPhotos, ...b64s])}
                onRemove={(i) => setWkRecapPhotos(wkRecapPhotos.filter((_, idx) => idx !== i))}
                max={5}
              />
            )}
            {day === 'domenica' && (
              <>
                <PhotoUploader
                  label="Screenshot Calendario Prossima Settimana (Outlook)"
                  preview={wkOutlookPreview}
                  onPhoto={(b64) => { setWkOutlookPhoto(b64); setWkOutlookPreview(`data:image/jpeg;base64,${b64}`); }}
                  onClear={() => { setWkOutlookPhoto(null); setWkOutlookPreview(null); }}
                />
                <MultiPhotoUploader
                  label="Screenshot Social Proof (Risultati Clienti)"
                  previews={wkSPPhotos.map(b => `data:image/jpeg;base64,${b}`)}
                  onPhotos={(b64s) => setWkSPPhotos([...wkSPPhotos, ...b64s])}
                  onRemove={(i) => setWkSPPhotos(wkSPPhotos.filter((_, idx) => idx !== i))}
                  max={4}
                />
              </>
            )}
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
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2"><span className="spinner" /> Generando... {elapsed}s</span>
          ) : mode === 'single' ? (
            <span className="flex items-center justify-center gap-2">
              <Zap size={14} /> Genera {activeType?.time}
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Zap size={14} /> Genera {day === 'sabato' ? 'Sabato' : 'Domenica'} Completo ({types.length} slot)
            </span>
          )}
        </button>
      </div>

      {mode === 'single' && (singleResult.it || singleResult.en) && (
        <div className="card animate-[slideUp_0.3s_ease]">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[var(--gold)]">
              <Icon name={activeType?.icon || ''} size={18} />
            </span>
            <span className="text-[var(--gold)] font-mono text-sm">{activeType?.time}</span>
            <span className="text-[var(--text2)] text-sm">{activeType?.name?.replace('\n', ' ')}</span>
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
            <span className="text-sm text-[var(--text2)]">{dayResults.length} / {types.length} slot</span>
            {loading && <span className="flex items-center gap-2 text-xs text-[var(--gold)]"><span className="mini-spinner" /> {elapsed}s</span>}
          </div>
          {dayResults.map((card, i) => <PlanCard key={card.id} card={card} index={i} />)}
        </div>
      )}
    </div>
  );
}
