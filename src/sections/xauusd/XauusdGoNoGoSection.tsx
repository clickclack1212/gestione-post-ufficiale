import { useState } from 'react';
import { useGemini } from '../../hooks/useGemini';
import { buildGoNoGoPrompt } from '../../services/xauusdPrompts';
import { XauusdResultBox } from '../../components/XauusdResultBox';
import { XauLangSelector } from '../../components/XauLangSelector';
import { Shield, RotateCw } from '../../components/Icon';
import type { XauLang } from '../../services/xauusdPrompts';

type F = Record<string, string>;

export function XauusdGoNoGoSection() {
  const { loading, elapsed, run } = useGemini();
  const [fields, setFields] = useState<F>({ asset: 'XAUUSD' });
  const [lang, setLang] = useState<XauLang>('it');
  const [result, setResult] = useState('');

  const set = (k: string, v: string) => setFields(prev => ({ ...prev, [k]: v }));

  async function handleValida() {
    const prompt = buildGoNoGoPrompt(fields, lang);
    const text = await run(prompt, 0.68);
    if (text) setResult(text);
  }

  function handleReset() {
    setFields({ asset: 'XAUUSD' });
    setResult('');
  }

  // Rileva il verdetto per colorare il box
  const verdetto = result
    ? /\bGO\b/.test(result) && !/NO.GO/i.test(result) ? 'go'
    : /NO.GO/i.test(result) ? 'nogo'
    : /\bWAIT\b|\bATTENDI\b/i.test(result) ? 'wait'
    : null
    : null;

  const coloreVerdetto =
    verdetto === 'go'   ? 'var(--green)'  :
    verdetto === 'nogo' ? 'var(--red)'    :
    verdetto === 'wait' ? 'var(--yellow)' : 'var(--gold)';

  return (
    <div>
      <div className="card">
        <div className="card-title">
          <Shield size={13} />
          Validatore Go / No-Go
        </div>
        <p className="text-xs text-[var(--text3)] mb-4 leading-relaxed">
          L'AI fa da validatore scettico del tuo trade. Inserisci il setup — ti darà 3 motivi per <strong className="text-[var(--text2)]">non</strong> entrare, poi un verdetto finale: <span className="text-[var(--green)]">GO</span> / <span className="text-[var(--red)]">NO-GO</span> / <span className="text-[var(--yellow)]">ATTENDI</span>.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <div>
            <label>Asset</label>
            <input value={fields.asset ?? 'XAUUSD'} onChange={e => set('asset', e.target.value)} placeholder="XAUUSD" />
          </div>
          <div>
            <label>Direzione</label>
            <select value={fields.direction ?? ''} onChange={e => set('direction', e.target.value)}>
              <option value="">Seleziona…</option>
              <option value="BUY (Long)">BUY (Long)</option>
              <option value="SELL (Short)">SELL (Short)</option>
            </select>
          </div>
          <div>
            <label>Sessione</label>
            <select value={fields.session ?? ''} onChange={e => set('session', e.target.value)}>
              <option value="">Seleziona…</option>
              <option value="London">London</option>
              <option value="New York">New York</option>
              <option value="Asian">Asian</option>
              <option value="London/NY overlap">London/NY overlap</option>
            </select>
          </div>
          <div>
            <label>Prezzo di Entrata</label>
            <input value={fields.entry ?? ''} onChange={e => set('entry', e.target.value)} placeholder="es. 3318.50" />
          </div>
          <div>
            <label>Stop Loss (pips)</label>
            <input value={fields.sl ?? ''} onChange={e => set('sl', e.target.value)} placeholder="es. 15" />
          </div>
          <div>
            <label>Zona Stop Loss</label>
            <input value={fields.slDir ?? ''} onChange={e => set('slDir', e.target.value)} placeholder="es. sotto 3303" />
          </div>
          <div>
            <label>Take Profit (pips)</label>
            <input value={fields.tp ?? ''} onChange={e => set('tp', e.target.value)} placeholder="es. 30" />
          </div>
          <div>
            <label>Zona Take Profit</label>
            <input value={fields.tpDir ?? ''} onChange={e => set('tpDir', e.target.value)} placeholder="es. a 3348" />
          </div>
          <div>
            <label>Rapporto Rischio/Rendimento (1:X)</label>
            <input value={fields.rr ?? ''} onChange={e => set('rr', e.target.value)} placeholder="es. 2" />
          </div>
          <div>
            <label>Confidenza (1–10)</label>
            <input type="number" min="1" max="10" value={fields.confidence ?? ''} onChange={e => set('confidence', e.target.value)} placeholder="es. 7" />
          </div>
          <div>
            <label>Notizie nelle prossime 2 ore</label>
            <input value={fields.news ?? ''} onChange={e => set('news', e.target.value)} placeholder="es. NFP alle 14:30 — oppure 'nessuna'" />
          </div>
        </div>

        <div>
          <label>Motivazione dell'Entrata</label>
          <textarea
            value={fields.reason ?? ''}
            onChange={e => set('reason', e.target.value)}
            placeholder="Descrivi il motivo dell'entrata — es. BOS sul 15M, order block retestato a 3318, struttura 4H ribassista…"
            style={{ minHeight: 70 }}
          />
        </div>

        <XauLangSelector value={lang} onChange={setLang} />

        <div className="flex gap-2 mt-3">
          <button className="btn-generate" disabled={loading} onClick={handleValida}>
            {loading
              ? <><span className="mini-spinner" /><span>Validazione in corso… {elapsed}s</span></>
              : '🛡 Valida il Trade'}
          </button>
          {(result || Object.keys(fields).length > 1) && (
            <button onClick={handleReset} className="btn-sec shrink-0 px-3" title="Reset">
              <RotateCw size={13} />
            </button>
          )}
        </div>
      </div>

      {result && (
        <XauusdResultBox
          result={result}
          lang={lang}
          title="Validazione Trade"
          // Passa il colore del verdetto tramite prop custom (gestito internamente con override stile)
        />
      )}

      {/* Verdetto badge visibile subito */}
      {result && verdetto && (
        <div
          className="mt-2 px-4 py-2 rounded-[var(--radius-sm)] border text-xs font-bold uppercase tracking-widest text-center"
          style={{ borderColor: `${coloreVerdetto}40`, background: `${coloreVerdetto}10`, color: coloreVerdetto }}
        >
          {verdetto === 'go' && '✅ VERDETTO: GO — Setup sufficientemente valido'}
          {verdetto === 'nogo' && '❌ VERDETTO: NO-GO — Salta questo trade'}
          {verdetto === 'wait' && '⏳ VERDETTO: ATTENDI — Serve conferma'}
        </div>
      )}
    </div>
  );
}
