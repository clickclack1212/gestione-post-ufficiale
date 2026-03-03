# CLAUDE.md — Contesto Progetto per Claude

Questo file descrive l'architettura, le convenzioni e i pattern del progetto **XAUUSD Post Panel** per assistere Claude nelle sessioni di sviluppo.

---

## Panoramica

App React SPA per generare post Telegram sul trading XAUUSD tramite Google Gemini API. Nessun backend — tutto in-browser con `localStorage` per persistenza. Build con Vite + TypeScript + TailwindCSS.

---

## Comandi Essenziali

```bash
npm run dev      # dev server
npm run build    # build (tsc + vite build) — usare per verificare errori TS
npm run preview  # preview build produzione
```

---

## File Chiave

| File | Ruolo |
|------|-------|
| `src/types/index.ts` | Tutti i tipi TypeScript condivisi — leggere prima di modificare interfacce |
| `src/constants/data.ts` | Slot, tipi messaggio, modelli Gemini, costanti UI |
| `src/services/gemini.ts` | Client API — `activeModelIdx` module-level, `setPreferredModelIdx()`, fallback rotation |
| `src/services/prompts.ts` | Tutti i prompt AI — `buildPrompt`, `buildDailyPrompt`, `buildNSPrompt`, `buildCalV1/V2/V3Prompt` |
| `src/services/storage.ts` | `getConfig/setConfig`, `getCounter/incCounter` — gestione `localStorage` |
| `src/context/AppContext.tsx` | State globale: `config`, `counter`, `showToast`, `preferredModelIdx`, `setPreferredModelIdx`, `calendarEvents` |
| `src/hooks/useGemini.ts` | Hook `{ loading, elapsed, run }` — chiama `setPreferredModelIdx` prima di ogni `run()` |
| `src/components/Icon.tsx` | Mappa centralizzata lucide-react → aggiungere qui ogni nuova icona prima di usarla |
| `src/components/Header.tsx` | Dropdown selettore modello + counter 4 modelli |
| `src/components/BilingualResult.tsx` | Componente output IT/EN — renderizza `result-box`, NON è una card stessa |

---

## Architettura

```
AppContext (config, counter, preferredModelIdx, toast, calendarEvents)
    └── App.tsx (tab routing)
            ├── Header (model selector, counter)
            └── Sections (una per tab)
                    └── useGemini (loading, elapsed, run)
                            └── gemini.ts (API call con fallback)
```

### Flusso Generazione

1. L'utente configura i campi nel pannello
2. Viene costruito un `prompt` tramite una funzione `build*Prompt` in `prompts.ts`
3. `useGemini.run(prompt, temperature, photo?)` viene chiamato
4. `useGemini` chiama `setPreferredModelIdx(preferredModelIdx)` da `gemini.ts` prima della chiamata
5. `gemini.ts` prova il modello scelto — in caso di errore scala al successivo (rotation)
6. Il testo restituito viene parsato con `parseBilingual()` che splitta su `──────────────`
7. Il risultato `{ it, en }` viene passato a `BilingualResult` o visualizzato inline

---

## Convenzioni Importanti

### Write/Edit richiedono Read preventivo
Prima di usare `Write` o `Edit` su un file, **quel file deve essere stato letto nella sessione corrente**. Anche leggere solo 3 righe è sufficiente per registrare il file nel contesto.

### Icone
Tutte le icone passano per `src/components/Icon.tsx`. Per aggiungere una nuova icona lucide:
1. Aggiungere al `import` in cima
2. Aggiungere al `const MAP = { ... }`
3. Aggiungere al blocco `export { ... } from 'lucide-react'`

### Prompt bilingue
Ogni prompt deve includere l'istruzione di generare IT e EN separati da `──────────────`. Il separatore è fisso — `parseBilingual()` in `prompts.ts` lo usa per lo split.

### Slot-specific fields pattern
`DailySignalPanel` e `DailyNoSignalPanel` usano un componente `*SlotFields` con `switch(slotId)` per mostrare i campi giusti per ogni slot. Quando si aggiunge un nuovo slot in `data.ts`, aggiungere il relativo case nel componente fields e nel prompt builder.

### Counter a 4 modelli
`Counter` in `types/index.ts` ha i campi `{ date, total, pro3, pro25, m2, m3 }`. Gli indici 0→`pro3`, 1→`pro25`, 2→`m2`, 3→`m3`. `getCounter()` in `storage.ts` migra automaticamente dati vecchi (default 0 per campi mancanti).

### Diversità prompt
`basePrompt()` in `prompts.ts` include il blocco `DIVERSITÀ OBBLIGATORIA` che impone varietà negli opener. Non rimuoverlo.

---

## Pattern Chiave

### Generazione sequenziale (Calendario)
```typescript
// CalendarioSection.tsx
setGenStep(1);
const t1 = await run(buildCalV1Prompt(...), 0.88, photo);
if (t1) setResults(prev => ({ ...prev, v1: parseBilingual(t1) }));
setGenStep(2);
// ...
```
I `setResults` intermedi aggiornano la UI progressivamente mentre le chiamate sono in corso.

### ctx object per i prompt giornalieri
```typescript
const ctx = () => ({
  cfg: config,
  date: todayItalian(),
  tone,
  news: fields.note || '',
  extra: '',
  hasPhoto: !!photo,
  calEvents: calEventsStr,  // solo DailySignalPanel
  fields,                   // Record<string, string> per dati slot-specifici
});
```

### Reset fields su cambio slot
```typescript
onClick={() => {
  setSelectedSlot(s.id);
  setSingleResult({ it: '', en: '' });
  setFieldsState({});  // pulizia campi slot precedente
}}
```

### Photo uploader condizionale
```typescript
const slotNeedsPhoto = activeSlot?.shot || activeSlot?.id === 'd_notizie';
// oppure activeSlot?.id === 'ns_calendario' per il panel NoSignal
```

---

## Tipi Principali

```typescript
type Tab = 'generate' | 'prog' | 'calendar' | 'optimize' | 'translate' | 'settings';
type Tone = 'assertivo' | 'hype' | 'essenziale';
type ProgMode = 'daily_signal' | 'daily_nosignal' | 'alt_signal' | 'alt_nosignal' | 'weekend_sab' | 'weekend_dom';

interface Config {
  apiKey: string; channelName: string; traderName: string;
  linkIT: string; linkEN: string; currencies: string[];
  calFrom: string; calTo: string;
}

interface Counter {
  date: string; total: number;
  pro3: number; pro25: number; m2: number; m3: number;
}

interface GeminiModel { id: string; label: string; }
```

---

## localStorage Keys

| Chiave | Contenuto |
|--------|-----------|
| `xauusd_v3` | `Config` — configurazione canale e API key |
| `xauusd_counter` | `Counter` — contatore giornaliero per modello |

---

## Cosa NON fare

- Non rimuovere il blocco `DIVERSITÀ OBBLIGATORIA` da `basePrompt()` in `prompts.ts`
- Non usare `Write` o `Edit` senza aver prima chiamato `Read` sul file nella sessione
- Non aggiungere icone lucide direttamente nei componenti — passare sempre da `Icon.tsx`
- Non modificare il separatore `──────────────` nei prompt — `parseBilingual()` dipende da esso
- Non creare un backend — questa è e deve restare una SPA pura in-browser
