import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useGemini } from '../hooks/useGemini';
import { ToneSelector } from '../components/ToneSelector';
import { PlanCard } from '../components/PlanCard';
import { buildAltPromptA, buildAltPromptB, parseBilingual, todayItalian } from '../services/prompts';
import {
  ALT_TYPES, ALT_TYPES_B, ALT_PLAN_INFO,
  ALT_NO_FIELDS_A, ALT_NO_FIELDS_B,
} from '../constants/data';
import { Icon, Diamond, Zap, Copy, Globe, Camera } from '../components/Icon';
import type { PlanCardData } from '../components/PlanCard';
import type { AltType, Tone } from '../types';

type AltPlan = 'A' | 'B';
type GenMode = 'single' | 'day';

function FieldsA({
  typeId, fields, setField,
}: { typeId: string; fields: Record<string, string>; setField: (k: string, v: string) => void }) {
  if (ALT_NO_FIELDS_A.includes(typeId)) return null;

  const f = (k: string) => fields[k] ?? '';
  const inp = (label: string, name: string, ph = '') => (
    <div className="space-y-1">
      <label className="block text-[10px] text-[var(--text3)] uppercase tracking-widest">{label}</label>
      <input type="text" value={f(name)} placeholder={ph} onChange={e => setField(name, e.target.value)} />
    </div>
  );

  if (typeId === 'alt_social_am') return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {inp('Feedback Membro', 'af_feedback', 'Un membro ha fatto profitto...')}
      {inp('Periodo', 'af_periodo', 'ieri / questa settimana')}
    </div>
  );

  if (typeId === 'alt_segnale') return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="block text-[10px] text-[var(--text3)] uppercase tracking-widest">Direzione</label>
          <select value={f('af_dir') || 'BUY'} onChange={e => setField('af_dir', e.target.value)}>
            <option value="BUY">BUY 🟢</option><option value="SELL">SELL 🔴</option>
          </select>
        </div>
        {inp('Entry', 'af_entry', '2345.00')}
        {inp('Stop Loss', 'af_sl', '2335.00')}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {inp('TP1', 'af_tp1', '2355')}
        {inp('TP2', 'af_tp2', '2365')}
        {inp('TP3 (opz.)', 'af_tp3', '2375')}
      </div>
    </div>
  );

  if (typeId === 'alt_update') return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {inp('Esito', 'af_esito', 'TP1 colpito')}
      {inp('Pips', 'af_pips', '+35')}
      {inp('Note', 'af_note', '')}
    </div>
  );

  if (typeId === 'alt_social_pm') return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {inp('Storia', 'af_storia', 'Un membro 9-5 ha fatto...')}
      {inp('Posti Rimasti', 'af_posti', '3')}
      {inp('Scadenza', 'af_scad', 'stasera')}
    </div>
  );

  if (typeId === 'alt_segnale2') return (
    <div className="space-y-3">
      <div className="space-y-1">
        <label className="block text-[10px] text-[var(--text3)] uppercase tracking-widest">Tipo</label>
        <div className="flex gap-2">
          {['segnale', 'recap'].map(t => (
            <button key={t} onClick={() => setField('af_tipo2', t)}
              className={`px-3 py-1.5 rounded-[var(--radius-sm)] text-xs border capitalize transition-colors
                ${f('af_tipo2') === t
                  ? 'bg-[rgba(254,153,32,0.15)] border-[rgba(254,153,32,0.4)] text-[var(--gold)]'
                  : 'border-[var(--bg3)] text-[var(--text3)]'
                }`}
            >{t}</button>
          ))}
        </div>
      </div>
      {f('af_tipo2') !== 'recap'
        ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="block text-[10px] text-[var(--text3)] uppercase tracking-widest">Dir.</label>
              <select value={f('af_dir2') || 'SELL'} onChange={e => setField('af_dir2', e.target.value)}>
                <option value="BUY">BUY</option><option value="SELL">SELL</option>
              </select>
            </div>
            {inp('Entry', 'af_entry2', '2360.00')}
            {inp('SL', 'af_sl2', '2370.00')}
            {inp('TP1', 'af_tp1b', '2350')}
          </div>
        )
        : inp('Note Recap', 'af_recap_note', 'Riepilogo trade di oggi...')
      }
    </div>
  );

  return null;
}

