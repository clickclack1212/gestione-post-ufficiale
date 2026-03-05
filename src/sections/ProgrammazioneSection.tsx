import { useState } from 'react';
import { DailySignalPanel } from './DailySignalPanel';
import { DailyNoSignalPanel } from './DailyNoSignalPanel';
import { AltPlanPanel } from './AltPlanPanel';
import { WeekendPanel } from './WeekendPanel';
import { HypePlanPanel } from './HypePlanPanel';
import { CostanzaPlanPanel } from './CostanzaPlanPanel';
import { Icon, CalendarDays } from '../components/Icon';

type ProgMode = 'daily_signal' | 'daily_nosignal' | 'alt' | 'weekend' | 'hype' | 'costanza';

const PROG_MODES: { id: ProgMode; icon: string; name: string; desc: string; color: string }[] = [
  {
    id: 'daily_signal',
    icon: 'ClipboardList',
    name: 'Giornaliera\ncon Segnale',
    desc: '12 slot · 07:00→21:00',
    color: '#FFAD47',
  },
  {
    id: 'daily_nosignal',
    icon: 'Lock',
    name: 'Giornaliera\nSenza Segnale',
    desc: '10 slot · solo VIP/Copy',
    color: '#3b82f6',
  },
  {
    id: 'alt',
    icon: 'Layers',
    name: 'Alternativa\nPiano A/B',
    desc: '12 slot · A=free signal · B=solo clienti',
    color: '#a855f7',
  },
  {
    id: 'weekend',
    icon: 'Waves',
    name: 'Weekend\nSab/Dom',
    desc: '4+6 slot · analisi settimanale',
    color: '#22c55e',
  },
  {
    id: 'hype',
    icon: 'Flame',
    name: 'Hype &\nVendita',
    desc: '10 slot · hook+CTA lead generation',
    color: '#ef4444',
  },
  {
    id: 'costanza',
    icon: 'TrendingUp',
    name: 'Costanza &\nMetodo',
    desc: '10 slot · fiducia · tono fluido',
    color: '#22c55e',
  },
];

export function ProgrammazioneSection() {
  const [activeMode, setActiveMode] = useState<ProgMode | null>(null);

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Mode grid */}
      <div className="card">
        <div className="card-title flex items-center gap-1.5">
          <CalendarDays size={14} />
          Programmazione Contenuti
        </div>
        <p className="text-[var(--text3)] text-sm mb-4">
          Seleziona il piano giornaliero per generare i messaggi della giornata completa o singoli slot.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PROG_MODES.map(m => (
            <button
              key={m.id}
              onClick={() => setActiveMode(m.id)}
              className={`type-card p-4 ${activeMode === m.id ? 'selected' : ''}`}
              style={activeMode === m.id
                ? { borderColor: m.color + '60', background: m.color + '14' }
                : {}}
            >
              <span className="mb-2 flex justify-center" style={{ color: m.color }}>
                <Icon name={m.icon} size={22} strokeWidth={1.5} />
              </span>
              <span className="text-xs font-semibold text-center whitespace-pre-line leading-tight">
                {m.name}
              </span>
              <span className="text-[10px] text-[var(--text3)] mt-1.5 text-center leading-tight block">
                {m.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {activeMode === 'daily_signal'   && <DailySignalPanel />}
      {activeMode === 'daily_nosignal' && <DailyNoSignalPanel />}
      {activeMode === 'alt'            && <AltPlanPanel />}
      {activeMode === 'weekend'        && <WeekendPanel />}
      {activeMode === 'hype'           && <HypePlanPanel />}
      {activeMode === 'costanza'       && <CostanzaPlanPanel />}
    </div>
  );
}
