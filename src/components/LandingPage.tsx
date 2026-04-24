import { useApp } from '../context/AppContext';
import { Diamond, Zap, BarChart2, Music, LayoutGrid } from './Icon';

interface AppCard {
  id: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  tag: string;
  active: boolean;
  color: string;
}

const APPS: AppCard[] = [
  {
    id: 'post',
    icon: <Zap size={28} strokeWidth={1.5} />,
    title: 'Gestione Post',
    desc: 'Genera contenuti Telegram per XAUUSD con AI — segnali, risultati, palinsesto settimanale e calendario economico.',
    tag: 'Disponibile',
    active: true,
    color: '#FFAD47',
  },
  {
    id: 'xauusd',
    icon: <BarChart2 size={28} strokeWidth={1.5} />,
    title: 'Gestione XAUUSD',
    desc: 'Analisi tecnica avanzata, gestione operativa e reportistica delle performance su Gold.',
    tag: 'Prossimamente',
    active: false,
    color: '#3b82f6',
  },
  {
    id: 'spotify',
    icon: <Music size={28} strokeWidth={1.5} />,
    title: 'Gestione Spotify',
    desc: 'Gestione playlist, analisi ascolti e ottimizzazione dei contenuti audio del canale.',
    tag: 'Prossimamente',
    active: false,
    color: '#22c55e',
  },
  {
    id: 'coming',
    icon: <LayoutGrid size={28} strokeWidth={1.5} />,
    title: 'Coming Soon',
    desc: 'Nuove integrazioni e strumenti AI in arrivo. Resta connesso per i prossimi aggiornamenti.',
    tag: 'Prossimamente',
    active: false,
    color: '#8b5cf6',
  },
];

export function LandingPage() {
  const { setScreen } = useApp();

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[rgba(254,153,32,0.12)] border border-[rgba(254,153,32,0.25)] mb-5">
          <Diamond size={26} className="text-[var(--gold)]" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-bold text-[var(--text)] tracking-tight mb-2">
          XAUUSD Suite
        </h1>
        <p className="text-sm text-[var(--text3)] max-w-sm mx-auto">
          Scegli il pannello di gestione che vuoi aprire.
        </p>
      </div>

      {/* App grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
        {APPS.map(app => (
          <button
            key={app.id}
            onClick={app.active ? () => setScreen('app') : undefined}
            disabled={!app.active}
            className={`relative group text-left p-6 rounded-[var(--radius)] border transition-all duration-200
              ${app.active
                ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.99]'
                : 'cursor-not-allowed opacity-50'
              }`}
            style={app.active
              ? {
                  background: `${app.color}0d`,
                  borderColor: `${app.color}40`,
                  boxShadow: `0 0 0 0 ${app.color}00`,
                }
              : {
                  background: 'var(--bg2)',
                  borderColor: 'var(--bg3)',
                }}
            onMouseEnter={e => {
              if (!app.active) return;
              (e.currentTarget as HTMLElement).style.boxShadow = `0 0 24px -4px ${app.color}30`;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = 'none';
            }}
          >
            {/* Tag badge */}
            <span
              className="absolute top-4 right-4 text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={app.active
                ? { background: `${app.color}20`, color: app.color }
                : { background: 'var(--bg3)', color: 'var(--text3)' }}
            >
              {app.tag}
            </span>

            {/* Icon */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
              style={{ background: `${app.color}15`, color: app.color }}
            >
              {app.icon}
            </div>

            {/* Text */}
            <h2 className="text-base font-semibold text-[var(--text)] mb-1.5">{app.title}</h2>
            <p className="text-xs text-[var(--text3)] leading-relaxed">{app.desc}</p>

            {/* Arrow on active */}
            {app.active && (
              <div
                className="mt-4 flex items-center gap-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: app.color }}
              >
                <span>Apri pannello</span>
                <span>→</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Footer */}
      <p className="text-[10px] text-[var(--text3)] mt-10">
        XAUUSD Suite — AI-powered content tools
      </p>
    </div>
  );
}
