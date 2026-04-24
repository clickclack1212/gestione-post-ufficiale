import { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { gemini } from '../../services/gemini';
import { buildPatternFinderPrompt } from '../../services/xauusdPrompts';
import { XauLangSelector } from '../../components/XauLangSelector';
import { Brain, Send, RotateCw, Copy } from '../../components/Icon';
import type { XauLang } from '../../services/xauusdPrompts';

interface Msg { role: 'user' | 'ai'; content: string; }

function buildFollowUpPrompt(history: Msg[], answer: string): string {
  const hist = history.map(m =>
    `${m.role === 'user' ? 'TRADER' : 'COACH'}: ${m.content}`
  ).join('\n\n');
  return `${hist}\n\nTRADER: ${answer}\n\nCOACH:`;
}

export function XauusdPatternSection() {
  const { config } = useApp();
  const [phase, setPhase] = useState<'form' | 'chat'>('form');
  const [trades, setTrades] = useState('');
  const [lang, setLang] = useState<XauLang>('it');
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function handleAvvia() {
    if (!trades.trim() || loading) return;
    setLoading(true);
    const prompt = buildPatternFinderPrompt({ trades }, lang);
    try {
      const reply = await gemini(prompt, config.apiKey, 0.75);
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
      const prompt = buildFollowUpPrompt(nuoviMsg.slice(0, -1), text);
      const reply = await gemini(prompt, config.apiKey, 0.75);
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
    setMessages([]);
    setInput('');
    setTrades('');
  }

  const noKey = !config.apiKey;

  return (
    <div>
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="card-title mb-0">
            <Brain size={13} />
            Analisi Pattern
          </div>
          {phase === 'chat' && (
            <button onClick={handleReset} className="btn-sec py-1 px-2.5 text-[10px]">
              <RotateCw size={11} /> Ricomincia
            </button>
          )}
        </div>
        <p className="text-xs text-[var(--text3)] mt-1 mb-3 leading-relaxed">
          Incolla i tuoi trade della settimana. L'AI ti farà prima 5 domande specifiche, poi identificherà i tuoi errori più frequenti, la sessione peggiore e ti darà UN'azione concreta per la settimana successiva.
        </p>
        {noKey && (
          <p className="text-xs text-[var(--red)] font-medium">⚠️ Nessuna API Key configurata. Vai in Config nell'app principale.</p>
        )}
      </div>

      {phase === 'form' ? (
        <div className="card">
          <label>I Tuoi Trade di Questa Settimana</label>
          <textarea
            value={trades}
            onChange={e => setTrades(e.target.value)}
            placeholder={`Incolla i tuoi trade nel formato:\nGiorno + Sessione | Direzione | Motivo entrata | Risultato (pips) | Stato emotivo | Regole seguite (sì/no)\n\nEsempio:\nLunedì London | SELL | BOS sul 15M, OB a 3320 | +18p | calmo | sì\nMartedì NY | BUY | Entrata per FOMO | -12p | ansioso | no`}
            style={{ minHeight: 160 }}
          />
          <XauLangSelector value={lang} onChange={setLang} />
          <button className="btn-generate mt-3" disabled={loading || !trades.trim() || noKey} onClick={handleAvvia}>
            {loading
              ? <><span className="mini-spinner" /><span>Analisi trade in corso…</span></>
              : '🧠 Avvia Analisi Pattern'}
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
                  <span className="text-xs text-[var(--text3)]">Analisi in corso…</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="flex gap-2 items-end bg-[var(--bg2)] border border-[var(--border)] rounded-[var(--radius)] p-2 focus-within:border-[rgba(254,153,32,0.5)] transition-colors">
            <textarea
              ref={textareaRef}
              className="flex-1 bg-transparent resize-none text-sm text-[var(--text)] placeholder-[var(--text3)] focus:outline-none py-1 px-1 max-h-32 min-h-[40px]"
              placeholder="Scrivi la tua risposta… (Invio per inviare)"
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
          <p className="text-[10px] text-[var(--text3)] mt-1.5 text-center">
            Invio per inviare · Shift+Invio per andare a capo
          </p>
        </div>
      )}
    </div>
  );
}
