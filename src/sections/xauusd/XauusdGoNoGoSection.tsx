import { useState } from 'react';
import { useGemini } from '../../hooks/useGemini';
import { buildGoNoGoPrompt } from '../../services/xauusdPrompts';
import { Copy, Shield, RotateCw } from '../../components/Icon';

type F = Record<string, string>;

export function XauusdGoNoGoSection() {
  const { loading, elapsed, run } = useGemini();
  const [fields, setFields] = useState<F>({ asset: 'XAUUSD' });
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);

  const set = (k: string, v: string) => setFields(prev => ({ ...prev, [k]: v }));

  async function handleGenerate() {
    const prompt = buildGoNoGoPrompt(fields);
    const text = await run(prompt, 0.68);
    if (text) setResult(text);
  }

  function handleReset() {
    setFields({ asset: 'XAUUSD' });
    setResult('');
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  const verdict = result
    ? result.includes('✅') || /\bGO\b/.test(result) ? 'go'
    : result.includes('❌') || /\bNO.GO\b/i.test(result) ? 'nogo'
    : result.includes('⏳') || /\bWAIT\b/.test(result) ? 'wait'
    : null
    : null;

  const verdictColor =
    verdict === 'go'   ? 'var(--green)'  :
    verdict === 'nogo' ? 'var(--red)'    :
    verdict === 'wait' ? 'var(--yellow)' : 'var(--gold)';

  return (
    <div>
      <div className="card">
        <div className="card-title">
          <Shield size={13} />
          Go / No-Go Validator
        </div>
        <p className="text-xs text-[var(--text3)] mb-4 leading-relaxed">
          The AI acts as a skeptical pre-trade validator. Fill in your setup — it will give you 3 reasons NOT to take the trade, then a final GO / NO-GO / WAIT verdict.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <div>
            <label>Asset</label>
            <input value={fields.asset ?? 'XAUUSD'} onChange={e => set('asset', e.target.value)} placeholder="XAUUSD" />
          </div>
          <div>
            <label>Direction</label>
            <select value={fields.direction ?? ''} onChange={e => set('direction', e.target.value)}>
              <option value="">Select…</option>
              <option value="BUY (Long)">BUY (Long)</option>
              <option value="SELL (Short)">SELL (Short)</option>
            </select>
          </div>
          <div>
            <label>Session</label>
            <select value={fields.session ?? ''} onChange={e => set('session', e.target.value)}>
              <option value="">Select…</option>
              <option value="London">London</option>
              <option value="New York">New York</option>
              <option value="Asian">Asian</option>
              <option value="London/NY overlap">London/NY overlap</option>
            </select>
          </div>
          <div>
            <label>Entry Price</label>
            <input value={fields.entry ?? ''} onChange={e => set('entry', e.target.value)} placeholder="e.g. 3318.50" />
          </div>
          <div>
            <label>Stop Loss (pips)</label>
            <input value={fields.sl ?? ''} onChange={e => set('sl', e.target.value)} placeholder="e.g. 15" />
          </div>
          <div>
            <label>SL Direction</label>
            <input value={fields.slDir ?? ''} onChange={e => set('slDir', e.target.value)} placeholder="e.g. below 3303" />
          </div>
          <div>
            <label>Take Profit (pips)</label>
            <input value={fields.tp ?? ''} onChange={e => set('tp', e.target.value)} placeholder="e.g. 30" />
          </div>
          <div>
            <label>TP Direction</label>
            <input value={fields.tpDir ?? ''} onChange={e => set('tpDir', e.target.value)} placeholder="e.g. at 3348" />
          </div>
          <div>
            <label>Risk-to-Reward (1:X)</label>
            <input value={fields.rr ?? ''} onChange={e => set('rr', e.target.value)} placeholder="e.g. 2" />
          </div>
          <div>
            <label>Confidence (1–10)</label>
            <input type="number" min="1" max="10" value={fields.confidence ?? ''} onChange={e => set('confidence', e.target.value)} placeholder="e.g. 7" />
          </div>
          <div>
            <label>News in next 2 hours</label>
            <input value={fields.news ?? ''} onChange={e => set('news', e.target.value)} placeholder="e.g. NFP at 14:30 — or 'none'" />
          </div>
        </div>

        <div>
          <label>Entry Reason</label>
          <textarea
            value={fields.reason ?? ''}
            onChange={e => set('reason', e.target.value)}
            placeholder="Describe your entry reason — e.g. BOS on 15M, retested order block at 3318, 4H structure bearish…"
            style={{ minHeight: 70 }}
          />
        </div>

        <div className="flex gap-2 mt-1">
          <button className="btn-generate" disabled={loading} onClick={handleGenerate}>
            {loading
              ? <><span className="mini-spinner" /><span>Validating… {elapsed}s</span></>
              : '🛡 Validate This Trade'}
          </button>
          {(result || Object.keys(fields).length > 1) && (
            <button onClick={handleReset} className="btn-sec shrink-0 px-3" title="Reset">
              <RotateCw size={13} />
            </button>
          )}
        </div>
      </div>

      {result && (
        <div className="result-box" style={{ borderColor: `${verdictColor}40` }}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: verdictColor }}>
              Trade Validation
            </span>
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
