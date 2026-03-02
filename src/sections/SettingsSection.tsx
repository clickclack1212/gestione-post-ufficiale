import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { saveConfig } from '../services/storage';
import { ALL_CURRENCIES, DEFAULT_LINK_IT, DEFAULT_LINK_EN } from '../constants/data';

export function SettingsSection() {
  const { config, setConfig, setApiModalOpen, showToast } = useApp();
  const [form, setForm] = useState({ ...config });

  const set = (k: keyof typeof form, v: string | string[]) =>
    setForm(prev => ({ ...prev, [k]: v }));

  function handleCurrencyToggle(c: string) {
    const curr = form.currencies ?? [];
    set('currencies', curr.includes(c) ? curr.filter(x => x !== c) : [...curr, c]);
  }

  function handleSave() {
    const updated = saveConfig(form);
    setConfig(updated);
    showToast('Configurazione salvata ✓', 'success');
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="card">
        <div className="card-title">⚙ Configurazione Canale</div>

        {/* API Key */}
        <div className="space-y-1">
          <label className="block text-xs text-[var(--text3)] uppercase tracking-widest">API Key Gemini</label>
          <div className="flex gap-2">
            <input
              type="password"
              value={form.apiKey || ''}
              placeholder="AIza..."
              className="flex-1 font-mono text-sm"
              onChange={e => set('apiKey', e.target.value)}
            />
            <button className="btn-sec text-sm" onClick={() => setApiModalOpen(true)}>
              🔑 Modifica
            </button>
          </div>
          <p className="text-[10px] text-[var(--text3)]">
            Ottieni la tua chiave su{' '}
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer"
              className="text-[var(--gold)] underline">
              aistudio.google.com
            </a>
          </p>
        </div>

        {/* Channel Name */}
        <div className="space-y-1 mt-4">
          <label className="block text-xs text-[var(--text3)] uppercase tracking-widest">Nome Canale</label>
          <input
            type="text"
            value={form.channelName || ''}
            placeholder="es. XAUUSD Signals"
            onChange={e => set('channelName', e.target.value)}
          />
        </div>

        {/* Trader Name */}
        <div className="space-y-1 mt-4">
          <label className="block text-xs text-[var(--text3)] uppercase tracking-widest">Nome Trader</label>
          <input
            type="text"
            value={form.traderName || ''}
            placeholder="es. Marco"
            onChange={e => set('traderName', e.target.value)}
          />
        </div>

        {/* Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div className="space-y-1">
            <label className="block text-xs text-[var(--text3)] uppercase tracking-widest">Link IT (CTA)</label>
            <input
              type="url"
              value={form.linkIT || ''}
              placeholder={DEFAULT_LINK_IT}
              onChange={e => set('linkIT', e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs text-[var(--text3)] uppercase tracking-widest">Link EN (CTA)</label>
            <input
              type="url"
              value={form.linkEN || ''}
              placeholder={DEFAULT_LINK_EN}
              onChange={e => set('linkEN', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Calendar settings */}
      <div className="card">
        <div className="card-title">📅 Calendario Economico</div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs text-[var(--text3)] uppercase tracking-widest">Da (data)</label>
            <input
              type="date"
              value={form.calFrom || ''}
              onChange={e => set('calFrom', e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs text-[var(--text3)] uppercase tracking-widest">A (data)</label>
            <input
              type="date"
              value={form.calTo || ''}
              onChange={e => set('calTo', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2 mt-4">
          <label className="block text-xs text-[var(--text3)] uppercase tracking-widest">Valute monitorate</label>
          <div className="flex flex-wrap gap-2">
            {ALL_CURRENCIES.map(c => (
              <button
                key={c}
                onClick={() => handleCurrencyToggle(c)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors
                  ${(form.currencies ?? []).includes(c)
                    ? 'bg-[rgba(254,153,32,0.15)] border-[rgba(254,153,32,0.4)] text-[var(--gold)]'
                    : 'border-[var(--bg3)] text-[var(--text3)] hover:border-[var(--bg4)] hover:text-[var(--text2)]'
                  }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button className="btn-generate w-full" onClick={handleSave}>
        💾 Salva Configurazione
      </button>
    </div>
  );
}