function FieldsB({
  typeId, fields, setField,
}: { typeId: string; fields: Record<string, string>; setField: (k: string, v: string) => void }) {
  if (ALT_NO_FIELDS_B.includes(typeId)) return null;

  const f = (k: string) => fields[k] ?? '';
  const inp = (label: string, name: string, ph = '') => (
    <div className="space-y-1">
      <label className="block text-[10px] text-[var(--text3)] uppercase tracking-widest">{label}</label>
      <input type="text" value={f(name)} placeholder={ph} onChange={e => setField(name, e.target.value)} />
    </div>
  );

  if (typeId === 'b_risultato') return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {inp('Nome Membro', 'bf_nome', 'Marco')}
      {inp('Risultato', 'bf_risultato', '+120 pips / +200€')}
      {inp('Dettaglio', 'bf_dettaglio', 'Lavoratore 9-5...')}
    </div>
  );

  if (typeId === 'b_carosello') return (
    <div className="space-y-3">
      {[1, 2, 3].map(n => (
        <div key={n} className="grid grid-cols-2 gap-3">
          {inp(`Feedback ${n}`, `bf_f${n}`, 'Risultato membro...')}
          {inp(`Chi ${n}`, `bf_c${n}`, 'membro')}
        </div>
      ))}
    </div>
  );

  if (typeId === 'b_recap_sett') return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {inp('Operazioni', 'bf_ops', '15')}
      {inp('Win', 'bf_win', '12')}
      {inp('Loss', 'bf_loss', '3')}
      {inp('Pips Totali', 'bf_pips', '+850')}
      {inp('Periodo', 'bf_periodo', 'settimana 24-28 Feb')}
      {inp('Note', 'bf_note', '')}
    </div>
  );

  if (typeId === 'b_lifestyle') return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {inp('Profilo', 'bf_profilo', 'un nostro membro')}
      {inp('Attività', 'bf_attivita', 'era al lavoro')}
      {inp('Risultato Copy', 'bf_outcome', '+80 pips chiusi')}
    </div>
  );

  return null;
}

