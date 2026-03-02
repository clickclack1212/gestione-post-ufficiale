import type { Tone } from '../types';

interface Props {
  value: Tone;
  onChange: (t: Tone) => void;
}

const TONES: { id: Tone; label: string; desc: string }[] = [
  { id: 'assertivo', label: 'Assertivo',  desc: 'Diretto e motivante' },
  { id: 'hype',      label: 'Hype',       desc: 'Esplosivo e urgente' },
  { id: 'essenziale',label: 'Essenziale', desc: 'Minimalista e conciso' },
];

export function ToneSelector({ value, onChange }: Props) {
  return (
    <div>
      <label className="block text-xs text-[var(--text3)] uppercase tracking-widest mb-2">
        Tono
      </label>
      <div className="flex gap-2 flex-wrap">
        {TONES.map(t => (
          <button
            key={t.id}
            className={`tone-btn ${value === t.id ? 'active' : ''}`}
            onClick={() => onChange(t.id)}
            title={t.desc}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
