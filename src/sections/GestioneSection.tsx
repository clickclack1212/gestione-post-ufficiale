import { useState } from 'react';
import { useGemini } from '../hooks/useGemini';
import { useApp } from '../context/AppContext';
import { Icon, Copy, Plus, X, Save, Music, Trash2 } from '../components/Icon';
import { getGestioneDB, saveGestioneDB } from '../services/storage';
import {
  buildNuovoServizioPrompt,
  buildSocialProofPrompt,
  buildPromemoriaPrompt,
  buildReferralPrompt,
} from '../services/gestionePrompts';
import type {
  ServizioItem, RecensioneItem, ReferralItem, GestioneDB,
  ToneVoice, PostVariant, PostBuilderType,
} from '../types';

// ── Telegram preview ───────────────────────────────────────────────────────
function parseTg(raw: string): string {
  return raw
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#5c9eff;text-decoration:none">$1</a>')
    .replace(/\n/g, '<br>');
}

function TelegramPreview({ text }: { text: string }) {
  if (!text) return null;
  return (
    <div style={{ background: '#17212b', borderRadius: 12, padding: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
      {/* mock header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#1db954', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>
          🎧
        </div>
        <div>
          <div style={{ color: '#fff', fontSize: 12, fontWeight: 600, lineHeight: 1.3 }}>Negozio Spotify</div>
          <div style={{ color: '#5d7a8a', fontSize: 10 }}>canale · 1.2k iscritti</div>
        </div>
      </div>
      {/* message bubble */}
      <div style={{ background: '#182533', borderRadius: '4px 10px 10px 10px', padding: '9px 11px', maxWidth: '100%' }}>
        <div
          style={{ color: '#e8e8e8', fontSize: 13.5, lineHeight: 1.65, fontFamily: 'system-ui, -apple-system, sans-serif', wordBreak: 'break-word' }}
          dangerouslySetInnerHTML={{ __html: parseTg(text) }}
        />
        <div style={{ color: '#5d7a8a', fontSize: 10, textAlign: 'right', marginTop: 5 }}>
          {new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })} ✓✓
        </div>
      </div>
    </div>
  );
}

// ── Builder type config ────────────────────────────────────────────────────
const BUILDER_TYPES: { id: PostBuilderType; emoji: string; label: string; desc: string }[] = [
  { id: 'nuovo_servizio', emoji: '🎵', label: 'Nuovo Servizio',       desc: 'Promuovi un servizio dal DB con prezzo e benefit' },
  { id: 'social_proof',   emoji: '⭐️', label: 'Social Proof',         desc: 'Post con recensioni reali dei clienti' },
  { id: 'promemoria',     emoji: '📢', label: 'Promemoria Giornaliero',desc: 'PayPal attivo, account disponibili, attivazione rapida' },
  { id: 'referral',       emoji: '🎁', label: 'Referral & Guadagno',  desc: 'Spiega il programma referral e il premio' },
];

// ── DB sub-tabs ────────────────────────────────────────────────────────────
type DbTab = 'servizi' | 'recensioni' | 'referral';
type View  = 'builder' | 'database' | 'note';

// ── Shared input class ─────────────────────────────────────────────────────
const inp = 'bg-[var(--bg3)] border border-[var(--bg3)] rounded px-2.5 py-1.5 text-sm text-[var(--text)] focus:border-[#1db954] focus:outline-none transition-colors w-full placeholder:text-[var(--text3)]';

