import { useState, type ReactNode } from 'react';
import { Diamond } from './Icon';

const SESSION_KEY = 'xauusd_session';
const CORRECT = '1230';

// Rimuovi eventuali hash password salvati in passato
localStorage.removeItem('xauusd_auth_hash');

function isAuthed(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === '1';
}

export function AuthGate({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(isAuthed);
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  const [show, setShow] = useState(false);

  if (authed) return <>{children}</>;

  function handleLogin() {
    if (pw === CORRECT) {
      sessionStorage.setItem(SESSION_KEY, '1');
      setAuthed(true);
    } else {
      setError('Password errata.');
      setPw('');
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleLogin();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4">
      <div className="w-full max-w-xs">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[rgba(254,153,32,0.12)] border border-[rgba(254,153,32,0.25)] mb-4">
            <Diamond size={22} className="text-[var(--gold)]" strokeWidth={1.5} />
          </div>
          <h1 className="text-xl font-bold text-[var(--text)] tracking-tight">XAUUSD Suite</h1>
          <p className="text-xs text-[var(--text3)] mt-1">Accesso riservato</p>
        </div>

        {/* Card */}
        <div className="card">
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="block text-xs text-[var(--text3)] uppercase tracking-widest">
                Password
              </label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  className="w-full pr-16 bg-[var(--bg3)] border border-[var(--border)] rounded-[var(--radius-sm)] px-3 py-2.5 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--gold)] transition-colors"
                  placeholder="••••••••"
                  value={pw}
                  onChange={e => { setPw(e.target.value); setError(''); }}
                  onKeyDown={handleKey}
                  autoFocus
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[var(--text3)] hover:text-[var(--text)] transition-colors"
                  onClick={() => setShow(v => !v)}
                  tabIndex={-1}
                >
                  {show ? 'Nascondi' : 'Mostra'}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-400 font-medium">{error}</p>
            )}

            <button
              className="btn-generate w-full"
              onClick={handleLogin}
            >
              Accedi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
