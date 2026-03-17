import type { EmojiLevel } from '../types';

interface Props {
  value: EmojiLevel;
  onChange: (l: EmojiLevel) => void;
}

const LEVELS: { id: EmojiLevel; label: string; desc: string }[] = [
  { id: '1-2', label: '1-2 Emoji', desc: 'Minimal — pochi emoji, massima sobrietà' },
  { id: '2-4', label: '2-4 Emoji', desc: 'Standard — equilibrio tra impatto e leggibilità' },
  { id: '4-5', label: '4-5 Emoji', desc: 'Full — ritmo visivo alto, energia massima' },
];

export function EmojiSelector({ value, onChange }: Props) {
  return (
    <div>
      <label className="block text-xs text-[var(--text3)] uppercase tracking-widest mb-2">
        Densità Emoji
      </label>
      <div className="flex gap-2 flex-wrap">
        {LEVELS.map(l => (
          <button
            key={l.id}
            className={`tone-btn ${value === l.id ? 'active' : ''}`}
            onClick={() => onChange(l.id)}
            title={l.desc}
          >
            {l.label}
          </button>
        ))}
      </div>
    </div>
  );
}
