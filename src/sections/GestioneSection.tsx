import { useState } from 'react';
import { useGemini } from '../hooks/useGemini';
import { useApp } from '../context/AppContext';
import {
  Icon,
  Copy, Plus, Save, Music, Trash2, Star, Gift, Bell, Flame,
  Sparkles, Zap, Shield, Package, Layers, StickyNote, Smartphone,
  BookOpen, MessageCircle,
} from '../components/Icon';
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#1db954', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Music size={14} color="#fff" />
        </div>
        <div>
          <div style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>Negozio Spotify</div>
          <div style={{ color: '#5d7a8a', fontSize: 10 }}>canale · 1.2k iscritti</div>
        </div>
      </div>
      <div style={{ background: '#182533', borderRadius: '4px 10px 10px 10px', padding: '9px 11px' }}>
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
const BUILDER_TYPES: { id: PostBuilderType; icon: string; label: string; desc: string }[] = [
  { id: 'nuovo_servizio', icon: 'Music',          label: 'Nuovo Servizio',        desc: 'Promuovi un servizio dal DB con prezzo e benefit' },
  { id: 'social_proof',   icon: 'MessageCircle',  label: 'Social Proof',          desc: 'Post con recensioni reali dei clienti' },
  { id: 'promemoria',     icon: 'Bell',           label: 'Promemoria Giornaliero',desc: 'PayPal attivo, account disponibili, attivazione rapida' },
  { id: 'referral',       icon: 'Gift',           label: 'Referral & Guadagno',   desc: 'Spiega il programma referral e il premio' },
];

// ── Shared input class ─────────────────────────────────────────────────────
const inp = 'bg-[var(--bg3)] border border-[var(--bg3)] rounded px-2.5 py-1.5 text-sm text-[var(--text)] focus:border-[var(--gold)] focus:outline-none transition-colors w-full placeholder:text-[var(--text3)]';

type DbTab = 'servizi' | 'recensioni' | 'referral';
type View  = 'builder' | 'database' | 'note';

// ── Stars display ──────────────────────────────────────────────────────────
function Stars({ count, total = 5, size = 11 }: { count: number; total?: number; size?: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: total }).map((_, i) => (
        <Star
          key={i}
          size={size}
          strokeWidth={1.5}
          className={i < count ? 'text-[var(--gold)]' : 'text-[var(--bg3)]'}
          fill={i < count ? 'var(--gold)' : 'none'}
        />
      ))}
    </span>
  );
}

