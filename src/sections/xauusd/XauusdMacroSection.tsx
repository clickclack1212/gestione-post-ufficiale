import { useState } from 'react';
import { useGemini } from '../../hooks/useGemini';
import { buildMacroIntelPrompt } from '../../services/xauusdPrompts';
import { XauusdResultBox } from '../../components/XauusdResultBox';
import { XauLangSelector } from '../../components/XauLangSelector';
import { Globe, RefreshCw } from '../../components/Icon';
import type { XauLang } from '../../services/xauusdPrompts';

export function XauusdMacroSection() {
  const { loading, elapsed, run } = useGemini();
  const [lang, setLang] = useState<XauLang>('it');
  const [result, setResult] = useState('');

  async function handleGenera() {
    const prompt = buildMacroIntelPrompt(lang);
    const text = await run(prompt, 0.70);
    if (text) setResult(text);
  }

  return (
    <div>
      <div className="card">
        <div className="card-title">
          <Globe size={13} />
          Macro Intelligence
        </div>
        <p className="text-xs text-[var(--text3)] mb-4 leading-relaxed">
          Briefing macro giornaliero strutturato su Oro e Dollaro USA — posizione Fed, dati inflazione, geopolitica, rendimenti obbligazionari, direzione DXY e eventi a rischio nelle prossime 24–48 ore.
        </p>

        {/* Chip informativi */}
        <div className="flex flex-wrap gap-2 mb-4">
          {['Posizione Fed', 'CPI / PCE / PPI', 'Geopolitica', 'US 10Y Yield', 'Livelli DXY', 'Risk Events 48h'].map(tag => (
            <span key={tag} className="text-[10px] px-2 py-1 rounded-full bg-[var(--bg3)] border border-[var(--border)] text-[var(--text3)]">
              {tag}
            </span>
          ))}
        </div>

        <XauLangSelector value={lang} onChange={setLang} />

        <div className="flex gap-2 mt-3">
          <button className="btn-generate" disabled={loading} onClick={handleGenera}>
            {loading
              ? <><span className="mini-spinner" /><span>Analisi macro in corso… {elapsed}s</span></>
              : '🌍 Genera Briefing Macro'}
          </button>
          {result && (
            <button onClick={() => setResult('')} className="btn-sec shrink-0 px-3" title="Cancella">
              <RefreshCw size={13} />
            </button>
          )}
        </div>
      </div>

      {result && (
        <XauusdResultBox result={result} lang={lang} title="Briefing Macro" />
      )}
    </div>
  );
}
