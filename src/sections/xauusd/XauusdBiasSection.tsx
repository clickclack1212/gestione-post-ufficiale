import { useState } from 'react';
import { useGemini } from '../../hooks/useGemini';
import { buildDailyBiasPrompt } from '../../services/xauusdPrompts';
import { XauusdResultBox } from '../../components/XauusdResultBox';
import { XauLangSelector } from '../../components/XauLangSelector';
import { TrendingUp, RotateCw } from '../../components/Icon';
import type { XauLang } from '../../services/xauusdPrompts';

type F = Record<string, string>;

const CAMPI: { key: string; label: string; placeholder: string }[] = [
  { key: 'price',       label: 'Prezzo Attuale',            placeholder: 'es. 3320.50'               },
  { key: 'candle4h',    label: 'Chiusura Ultima Candela 4H', placeholder: 'es. 3318.00 ribassista'   },
  { key: 'structure4h', label: 'Struttura 4H',               placeholder: 'es. BOS al ribasso'       },
  { key: 'dailyTrend',  label: 'Trend Daily',                placeholder: 'es. ribassista, HTF sell' },
  { key: 'resistance',  label: 'Resistenza Chiave Sopra',    placeholder: 'es. 3340.00'              },
  { key: 'support',     label: 'Supporto Chiave Sotto',      placeholder: 'es. 3300.00'              },
  { key: 'prevHigh',    label: 'Massimo Giorno Precedente',  placeholder: 'es. 3335.00'              },
  { key: 'prevLow',     label: 'Minimo Giorno Precedente',   placeholder: 'es. 3298.00'              },
  { key: 'asianHigh',   label: 'Range Asiatico — Massimo',   placeholder: 'es. 3322.00'              },
  { key: 'asianLow',    label: 'Range Asiatico — Minimo',    placeholder: 'es. 3312.00'              },
];

export function XauusdBiasSection() {
  const { loading, elapsed, run } = useGemini();
  const [fields, setFields] = useState<F>({});
  const [lang, setLang] = useState<XauLang>('it');
  const [result, setResult] = useState('');

  const set = (k: string, v: string) => setFields(prev => ({ ...prev, [k]: v }));

  async function handleGenera() {
    const prompt = buildDailyBiasPrompt(fields, lang);
    const text = await run(prompt, 0.72);
    if (text) setResult(text);
  }

  function handleReset() {
    setFields({});
    setResult('');
  }

  return (
    <div>
      <div className="card">
        <div className="card-title">
          <TrendingUp size={13} />
          Bias Giornaliero
        </div>
        <p className="text-xs text-[var(--text3)] mb-4 leading-relaxed">
          Inserisci la tua lettura del mercato — prezzo, struttura, livelli chiave, range asiatico — e ottieni un bias direzionale strutturato con motivi, invalidazione e sessione consigliata.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          {CAMPI.map(c => (
            <div key={c.key}>
              <label>{c.label}</label>
              <input
                value={fields[c.key] ?? ''}
                onChange={e => set(c.key, e.target.value)}
                placeholder={c.placeholder}
              />
            </div>
          ))}
        </div>

        <XauLangSelector value={lang} onChange={setLang} />

        <div className="flex gap-2 mt-3">
          <button className="btn-generate" disabled={loading} onClick={handleGenera}>
            {loading
              ? <><span className="mini-spinner" /><span>Analisi in corso… {elapsed}s</span></>
              : '⚡ Genera Bias Giornaliero'}
          </button>
          {(result || Object.keys(fields).length > 0) && (
            <button onClick={handleReset} className="btn-sec shrink-0 px-3" title="Reset">
              <RotateCw size={13} />
            </button>
          )}
        </div>
      </div>

      {result && (
        <XauusdResultBox result={result} lang={lang} title="Analisi Bias Giornaliero" />
      )}
    </div>
  );
}