// ── Main section ───────────────────────────────────────────────────────────
export function GestioneSection() {
  const [view, setView]   = useState<View>('builder');
  const [db, setDb]       = useState<GestioneDB>(getGestioneDB);
  const [dbTab, setDbTab] = useState<DbTab>('servizi');

  // builder
  const [builderType, setBuilderType]     = useState<PostBuilderType | null>(null);
  const [selServizioId, setSelServizioId] = useState('');
  const [selRecIds, setSelRecIds]         = useState<string[]>([]);
  const [selReferralId, setSelReferralId] = useState('');
  const [toneVoice, setToneVoice]         = useState<ToneVoice>('aggressivo');
  const [variant, setVariant]             = useState<PostVariant>('hype');
  const [result, setResult]               = useState('');
  const [copied, setCopied]               = useState(false);

  // forms
  const [newS,   setNewS]   = useState({ nome: '', durata: '', prezzo: '', benefit: '', emoji: '🎧' });
  const [newR,   setNewR]   = useState({ nomeUtente: '', testo: '', servizioId: '', stelle: 5 });
  const [newRef, setNewRef] = useState({ obiettivo: '', condizione: '' });
  const [notes,  setNotes]  = useState(() => getGestioneDB().adminNotes || '');

  const { loading, elapsed, run } = useGemini();
  const { showToast } = useApp();

  const persist = (updated: GestioneDB) => { setDb(updated); saveGestioneDB(updated); };
  const setBotHandle = (v: string) => persist({ ...db, botHandle: v });

  // ── Generate ──────────────────────────────────────────────────────────────
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
    showToast('Post copiato negli appunti', 'success');
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
    showToast(`${item.nome} aggiunto`, 'success');
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
    showToast('Note salvate', 'success');
  };

  // ── VIEW TABS config ──────────────────────────────────────────────────────
  const viewTabs: { id: View; icon: string; label: string }[] = [
    { id: 'builder',  icon: 'Sparkles',   label: 'Builder'    },
    { id: 'database', icon: 'Layers',     label: 'Database'   },
    { id: 'note',     icon: 'StickyNote', label: 'Note Admin' },
  ];

  // ── DB TABS config ─────────────────────────────────────────────────────────
  const dbTabs: { id: DbTab; icon: string; label: string; count: number }[] = [
    { id: 'servizi',    icon: 'Package',         label: 'Servizi',    count: db.servizi.length    },
    { id: 'recensioni', icon: 'Star',            label: 'Recensioni', count: db.recensioni.length },
    { id: 'referral',   icon: 'Gift',            label: 'Referral',   count: db.referral.length   },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4 pb-8">

      {/* Section header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-[var(--bg3)] border border-[var(--bg3)]">
            <Music size={15} className="text-[var(--text2)]" />
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
            className="text-xs bg-[var(--bg2)] border border-[var(--bg3)] rounded px-2 py-1 text-[var(--text2)] focus:border-[var(--gold)] focus:outline-none transition-colors"
            style={{ width: 160 }}
            placeholder="@BotHandle"
          />
        </div>
      </div>

      {/* View tabs */}
      <div className="flex border border-[var(--bg3)] rounded-[var(--radius)] overflow-hidden">
        {viewTabs.map(v => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors border-b-2
              ${view === v.id
                ? 'text-[var(--gold)] bg-[rgba(254,153,32,0.08)] border-[var(--gold)]'
                : 'text-[var(--text3)] hover:text-[var(--text2)] hover:bg-[var(--bg2)] border-transparent'
              }`}
          >
            <Icon name={v.icon} size={13} />
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
              <button
                onClick={() => setToneVoice('aggressivo')}
                className={`flex items-center gap-2 p-3 rounded-[var(--radius)] border text-left transition-all
                  ${toneVoice === 'aggressivo'
                    ? 'bg-[rgba(239,68,68,0.1)] border-[rgba(239,68,68,0.4)] text-[var(--red)]'
                    : 'bg-[var(--bg2)] border-[var(--bg3)] text-[var(--text3)] hover:text-[var(--text2)]'
                  }`}
              >
                <Flame size={16} className="shrink-0" />
                <div>
                  <div className="text-xs font-semibold">Aggressivo / Vendita</div>
                  <div className="text-[10px] opacity-70">molte emoji, frasi brevi, FOMO</div>
                </div>
              </button>
              <button
                onClick={() => setToneVoice('informativo')}
                className={`flex items-center gap-2 p-3 rounded-[var(--radius)] border text-left transition-all
                  ${toneVoice === 'informativo'
                    ? 'bg-[rgba(59,130,246,0.1)] border-[rgba(59,130,246,0.4)] text-[#3b82f6]'
                    : 'bg-[var(--bg2)] border-[var(--bg3)] text-[var(--text3)] hover:text-[var(--text2)]'
                  }`}
              >
                <BookOpen size={16} className="shrink-0" />
                <div>
                  <div className="text-xs font-semibold">Informativo</div>
                  <div className="text-[10px] opacity-70">calmo, dettagliato, professionale</div>
                </div>
              </button>
            </div>
          </div>

          {/* Variant */}
          <div>
            <p className="text-[10px] text-[var(--text3)] uppercase tracking-wider mb-2">Variante Post</p>
            <div className="grid grid-cols-3 gap-2">
              {([
                { id: 'hype',  icon: <Flame    size={13} />, label: 'Hype',  hint: 'Max energia' },
                { id: 'seria', icon: <Shield   size={13} />, label: 'Seria', hint: 'Professionale' },
                { id: 'breve', icon: <Zap      size={13} />, label: 'Breve', hint: '60-80 parole' },
              ] as const).map(v => (
                <button
                  key={v.id}
                  onClick={() => setVariant(v.id)}
                  className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-[var(--radius-sm)] border text-center transition-colors
                    ${variant === v.id
                      ? 'bg-[rgba(254,153,32,0.12)] border-[rgba(254,153,32,0.4)] text-[var(--gold)]'
                      : 'bg-[var(--bg2)] border-[var(--bg3)] text-[var(--text3)] hover:text-[var(--text2)]'
                    }`}
                >
                  {v.icon}
                  <div className="text-xs font-semibold">{v.label}</div>
                  <div className="text-[9px] opacity-60">{v.hint}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 4 builder type cards */}
          <div>
            <p className="text-[10px] text-[var(--text3)] uppercase tracking-wider mb-2">Tipo di Post</p>
            <div className="grid grid-cols-2 gap-2.5">
              {BUILDER_TYPES.map(bt => (
                <button
                  key={bt.id}
                  onClick={() => { setBuilderType(bt.id); setResult(''); }}
                  className={`p-3.5 rounded-[var(--radius)] border text-left transition-all
                    ${builderType === bt.id
                      ? 'bg-[rgba(254,153,32,0.08)] border-[rgba(254,153,32,0.4)]'
                      : 'bg-[var(--bg2)] border-[var(--bg3)] hover:border-[rgba(254,153,32,0.2)] hover:bg-[rgba(254,153,32,0.04)]'
                    }`}
                >
                  <Icon
                    name={bt.icon}
                    size={18}
                    className={`mb-2 ${builderType === bt.id ? 'text-[var(--gold)]' : 'text-[var(--text3)]'}`}
                  />
                  <div className={`text-xs font-semibold leading-tight ${builderType === bt.id ? 'text-[var(--gold)]' : 'text-[var(--text)]'}`}>{bt.label}</div>
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
                  <button onClick={() => setView('database')} className="text-[var(--gold)] underline">Aggiungine uno →</button>
                </p>
              ) : (
                <select
                  value={selServizioId}
                  onChange={e => setSelServizioId(e.target.value)}
                  className="bg-[var(--bg2)] border border-[var(--bg3)] rounded-[var(--radius-sm)] px-3 py-2 text-sm text-[var(--text)] w-full focus:outline-none focus:border-[var(--gold)] transition-colors"
                >
                  <option value="">— Scegli un servizio —</option>
                  {db.servizi.map(s => (
                    <option key={s.id} value={s.id}>{s.nome} · {s.durata} · {s.prezzo}</option>
                  ))}
                </select>
              )}
            </div>
          )}

          {builderType === 'social_proof' && (
            <div>
              <label className="text-[10px] text-[var(--text3)] uppercase tracking-wider block mb-1.5">
                Seleziona Recensioni
                {selRecIds.length > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] bg-[rgba(254,153,32,0.1)] text-[var(--gold)] border border-[rgba(254,153,32,0.2)]">
                    {selRecIds.length} selezionate
                  </span>
                )}
              </label>
              {db.recensioni.length === 0 ? (
                <p className="text-xs text-[var(--text3)] bg-[var(--bg2)] rounded p-3 border border-[var(--bg3)]">
                  Nessuna recensione.{' '}
                  <button onClick={() => { setView('database'); setDbTab('recensioni'); }} className="text-[var(--gold)] underline">Aggiungine una →</button>
                </p>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {db.recensioni.map(r => (
                    <label key={r.id} className="flex items-start gap-2.5 p-2.5 bg-[var(--bg2)] rounded-[var(--radius-sm)] border border-[var(--bg3)] cursor-pointer hover:border-[rgba(254,153,32,0.25)] transition-colors">
                      <input
                        type="checkbox"
                        checked={selRecIds.includes(r.id)}
                        onChange={e => setSelRecIds(prev =>
                          e.target.checked ? [...prev, r.id] : prev.filter(id => id !== r.id)
                        )}
                        className="mt-0.5 shrink-0 accent-[var(--gold)]"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Stars count={r.stelle} size={10} />
                          {r.nomeUtente && <span className="text-xs font-medium text-[var(--text)]">{r.nomeUtente}</span>}
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
                  <button onClick={() => { setView('database'); setDbTab('referral'); }} className="text-[var(--gold)] underline">Aggiungine uno →</button>
                </p>
              ) : (
                <select
                  value={selReferralId}
                  onChange={e => setSelReferralId(e.target.value)}
                  className="bg-[var(--bg2)] border border-[var(--bg3)] rounded-[var(--radius-sm)] px-3 py-2 text-sm text-[var(--text)] w-full focus:outline-none focus:border-[var(--gold)] transition-colors"
                >
                  <option value="">— Scegli un programma —</option>
                  {db.referral.map(r => (
                    <option key={r.id} value={r.id}>{r.obiettivo} · {r.condizione}</option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Generate */}
          {builderType && (
            <button onClick={handleGenerate} disabled={loading} className="btn-generate w-full">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="mini-spinner" />
                  Generando il post... {elapsed}s
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Sparkles size={14} />
                  Genera Post — {variant === 'hype' ? 'Hype' : variant === 'seria' ? 'Seria' : 'Breve'}
                </span>
              )}
            </button>
          )}

          {/* Result */}
          {result && !loading && (
            <div className="space-y-4 animate-[slideUp_0.3s_ease]">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] text-[var(--text3)] uppercase tracking-wider mb-2">
                  <Smartphone size={11} />
                  Anteprima Telegram
                </div>
                <TelegramPreview text={result} />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] text-[var(--text3)] uppercase tracking-wider">Testo Grezzo</p>
                  <button
                    onClick={handleCopy}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-[var(--radius-sm)] text-xs font-semibold border transition-colors
                      ${copied
                        ? 'bg-[rgba(254,153,32,0.12)] border-[rgba(254,153,32,0.4)] text-[var(--gold)]'
                        : 'bg-[var(--bg3)] border-[var(--bg3)] text-[var(--text2)] hover:border-[rgba(254,153,32,0.35)] hover:text-[var(--gold)]'
                      }`}
                  >
                    <Copy size={11} />
                    {copied ? 'Copiato' : 'Copia negli Appunti'}
                  </button>
                </div>
                <textarea
                  value={result}
                  onChange={e => setResult(e.target.value)}
                  rows={9}
                  className="w-full bg-[var(--bg2)] border border-[var(--bg3)] rounded-[var(--radius)] px-3 py-3 text-sm text-[var(--text)] resize-y focus:border-[rgba(254,153,32,0.35)] focus:outline-none font-mono leading-relaxed"
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
          <div className="flex gap-2">
            {dbTabs.map(t => (
              <button
                key={t.id}
                onClick={() => setDbTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-medium border transition-colors
                  ${dbTab === t.id
                    ? 'bg-[rgba(254,153,32,0.1)] border-[rgba(254,153,32,0.35)] text-[var(--gold)]'
                    : 'bg-[var(--bg2)] border-[var(--bg3)] text-[var(--text3)] hover:text-[var(--text2)]'
                  }`}
              >
                <Icon name={t.icon} size={12} />
                {t.label}
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${dbTab === t.id ? 'bg-[rgba(254,153,32,0.15)] text-[var(--gold)]' : 'bg-[var(--bg3)] text-[var(--text3)]'}`}>
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
                  <div className="w-8 h-8 rounded flex items-center justify-center shrink-0 bg-[var(--bg3)]">
                    <Package size={15} className="text-[var(--text2)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[var(--text)]">{s.nome}</div>
                    <div className="text-[11px] text-[var(--text3)] mt-0.5">{s.durata} · <span className="text-[var(--gold)]">{s.prezzo}</span></div>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {s.benefit.map((b, i) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--bg3)] text-[var(--text2)] border border-[var(--bg3)]">{b}</span>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => removeServizio(s.id)} className="p-1.5 rounded text-[var(--text3)] hover:text-[var(--red)] hover:bg-[rgba(239,68,68,0.08)] transition-colors shrink-0">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}

              <div className="card space-y-3" style={{ borderStyle: 'dashed', borderColor: 'rgba(254,153,32,0.3)' }}>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--gold)] flex items-center gap-1.5">
                  <Plus size={11} /> Nuovo Servizio
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <input className={inp} placeholder="Nome servizio *" value={newS.nome} onChange={e => setNewS(p => ({ ...p, nome: e.target.value }))} />
                  <input className={inp} placeholder="Durata (es. 12 mesi)" value={newS.durata} onChange={e => setNewS(p => ({ ...p, durata: e.target.value }))} />
                  <input className={inp} placeholder="Prezzo (es. 30€)" value={newS.prezzo} onChange={e => setNewS(p => ({ ...p, prezzo: e.target.value }))} />
                  <input className={inp} placeholder="Emoji (es. 🎧)" value={newS.emoji} onChange={e => setNewS(p => ({ ...p, emoji: e.target.value }))} />
                </div>
                <textarea
                  className={`${inp} resize-none`}
                  rows={3}
                  placeholder={'Benefit (uno per riga):\nNessuna pubblicità\nAscolto offline'}
                  value={newS.benefit}
                  onChange={e => setNewS(p => ({ ...p, benefit: e.target.value }))}
                />
                <button
                  onClick={addServizio}
                  disabled={!newS.nome.trim()}
                  className="btn-sec w-full disabled:opacity-40"
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
                      <Stars count={r.stelle} size={11} />
                      {r.nomeUtente && <span className="text-xs font-medium text-[var(--text)]">{r.nomeUtente}</span>}
                      {r.servizioId && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg3)] text-[var(--text3)]">
                          {db.servizi.find(s => s.id === r.servizioId)?.nome ?? '—'}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[var(--text2)] mt-1 leading-relaxed">"{r.testo}"</div>
                  </div>
                  <button onClick={() => removeRecensione(r.id)} className="p-1.5 rounded text-[var(--text3)] hover:text-[var(--red)] hover:bg-[rgba(239,68,68,0.08)] transition-colors shrink-0">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}

              <div className="card space-y-3" style={{ borderStyle: 'dashed', borderColor: 'rgba(254,153,32,0.3)' }}>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--gold)] flex items-center gap-1.5">
                  <Plus size={11} /> Nuova Recensione
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <input className={inp} placeholder="Nome utente (opzionale)" value={newR.nomeUtente} onChange={e => setNewR(p => ({ ...p, nomeUtente: e.target.value }))} />
                  <select
                    value={newR.servizioId}
                    onChange={e => setNewR(p => ({ ...p, servizioId: e.target.value }))}
                    className="bg-[var(--bg3)] border border-[var(--bg3)] rounded px-2.5 py-1.5 text-sm text-[var(--text)] focus:outline-none w-full"
                  >
                    <option value="">— Servizio (opzionale) —</option>
                    {db.servizi.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--text3)]">Stelle:</span>
                  {[1,2,3,4,5].map(n => (
                    <button
                      key={n}
                      onClick={() => setNewR(p => ({ ...p, stelle: n }))}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        size={18}
                        strokeWidth={1.5}
                        className={n <= newR.stelle ? 'text-[var(--gold)]' : 'text-[var(--bg3)]'}
                        fill={n <= newR.stelle ? 'var(--gold)' : 'none'}
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  className={`${inp} resize-none`}
                  rows={3}
                  placeholder="Testo della recensione *"
                  value={newR.testo}
                  onChange={e => setNewR(p => ({ ...p, testo: e.target.value }))}
                />
                <button onClick={addRecensione} disabled={!newR.testo.trim()} className="btn-sec w-full disabled:opacity-40">
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
                  <div className="w-8 h-8 rounded flex items-center justify-center shrink-0 bg-[var(--bg3)]">
                    <Gift size={15} className="text-[var(--text2)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[var(--text)]">{r.obiettivo}</div>
                    <div className="text-xs text-[var(--text3)] mt-0.5">{r.condizione}</div>
                  </div>
                  <button onClick={() => removeReferral(r.id)} className="p-1.5 rounded text-[var(--text3)] hover:text-[var(--red)] hover:bg-[rgba(239,68,68,0.08)] transition-colors shrink-0">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}

              <div className="card space-y-3" style={{ borderStyle: 'dashed', borderColor: 'rgba(254,153,32,0.3)' }}>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--gold)] flex items-center gap-1.5">
                  <Plus size={11} /> Nuovo Programma Referral
                </p>
                <input className={inp} placeholder="Premio / Obiettivo (es. Buono Amazon 10€) *" value={newRef.obiettivo} onChange={e => setNewRef(p => ({ ...p, obiettivo: e.target.value }))} />
                <input className={inp} placeholder="Condizione (es. Porta 5 amici)" value={newRef.condizione} onChange={e => setNewRef(p => ({ ...p, condizione: e.target.value }))} />
                <button onClick={addReferral} disabled={!newRef.obiettivo.trim()} className="btn-sec w-full disabled:opacity-40">
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
            Spazio privato per idee, promemoria e piani futuri. Salvato in localStorage.
          </p>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder={'Idee per post futuri...\n\n— Fare post su Crunchyroll lunedì\n— Testare offerta 2+1 su Spotify Family\n— Chiedere a Marco una recensione'}
            rows={16}
            className="w-full bg-[var(--bg2)] border border-[var(--bg3)] rounded-[var(--radius)] px-4 py-3 text-sm text-[var(--text)] resize-y focus:border-[rgba(254,153,32,0.35)] focus:outline-none font-mono leading-relaxed transition-colors"
          />
          <button onClick={saveNotes} className="btn-sec flex items-center gap-1.5">
            <Save size={12} />
            Salva Note
          </button>
        </div>
      )}
    </div>
  );
}