export function AltPlanPanel() {
  const { config } = useApp();
  const { loading, elapsed, run } = useGemini();

  const [plan, setPlan] = useState<AltPlan>('A');
  const [mode, setMode] = useState<GenMode>('single');
  const [tone, setTone] = useState<Tone>('assertivo');
  const [selectedTypeId, setSelectedTypeId] = useState(ALT_TYPES[0].id);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [news, setNews] = useState('');
  const [mktCtx, setMktCtx] = useState('');
  const [singleResult, setSingleResult] = useState({ it: '', en: '' });
  const [dayResults, setDayResults] = useState<PlanCardData[]>([]);

  const types: AltType[] = plan === 'A' ? ALT_TYPES : ALT_TYPES_B;
  const planInfo = ALT_PLAN_INFO[plan];

  function setField(k: string, v: string) {
    setFields(prev => ({ ...prev, [k]: v }));
  }

  const ctx = () => ({ date: todayItalian(), news, mktCtx });

  const buildPrompt = (typeId: string) =>
    plan === 'A'
      ? buildAltPromptA(typeId, config, tone, fields, ctx())
      : buildAltPromptB(typeId, config, tone, fields, ctx());

  async function handleSingle() {
    const prompt = buildPrompt(selectedTypeId);
    if (!prompt) return;
    const text = await run(prompt);
    if (text) setSingleResult(parseBilingual(text));
  }

  async function handleDay() {
    setDayResults([]);
    const results: PlanCardData[] = [];
    for (const t of types) {
      const prompt = buildPrompt(t.id);
      if (!prompt) continue;
      const text = await run(prompt);
      if (!text) continue;
      const { it, en } = parseBilingual(text);
      results.push({ id: t.id, time: t.time, label: t.name.replace('\n', ' '), shot: t.shot, color: t.color, icon: t.icon, it, en });
      setDayResults([...results]);
    }
  }

  const activeType = types.find(t => t.id === selectedTypeId)!;

  return (
    <div className="space-y-5">
      {/* Plan selector */}
      <div className="card">
        <div className="card-title flex items-center gap-1.5">
          <Diamond size={14} /> Alternativa Piano
        </div>
        <div className="flex gap-2 mb-4">
          {(['A', 'B'] as AltPlan[]).map(p => (
            <button
              key={p}
              onClick={() => {
                setPlan(p);
                setSelectedTypeId(p === 'A' ? ALT_TYPES[0].id : ALT_TYPES_B[0].id);
                setDayResults([]);
                setSingleResult({ it: '', en: '' });
              }}
              className={`alt-plan-btn flex-1 ${plan === p ? 'active' : ''}`}
            >
              <span className="font-semibold">Piano {p}</span>
              <span className="block text-[10px] mt-0.5 opacity-70">
                {p === 'A' ? 'Con Free Signal' : 'Solo VIP/Clienti'}
              </span>
            </button>
          ))}
        </div>

        {/* Plan info */}
        <div className="bg-[var(--bg3)] rounded-[var(--radius-sm)] p-3 mb-4">
          <div className="text-xs font-medium text-[var(--gold)] mb-1">{planInfo.title}</div>
          <div className="text-xs text-[var(--text3)] leading-relaxed">{planInfo.desc}</div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {planInfo.slots.map((s, i) => (
              <span key={i} className="text-[9px] px-1.5 py-0.5 rounded border font-medium"
                style={{ background: s.bg, borderColor: s.border, color: s.color }}>
                {s.label}
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <button className={`alt-mode-btn ${mode === 'single' ? 'active' : ''}`} onClick={() => setMode('single')}>Singolo</button>
          <button className={`alt-mode-btn ${mode === 'day' ? 'active' : ''}`} onClick={() => setMode('day')}>Intera Giornata</button>
        </div>

        <ToneSelector value={tone} onChange={setTone} />

        {/* Type grid (single mode) */}
        {mode === 'single' && (
          <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-2">
            {types.map(t => (
              <button
                key={t.id}
                onClick={() => { setSelectedTypeId(t.id); setSingleResult({ it: '', en: '' }); }}
                className={`type-card ${selectedTypeId === t.id ? 'selected' : ''}`}
                style={selectedTypeId === t.id ? { borderColor: t.color + '60', background: t.color + '14' } : {}}
              >
                <span className="mb-1 flex justify-center" style={{ color: t.color }}>
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
        )}

        {/* Context */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-xs text-[var(--text3)] uppercase tracking-widest">Notizie Giorno</label>
            <input type="text" value={news} placeholder="CPI, Fed, NFP..." onChange={e => setNews(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="block text-xs text-[var(--text3)] uppercase tracking-widest">Contesto Mercato</label>
            <input type="text" value={mktCtx} placeholder="Gold area 2350..." onChange={e => setMktCtx(e.target.value)} />
          </div>
        </div>

        {/* Dynamic fields */}
        {mode === 'single' && (
          <div className="mt-4">
            {plan === 'A'
              ? <FieldsA typeId={selectedTypeId} fields={fields} setField={setField} />
              : <FieldsB typeId={selectedTypeId} fields={fields} setField={setField} />
            }
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
              <Zap size={14} /> Genera {activeType?.time} — {activeType?.name?.replace('\n', ' ')}
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Zap size={14} /> Genera Piano {plan} Completo ({types.length} slot)
            </span>
          )}
        </button>
      </div>

      {/* Single result */}
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

      {/* Day results */}
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
