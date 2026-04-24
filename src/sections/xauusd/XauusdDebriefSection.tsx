import { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { gemini } from '../../services/gemini';
import { buildDebriefPrompt } from '../../services/xauusdPrompts';
import { CheckCircle, Send, RotateCw, Copy } from '../../components/Icon';

interface Msg { role: 'user' | 'ai'; content: string; }
type F = Record<string, string>;

function buildReplyPrompt(history: Msg[], answer: string): string {
  const histStr = history.map(m =>
    `${m.role === 'user' ? 'TRADER' : 'COACH'}: ${m.content}`
  ).join('\n\n');
  return `${histStr}\n\nTRADER: ${answer}\n\nCOACH:`;
}

export function XauusdDebriefSection() {
  const { config } = useApp();
  const [phase, setPhase] = useState<'form' | 'chat'>('form');
  const [fields, setFields] = useState<F>({ asset: 'XAUUSD' });
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const set = (k: string, v: string) => setFields(prev => ({ ...prev, [k]: v }));

  async function handleStart() {
    if (loading) return;
    setLoading(true);
    const prompt = buildDebriefPrompt(fields);
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

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;
    const newMessages: Msg[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    try {
      const prompt = buildReplyPrompt(newMessages.slice(0, -1), text);
      const reply = await gemini(prompt, config.apiKey, 0.72);
      setMessages(prev => [...prev, { role: 'ai', content: reply.trim() }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', content: `⚠️ Error: ${(e as Error).message}` }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
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
            Post-Trade Debrief
          </div>
          {phase === 'chat' && (
            <button onClick={handleReset} className="btn-sec py-1 px-2.5 text-[10px]">
              <RotateCw size={11} /> New Debrief
            </button>
          )}
        </div>
        <p className="text-xs text-[var(--text3)] mt-1 mb-2 leading-relaxed">
          Just closed a trade? Fill in the details — the AI will ask you 3 honest questions one at a time, then give you ONE specific lesson from this trade.
        </p>
        {noKey && (
          <p className="text-xs text-[var(--red)] font-medium">⚠️ No API Key configured. Go to the main app Config tab.</p>
        )}
      </div>

      {phase === 'form' ? (
        <div className="card">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <div>
              <label>Date & Time</label>
              <input value={fields.datetime ?? ''} onChange={e => set('datetime', e.target.value)} placeholder="e.g. Mon Apr 28 11:45" />
            </div>
            <div>
              <label>Asset</label>
              <input value={fields.asset ?? 'XAUUSD'} onChange={e => set('asset', e.target.value)} placeholder="XAUUSD" />
            </div>
            <div>
              <label>Session</label>
              <select value={fields.session ?? ''} onChange={e => set('session', e.target.value)}>
                <option value="">Select…</option>
                <option value="London">London</option>
                <option value="New York">New York</option>
                <option value="Asian">Asian</option>
                <option value="London/NY overlap">London/NY overlap</option>
              </select>
            </div>
            <div>
              <label>Direction</label>
              <select value={fields.direction ?? ''} onChange={e => set('direction', e.target.value)}>
                <option value="">Select…</option>
                <option value="BUY (Long)">BUY (Long)</option>
                <option value="SELL (Short)">SELL (Short)</option>
              </select>
            </div>
            <div>
              <label>Entry Price</label>
              <input value={fields.entry ?? ''} onChange={e => set('entry', e.target.value)} placeholder="e.g. 3318.50" />
            </div>
            <div>
              <label>Exit Price</label>
              <input value={fields.exit ?? ''} onChange={e => set('exit', e.target.value)} placeholder="e.g. 3335.00" />
            </div>
            <div>
              <label>Stop Loss (pips)</label>
              <input value={fields.sl ?? ''} onChange={e => set('sl', e.target.value)} placeholder="e.g. 15" />
            </div>
            <div>
              <label>Result (pips)</label>
              <input value={fields.result ?? ''} onChange={e => set('result', e.target.value)} placeholder="e.g. +18 or -15" />
            </div>
            <div>
              <label>Outcome</label>
              <select value={fields.outcome ?? ''} onChange={e => set('outcome', e.target.value)}>
                <option value="">Select…</option>
                <option value="WIN — target hit">WIN — target hit</option>
                <option value="LOSS — stopped out">LOSS — stopped out</option>
                <option value="BREAK EVEN">BREAK EVEN</option>
                <option value="Manually closed in profit">Manually closed in profit</option>
                <option value="Manually closed in loss">Manually closed in loss</option>
              </select>
            </div>
          </div>
          <button className="btn-generate" disabled={loading || noKey} onClick={handleStart}>
            {loading
              ? <><span className="mini-spinner" /><span>Starting debrief…</span></>
              : '✅ Start Debrief'}
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
              placeholder="Type your honest answer… (Enter to send)"
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
