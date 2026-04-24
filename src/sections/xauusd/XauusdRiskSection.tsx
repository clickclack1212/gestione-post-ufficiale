import { useState } from 'react';
import { useGemini } from '../../hooks/useGemini';
import { buildRiskCalcPrompt } from '../../services/xauusdPrompts';
import { XauusdResultBox } from '../../components/XauusdResultBox';
import { XauLangSelector } from '../../components/XauLangSelector';
import { ClipboardList, RotateCw } from '../../components/Icon';
import type { XauLang } from '../../services/xauusdPrompts';

type F = Record<string, string>;

export function XauusdRiskSection() {
  const { loading, elapsed, run } = useGemini();
  const [fields, setFields] = useState<F>({
    accountType: 'Personale',
    currency: 'USD',
    riskPct: '1%',
    asset: 'XAUUSD',
    tradesToday: '0',
    pnlToday: '$0',
    ddToday: '0',
    ddOverall: '0',
  });
  const [lang, setLang] = useState<XauLang>('it');
  const [result, setResult] = useState('');

  const set = (k: string, v: string) => setFields(prev => ({ ...prev, [k]: v }));

  async function handleCalcola() {
    const prompt = buildRiskCalcPrompt(fields, lang);
    const text = await run(prompt, 0.55);
    if (text) setResult(text);
  }

  return (
    <div>
      <div className="card">
        <div className="card-title">
          <ClipboardList size={13} />
          Calcolatore Rischio
        </div>
        <p className="text-xs text-[var(--text3)] mb-4 leading-relaxed">
          Inserisci i dati del conto e del trade — ottieni il lot size esatto con calcolo passo-passo, rischio in dollari, drawdown giornaliero rimanente e avvisi prop firm.
        </p>

        {/* Conto */}
        <p className="text-[10px] text-[var(--text3)] uppercase tracking-widest font-semibold mb-2">Conto</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <div>
            <label>Tipo Conto</label>
            <select value={fields.accountType ?? 'Personale'} onChange={e => set('accountType', e.target.value)}>
              <option value="Personale">Personale</option>
              <option value="Prop Firm">Prop Firm</option>
              <option value="Demo">Demo</option>
            </select>
          </div>
          <div>
            <label>Saldo ($)</label>
            <input value={fields.balance ?? ''} onChange={e => set('balance', e.target.value)} placeholder="es. 10000" />
          </div>
          <div>
            <label>Valuta</label>
            <input value={fields.currency ?? 'USD'} onChange={e => set('currency', e.target.value)} placeholder="USD" />
          </div>
          <div>
            <label>Max Drawdown Giornaliero (%)</label>
            <input value={fields.maxDailyDD ?? ''} onChange={e => set('maxDailyDD', e.target.value)} placeholder="es. 5%" />
          </div>
          <div>
            <label>Max Drawdown Complessivo (%)</label>
            <input value={fields.maxOverallDD ?? ''} onChange={e => set('maxOverallDD', e.target.value)} placeholder="es. 10%" />
          </div>
        </div>

        {/* Oggi */}
        <p className="text-[10px] text-[var(--text3)] uppercase tracking-widest font-semibold mb-2 mt-2">Oggi fino a ora</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4">
          <div>
            <label>Trade Aperti</label>
            <input type="number" value={fields.tradesToday ?? '0'} onChange={e => set('tradesToday', e.target.value)} placeholder="0" />
          </div>
          <div>
            <label>P&amp;L Oggi</label>
            <input value={fields.pnlToday ?? '$0'} onChange={e => set('pnlToday', e.target.value)} placeholder="es. -$120" />
          </div>
          <div>
            <label>DD Usato Oggi (%)</label>
            <input value={fields.ddToday ?? '0'} onChange={e => set('ddToday', e.target.value)} placeholder="es. 1.2" />
          </div>
          <div>
            <label>DD Usato Totale (%)</label>
            <input value={fields.ddOverall ?? '0'} onChange={e => set('ddOverall', e.target.value)} placeholder="es. 3.5" />
          </div>
        </div>

        {/* Trade */}
        <p className="text-[10px] text-[var(--text3)] uppercase tracking-widest font-semibold mb-2 mt-2">Questo Trade</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <div>
            <label>Asset</label>
            <input value={fields.asset ?? 'XAUUSD'} onChange={e => set('asset', e.target.value)} placeholder="XAUUSD" />
          </div>
          <div>
            <label>Direzione</label>
            <select value={fields.direction ?? ''} onChange={e => set('direction', e.target.value)}>
              <option value="">Seleziona…</option>
              <option value="BUY">BUY</option>
              <option value="SELL">SELL</option>
            </select>
          </div>
          <div>
            <label>Rischio %</label>
            <input value={fields.riskPct ?? '1%'} onChange={e => set('riskPct', e.target.value)} placeholder="es. 1%" />
          </div>
          <div>
            <label>Stop Loss (pips)</label>
            <input value={fields.sl ?? ''} onChange={e => set('sl', e.target.value)} placeholder="es. 20" />
          </div>
        </div>

        <XauLangSelector value={lang} onChange={setLang} />

        <div className="flex gap-2 mt-3">
          <button className="btn-generate" disabled={loading} onClick={handleCalcola}>
            {loading
              ? <><span className="mini-spinner" /><span>Calcolo in corso… {elapsed}s</span></>
              : '📊 Calcola Dimensione Posizione'}
          </button>
          {result && (
            <button onClick={() => setResult('')} className="btn-sec shrink-0 px-3" title="Cancella">
              <RotateCw size={13} />
            </button>
          )}
        </div>
      </div>

      {result && (
        <XauusdResultBox result={result} lang={lang} title="Calcolo Dimensione Posizione" />
      )}
    </div>
  );
}
