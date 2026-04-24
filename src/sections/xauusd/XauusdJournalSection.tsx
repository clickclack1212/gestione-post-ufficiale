import { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { gemini } from '../../services/gemini';
import { buildJournalPrompt } from '../../services/xauusdPrompts';
import { XauLangSelector } from '../../components/XauLangSelector';
import { BookOpen, Send, RotateCw, Copy, Plus } from '../../components/Icon';
import type { XauLang } from '../../services/xauusdPrompts';

interface Msg { role: 'user' | 'ai'; content: string; }
type F = Record<string, string>;

function buildReplyPrompt(history: Msg[], answer: string): string {
  const hist = history.map(m =>
    `${m.role === 'user' ? 'TRADER' : 'JOURNAL'}: ${m.content}`
  ).join('\n\n');
  return `${hist}\n\nTRADER: ${answer}\n\nJOURNAL:`;
}

export function XauusdJournalSection() {
  const { config } = useApp();
  const [phase, setPhase] = useState<'form' | 'chat'>('form');
  const [fields, setFields] = useState<F>({ asset: 'XAUUSD' });
  const [lang, setLang] = useState<XauLang>('it');
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [nTrade, setNTrade] = useState(0);
  const [cronologia, setCronologia] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const set = (k: string, v: string) => setFields(prev => ({ ...prev, [k]: v }));

  async function handleRegistra() {
    if (loading) return;
    setLoading(true);
    const prompt = buildJournalPrompt(fields, cronologia, lang);
    try {
      const reply = await gemini(prompt, config.apiKey, 0.75);
      const testo = reply.trim();
      const nuovaCron = cronologia + `\nTRADE #${nTrade + 1}: ${JSON.stringify(fields)}\nJOURNAL: ${testo}`;
      setCronologia(nuovaCron);
      setNTrade(n => n + 1);
      setMessages([{ role: 'ai', content: testo }]);
      setPhase('chat');
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleInvia() {
    const text = input.trim();
    if (!text || loading) return;
    const nuoviMsg: Msg[] = [...messages, { role: 'user', content: text }];
    setMessages(nuoviMsg);
    setInput('');
    setLoading(true);
    try {
      const prompt = buildReplyPrompt(nuoviMsg.slice(0, -1), text);
      const reply = await gemini(prompt, config.apiKey, 0.75);
      const testo = reply.trim();
      setCronologia(prev => prev + `\nTRADER: ${text}\nJOURNAL: ${testo}`);
      setMessages(prev => [...prev, { role: 'ai', content: testo }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', content: `⚠️ Errore: ${(e as Error).message}` }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleInvia(); }
  }

  function handleNuovoTrade() {
    setPhase('form');
    setFields({ asset: 'XAUUSD' });
    setMessages([]);
    setInput('');
  }

  function handleResetCompleto() {
    setPhase('form');
    setMessages([]);
    setInput('');
    setFields({ asset: 'XAUUSD' });
    setNTrade(0);
    setCronologia('');
  }

  const noKey = !config.apiKey;

  return (
    <div>
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="card-title mb-0">
            <BookOpen size={13} />
            Journal AI
          </div>
          <div className="flex items-center gap-2">
            {nTrade > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(254,153,32,0.12)] border border-[rgba(254,153,32,0.25)] text-[var(--gold)]">
                {nTrade} trade{nTrade > 1 ? ' registrati' : ' registrato'}
              </span>
            )}
            {phase === 'chat' && (
              <button onClick={handleNuovoTrade} className="btn-sec py-1 px-2.5 text-[10px]">
                <Plus size={11} /> Nuovo Trade
              </button>
            )}
            {nTrade > 0 && (
              <button onClick={handleResetCompleto} className="btn-sec py-1 px-2.5 text-[10px]">
                <RotateCw size={11} /> Reset
              </button>
            )}
          </div>
        </div>
        <p className="text-xs text-[var(--text3)] mt-1 mb-2 leading-relaxed">
          Registra ogni trade dopo la chiusura. L'AI costruisce nel tempo il tuo profilo come trader, fa UNA domanda specifica per trade, e dopo 10+ trade evidenzia pattern, punti di forza e debolezze.
        </p>
        {noKey && (
          <p className="text-xs text-[var(--red)] font-medium">⚠️ Nessuna API Key configurata. Vai in Config nell'app principale.</p>
        )}
      </div>

      {phase === 'form' ? (
        <div className="card">
          <p className="text-xs font-semibold text-[var(--text2)] mb-3">Trade #{nTrade + 1}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <div>
              <label>Asset</label>
              <input value={fields.asset ?? 'XAUUSD'} onChange={e => set('asset', e.target.value)} placeholder="XAUUSD" />
            </div>
            <div>
              <label>Data e Ora</label>
              <input value={fields.datetime ?? ''} onChange={e => set('datetime', e.target.value)} placeholder="es. Lun 28 Apr 10:15" />
            </div>
            <div>
              <label>Sessione</label>
              <select value={fields.session ?? ''} onChange={e => set('session', e.target.value)}>
                <option value="">Seleziona…</option>
                <option value="London">London</option>
                <option value="New York">New York</option>
                <option value="Asian">Asian</option>
                <option value="London/NY overlap">London/NY overlap</option>
              </select>
            </div>
            <div>
              <label>Direzione</label>
              <select value={fields.direction ?? ''} onChange={e => set('direction', e.target.value)}>
                <option value="">Seleziona…</option>
                <option value="BUY">BUY</option>
                <option value="SELL">SELL</option>
              </select>
            </div>
            <div>
              <label>Prezzo Entrata</label>
              <input value={fields.entry ?? ''} onChange={e => set('entry', e.target.value)} placeholder="es. 3318.50" />
            </div>
            <div>
              <label>Stop Loss (pips)</label>
              <input value={fields.sl ?? ''} onChange={e => set('sl', e.target.value)} placeholder="es. 15" />
            </div>
            <div>
              <label>Target (pips)</label>
              <input value={fields.tp ?? ''} onChange={e => set('tp', e.target.value)} placeholder="es. 30" />
            </div>
            <div>
              <label>Risultato</label>
              <input value={fields.result ?? ''} onChange={e => set('result', e.target.value)} placeholder="es. WIN +18p" />
            </div>
            <div>
              <label>Stato Emotivo</label>
              <input value={fields.emotion ?? ''} onChange={e => set('emotion', e.target.value)} placeholder="es. calmo, ansioso" />
            </div>
            <div>
              <label>Regole Seguite?</label>
              <select value={fields.rules ?? ''} onChange={e => set('rules', e.target.value)}>
                <option value="">Seleziona…</option>
                <option value="sì">Sì</option>
                <option value="no">No</option>
                <option value="in parte">In parte</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label>Motivo dell'Entrata</label>
              <textarea value={fields.reason ?? ''} onChange={e => set('reason', e.target.value)} placeholder="Perché sei entrato in questo trade?" style={{ minHeight: 60 }} />
            </div>
          </div>
          <XauLangSelector value={lang} onChange={setLang} />
          <button className="btn-generate mt-3" disabled={loading || noKey} onClick={handleRegistra}>
            {loading
              ? <><span className="mini-spinner" /><span>Registrazione trade…</span></>
              : '📖 Registra Questo Trade'}
          </button>
        </div>
      ) : (
        <div className="flex flex-col" style={{ minHeight: 400 }}>
          <div className="space-y-3 mb-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
                  ${msg.role === 'user'
                    ? 'bg-[rgba(254,153,32,0.15)] text-[var(--text)] rounded-br-sm border border-[rgba(254,153,32,0.25)]'
                    : 'bg-[var(--bg2)] text-[var(--text)] rounded-bl-sm border border-[var(--border)]'
                  }`}
                >
                  {msg.content}
                  {msg.role === 'ai' && (
                    <button
                      onClick={() => navigator.clipboard.writeText(msg.content)}
                      className="mt-2 flex items-center gap-1 text-[10px] text-[var(--text3)] hover:text-[var(--gold)] transition-colors"
                    >
                      <Copy size={9} /> Copia
                    </button>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[var(--bg2)] border border-[var(--border)] px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-2">
                  <span className="mini-spinner" />
                  <span className="text-xs text-[var(--text3)]">Elaborazione…</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="flex gap-2 items-end bg-[var(--bg2)] border border-[var(--border)] rounded-[var(--radius)] p-2 focus-within:border-[rgba(254,153,32,0.5)] transition-colors">
            <textarea
              className="flex-1 bg-transparent resize-none text-sm text-[var(--text)] placeholder-[var(--text3)] focus:outline-none py-1 px-1 max-h-32 min-h-[40px]"
              placeholder="Rispondi alla domanda del journal…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
              disabled={loading}
              style={{ height: 'auto' }}
              onInput={e => {
                const el = e.currentTarget;
                el.style.height = 'auto';
                el.style.height = Math.min(el.scrollHeight, 128) + 'px';
              }}
            />
            <button
              onClick={handleInvia}
              disabled={!input.trim() || loading}
              className="shrink-0 w-9 h-9 rounded-[var(--radius-sm)] flex items-center justify-center transition-all
                bg-[rgba(254,153,32,0.15)] text-[var(--gold)] border border-[rgba(254,153,32,0.3)]
                hover:bg-[rgba(254,153,32,0.25)] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send size={15} />
            </button>
          </div>
          <p className="text-[10px] text-[var(--text3)] mt-1.5 text-center">Invio per inviare · Shift+Invio per andare a capo</p>
        </div>
      )}
    </div>
  );
}
