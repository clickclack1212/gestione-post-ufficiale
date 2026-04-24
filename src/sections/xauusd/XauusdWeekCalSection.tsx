import { useState } from 'react';
import { useGemini } from '../../hooks/useGemini';
import { buildWeeklyCalendarPrompt } from '../../services/xauusdPrompts';
import { XauusdResultBox } from '../../components/XauusdResultBox';
import { XauLangSelector } from '../../components/XauLangSelector';
import { CalendarDays, RotateCw } from '../../components/Icon';
import type { XauLang } from '../../services/xauusdPrompts';

export function XauusdWeekCalSection() {
  const { loading, elapsed, run } = useGemini();
  const [timezone, setTimezone] = useState('CET (GMT+1)');
  const [weekRange, setWeekRange] = useState('');
  const [lang, setLang] = useState<XauLang>('it');
  const [result, setResult] = useState('');

  async function handleGenera() {
    const prompt = buildWeeklyCalendarPrompt({ timezone, weekRange }, lang);
    const text = await run(prompt, 0.68);
    if (text) setResult(text);
  }

  return (
    <div>
      <div className="card">
        <div className="card-title">
          <CalendarDays size={13} />
          Calendario Settimanale
        </div>
        <p className="text-xs text-[var(--text3)] mb-4 leading-relaxed">
          Briefing completo sugli eventi economici ad alto impatto della settimana per XAUUSD e DXY — tabella eventi, rischio volatilità, sessioni da evitare, e trigger di inversione rialzo/ribasso.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <div>
            <label>Fuso Orario</label>
            <input
              value={timezone}
              onChange={e => setTimezone(e.target.value)}
              placeholder="es. CET (GMT+1)"
            />
          </div>
          <div>
            <label>Settimana (opzionale)</label>
            <input
              value={weekRange}
              onChange={e => setWeekRange(e.target.value)}
              placeholder="es. 28 Apr – 2 Mag 2025"
            />
          </div>
        </div>

        <XauLangSelector value={lang} onChange={setLang} />

        <div className="flex gap-2 mt-3">
          <button className="btn-generate" disabled={loading} onClick={handleGenera}>
            {loading
              ? <><span className="mini-spinner" /><span>Generazione calendario… {elapsed}s</span></>
              : '📅 Genera Calendario Settimanale'}
          </button>
          {result && (
            <button onClick={() => setResult('')} className="btn-sec shrink-0 px-3" title="Cancella">
              <RotateCw size={13} />
            </button>
          )}
        </div>
      </div>

      {result && (
        <XauusdResultBox result={result} lang={lang} title="Calendario Settimanale" mono />
      )}
    </div>
  );
}
