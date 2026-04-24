import { useState } from 'react';
import { useGemini } from '../../hooks/useGemini';
import { buildRiskCalcPrompt } from '../../services/xauusdPrompts';
import { Copy, ClipboardList, RotateCw } from '../../components/Icon';

type F = Record<string, string>;

export function XauusdRiskSection() {
  const { loading, elapsed, run } = useGemini();
  const [fields, setFields] = useState<F>({
    accountType: 'Personal',
    currency: 'USD',
    riskPct: '1%',
    asset: 'XAUUSD',
    tradesToday: '0',
    pnlToday: '$0',
    ddToday: '0',
    ddOverall: '0',
  });
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);

  const set = (k: string, v: string) => setFields(prev => ({ ...prev, [k]: v }));

  async function handleGenerate() {
    const prompt = buildRiskCalcPrompt(fields);
    const text = await run(prompt, 0.55);
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
          <ClipboardList size={13} />
          Risk Calculator
        </div>
        <p className="text-xs text-[var(--text3)] mb-4 leading-relaxed">
          Enter your account details and trade parameters — get exact lot size with step-by-step math, dollar risk, daily drawdown remaining, and prop firm rule warnings.
        </p>

        {/* Account */}
        <p className="text-[10px] text-[var(--text3)] uppercase tracking-widest font-semibold mb-2">Account</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <div>
            <label>Account Type</label>
            <select value={fields.accountType ?? 'Personal'} onChange={e => set('accountType', e.target.value)}>
              <option value="Personal">Personal</option>
              <option value="Prop Firm">Prop Firm</option>
              <option value="Demo">Demo</option>
            </select>
          </div>
          <div>
            <label>Balance ($)</label>
            <input value={fields.balance ?? ''} onChange={e => set('balance', e.target.value)} placeholder="e.g. 10000" />
          </div>
          <div>
            <label>Currency</label>
            <input value={fields.currency ?? 'USD'} onChange={e => set('currency', e.target.value)} placeholder="USD" />
          </div>
          <div>
            <label>Max Daily Drawdown (%)</label>
            <input value={fields.maxDailyDD ?? ''} onChange={e => set('maxDailyDD', e.target.value)} placeholder="e.g. 5%" />
          </div>
          <div>
            <label>Max Overall Drawdown (%)</label>
            <input value={fields.maxOverallDD ?? ''} onChange={e => set('maxOverallDD', e.target.value)} placeholder="e.g. 10%" />
          </div>
        </div>

        {/* Today */}
        <p className="text-[10px] text-[var(--text3)] uppercase tracking-widest font-semibold mb-2 mt-2">Today so far</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4">
          <div>
            <label>Trades Taken</label>
            <input type="number" value={fields.tradesToday ?? '0'} onChange={e => set('tradesToday', e.target.value)} placeholder="0" />
          </div>
          <div>
            <label>P&amp;L Today</label>
            <input value={fields.pnlToday ?? '$0'} onChange={e => set('pnlToday', e.target.value)} placeholder="e.g. -$120" />
          </div>
          <div>
            <label>DD Used Today (%)</label>
            <input value={fields.ddToday ?? '0'} onChange={e => set('ddToday', e.target.value)} placeholder="e.g. 1.2" />
          </div>
          <div>
            <label>DD Used Overall (%)</label>
            <input value={fields.ddOverall ?? '0'} onChange={e => set('ddOverall', e.target.value)} placeholder="e.g. 3.5" />
          </div>
        </div>

        {/* Trade */}
        <p className="text-[10px] text-[var(--text3)] uppercase tracking-widest font-semibold mb-2 mt-2">This trade</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <div>
            <label>Asset</label>
            <input value={fields.asset ?? 'XAUUSD'} onChange={e => set('asset', e.target.value)} placeholder="XAUUSD" />
          </div>
          <div>
            <label>Direction</label>
            <select value={fields.direction ?? ''} onChange={e => set('direction', e.target.value)}>
              <option value="">Select…</option>
              <option value="BUY">BUY</option>
              <option value="SELL">SELL</option>
            </select>
          </div>
          <div>
            <label>Risk %</label>
            <input value={fields.riskPct ?? '1%'} onChange={e => set('riskPct', e.target.value)} placeholder="e.g. 1%" />
          </div>
          <div>
            <label>Stop Loss (pips)</label>
            <input value={fields.sl ?? ''} onChange={e => set('sl', e.target.value)} placeholder="e.g. 20" />
          </div>
        </div>

        <div className="flex gap-2 mt-1">
          <button className="btn-generate" disabled={loading} onClick={handleGenerate}>
            {loading
              ? <><span className="mini-spinner" /><span>Calculating… {elapsed}s</span></>
              : '📊 Calculate Position Size'}
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
            <span className="text-xs font-bold text-[var(--gold)] uppercase tracking-widest">Position Size Calculation</span>
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
