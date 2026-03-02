import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { saveConfig } from '../services/storage';

export function ApiModal() {
  const { apiModalOpen, setApiModalOpen, config, setConfig } = useApp();
  const [key, setKey] = useState(config.apiKey || '');

  if (!apiModalOpen) return null;

  function handleSave() {
    if (!key.trim()) return;
    const updated = saveConfig({ apiKey: key.trim() });
    setConfig(updated);
    setApiModalOpen(false);
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
        onClick={() => config.apiKey && setApiModalOpen(false)}
      />
      {/* Modal */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg2)] border-t border-[var(--bg3)] rounded-t-2xl p-6 shadow-2xl animate-[slideUp_0.3s_ease] max-w-lg mx-auto">
        <div className="w-10 h-1 bg-[var(--bg3)] rounded-full mx-auto mb-5" />
        <h2 className="text-[var(--gold)] font-semibold text-lg mb-1">🔑 Gemini API Key</h2>
        <p className="text-[var(--text3)] text-sm mb-4">
          Inserisci la tua API Key di Google Gemini per generare contenuti.{' '}
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noreferrer"
            className="text-[var(--gold)] underline"
          >
            Ottienila qui
          </a>
          .
        </p>
        <input
          type="password"
          placeholder="AIza..."
          value={key}
          onChange={e => setKey(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
          className="w-full mb-4 font-mono text-sm"
          autoFocus
        />
        <div className="flex gap-3">
          <button className="btn-generate flex-1" onClick={handleSave} disabled={!key.trim()}>
            Salva e continua
          </button>
          {config.apiKey && (
            <button className="btn-outline" onClick={() => setApiModalOpen(false)}>
              Annulla
            </button>
          )}
        </div>
      </div>
    </>
  );
}
