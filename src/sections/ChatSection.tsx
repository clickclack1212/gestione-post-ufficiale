import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { gemini } from '../services/gemini';
import { MessageSquare, Send, X } from '../components/Icon';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function buildChatPrompt(history: Message[], newMessage: string, traderName: string): string {
  const systemCtx = `Sei un assistente AI esperto al servizio di ${traderName || 'un trader'}, gestore di un canale Telegram XAUUSD (Oro).

Le tue competenze includono:
- Strategia e pianificazione contenuti per canali Telegram di trading
- XAUUSD (Oro): analisi tecnica, Price Action, livelli chiave, segnali operativi
- CopyTrading e gestione automatizzata di portafogli
- Marketing per canali di trading: crescita abbonati, conversione, retention
- Copywriting persuasivo: post Telegram, CTA, post psicologici
- Gestione community: engagement, risposta a domande, gestione obiezioni
- Psicologia del trader: gestione emozioni, disciplina, mindset vincente

Rispondi in italiano. Sii diretto, pratico e concreto. Quando utile, usa esempi reali o schemi operativi. Niente risposte generiche — vai al punto.`;

  const historyStr = history.length > 0
    ? '\n\nCONVERSAZIONE PRECEDENTE:\n' + history.map(m =>
        `${m.role === 'user' ? 'UTENTE' : 'ASSISTENTE'}: ${m.content}`
      ).join('\n\n')
    : '';

  return `${systemCtx}${historyStr}\n\nUTENTE: ${newMessage}\n\nASSISTENTE:`;
}

export function ChatSection() {
  const { config } = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
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

    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const prompt = buildChatPrompt(messages, text, config.traderName);
      const reply = await gemini(prompt, config.apiKey, 0.75);
      setMessages(prev => [...prev, { role: 'assistant', content: reply.trim() }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ Errore: ${(e as Error).message}`,
      }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function clearChat() {
    setMessages([]);
  }

  const noKey = !config.apiKey;

  return (
    <div className="max-w-2xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 140px)' }}>
      {/* Header */}
      <div className="card mb-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare size={14} className="text-[var(--gold)]" />
            <span className="card-title mb-0">Chat AI</span>
          </div>
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="flex items-center gap-1 text-[11px] text-[var(--text3)] hover:text-[var(--text)] transition-colors px-2 py-1 rounded-[var(--radius-sm)] hover:bg-[var(--bg3)]"
            >
              <X size={11} /> Cancella chat
            </button>
          )}
        </div>
        <p className="text-[var(--text3)] text-xs mt-1">
          Chiedi qualsiasi cosa — strategia, copy, analisi, idee per i post, gestione community.
        </p>
        {noKey && (
          <p className="text-xs text-[var(--red)] mt-2 font-medium">
            ⚠️ Nessuna API Key configurata. Vai in Config per impostarla.
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
            <p className="text-sm font-medium text-[var(--text2)] mb-1">Cosa vuoi sapere?</p>
            <p className="text-xs text-[var(--text3)] max-w-xs">
              Puoi chiedermi idee per i post, come gestire una giornata di stop loss, analisi del mercato, strategie di crescita canale e altro.
            </p>
            <div className="mt-5 flex flex-col gap-2 w-full max-w-xs">
              {[
                'Come gestisco una giornata con segnale negativo?',
                'Dammi 5 idee per un post motivazionale del lunedì',
                'Come aumentare i conversions dal canale free al VIP?',
              ].map(q => (
                <button
                  key={q}
                  onClick={() => { setInput(q); textareaRef.current?.focus(); }}
                  className="text-left text-xs px-3 py-2 rounded-[var(--radius-sm)] border border-[var(--bg3)] text-[var(--text3)] hover:text-[var(--text)] hover:border-[var(--bg4)] transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
                ${msg.role === 'user'
                  ? 'bg-[rgba(254,153,32,0.15)] text-[var(--text)] rounded-br-sm border border-[rgba(254,153,32,0.25)]'
                  : 'bg-[var(--bg2)] text-[var(--text)] rounded-bl-sm border border-[var(--border)]'
                }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-[var(--bg2)] border border-[var(--border)] px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-2">
              <span className="mini-spinner" />
              <span className="text-xs text-[var(--text3)]">Sto elaborando...</span>
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
            placeholder={noKey ? 'Configura API Key in Config…' : 'Scrivi qui la tua domanda… (Invio per inviare, Shift+Invio per andare a capo)'}
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
          Invio per inviare · Shift+Invio per andare a capo
        </p>
      </div>
    </div>
  );
}
