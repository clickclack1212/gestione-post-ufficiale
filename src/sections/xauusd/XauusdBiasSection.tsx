import { useState } from 'react';
import { useGemini } from '../../hooks/useGemini';
import { buildDailyBiasPrompt } from '../../services/xauusdPrompts';
import { Copy, TrendingUp, RotateCw } from '../../components/Icon';

type F = Record<string, string>;

const FIELDS: { key: string; label: string; placeholder: string; half?: boolean }[] = [
  { key: 'price',      label: 'Current Price',        placeholder: 'e.g. 3320.50'           },
  { key: 'candle4h',   label: 'Last 4H Candle Close', placeholder: 'e.g. 3318.00 bearish'   },
  { key: 'structure4h',label: '4H Structure',         placeholder: 'e.g. BOS to downside'   },
  { key: 'dailyTrend', label: 'Daily Trend',          placeholder: 'e.g. bearish, HTF sell' },
  { key: 'resistance', label: 'Key Resistance Above', placeholder: 'e.g. 3340.00'           },
  { key: 'support',    label: 'Key Support Below',    placeholder: 'e.g. 3300.00'           },
  { key: 'prevHigh',   label: 'Previous Day High',    placeholder: 'e.g. 3335.00'           },
  { key: 'prevLow',    label: 'Previous Day Low',     placeholder: 'e.g. 3298.00'           },
  { key: 'asianHigh',  label: 'Asian Range High',     placeholder: 'e.g. 3322.00'           },
  { key: 'asianLow',   label: 'Asian Range Low',      placeholder: 'e.g. 3312.00'           },
];

export function XauusdBiasSection() {
  const { loading, elapsed, run } = useGemini();
  const [fields, setFields] = useState<F>({});
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);

  const set = (k: string, v: string) => setFields(prev => ({ ...prev, [k]: v }));

  async function handleGenerate() {
    const prompt = buildDailyBiasPrompt(fields);
    const text = await run(prompt, 0.72);
    if (text) setResult(text);
  }

  function handleReset() {
    setFields({});
    setResult('');
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div>
      {/* Card */}
      <div className="card">
        <div className="card-title">
          <TrendingUp size={13} />
          Daily Bias
        </div>
        <p className="text-xs text-[var(--text3)] mb-4 leading-relaxed">
          Feed your current market read — price, structure, key levels — and get a structured directional bias with reasons, invalidation and session guidance.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          {FIELDS.map(f => (
            <div key={f.key}>
              <label>{f.label}</label>
              <input
                value={fields[f.key] ?? ''}
                onChange={e => set(f.key, e.target.value)}
                placeholder={f.placeholder}
              />
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-1">
          <button className="btn-generate" disabled={loading} onClick={handleGenerate}>
            {loading
              ? <><span className="mini-spinner" /><span>Analysing… {elapsed}s</span></>
              : '⚡ Generate Daily Bias'}
          </button>
          {(result || Object.keys(fields).length > 0) && (
            <button onClick={handleReset} className="btn-sec shrink-0 px-3" title="Reset">
              <RotateCw size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="result-box">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
            <span className="text-xs font-bold text-[var(--gold)] uppercase tracking-widest">Daily Bias Analysis</span>
            <button onClick={handleCopy} className="btn-sec py-1 px-2.5 text-[10px]">
              <Copy size={11} />
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="px-4 py-4 text-sm text-[var(--text)] whitespace-pre-wrap leading-relaxed">
            {result}
          </div>
        </div>
      )}
    </div>
  );
}
