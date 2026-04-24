import { useState } from 'react';
import { Copy } from './Icon';
import type { XauLang } from '../services/xauusdPrompts';

const SEP = '──────────────';

interface Props {
  result: string;
  lang: XauLang;
  title?: string;
  mono?: boolean; // use monospace font (e.g. calendar tables)
}

export function XauusdResultBox({ result, lang, title = 'Analisi', mono = false }: Props) {
  const [tab, setTab] = useState<'it' | 'en'>('it');
  const [copied, setCopied] = useState(false);

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  const textClass = `text-sm text-[var(--text)] whitespace-pre-wrap leading-relaxed ${mono ? 'font-mono text-xs' : ''}`;

  if (lang === 'both') {
    const idx = result.indexOf(SEP);
    const it = (idx > -1 ? result.slice(0, idx) : result).trim();
    const en = (idx > -1 ? result.slice(idx + SEP.length) : '').trim();
    const active = tab === 'it' ? it : en;

    return (
      <div className="result-box mt-4">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
          <span className="text-xs font-bold text-[var(--gold)] uppercase tracking-widest">{title}</span>
          <div className="flex items-center gap-1.5">
            {/* Lang tabs */}
            <div className="flex rounded-[var(--radius-sm)] overflow-hidden border border-[var(--border)]">
              <button
                onClick={() => setTab('it')}
                className={`px-2.5 py-1 text-[10px] font-bold transition-colors
                  ${tab === 'it'
                    ? 'bg-[rgba(254,153,32,0.18)] text-[var(--gold)]'
                    : 'text-[var(--text3)] hover:text-[var(--text2)]'
                  }`}
              >
                🇮🇹 IT
              </button>
              <button
                onClick={() => setTab('en')}
                className={`px-2.5 py-1 text-[10px] font-bold border-l border-[var(--border)] transition-colors
                  ${tab === 'en'
                    ? 'bg-[rgba(254,153,32,0.18)] text-[var(--gold)]'
                    : 'text-[var(--text3)] hover:text-[var(--text2)]'
                  }`}
              >
                🇬🇧 EN
              </button>
            </div>
            <button onClick={() => copy(active)} className="btn-sec py-1 px-2.5 text-[10px]">
              <Copy size={11} />
              {copied ? 'Copiato!' : 'Copia'}
            </button>
          </div>
        </div>
        <div className={`px-4 py-4 ${textClass}`}>
          {active || <span className="text-[var(--text3)] italic text-xs">Versione non disponibile — riprova la generazione.</span>}
        </div>
      </div>
    );
  }

  return (
    <div className="result-box mt-4">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
        <span className="text-xs font-bold text-[var(--gold)] uppercase tracking-widest">
          {title}
          {lang === 'en' && <span className="ml-1.5 text-[var(--text3)] normal-case font-normal tracking-normal text-[9px]">English</span>}
        </span>
        <button onClick={() => copy(result)} className="btn-sec py-1 px-2.5 text-[10px]">
          <Copy size={11} />
          {copied ? 'Copiato!' : 'Copia'}
        </button>
      </div>
      <div className={`px-4 py-4 ${textClass}`}>
        {result}
      </div>
    </div>
  );
}
