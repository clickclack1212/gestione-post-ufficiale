import { useState } from 'react';
import { useGemini } from '../hooks/useGemini';
import { buildTrPrompt } from '../services/prompts';
import { LANG_NAMES } from '../constants/data';

interface LangDef {
  code: string;
  flag: string;
  label: string;
  short: string;
}

const LANGS: LangDef[] = [
  { code: 'it', flag: '🇮🇹', label: 'Italiano',  short: 'IT' },
  { code: 'en', flag: '🇬🇧', label: 'Inglese',   short: 'EN' },
  { code: 'es', flag: '🇪🇸', label: 'Spagnolo',  short: 'ES' },
  { code: 'fr', flag: '🇫🇷', label: 'Francese',  short: 'FR' },
  { code: 'de', flag: '🇩🇪', label: 'Tedesco',   short: 'DE' },
];

function getLang(code: string): LangDef {
  return LANGS.find(l => l.code === code) ?? LANGS[0];
}

function LangPicker({
  value, onChange, exclude,
}: { value: string; onChange: (v: string) => void; exclude?: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {LANGS.filter(l => l.code !== exclude).map(l => (
        <button
          key={l.code}
          onClick={() => onChange(l.code)}
          className={`lang-chip ${value === l.code ? 'active' : ''}`}
        >
          <span className="text-base leading-none">{l.flag}</span>
          <span>{l.short}</span>
        </button>
      ))}
    </div>
  );
}

export function TraduciSection() {
  const { loading, elapsed, run } = useGemini();
  const [fromLang, setFromLang] = useState('it');
  const [toLang, setToLang]     = useState('en');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');

  const from = getLang(fromLang);
  const to   = getLang(toLang);

  async function handleTranslate() {
    if (!inputText.trim()) return;
    const prompt = buildTrPrompt(inputText, LANG_NAMES[fromLang], LANG_NAMES[toLang]);
    const text = await run(prompt, 0.5);
    if (text) setOutputText(text);
  }

  function swapLangs() {
    const prevFrom = fromLang;
    const prevTo = toLang;
    setFromLang(prevTo);
    setToLang(prevFrom);
    setInputText(outputText);
    setOutputText(inputText);
  }

  async function pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setInputText(text);
    } catch {
      // fallback: focus textarea
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="card">
        <div className="card-title">🌐 Traduzione Messaggio</div>

        {/* Language selectors */}
        <div className="space-y-4 mb-5">
          {/* FROM row */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-[var(--text3)] uppercase tracking-widest font-semibold">Da</span>
              <span className="text-lg leading-none">{from.flag}</span>
              <span className="text-sm font-semibold text-[var(--text2)]">{from.label}</span>
            </div>
            <LangPicker value={fromLang} onChange={(v) => { setFromLang(v); if (v === toLang) setToLang(fromLang); }} />
          </div>

          {/* Swap button */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[var(--border)]" />
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-[rgba(254,153,32,0.3)]
                bg-[rgba(254,153,32,0.07)] text-[var(--gold)] text-sm font-bold transition-all
                hover:bg-[rgba(254,153,32,0.14)] hover:border-[var(--gold)] active:scale-95"
              onClick={swapLangs}
              title="Inverti lingue e testo"
            >
              <span className="text-base">⇄</span>
              <span className="text-xs">Inverti</span>
            </button>
            <div className="flex-1 h-px bg-[var(--border)]" />
          </div>

          {/* TO row */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-[var(--text3)] uppercase tracking-widest font-semibold">A</span>
              <span className="text-lg leading-none">{to.flag}</span>
              <span className="text-sm font-semibold text-[var(--text2)]">{to.label}</span>
            </div>
            <LangPicker value={toLang} onChange={setToLang} exclude={fromLang} />
          </div>
        </div>

        {/* Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="mb-0">
              {from.flag} Testo in {from.label}
            </label>
            <button className="btn-paste" onClick={pasteFromClipboard}>
              📋 Incolla
            </button>
          </div>
          <textarea
            className="result-textarea border border-[var(--border)] rounded-[var(--radius-sm)]
              bg-[var(--bg4)] min-h-[130px]"
            placeholder={`Incolla il testo in ${from.label} da tradurre...`}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            rows={6}
          />
        </div>

        <button
          className="btn-generate w-full mt-3"
          onClick={handleTranslate}
          disabled={loading || !inputText.trim()}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="spinner" /> Traducendo... {elapsed}s
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span>{to.flag}</span>
              <span>Traduci in {to.label}</span>
            </span>
          )}
        </button>
      </div>

      {/* Output */}
      {outputText && (
        <div className="card animate-[slideUp_0.3s_ease]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">{to.flag}</span>
              <span className="text-xs font-semibold text-[var(--gold)] uppercase tracking-widest">
                Traduzione in {to.label}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                className="btn-paste"
                onClick={() => { setFromLang(toLang); setToLang(fromLang); setInputText(outputText); setOutputText(''); }}
                title="Ritradurre questa versione"
              >
                🔄 Ritradurre
              </button>
              <button
                className="btn-sec text-sm"
                onClick={() => navigator.clipboard.writeText(outputText)}
              >
                📋 Copia
              </button>
            </div>
          </div>
          <textarea
            className="result-textarea border border-[var(--border)] rounded-[var(--radius-sm)]
              bg-[var(--bg4)] min-h-[100px]"
            value={outputText}
            readOnly
            rows={Math.max(6, outputText.split('\n').length + 2)}
          />
        </div>
      )}
    </div>
  );
}
