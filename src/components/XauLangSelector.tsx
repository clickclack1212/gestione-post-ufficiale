import type { XauLang } from '../services/xauusdPrompts';

interface Props {
  value: XauLang;
  onChange: (l: XauLang) => void;
}

const OPTIONS: { id: XauLang; label: string }[] = [
  { id: 'it',   label: '🇮🇹 Italiano'   },
  { id: 'en',   label: '🇬🇧 English'    },
  { id: 'both', label: '🌐 Entrambi'    },
];

export function XauLangSelector({ value, onChange }: Props) {
  return (
    <div className="mt-3">
      <label>Lingua output</label>
      <div className="flex gap-2">
        {OPTIONS.map(o => (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={`tone-btn ${value === o.id ? 'active' : ''}`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
