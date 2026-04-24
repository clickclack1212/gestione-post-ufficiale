import { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { gemini } from '../../services/gemini';
import { buildPatternFinderPrompt } from '../../services/xauusdPrompts';
import { Brain, Send, RotateCw, Copy } from '../../components/Icon';

interface Msg { role: 'user' | 'ai'; content: string; }

function buildFollowUpPrompt(history: Msg[], answer: string): string {
  const histStr = history.map(m =>
    `${m.role === 'user' ? 'TRADER' : 'COACH'}: ${m.content}`
  ).join('\n\n');
  return `${histStr}\n\nTRADER: ${answer}\n\nCOACH:`;
}

export function XauusdPatternSection() {
  const { config } = useApp();
  const [phase, setPhase] = useState<'form' | 'chat'>('form');
  const [trades, setTrades] = useState('');
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function handleStart() {
    if (!trades.trim() || loading) return;
    setLoading(true);
    const prompt = buildPatternFinderPrompt({ trades });
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

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;
    const newMessages: Msg[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    try {
      const prompt = buildFollowUpPrompt(newMessages.slice(0, -1), text);
      const reply = await gemini(prompt, config.apiKey, 0.75);
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
            Pattern Finder
          </div>
          {phase === 'chat' && (
            <button onClick={handleReset} className="btn-sec py-1 px-2.5 text-[10px]">
              <RotateCw size={11} /> Reset
            </button>
          )}
        </div>
        <p className="text-xs text-[var(--text3)] mt-1 mb-3 leading-relaxed">
          Paste your weekly trades. The AI will first ask you 5 specific questions, then reveal your most repeated mistakes, weakest session, and give you ONE action for next week.
        </p>
        {noKey && (
          <p className="text-xs text-[var(--red)] mb-3 font-medium">⚠️ No API Key configured. Go to the main app Config tab.</p>
        )}
      </div>

      {phase === 'form' ? (
        <div className="card">
          <label>Your Trades This Week</label>
          <textarea
            value={trades}
            onChange={e => setTrades(e.target.value)}
            placeholder={`Paste your trades in format:\nDay + Session | Direction | Entry reason | Result (pips) | Emotion | Followed rules (yes/no)\n\nExample:\nMonday London | SELL | BOS on 15M, OB at 3320 | +18p | calm | yes\nTuesday NY | BUY | FOMO entry | -12p | anxious | no`}
            style={{ minHeight: 160 }}
          />
          <button className="btn-generate" disabled={loading || !trades.trim() || noKey} onClick={handleStart}>
            {loading
              ? <><span className="mini-spinner" /><span>Analysing trades…</span></>
              : '🧠 Start Pattern Analysis'}
          </button>
        </div>
      ) : (
        <div className="flex flex-col" style={{ minHeight: 400 }}>
          {/* Messages */}
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
                  <span className="text-xs text-[var(--text3)]">Analysing…</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2 items-end bg-[var(--bg2)] border border-[var(--border)] rounded-[var(--radius)] p-2 focus-within:border-[rgba(254,153,32,0.5)] transition-colors">
            <textarea
              ref={textareaRef}
              className="flex-1 bg-transparent resize-none text-sm text-[var(--text)] placeholder-[var(--text3)] focus:outline-none py-1 px-1 max-h-32 min-h-[40px]"
              placeholder="Type your answer here… (Enter to send)"
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
          <p className="text-[10px] text-[var(--text3)] mt-1.5 text-center">
            Enter · send &nbsp;·&nbsp; Shift+Enter · new line
          </p>
        </div>
      )}
    </div>
  );
}
