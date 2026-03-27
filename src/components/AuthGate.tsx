import { useState, useEffect, type ReactNode } from 'react';

const HASH_KEY = 'xauusd_auth_hash';
const SESSION_KEY = 'xauusd_session';

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function getStoredHash(): string | null {
  return localStorage.getItem(HASH_KEY);
}

function isSessionActive(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === '1';
}

function setSession() {
  sessionStorage.setItem(SESSION_KEY, '1');
}

export function AuthGate({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(isSessionActive);
  const [mode, setMode] = useState<'login' | 'register'>(() =>
    getStoredHash() ? 'login' : 'register'
  );
  const [pw, setPw] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    setMode(getStoredHash() ? 'login' : 'register');
  }, []);

  if (authed) return <>{children}</>;

  async function handleRegister() {
    if (pw.length < 4) { setError('Password minima 4 caratteri.'); return; }
    if (pw !== pwConfirm) { setError('Le password non coincidono.'); return; }
    setLoading(true);
    const hash = await sha256(pw);
    localStorage.setItem(HASH_KEY, hash);
    setSession();
    setAuthed(true);
    setLoading(false);
  }

  async function handleLogin() {
    if (!pw) { setError('Inserisci la password.'); return; }
    setLoading(true);
    const hash = await sha256(pw);
    if (hash === getStoredHash()) {
      setSession();
      setAuthed(true);
    } else {
      setError('Password errata.');
    }
    setLoading(false);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') mode === 'login' ? handleLogin() : handleRegister();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4">
      <div className="w-full max-w-sm">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[rgba(254,153,32,0.12)] border border-[rgba(254,153,32,0.25)] mb-4">
            <span className="text-2xl">⚡</span>
          </div>
          <h1 className="text-xl font-bold text-[var(--text)] tracking-tight">XAUUSD Post Panel</h1>
          <p className="text-xs text-[var(--text3)] mt-1">AI Content Generator</p>
        </div>

        {/* Card */}
        <div className="card">
          <h2 className="text-base font-semibold text-[var(--text)] mb-5">
            {mode === 'login' ? 'Accedi al pannello' : 'Crea la tua password'}
          </h2>

          <div className="space-y-3">
            {/* Password field */}
            <div className="space-y-1">
              <label className="block text-xs text-[var(--text3)] uppercase tracking-widest">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="w-full pr-10 bg-[var(--bg3)] border border-[var(--border)] rounded-[var(--radius-sm)] px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--gold)] transition-colors"
                  placeholder="Inserisci password..."
                  value={pw}
                  onChange={e => { setPw(e.target.value); setError(''); }}
                  onKeyDown={handleKey}
                  autoFocus
                />
                <button
                  type="button"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text3)] hover:text-[var(--text)] text-xs"
                  onClick={() => setShowPw(v => !v)}
                  tabIndex={-1}
                >
                  {showPw ? 'Nascondi' : 'Mostra'}
                </button>
              </div>
            </div>

            {/* Confirm field — register only */}
            {mode === 'register' && (
              <div className="space-y-1">
                <label className="block text-xs text-[var(--text3)] uppercase tracking-widest">
                  Conferma password
                </label>
                <input
                  type={showPw ? 'text' : 'password'}
                  className="w-full bg-[var(--bg3)] border border-[var(--border)] rounded-[var(--radius-sm)] px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--gold)] transition-colors"
                  placeholder="Ripeti la password..."
                  value={pwConfirm}
                  onChange={e => { setPwConfirm(e.target.value); setError(''); }}
                  onKeyDown={handleKey}
                />
              </div>
            )}

            {/* Error */}
            {error && (
              <p className="text-xs text-red-400 font-medium">{error}</p>
            )}

            {/* Submit */}
            <button
              className="btn-generate w-full mt-1"
              onClick={mode === 'login' ? handleLogin : handleRegister}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="spinner" /> Verifica...
                </span>
              ) : mode === 'login' ? 'Accedi' : 'Imposta password e accedi'}
            </button>
          </div>

          {/* Switch mode */}
          {mode === 'login' && (
            <p className="text-center text-xs text-[var(--text3)] mt-4">
              Vuoi cambiare password?{' '}
              <button
                className="text-[var(--gold)] hover:underline"
                onClick={() => { setMode('register'); setError(''); setPw(''); setPwConfirm(''); }}
              >
                Reimposta
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
