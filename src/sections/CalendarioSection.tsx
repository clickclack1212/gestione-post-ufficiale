import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useGemini } from '../hooks/useGemini';
import { ToneSelector } from '../components/ToneSelector';
import { BilingualResult } from '../components/BilingualResult';
import { buildCalendarParsePrompt, buildCalendarNewsPrompt, parseBilingual } from '../services/prompts';
import { ALL_CURRENCIES } from '../constants/data';
import type { CalendarEvent, Tone } from '../types';

const IMPACT_COLORS: Record<string, string> = {
  alto:   'text-[var(--red)]',
  medio:  'text-[var(--orange)]',
  basso:  'text-[var(--text3)]',
};

export function CalendarioSection() {
  const { config, calendarEvents, setCalendarEvents, showToast } = useApp();
  const { loading, elapsed, run } = useGemini();
  const [rawCalText, setRawCalText] = useState('');
  const [tone, setTone] = useState<Tone>('assertivo');
  const [filterCurr, setFilterCurr] = useState<string[]>(
    Array.isArray(config.currencies) && config.currencies.length > 0
      ? config.currencies
      : ['XAU', 'USD'],
  );
  const [filterImpact, setFilterImpact] = useState<string[]>(['alto', 'medio']);
  const [newsResult, setNewsResult] = useState({ it: '', en: '' });

  const dateLabel = config.calFrom && config.calTo
    ? `${config.calFrom} → ${config.calTo}`
    : new Date().toLocaleDateString('it-IT');

  async function pasteCalendar() {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) {
        setRawCalText(text);
        showToast('Calendario incollato dagli appunti ✓', 'success');
      }
    } catch {
      showToast('Impossibile leggere dagli appunti. Incolla manualmente.', 'error');
    }
  }

  async function handleParseCalendar() {
    if (!rawCalText.trim()) return;
    const prompt = buildCalendarParsePrompt(rawCalText, dateLabel);
    const text = await run(prompt, 0.3);
    if (!text) return;

    try {
      const cleaned = text.replace(/```json|```/g, '').trim();
      const events: CalendarEvent[] = JSON.parse(cleaned);
      setCalendarEvents(Array.isArray(events) ? events : []);
      showToast(`Importati ${events.length} eventi`, 'success');
    } catch {
      showToast('Errore nel parsing JSON del calendario', 'error');
    }
  }

  async function handleGenerateNews() {
    const visibleEvents = filteredEvents();
    if (visibleEvents.length === 0) {
      showToast('Nessun evento da analizzare', 'error');
      return;
    }
    const prompt = buildCalendarNewsPrompt(visibleEvents, config, tone);
    const text = await run(prompt);
    if (text) setNewsResult(parseBilingual(text));
  }

  function filteredEvents(): CalendarEvent[] {
    return calendarEvents.filter(e => {
      const currMatch = filterCurr.length === 0 || filterCurr.includes(e.currency);
      const impactMatch = filterImpact.length === 0 || filterImpact.includes(e.impact?.toLowerCase() ?? '');
      return currMatch && impactMatch;
    });
  }

  const shown = filteredEvents();

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Import */}
      <div className="card">
        <div className="card-title">📰 Importa Calendario Economico</div>
        <p className="text-[var(--text3)] text-sm mb-4">
          Copia il testo da ForexFactory o simili e incollalo qui sotto — l&apos;AI estrarrà e strutturerà automaticamente tutti gli eventi.
        </p>

        {/* Quick paste buttons */}
        <div className="flex gap-2 mb-3">
          <button className="btn-paste flex-1 justify-center" onClick={pasteCalendar}>
            📋 Incolla dagli Appunti
          </button>
          {rawCalText && (
            <button
              className="px-3 py-1.5 text-xs border border-[var(--border)] rounded-[var(--radius-sm)]
                text-[var(--text3)] hover:text-[var(--red)] transition-colors"
              onClick={() => setRawCalText('')}
              title="Svuota"
            >
              ✕
            </button>
          )}
        </div>

        <div className="relative">
          <div className="absolute top-2 right-2 text-[10px] text-[var(--text3)] pointer-events-none">
            Manuale
          </div>
          <textarea
            className="result-textarea border border-[var(--border)] rounded-[var(--radius-sm)]
              bg-[var(--bg4)] min-h-[90px]"
            placeholder="…oppure incolla qui il testo del calendario (Ctrl+V)"
            value={rawCalText}
            onChange={e => setRawCalText(e.target.value)}
            rows={4}
          />
        </div>

        <button
          className="btn-generate w-full mt-2"
          onClick={handleParseCalendar}
          disabled={loading || !rawCalText.trim()}
        >
          {loading && newsResult.it === ''
            ? <span className="flex items-center justify-center gap-2"><span className="spinner" /> Importando... {elapsed}s</span>
            : '📥 Importa & Analizza con AI'}
        </button>
      </div>

      {/* Filters */}
      {calendarEvents.length > 0 && (
        <div className="card">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="text-xs text-[var(--text3)] uppercase tracking-widest">Valute</span>
            {ALL_CURRENCIES.map(c => (
              <button
                key={c}
                onClick={() => setFilterCurr(prev =>
                  prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
                )}
                className={`cal-filter-chip ${filterCurr.includes(c) ? 'active' : ''}`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-[var(--text3)] uppercase tracking-widest">Impatto</span>
            {['alto', 'medio', 'basso'].map(i => (
              <button
                key={i}
                onClick={() => setFilterImpact(prev =>
                  prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
                )}
                className={`cal-filter-chip ${filterImpact.includes(i) ? 'active' : ''} capitalize`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Events table */}
      {shown.length > 0 && (
        <div className="card overflow-x-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="card-title mb-0">📋 {shown.length} eventi</span>
            <ToneSelector value={tone} onChange={setTone} />
          </div>

          <table className="w-full text-xs">
            <thead>
              <tr className="text-[var(--text3)] border-b border-[var(--bg3)]">
                <th className="text-left pb-2 pr-3 font-medium">Orario</th>
                <th className="text-left pb-2 pr-3 font-medium">Valuta</th>
                <th className="text-left pb-2 pr-3 font-medium">Evento</th>
                <th className="text-left pb-2 pr-3 font-medium">Impatto</th>
                <th className="text-left pb-2 pr-3 font-medium">Atteso</th>
                <th className="text-left pb-2 font-medium">Precedente</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((ev, i) => (
                <tr key={i} className="border-b border-[var(--bg3)]/50 hover:bg-[var(--bg2)] transition-colors">
                  <td className="py-1.5 pr-3 text-[var(--gold)] font-mono">{ev.time}</td>
                  <td className="py-1.5 pr-3 font-medium text-[var(--text)]">{ev.currency}</td>
                  <td className="py-1.5 pr-3 text-[var(--text2)]">{ev.title}</td>
                  <td className={`py-1.5 pr-3 capitalize font-medium ${IMPACT_COLORS[ev.impact?.toLowerCase() ?? ''] || ''}`}>
                    {ev.impact}
                  </td>
                  <td className="py-1.5 pr-3 text-[var(--text3)]">{ev.forecast ?? '—'}</td>
                  <td className="py-1.5 text-[var(--text3)]">{ev.previous ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            className="cal-generate-btn w-full mt-4"
            onClick={handleGenerateNews}
            disabled={loading}
          >
            {loading && newsResult.it !== ''
              ? <span className="flex items-center justify-center gap-2"><span className="spinner" /> Generando... {elapsed}s</span>
              : '📰 Genera Post Notizie Gold'}
          </button>
        </div>
      )}

      {(newsResult.it || newsResult.en) && (
        <BilingualResult it={newsResult.it} en={newsResult.en} />
      )}
    </div>
  );
}
