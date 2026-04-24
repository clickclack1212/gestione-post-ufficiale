import { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { gemini } from '../../services/gemini';
import { buildJournalPrompt } from '../../services/xauusdPrompts';
import { BookOpen, Send, RotateCw, Copy, Plus } from '../../components/Icon';

interface Msg { role: 'user' | 'ai'; content: string; }

type F = Record<string, string>;

const TRADE_FIELDS: { key: string; label: string; placeholder: string; type?: string }[] = [
  { key: 'datetime',  label: 'Date & Time',      placeholder: 'e.g. Mon Apr 28 10:15' },
  { key: 'session',   label: 'Session',           placeholder: 'London / NY / Asian'   },
  { key: 'direction', label: 'Direction',         placeholder: 'BUY or SELL'           },
  { key: 'entry',     label: 'Entry Price',       placeholder: 'e.g. 3318.50'          },
  { key: 'sl',        label: 'Stop Loss (pips)',  placeholder: 'e.g. 15'               },
  { key: 'tp',        label: 'Target (pips)',     placeholder: 'e.g. 30'               },
  { key: 'result',    label: 'Result',            placeholder: 'e.g. WIN +18p'         },
  { key: 'reason',    label: 'Entry Reason',      placeholder: 'Why did you enter?'    },
  { key: 'emotion',   label: 'Emotional State',   placeholder: 'e.g. calm, anxious'    },
  { key: 'rules',     label: 'Followed Rules?',   placeholder: 'yes / no / partly'     },
];

function buildReplyPrompt(history: Msg[], answer: string): string {
  const histStr = history.map(m =>
    `${m.role === 'user' ? 'TRADER' : 'JOURNAL'}: ${m.content}`
  ).join('\n\n');
  return `${histStr}\n\nTRADER: ${answer}\n\nJOURNAL:`;
}

export function XauusdJournalSection() {
  const { config } = useApp();
  const [phase, setPhase] = useState<'form' | 'chat'>('form');
  const [fields, setFields] = useState<F>({ asset: 'XAUUSD' });
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [tradeCount, setTradeCount] = useState(0);
  const [fullHistory, setFullHistory] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const set = (k: string, v: string) => setFields(prev => ({ ...prev, [k]: v }));

  async function handleLogTrade() {
    if (loading) return;
    setLoading(true);
    const prompt = buildJournalPrompt(fields, fullHistory);
    try {
      const reply = await gemini(prompt, config.apiKey, 0.75);
      const trimmed = reply.trim();
      const newHistory = fullHistory + `\nTRADE #${tradeCount + 1}: ${JSON.stringify(fields)}\nJOURNAL: ${trimmed}`;
      setFullHistory(newHistory);
      setTradeCount(c => c + 1);
      setMessages([{ role: 'ai', content: trimmed }]);
      setPhase('chat');
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;
    const newMessages: Msg[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    try {
      const prompt = buildReplyPrompt(newMessages.slice(0, -1), text);
      const reply = await gemini(prompt, config.apiKey, 0.75);
      const trimmed = reply.trim();
      setFullHistory(prev => prev + `\nTRADER: ${text}\nJOURNAL: ${trimmed}`);
      setMessages(prev => [...prev, { role: 'ai', content: trimmed }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', content: `⚠️ Error: ${(e as Error).message}` }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  function handleNewTrade() {
    setPhase('form');
    setFields({ asset: 'XAUUSD' });
    setMessages([]);
    setInput('');
  }

  function handleFullReset() {
    setPhase('form');
    setMessages([]);
    setInput('');
    setFields({ asset: 'XAUUSD' });
    setTradeCount(0);
    setFullHistory('');
  }

  const noKey = !config.apiKey;

  return (
    <div>
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="card-title mb-0">
            <BookOpen size={13} />
            AI Trading Journal
          </div>
          <div className="flex items-center gap-2">
            {tradeCount > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(254,153,32,0.12)] border border-[rgba(254,153,32,0.25)] text-[var(--gold)]">
                {tradeCount} trade{tradeCount > 1 ? 's' : ''} logged
              </span>
            )}
            {phase === 'chat' && (
              <button onClick={handleNewTrade} className="btn-sec py-1 px-2.5 text-[10px]">
                <Plus size={11} /> New Trade
              </button>
            )}
            {tradeCount > 0 && (
              <button onClick={handleFullReset} className="btn-sec py-1 px-2.5 text-[10px]">
                <RotateCw size={11} /> Reset All
              </button>
            )}
          </div>
        </div>
        <p className="text-xs text-[var(--text3)] mt-1 mb-2 leading-relaxed">
          Log each trade after you close it. The AI builds a long-term profile, asks ONE specific question per trade, and flags patterns after 10+ trades.
        </p>
        {noKey && (
          <p className="text-xs text-[var(--red)] font-medium">⚠️ No API Key configured. Go to the main app Config tab.</p>
        )}
      </div>

      {phase === 'form' ? (
        <div className="card">
          <p className="text-xs font-semibold text-[var(--text2)] mb-3">Trade #{tradeCount + 1}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <div>
              <label>Asset</label>
              <input value={fields.asset ?? 'XAUUSD'} onChange={e => set('asset', e.target.value)} placeholder="XAUUSD" />
            </div>
            {TRADE_FIELDS.map(f => (
              <div key={f.key} className={f.key === 'reason' || f.key === 'emotion' || f.key === 'rules' ? 'sm:col-span-1' : ''}>
                <label>{f.label}</label>
                {f.key === 'reason' ? (
                  <textarea value={fields[f.key] ?? ''} onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder} style={{ minHeight: 60 }} />
                ) : (
                  <input value={fields[f.key] ?? ''} onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder} />
                )}
              </div>
            ))}
          </div>
          <button className="btn-generate" disabled={loading || noKey} onClick={handleLogTrade}>
            {loading
              ? <><span className="mini-spinner" /><span>Logging trade…</span></>
              : '📖 Log This Trade'}
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
                      <Copy size={9} /> Copy
                    </button>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[var(--bg2)] border border-[var(--border)] px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-2">
                  <span className="mini-spinner" />
                  <span className="text-xs text-[var(--text3)]">Thinking…</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="flex gap-2 items-end bg-[var(--bg2)] border border-[var(--border)] rounded-[var(--radius)] p-2 focus-within:border-[rgba(254,153,32,0.5)] transition-colors">
            <textarea
              className="flex-1 bg-transparent resize-none text-sm text-[var(--text)] placeholder-[var(--text3)] focus:outline-none py-1 px-1 max-h-32 min-h-[40px]"
              placeholder="Answer the journal's question…"
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
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="shrink-0 w-9 h-9 rounded-[var(--radius-sm)] flex items-center justify-center transition-all
                bg-[rgba(254,153,32,0.15)] text-[var(--gold)] border border-[rgba(254,153,32,0.3)]
                hover:bg-[rgba(254,153,32,0.25)] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send size={15} />
            </button>
          </div>
          <p className="text-[10px] text-[var(--text3)] mt-1.5 text-center">Enter · send &nbsp;·&nbsp; Shift+Enter · new line</p>
        </div>
      )}
    </div>
  );
}
