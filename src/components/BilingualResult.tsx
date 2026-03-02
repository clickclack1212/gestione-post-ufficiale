import { useState } from 'react';
import { Copy } from './Icon';

interface Props {
  it: string;
  en: string;
}

function copyText(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}

export function BilingualResult({ it, en }: Props) {
  const [tab, setTab] = useState<'it' | 'en'>('it');
  const active = tab === 'it' ? it : en;

  if (!it && !en) return null;

  return (
    <div className="result-box animate-[slideUp_0.3s_ease]">
      {/* Language tabs — flag emoji kept intentionally */}
      <div className="flex gap-1 mb-3">
        <button
          className={`result-lang-tab ${tab === 'it' ? 'active' : ''}`}
          onClick={() => setTab('it')}
        >
          🇮🇹 Italiano
        </button>
        <button
          className={`result-lang-tab ${tab === 'en' ? 'active' : ''}`}
          onClick={() => setTab('en')}
        >
          🇬🇧 English
        </button>
      </div>

      {/* Text area */}
      <textarea
        className="lang-textarea"
        value={active}
        readOnly
        rows={Math.max(8, active.split('\n').length + 2)}
      />

      {/* Actions */}
      <div className="flex gap-2 mt-3 flex-wrap">
        <button
          className="btn-sec text-sm flex items-center gap-1.5"
          onClick={() => copyText(active)}
        >
          <Copy size={12} /> Copia {tab === 'it' ? 'IT' : 'EN'}
        </button>
        <button
          className="btn-sec text-sm flex items-center gap-1.5"
          onClick={() => copyText(`${it}\n\n──────────────\n\n${en}`)}
        >
          <Copy size={12} /> Copia Bilingue
        </button>
      </div>
    </div>
  );
}
