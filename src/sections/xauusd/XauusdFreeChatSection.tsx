import { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { gemini } from '../../services/gemini';
import { MessageSquare, Send, X, Copy } from '../../components/Icon';

interface Msg { role: 'user' | 'assistant'; content: string; }

const STARTERS = [
  'What is a Breaker Block and how do I trade it?',
  'Explain the ICT Optimal Trade Entry setup on XAUUSD',
  'How should I manage a trade that is 20 pips in profit on Gold?',
  'What are the best sessions to trade XAUUSD and why?',
  'Walk me through a complete Smart Money Concepts trade setup',
];

function buildPrompt(history: Msg[], message: string): string {
  const sys = `You are an expert XAUUSD (Gold) trading analyst and coach. Your knowledge covers:
- ICT (Inner Circle Trader) concepts: Order Blocks, FVG, BOS/CHoCH, Liquidity, Displacement
- Smart Money Concepts (SMC)
- Price Action and market structure
- Risk management for Gold trading
- Prop firm rules and funded account strategies
- Trade psychology and discipline

Respond with clear, actionable analysis. Use specific price examples when useful. Be direct and avoid generic advice.`;

  const histStr = history.length > 0
    ? '\n\nCONVERSATION:\n' + history.map(m =>
        `${m.role === 'user' ? 'TRADER' : 'ANALYST'}: ${m.content}`
      ).join('\n\n')
    : '';

  return `${sys}${histStr}\n\nTRADER: ${message}\n\nANALYST:`;
}

export function XauusdFreeChatSection() {
  const { config } = useApp();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading || !config.apiKey) return;
    const userMsg: Msg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const prompt = buildPrompt(messages, text);
      const reply = await gemini(prompt, config.apiKey, 0.75);
      setMessages(prev => [...prev, { role: 'assistant', content: reply.trim() }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ Error: ${(e as Error).message}`,
      }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  const noKey = !config.apiKey;

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 160px)', minHeight: 480 }}>
      {/* Header card */}
      <div className="card mb-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare size={14} className="text-[var(--gold)]" />
            <span className="card-title mb-0">XAUUSD Free Chat</span>
          </div>
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              className="flex items-center gap-1 text-[11px] text-[var(--text3)] hover:text-[var(--text)] transition-colors px-2 py-1 rounded-[var(--radius-sm)] hover:bg-[var(--bg3)]"
            >
              <X size={11} /> Clear
            </button>
          )}
        </div>
        <p className="text-xs text-[var(--text3)] mt-1">
          Ask anything about XAUUSD — ICT concepts, setups, risk management, trade psychology, prop firm rules.
        </p>
        {noKey && (
          <p className="text-xs text-[var(--red)] mt-2 font-medium">
            ⚠️ No API Key configured. Go to the main app → Config tab.
          </p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center pb-8">
            <div className="w-14 h-14 rounded-2xl bg-[rgba(254,153,32,0.08)] border border-[rgba(254,153,32,0.15)] flex items-center justify-center mb-4">
              <MessageSquare size={22} className="text-[var(--gold)]" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-medium text-[var(--text2)] mb-1">Ask anything about Gold trading</p>
            <p className="text-xs text-[var(--text3)] max-w-xs mb-5">
              ICT, SMC, order blocks, liquidity, risk management, psychology — your dedicated XAUUSD analyst is ready.
            </p>
            <div className="flex flex-col gap-2 w-full max-w-sm">
              {STARTERS.map(q => (
                <button
                  key={q}
                  onClick={() => { setInput(q); textareaRef.current?.focus(); }}
                  className="text-left text-xs px-3 py-2 rounded-[var(--radius-sm)] border border-[var(--bg3)] text-[var(--text3)] hover:text-[var(--text)] hover:border-[rgba(254,153,32,0.3)] transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[88%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
              ${msg.role === 'user'
                ? 'bg-[rgba(254,153,32,0.15)] text-[var(--text)] rounded-br-sm border border-[rgba(254,153,32,0.25)]'
                : 'bg-[var(--bg2)] text-[var(--text)] rounded-bl-sm border border-[var(--border)]'
              }`}
            >
              {msg.content}
              {msg.role === 'assistant' && (
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
      <div className="mt-4 shrink-0">
        <div className="flex gap-2 items-end bg-[var(--bg2)] border border-[var(--border)] rounded-[var(--radius)] p-2 focus-within:border-[rgba(254,153,32,0.5)] transition-colors">
          <textarea
            ref={textareaRef}
            className="flex-1 bg-transparent resize-none text-sm text-[var(--text)] placeholder-[var(--text3)] focus:outline-none py-1 px-1 max-h-40 min-h-[40px]"
            placeholder={noKey ? 'Configure API Key first…' : 'Ask about XAUUSD… (Enter to send, Shift+Enter for new line)'}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
            disabled={noKey || loading}
            style={{ height: 'auto' }}
            onInput={e => {
              const el = e.currentTarget;
              el.style.height = 'auto';
              el.style.height = Math.min(el.scrollHeight, 160) + 'px';
            }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading || noKey}
            className="shrink-0 w-9 h-9 rounded-[var(--radius-sm)] flex items-center justify-center transition-all
              bg-[rgba(254,153,32,0.15)] text-[var(--gold)] border border-[rgba(254,153,32,0.3)]
              hover:bg-[rgba(254,153,32,0.25)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send size={15} />
          </button>
        </div>
        <p className="text-[10px] text-[var(--text3)] mt-1.5 text-center">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
