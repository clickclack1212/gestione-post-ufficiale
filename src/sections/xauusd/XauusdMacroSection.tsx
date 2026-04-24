import { useState } from 'react';
import { useGemini } from '../../hooks/useGemini';
import { buildMacroIntelPrompt } from '../../services/xauusdPrompts';
import { Copy, Globe, RefreshCw } from '../../components/Icon';

export function XauusdMacroSection() {
  const { loading, elapsed, run } = useGemini();
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    const prompt = buildMacroIntelPrompt();
    const text = await run(prompt, 0.70);
    if (text) setResult(text);
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div>
      <div className="card">
        <div className="card-title">
          <Globe size={13} />
          Macro Intel
        </div>
        <p className="text-xs text-[var(--text3)] mb-4 leading-relaxed">
          Get a structured daily macro briefing on Gold and the US Dollar — Fed stance, inflation data, geopolitics, bond yields, DXY direction and key risk events for the next 24–48 hours.
        </p>

        {/* Info chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          {['Fed Stance', 'CPI / PCE / PPI', 'Geopolitics', 'US 10Y Yield', 'DXY Levels', 'Risk Events 48h'].map(tag => (
            <span key={tag} className="text-[10px] px-2 py-1 rounded-full bg-[var(--bg3)] border border-[var(--border)] text-[var(--text3)]">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          <button className="btn-generate" disabled={loading} onClick={handleGenerate}>
            {loading
              ? <><span className="mini-spinner" /><span>Fetching macro… {elapsed}s</span></>
              : '🌍 Get Macro Briefing'}
          </button>
          {result && (
            <button onClick={() => setResult('')} className="btn-sec shrink-0 px-3" title="Clear">
              <RefreshCw size={13} />
            </button>
          )}
        </div>
      </div>

      {result && (
        <div className="result-box">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
            <span className="text-xs font-bold text-[var(--gold)] uppercase tracking-widest">Macro Intel Briefing</span>
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