// ── Main section ───────────────────────────────────────────────────────────
export function GestioneSection() {
  const [view, setView]     = useState<View>('builder');
  const [db, setDb]         = useState<GestioneDB>(getGestioneDB);
  const [dbTab, setDbTab]   = useState<DbTab>('servizi');

  // builder
  const [builderType, setBuilderType]       = useState<PostBuilderType | null>(null);
  const [selServizioId, setSelServizioId]   = useState('');
  const [selRecIds, setSelRecIds]           = useState<string[]>([]);
  const [selReferralId, setSelReferralId]   = useState('');
  const [toneVoice, setToneVoice]           = useState<ToneVoice>('aggressivo');
  const [variant, setVariant]               = useState<PostVariant>('hype');
  const [result, setResult]                 = useState('');
  const [copied, setCopied]                 = useState(false);

  // forms
  const [newS,   setNewS]   = useState({ nome: '', durata: '', prezzo: '', benefit: '', emoji: '🎧' });
  const [newR,   setNewR]   = useState({ nomeUtente: '', testo: '', servizioId: '', stelle: 5 });
  const [newRef, setNewRef] = useState({ obiettivo: '', condizione: '' });
  const [notes,  setNotes]  = useState(() => getGestioneDB().adminNotes || '');

  const { loading, elapsed, run } = useGemini();
  const { showToast } = useApp();

  // ── helpers ──────────────────────────────────────────────────────────────
  const persist = (updated: GestioneDB) => {
    setDb(updated);
    saveGestioneDB(updated);
  };

  const setBotHandle = (v: string) => persist({ ...db, botHandle: v });

  // ── generate ─────────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!builderType) { showToast('Seleziona prima un tipo di post', 'error'); return; }

    let prompt = '';

    if (builderType === 'nuovo_servizio') {
      const s = db.servizi.find(x => x.id === selServizioId);
      if (!s) { showToast('Seleziona un servizio dal database', 'error'); return; }
      prompt = buildNuovoServizioPrompt(s, db.botHandle, toneVoice, variant);

    } else if (builderType === 'social_proof') {
      const recs = db.recensioni.filter(r => selRecIds.includes(r.id));
      if (!recs.length) { showToast('Seleziona almeno una recensione', 'error'); return; }
      prompt = buildSocialProofPrompt(recs, db.botHandle, toneVoice, variant);

    } else if (builderType === 'promemoria') {
      prompt = buildPromemoriaPrompt(db.botHandle, toneVoice, variant);

    } else if (builderType === 'referral') {
      const ref = db.referral.find(x => x.id === selReferralId);
      if (!ref) { showToast('Seleziona un programma referral', 'error'); return; }
      prompt = buildReferralPrompt(ref.obiettivo, ref.condizione, db.botHandle, toneVoice, variant);
    }

    const text = await run(prompt, 0.88);
    if (text) setResult(text);
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    showToast('Post copiato! 📋', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  // ── DB actions ────────────────────────────────────────────────────────────
  const addServizio = () => {
    if (!newS.nome.trim()) return;
    const item: ServizioItem = {
      id: Date.now().toString(),
      nome: newS.nome.trim(),
      durata: newS.durata.trim(),
      prezzo: newS.prezzo.trim(),
      benefit: newS.benefit.split('\n').map(b => b.trim()).filter(Boolean),
      emoji: newS.emoji.trim() || '🎧',
    };
    persist({ ...db, servizi: [...db.servizi, item] });
    setNewS({ nome: '', durata: '', prezzo: '', benefit: '', emoji: '🎧' });
    showToast(`${item.emoji} ${item.nome} aggiunto`, 'success');
  };

  const removeServizio = (id: string) => persist({ ...db, servizi: db.servizi.filter(s => s.id !== id) });

  const addRecensione = () => {
    if (!newR.testo.trim()) return;
    const item: RecensioneItem = {
      id: Date.now().toString(),
      nomeUtente: newR.nomeUtente.trim() || undefined,
      testo: newR.testo.trim(),
      servizioId: newR.servizioId,
      stelle: newR.stelle,
    };
    persist({ ...db, recensioni: [...db.recensioni, item] });
    setNewR({ nomeUtente: '', testo: '', servizioId: '', stelle: 5 });
    showToast('Recensione aggiunta', 'success');
  };

  const removeRecensione = (id: string) => persist({ ...db, recensioni: db.recensioni.filter(r => r.id !== id) });

  const addReferral = () => {
    if (!newRef.obiettivo.trim()) return;
    const item: ReferralItem = {
      id: Date.now().toString(),
      obiettivo: newRef.obiettivo.trim(),
      condizione: newRef.condizione.trim(),
    };
    persist({ ...db, referral: [...db.referral, item] });
    setNewRef({ obiettivo: '', condizione: '' });
    showToast('Programma referral aggiunto', 'success');
  };

  const removeReferral = (id: string) => persist({ ...db, referral: db.referral.filter(r => r.id !== id) });

  const saveNotes = () => {
    persist({ ...db, adminNotes: notes });
    showToast('Note salvate ✓', 'success');
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4 pb-8">

      {/* Section header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(29,185,84,0.15)', border: '1px solid rgba(29,185,84,0.35)' }}>
            <Music size={15} style={{ color: '#1db954' }} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[var(--text)] leading-tight">Gestione Contenuti Spotify</h2>
            <p className="text-[10px] text-[var(--text3)]">Post builder per Telegram</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-[var(--text3)] shrink-0">Bot:</span>
          <input
            value={db.botHandle}
            onChange={e => setBotHandle(e.target.value)}
            className="text-xs bg-[var(--bg2)] border border-[var(--bg3)] rounded px-2 py-1 text-[var(--text2)] w-38 focus:border-[rgba(29,185,84,0.5)] focus:outline-none transition-colors"
            placeholder="@BotHandle"
          />
        </div>
      </div>

      {/* View tabs */}
      <div className="flex border border-[var(--bg3)] rounded-[var(--radius)] overflow-hidden">
        {([
          { id: 'builder',  label: '🏗️ Builder'     },
          { id: 'database', label: '🗃️ Database'     },
          { id: 'note',     label: '📝 Note Admin'   },
        ] as { id: View; label: string }[]).map(v => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            className={`flex-1 py-2.5 text-xs font-medium transition-colors
              ${view === v.id
                ? 'text-[#1db954] bg-[rgba(29,185,84,0.1)] border-b-2 border-[#1db954]'
                : 'text-[var(--text3)] hover:text-[var(--text2)] hover:bg-[var(--bg2)] border-b-2 border-transparent'
              }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* ═══════════ BUILDER ═══════════ */}
      {view === 'builder' && (
        <div className="space-y-5">

          {/* Tone of voice */}
          <div>
            <p className="text-[10px] text-[var(--text3)] uppercase tracking-wider mb-2">Tone of Voice</p>
            <div className="grid grid-cols-2 gap-2">
              {([
                { id: 'aggressivo', label: '🔥 Aggressivo / Vendita', hint: 'molte emoji, frasi brevi, FOMO', activeColor: 'rgba(239,68,68,0.15)', activeBorder: 'rgba(239,68,68,0.45)', activeText: '#ef4444' },
                { id: 'informativo', label: '📋 Informativo', hint: 'calmo, dettagliato, professionale', activeColor: 'rgba(59,130,246,0.15)', activeBorder: 'rgba(59,130,246,0.45)', activeText: '#3b82f6' },
              ] as const).map(t => (
                <button
                  key={t.id}
                  onClick={() => setToneVoice(t.id)}
                  className={`p-3 rounded-[var(--radius)] border text-left transition-all`}
                  style={toneVoice === t.id
                    ? { background: t.activeColor, borderColor: t.activeBorder, color: t.activeText }
                    : { background: 'var(--bg2)', borderColor: 'var(--bg3)', color: 'var(--text3)' }
                  }
                >
                  <div className="text-xs font-semibold">{t.label}</div>
                  <div className="text-[10px] opacity-70 mt-0.5">{t.hint}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Variant */}
          <div>
            <p className="text-[10px] text-[var(--text3)] uppercase tracking-wider mb-2">Variante Post</p>
            <div className="grid grid-cols-3 gap-2">
              {([
                { id: 'hype',  label: '🔥 Hype',      hint: 'Max energia' },
                { id: 'seria', label: '👔 Seria',      hint: 'Professionale' },
                { id: 'breve', label: '⚡️ Breve',     hint: '60-80 parole' },
              ] as const).map(v => (
                <button
                  key={v.id}
                  onClick={() => setVariant(v.id)}
                  className={`py-2.5 px-2 rounded-[var(--radius-sm)] border text-center transition-colors
                    ${variant === v.id
                      ? 'bg-[rgba(254,153,32,0.15)] border-[rgba(254,153,32,0.45)] text-[var(--gold)]'
                      : 'bg-[var(--bg2)] border-[var(--bg3)] text-[var(--text3)] hover:text-[var(--text2)]'
                    }`}
                >
                  <div className="text-xs font-semibold">{v.label}</div>
                  <div className="text-[9px] opacity-60 mt-0.5">{v.hint}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 4 builder cards */}
          <div>
            <p className="text-[10px] text-[var(--text3)] uppercase tracking-wider mb-2">Tipo di Post</p>
            <div className="grid grid-cols-2 gap-2.5">
              {BUILDER_TYPES.map(bt => (
                <button
                  key={bt.id}
                  onClick={() => { setBuilderType(bt.id); setResult(''); }}
                  className={`p-3.5 rounded-[var(--radius)] border text-left transition-all
                    ${builderType === bt.id
                      ? 'bg-[rgba(29,185,84,0.12)] border-[rgba(29,185,84,0.45)]'
                      : 'bg-[var(--bg2)] border-[var(--bg3)] hover:border-[rgba(29,185,84,0.2)] hover:bg-[rgba(29,185,84,0.04)]'
                    }`}
                >
                  <div className="text-2xl mb-1.5">{bt.emoji}</div>
                  <div className="text-xs font-semibold text-[var(--text)] leading-tight">{bt.label}</div>
                  <div className="text-[10px] text-[var(--text3)] mt-1 leading-snug">{bt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Context selectors */}
          {builderType === 'nuovo_servizio' && (
            <div>
              <label className="text-[10px] text-[var(--text3)] uppercase tracking-wider block mb-1.5">Seleziona Servizio</label>
              {db.servizi.length === 0 ? (
                <p className="text-xs text-[var(--text3)] bg-[var(--bg2)] rounded p-3 border border-[var(--bg3)]">
                  Nessun servizio nel database.{' '}
                  <button onClick={() => setView('database')} className="underline" style={{ color: '#1db954' }}>Aggiungine uno →</button>
                </p>
              ) : (
                <select
                  value={selServizioId}
                  onChange={e => setSelServizioId(e.target.value)}
                  className="bg-[var(--bg2)] border border-[var(--bg3)] rounded-[var(--radius-sm)] px-3 py-2 text-sm text-[var(--text)] w-full focus:outline-none focus:border-[#1db954] transition-colors"
                >
                  <option value="">— Scegli un servizio —</option>
                  {db.servizi.map(s => (
                    <option key={s.id} value={s.id}>{s.emoji} {s.nome} · {s.durata} · {s.prezzo}</option>
                  ))}
                </select>
              )}
            </div>
          )}

          {builderType === 'social_proof' && (
            <div>
              <label className="text-[10px] text-[var(--text3)] uppercase tracking-wider block mb-1.5">
                Seleziona Recensioni{selRecIds.length > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-full text-[9px] bg-[rgba(29,185,84,0.15)] text-[#1db954]">{selRecIds.length} selezionate</span>}
              </label>
              {db.recensioni.length === 0 ? (
                <p className="text-xs text-[var(--text3)] bg-[var(--bg2)] rounded p-3 border border-[var(--bg3)]">
                  Nessuna recensione.{' '}
                  <button onClick={() => { setView('database'); setDbTab('recensioni'); }} className="underline" style={{ color: '#1db954' }}>Aggiungine una →</button>
                </p>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
                  {db.recensioni.map(r => (
                    <label key={r.id} className="flex items-start gap-2.5 p-2.5 bg-[var(--bg2)] rounded-[var(--radius-sm)] border border-[var(--bg3)] cursor-pointer hover:border-[rgba(29,185,84,0.3)] transition-colors">
                      <input
                        type="checkbox"
                        checked={selRecIds.includes(r.id)}
                        onChange={e => setSelRecIds(prev =>
                          e.target.checked ? [...prev, r.id] : prev.filter(id => id !== r.id)
                        )}
                        className="mt-0.5 shrink-0 accent-[#1db954]"
                      />
                      <div className="min-w-0">
                        <div className="text-[10px] font-medium" style={{ color: '#f59e0b' }}>
                          {'⭐'.repeat(r.stelle)}{r.nomeUtente && <span className="text-[var(--text2)] ml-1">{r.nomeUtente}</span>}
                        </div>
                        <div className="text-xs text-[var(--text2)] mt-0.5 line-clamp-2">"{r.testo}"</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {builderType === 'referral' && (
            <div>
              <label className="text-[10px] text-[var(--text3)] uppercase tracking-wider block mb-1.5">Seleziona Programma Referral</label>
              {db.referral.length === 0 ? (
                <p className="text-xs text-[var(--text3)] bg-[var(--bg2)] rounded p-3 border border-[var(--bg3)]">
                  Nessun programma referral.{' '}
                  <button onClick={() => { setView('database'); setDbTab('referral'); }} className="underline" style={{ color: '#1db954' }}>Aggiungine uno →</button>
                </p>
              ) : (
                <select
                  value={selReferralId}
                  onChange={e => setSelReferralId(e.target.value)}
                  className="bg-[var(--bg2)] border border-[var(--bg3)] rounded-[var(--radius-sm)] px-3 py-2 text-sm text-[var(--text)] w-full focus:outline-none focus:border-[#1db954] transition-colors"
                >
                  <option value="">— Scegli un programma —</option>
                  {db.referral.map(r => (
                    <option key={r.id} value={r.id}>🎁 {r.obiettivo} · {r.condizione}</option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Generate button */}
          {builderType && (
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="btn-generate w-full"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="mini-spinner" />
                  Generando il post... {elapsed}s
                </span>
              ) : (
                `✨ Genera Post — ${variant === 'hype' ? '🔥 Hype' : variant === 'seria' ? '👔 Seria' : '⚡️ Breve'}`
              )}
            </button>
          )}

          {/* Result */}
          {result && !loading && (
            <div className="space-y-4 animate-[slideUp_0.3s_ease]">

              {/* Telegram preview */}
              <div>
                <p className="text-[10px] text-[var(--text3)] uppercase tracking-wider mb-2">📱 Anteprima Telegram</p>
                <TelegramPreview text={result} />
              </div>

              {/* Editable raw text + copy */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] text-[var(--text3)] uppercase tracking-wider">Testo Grezzo</p>
                  <button
                    onClick={handleCopy}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-[var(--radius-sm)] text-xs font-semibold border transition-colors
                      ${copied
                        ? 'bg-[rgba(29,185,84,0.2)] border-[rgba(29,185,84,0.5)] text-[#1db954]'
                        : 'bg-[var(--bg3)] border-[var(--bg3)] text-[var(--text2)] hover:border-[rgba(29,185,84,0.4)] hover:text-[#1db954]'
                      }`}
                  >
                    <Copy size={11} />
                    {copied ? '✓ Copiato!' : 'Copia negli Appunti'}
                  </button>
                </div>
                <textarea
                  value={result}
                  onChange={e => setResult(e.target.value)}
                  rows={9}
                  className="w-full bg-[var(--bg2)] border border-[var(--bg3)] rounded-[var(--radius)] px-3 py-3 text-sm text-[var(--text)] resize-y focus:border-[rgba(29,185,84,0.4)] focus:outline-none font-mono leading-relaxed"
                />
                <p className="text-[10px] text-[var(--text3)] mt-1">Puoi modificare il testo prima di copiarlo</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════ DATABASE ═══════════ */}
      {view === 'database' && (
        <div className="space-y-4">

          {/* DB sub-tabs */}
          <div className="flex gap-2">
            {([
              { id: 'servizi',    label: '📦 Servizi',    count: db.servizi.length    },
              { id: 'recensioni', label: '⭐️ Recensioni', count: db.recensioni.length },
              { id: 'referral',   label: '🎁 Referral',   count: db.referral.length   },
            ] as { id: DbTab; label: string; count: number }[]).map(t => (
              <button
                key={t.id}
                onClick={() => setDbTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-medium border transition-colors
                  ${dbTab === t.id
                    ? 'bg-[rgba(29,185,84,0.15)] border-[rgba(29,185,84,0.4)] text-[#1db954]'
                    : 'bg-[var(--bg2)] border-[var(--bg3)] text-[var(--text3)] hover:text-[var(--text2)]'
                  }`}
              >
                {t.label}
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${dbTab === t.id ? 'bg-[rgba(29,185,84,0.2)] text-[#1db954]' : 'bg-[var(--bg3)] text-[var(--text3)]'}`}>
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          {/* ── SERVIZI ── */}
          {dbTab === 'servizi' && (
            <div className="space-y-3">
              {db.servizi.length === 0 && (
                <p className="text-xs text-[var(--text3)] text-center py-4">Nessun servizio — aggiungine uno qui sotto.</p>
              )}
              {db.servizi.map(s => (
                <div key={s.id} className="card flex items-start gap-3">
                  <div className="text-2xl shrink-0 leading-none mt-0.5">{s.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[var(--text)]">{s.nome}</div>
                    <div className="text-[11px] text-[var(--text3)] mt-0.5">{s.durata} · <span style={{ color: '#1db954' }}>{s.prezzo}</span></div>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {s.benefit.map((b, i) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(29,185,84,0.1)', border: '1px solid rgba(29,185,84,0.2)', color: '#1db954' }}>{b}</span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => removeServizio(s.id)}
                    className="p-1.5 rounded text-[var(--text3)] hover:text-[var(--red)] hover:bg-[rgba(239,68,68,0.08)] transition-colors shrink-0"
                    title="Elimina"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}

              {/* Add form */}
              <div className="card space-y-3" style={{ borderStyle: 'dashed', borderColor: 'rgba(29,185,84,0.3)' }}>
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#1db954' }}>
                  <Plus size={10} className="inline mr-1" />
                  Nuovo Servizio
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <input className={inp} placeholder="Emoji (es. 🎧)" value={newS.emoji} onChange={e => setNewS(p => ({ ...p, emoji: e.target.value }))} />
                  <input className={inp} placeholder="Nome servizio *" value={newS.nome} onChange={e => setNewS(p => ({ ...p, nome: e.target.value }))} />
                  <input className={inp} placeholder="Durata (es. 12 mesi)" value={newS.durata} onChange={e => setNewS(p => ({ ...p, durata: e.target.value }))} />
                  <input className={inp} placeholder="Prezzo (es. 30€)" value={newS.prezzo} onChange={e => setNewS(p => ({ ...p, prezzo: e.target.value }))} />
                </div>
                <textarea
                  className={`${inp} resize-none`}
                  rows={3}
                  placeholder={'Benefit (uno per riga):\nNessuna pubblicità\nAscolto offline\nQualità massima'}
                  value={newS.benefit}
                  onChange={e => setNewS(p => ({ ...p, benefit: e.target.value }))}
                />
                <button
                  onClick={addServizio}
                  disabled={!newS.nome.trim()}
                  className="w-full py-2 rounded-[var(--radius-sm)] text-xs font-medium transition-colors disabled:opacity-40"
                  style={{ background: 'rgba(29,185,84,0.15)', border: '1px solid rgba(29,185,84,0.4)', color: '#1db954' }}
                >
                  <Plus size={11} className="inline mr-1" />
                  Aggiungi Servizio
                </button>
              </div>
            </div>
          )}

          {/* ── RECENSIONI ── */}
          {dbTab === 'recensioni' && (
            <div className="space-y-3">
              {db.recensioni.length === 0 && (
                <p className="text-xs text-[var(--text3)] text-center py-4">Nessuna recensione — aggiungine una qui sotto.</p>
              )}
              {db.recensioni.map(r => (
                <div key={r.id} className="card flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs" style={{ color: '#f59e0b' }}>{'⭐'.repeat(r.stelle)}</span>
                      {r.nomeUtente && <span className="text-xs font-medium text-[var(--text)]">{r.nomeUtente}</span>}
                      {r.servizioId && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(29,185,84,0.1)', color: '#1db954' }}>
                          {db.servizi.find(s => s.id === r.servizioId)?.nome ?? '—'}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[var(--text2)] mt-1 leading-relaxed">❝{r.testo}❞</div>
                  </div>
                  <button onClick={() => removeRecensione(r.id)} className="p-1.5 rounded text-[var(--text3)] hover:text-[var(--red)] hover:bg-[rgba(239,68,68,0.08)] transition-colors shrink-0"><Trash2 size={13} /></button>
                </div>
              ))}

              {/* Add form */}
              <div className="card space-y-3" style={{ borderStyle: 'dashed', borderColor: 'rgba(245,158,11,0.3)' }}>
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#f59e0b' }}>
                  <Plus size={10} className="inline mr-1" />
                  Nuova Recensione
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <input className={inp} placeholder="Nome utente (opzionale)" value={newR.nomeUtente} onChange={e => setNewR(p => ({ ...p, nomeUtente: e.target.value }))} />
                  <select
                    value={newR.servizioId}
                    onChange={e => setNewR(p => ({ ...p, servizioId: e.target.value }))}
                    className="bg-[var(--bg3)] border border-[var(--bg3)] rounded px-2.5 py-1.5 text-sm text-[var(--text)] focus:outline-none w-full"
                  >
                    <option value="">— Servizio (opzionale) —</option>
                    {db.servizi.map(s => <option key={s.id} value={s.id}>{s.emoji} {s.nome}</option>)}
                  </select>
                </div>
                {/* Stars picker */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--text3)]">Stelle:</span>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setNewR(p => ({ ...p, stelle: n }))} className="text-lg transition-transform hover:scale-110" style={{ opacity: n <= newR.stelle ? 1 : 0.25 }}>⭐</button>
                  ))}
                </div>
                <textarea
                  className={`${inp} resize-none`}
                  rows={3}
                  placeholder="Testo della recensione *"
                  value={newR.testo}
                  onChange={e => setNewR(p => ({ ...p, testo: e.target.value }))}
                />
                <button
                  onClick={addRecensione}
                  disabled={!newR.testo.trim()}
                  className="w-full py-2 rounded-[var(--radius-sm)] text-xs font-medium transition-colors disabled:opacity-40"
                  style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.4)', color: '#f59e0b' }}
                >
                  <Plus size={11} className="inline mr-1" />
                  Aggiungi Recensione
                </button>
              </div>
            </div>
          )}

          {/* ── REFERRAL ── */}
          {dbTab === 'referral' && (
            <div className="space-y-3">
              {db.referral.length === 0 && (
                <p className="text-xs text-[var(--text3)] text-center py-4">Nessun programma referral — aggiungine uno qui sotto.</p>
              )}
              {db.referral.map(r => (
                <div key={r.id} className="card flex items-start gap-3">
                  <div className="text-xl shrink-0 leading-none mt-0.5">🎁</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[var(--text)]">{r.obiettivo}</div>
                    <div className="text-xs text-[var(--text3)] mt-0.5">{r.condizione}</div>
                  </div>
                  <button onClick={() => removeReferral(r.id)} className="p-1.5 rounded text-[var(--text3)] hover:text-[var(--red)] hover:bg-[rgba(239,68,68,0.08)] transition-colors shrink-0"><Trash2 size={13} /></button>
                </div>
              ))}

              {/* Add form */}
              <div className="card space-y-3" style={{ borderStyle: 'dashed', borderColor: 'rgba(168,85,247,0.3)' }}>
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#a855f7' }}>
                  <Plus size={10} className="inline mr-1" />
                  Nuovo Programma Referral
                </p>
                <input className={inp} placeholder="Obiettivo/Premio (es. Buono Amazon 10€) *" value={newRef.obiettivo} onChange={e => setNewRef(p => ({ ...p, obiettivo: e.target.value }))} />
                <input className={inp} placeholder="Condizione (es. Porta 5 amici)" value={newRef.condizione} onChange={e => setNewRef(p => ({ ...p, condizione: e.target.value }))} />
                <button
                  onClick={addReferral}
                  disabled={!newRef.obiettivo.trim()}
                  className="w-full py-2 rounded-[var(--radius-sm)] text-xs font-medium transition-colors disabled:opacity-40"
                  style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.4)', color: '#a855f7' }}
                >
                  <Plus size={11} className="inline mr-1" />
                  Aggiungi Programma
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════ NOTE ADMIN ═══════════ */}
      {view === 'note' && (
        <div className="space-y-3">
          <p className="text-xs text-[var(--text3)] bg-[var(--bg2)] rounded p-3 border border-[var(--bg3)] leading-relaxed">
            📝 Spazio privato per idee, promemoria e piani futuri per il canale. Salvato in localStorage.
          </p>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder={'Idee per post futuri...\n\n• Fare post su Crunchyroll lunedì\n• Testare offerta 2+1 su Spotify Family\n• Chiedere a Marco una recensione\n• Promo Black Friday — preparare 3 varianti'}
            rows={16}
            className="w-full bg-[var(--bg2)] border border-[var(--bg3)] rounded-[var(--radius)] px-4 py-3 text-sm text-[var(--text)] resize-y focus:border-[rgba(29,185,84,0.4)] focus:outline-none font-mono leading-relaxed transition-colors"
          />
          <button
            onClick={saveNotes}
            className="flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-sm)] text-xs font-medium transition-colors"
            style={{ background: 'rgba(29,185,84,0.15)', border: '1px solid rgba(29,185,84,0.4)', color: '#1db954' }}
          >
            <Save size={12} />
            Salva Note
          </button>
        </div>
      )}
    </div>
  );
}
