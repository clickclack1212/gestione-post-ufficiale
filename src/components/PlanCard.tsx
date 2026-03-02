import { useState } from 'react';

export interface PlanCardData {
  id: string;
  time: string;
  label: string;
  shot: boolean;
  tag?: string;
  color?: string;
  icon?: string;
  it: string;
  en: string;
}

interface Props {
  card: PlanCardData;
  index: number;
}

const TAG_COLORS: Record<string, string> = {
  mindset:   'bg-[rgba(34,197,94,0.12)]  text-[#22c55e]  border-[rgba(34,197,94,0.25)]',
  proof:     'bg-[rgba(59,130,246,0.12)] text-[#3b82f6]  border-[rgba(59,130,246,0.25)]',
  operativo: 'bg-[rgba(254,153,32,0.12)] text-[#FFAD47]  border-[rgba(254,153,32,0.3)]',
  educativo: 'bg-[rgba(249,115,22,0.12)] text-[#f97316]  border-[rgba(249,115,22,0.25)]',
};

function copyText(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}

export function PlanCard({ card, index }: Props) {
  const [lang, setLang] = useState<'it' | 'en'>('it');
  const text = lang === 'it' ? card.it : card.en;
  const tagCls = card.tag ? (TAG_COLORS[card.tag] || '') : '';

  return (
    <div className="plan-card animate-[slideUp_0.3s_ease]" style={{ animationDelay: `${index * 0.05}s` }}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          {card.icon && <span className="text-base leading-none">{card.icon}</span>}
          <span className="text-[var(--gold)] font-mono text-xs font-semibold">{card.time}</span>
          {card.tag && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium uppercase tracking-wide ${tagCls}`}>
              {card.tag}
            </span>
          )}
          <span className="text-[var(--text2)] text-xs truncate">{card.label}</span>
          {card.shot && (
            <span className="badge-photo text-[10px]">📸 Screenshot</span>
          )}
        </div>
        {/* Copy buttons */}
        <div className="flex gap-1 shrink-0">
          <button
            className="btn-sec text-xs px-2 py-1"
            onClick={() => copyText(text)}
            title={`Copia ${lang.toUpperCase()}`}
          >
            📋 {lang.toUpperCase()}
          </button>
          <button
            className="btn-sec text-xs px-2 py-1"
            onClick={() => copyText(`${card.it}\n\n──────────────\n\n${card.en}`)}
            title="Copia bilingue"
          >
            🌐
          </button>
        </div>
      </div>

      {/* Language tabs */}
      <div className="flex gap-1 mb-2">
        <button
          className={`result-lang-tab text-xs ${lang === 'it' ? 'active' : ''}`}
          onClick={() => setLang('it')}
        >
          🇮🇹
        </button>
        <button
          className={`result-lang-tab text-xs ${lang === 'en' ? 'active' : ''}`}
          onClick={() => setLang('en')}
        >
          🇬🇧
        </button>
      </div>

      {/* Text */}
      <p className="plan-msg-text">{text}</p>
    </div>
  );
}
