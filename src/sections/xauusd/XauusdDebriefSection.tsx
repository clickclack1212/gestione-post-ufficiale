import { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { gemini } from '../../services/gemini';
import { buildDebriefPrompt } from '../../services/xauusdPrompts';
import { XauLangSelector } from '../../components/XauLangSelector';
import { CheckCircle, Send, RotateCw, Copy } from '../../components/Icon';
import type { XauLang } from '../../services/xauusdPrompts';

interface Msg { role: 'user' | 'ai'; content: string; }
type F = Record<string, string>;

function buildReplyPrompt(history: Msg[], answer: string): string {
  const hist = history.map(m =>
    `${m.role === 'user' ? 'TRADER' : 'COACH'}: ${m.content}`
  ).join('\n\n');
  return `${hist}\n\nTRADER: ${answer}\n\nCOACH:`;
}

export function XauusdDebriefSection() {
  const { config } = useApp();
  const [phase, setPhase] = useState<'form' | 'chat'>('form');
  const [fields, setFields] = useState<F>({ asset: 'XAUUSD' });
  const [lang, setLang] = useState<XauLang>('it');
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const set = (k: string, v: string) => setFields(prev => ({ ...prev, [k]: v }));

  async function handleAvvia() {
    if (loading) return;
    setLoading(true);
    const prompt = buildDebriefPrompt(fields, lang);
    try {
      const reply = await gemini(prompt, config.apiKey, 0.72);
      setMessages([{ role: 'ai', content: reply.trim() }]);
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
      const reply = await gemini(prompt, config.apiKey, 0.72);
      setMessages(prev => [...prev, { role: 'ai', content: reply.trim() }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', content: `⚠️ Errore: ${(e as Error).message}` }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleInvia(); }
  }

  function handleReset() {
    setPhase('form');
    setFields({ asset: 'XAUUSD' });
    setMessages([]);
    setInput('');
  }

  const noKey = !config.apiKey;

  return (
    <div>
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="card-title mb-0">
            <CheckCircle size={13} />
            Debrief Post-Trade
          </div>
          {phase === 'chat' && (
            <button onClick={handleReset} className="btn-sec py-1 px-2.5 text-[10px]">
              <RotateCw size={11} /> Nuovo Debrief
            </button>
          )}
        </div>
        <p className="text-xs text-[var(--text3)] mt-1 mb-2 leading-relaxed">
          Hai appena chiuso un trade? Inserisci i dettagli — l'AI ti farà 3 domande oneste una alla volta, poi ti darà UN'unica lezione specifica da questo trade.
        </p>
        {noKey && (
          <p className="text-xs text-[var(--red)] font-medium">⚠️ Nessuna API Key configurata. Vai in Config nell'app principale.</p>
        )}
      </div>

      {phase === 'form' ? (
        <div className="card">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <div>
              <label>Data e Ora</label>
              <input value={fields.datetime ?? ''} onChange={e => set('datetime', e.target.value)} placeholder="es. Lun 28 Apr 11:45" />
            </div>
            <div>
              <label>Asset</label>
              <input value={fields.asset ?? 'XAUUSD'} onChange={e => set('asset', e.target.value)} placeholder="XAUUSD" />
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
                <option value="BUY (Long)">BUY (Long)</option>
                <option value="SELL (Short)">SELL (Short)</option>
              </select>
            </div>
            <div>
              <label>Prezzo Entrata</label>
              <input value={fields.entry ?? ''} onChange={e => set('entry', e.target.value)} placeholder="es. 3318.50" />
            </div>
            <div>
              <label>Prezzo Uscita</label>
              <input value={fields.exit ?? ''} onChange={e => set('exit', e.target.value)} placeholder="es. 3335.00" />
            </div>
            <div>
              <label>Stop Loss (pips)</label>
              <input value={fields.sl ?? ''} onChange={e => set('sl', e.target.value)} placeholder="es. 15" />
            </div>
            <div>
              <label>Risultato (pips)</label>
              <input value={fields.result ?? ''} onChange={e => set('result', e.target.value)} placeholder="es. +18 oppure -15" />
            </div>
            <div>
              <label>Esito</label>
              <select value={fields.outcome ?? ''} onChange={e => set('outcome', e.target.value)}>
                <option value="">Seleziona…</option>
                <option value="WIN — target raggiunto">WIN — target raggiunto</option>
                <option value="LOSS — stoppato">LOSS — stoppato</option>
                <option value="BREAK EVEN">BREAK EVEN</option>
                <option value="Chiuso manualmente in profitto">Chiuso manualmente in profitto</option>
                <option value="Chiuso manualmente in perdita">Chiuso manualmente in perdita</option>
              </select>
            </div>
          </div>

          <XauLangSelector value={lang} onChange={setLang} />

          <button className="btn-generate mt-3" disabled={loading || noKey} onClick={handleAvvia}>
            {loading
              ? <><span className="mini-spinner" /><span>Avvio debrief…</span></>
              : '✅ Avvia Debrief'}
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
              placeholder="Rispondi onestamente alla domanda…"
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
