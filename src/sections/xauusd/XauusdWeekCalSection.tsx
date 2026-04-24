import { useState } from 'react';
import { useGemini } from '../../hooks/useGemini';
import { buildWeeklyCalendarPrompt } from '../../services/xauusdPrompts';
import { Copy, CalendarDays, RotateCw } from '../../components/Icon';

export function XauusdWeekCalSection() {
  const { loading, elapsed, run } = useGemini();
  const [timezone, setTimezone] = useState('CET (GMT+1)');
  const [weekRange, setWeekRange] = useState('');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    const prompt = buildWeeklyCalendarPrompt({ timezone, weekRange });
    const text = await run(prompt, 0.68);
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
          <CalendarDays size={13} />
          Weekly Calendar
        </div>
        <p className="text-xs text-[var(--text3)] mb-4 leading-relaxed">
          Get a complete weekly briefing on high-impact economic events affecting XAUUSD and DXY — including a table, volatility forecast, sessions to avoid, and bull/bear reversal triggers.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <div>
            <label>Timezone</label>
            <input
              value={timezone}
              onChange={e => setTimezone(e.target.value)}
              placeholder="e.g. CET (GMT+1)"
            />
          </div>
          <div>
            <label>Week (optional)</label>
            <input
              value={weekRange}
              onChange={e => setWeekRange(e.target.value)}
              placeholder="e.g. Apr 28 – May 2, 2025"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-1">
          <button className="btn-generate" disabled={loading} onClick={handleGenerate}>
            {loading
              ? <><span className="mini-spinner" /><span>Building calendar… {elapsed}s</span></>
              : '📅 Generate Weekly Calendar'}
          </button>
          {result && (
            <button onClick={() => setResult('')} className="btn-sec shrink-0 px-3" title="Clear">
              <RotateCw size={13} />
            </button>
          )}
        </div>
      </div>

      {result && (
        <div className="result-box">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
            <span className="text-xs font-bold text-[var(--gold)] uppercase tracking-widest">Weekly Calendar Briefing</span>
            <button onClick={handleCopy} className="btn-sec py-1 px-2.5 text-[10px]">
              <Copy size={11} />
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="px-4 py-4 text-sm text-[var(--text)] whitespace-pre-wrap leading-relaxed font-mono text-xs">
            {result}
          </div>
        </div>
      )}
    </div>
  );
}
