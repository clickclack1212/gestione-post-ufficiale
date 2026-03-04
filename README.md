# XAUUSD Post Panel

Pannello AI per la gestione e generazione automatizzata di contenuti per canali Telegram dedicati al trading su XAUUSD (Gold). Genera post bilingui (IT + EN) ottimizzati per ogni momento della giornata operativa, sfruttando l'API Google Gemini.

---

## Stack Tecnologico

| Tecnologia | Versione | Ruolo |
|---|---|---|
| **React** | 18.3 | UI framework (hooks, context) |
| **Vite** | 7.x | Build tool e dev server |
| **TypeScript** | 5.6 | Type safety su tutto il progetto |
| **TailwindCSS** | 3.4 | Styling utility-first |
| **lucide-react** | 0.441 | Icone SVG (centralizzate in `Icon.tsx`) |
| **Google Gemini API** | — | Generazione testo AI (4 modelli disponibili) |

Nessun backend — tutto gira in-browser. La chiave API è salvata in `localStorage`.

---

## Avvio Rapido

```bash
npm install
npm run dev       # dev server su http://localhost:5173
npm run build     # build produzione in dist/
npm run preview   # anteprima build
```

---

## Struttura del Progetto

```
src/
├── components/          # Componenti UI riutilizzabili
│   ├── Header.tsx       # Header con selettore modello + counter giornaliero
│   ├── Icon.tsx         # Mappa centralizzata icone lucide-react
│   ├── BilingualResult  # Output bilingue IT/EN con tab e pulsanti copia
│   ├── PhotoUploader    # Upload e preview immagini (base64)
│   ├── PlanCard         # Card singolo slot per modalità "Intera Giornata"
│   ├── ToneSelector     # Selettore tono (Assertivo / Hype / Essenziale)
│   ├── Toast            # Notifiche temporanee
│   └── ApiModal         # Modal configurazione API key
├── sections/            # Sezioni principali (una per tab)
│   ├── GeneraSection           # Generazione singolo messaggio
│   ├── ProgrammazioneSection   # Hub pianificazione giornaliera
│   ├── DailySignalPanel        # Piano giornaliero con segnale (12 slot)
│   ├── DailyNoSignalPanel      # Piano giornaliero senza segnale (10 slot)
│   ├── AltPlanPanel            # Piani alternativi A (Free Signal) e B (Solo VIP)
│   ├── WeekendPanel            # Post Sabato (4 slot) e Domenica (6 slot)
│   ├── CalendarioSection       # Analisi calendario economico (3 versioni)
│   ├── OttimizzaSection        # Ottimizzazione post esistenti
│   ├── TraduciSection          # Traduzione in 5 lingue
│   └── SettingsSection         # Configurazione canale e API
├── context/
│   └── AppContext.tsx    # State globale (config, counter, toast, modello)
├── hooks/
│   ├── useGemini.ts     # Hook per chiamate Gemini (loading, elapsed, run)
│   └── usePhotoUpload   # Hook per gestione upload foto
├── services/
│   ├── gemini.ts        # Client API Gemini con rotazione modelli
│   ├── prompts.ts       # Tutti i prompt AI (buildPrompt, buildDailyPrompt, ecc.)
│   └── storage.ts       # Persistenza localStorage (config, counter)
├── constants/
│   └── data.ts          # Definizione slot, tipi messaggio, modelli Gemini
└── types/
    └── index.ts         # Tutti i tipi TypeScript condivisi
```

---

## Funzionalità

### Tab 1 — Genera Messaggio

Generazione di singoli messaggi in 12 tipologie:

| Tipo | Orario | Campi |
|------|--------|-------|
| Buongiorno | 07:00 | — |
| Risultati Ieri | 08:00 | VIP Room (pips/ops/winrate) + CopyTrading (pips/ops/perf) |
| Ready Segnale | 09:30 | — |
| Segnale XAUUSD | 10:00 | BUY/SELL, Entry, SL, TP1/TP2/TP3 |
| Risultato Segnale | Dopo | Esito (WIN/LOSS/BE), Entry, Uscita, Pips |
| Notizie Gold | 13:00 | Note + foto calendario opzionale |
| Risultati Clienti | Live | Descrizione, Periodo |
| Aggiornamento Trade | Live | Situazione, Pips, Note |
| Chiusura Giornata | 17:00 | — |
| Engagement | Varie | — |
| **Risultati Sala VIP** | Live | 3 sub-stati: *Primi Risultati* / *Durante* / *Conclusi* — pips, ops, win rate |
| **Risultati CopyTrading** | Live | 3 sub-stati: *Primi Risultati* / *Durante* / *Conclusi* — pips, ops, performance % |

I tipi **Risultati Sala VIP** e **Risultati CopyTrading** hanno un selettore a 3 stadi (Primi Risultati / Durante / Conclusi) con prompt e campi specifici per ogni momento della sessione live.

Ogni tipo genera un post bilingue IT+EN, visualizzato in `BilingualResult` con tab e pulsanti copia singola o bilingue.

---

### Tab 2 — Programmazione Giornaliera

Hub che raccoglie 6 modalità di pianificazione:

#### 2a — Giornaliera con Segnale (12 slot)

Slot fissi dall'apertura alla chiusura mercati. Ogni slot ha campi dedicati:

| Slot | Orario | Campi Specifici |
|------|--------|-----------------|
| Buongiorno + Hype | 07:00 | — |
| Risultati Ieri VIP + Copy | 08:00 | VIP (pips/ops/winrate) + Copy (pips/ops/perf) |
| Primi Risultati Mattina | 09:00 | Pips, Operazioni |
| Ready Segnale | 09:30 | — |
| Segnale XAUUSD | 10:00 | BUY/SELL, Entry, SL, TP1/TP2/TP3 |
| Risultato Segnale | 11:30 | Esito (WIN/LOSS/BE), Pips |
| Risultati CopyTrading | 12:00 | Pips live, Ops chiuse |
| Calendario Economico | 13:00 | Note + foto calendario |
| Copy Post-News | 15:00 | Notizia riferimento, Pips |
| Post Educativo | 17:00 | Topic (opzionale) |
| Recensioni + Recap | 19:00 | Nota opzionale |
| Chiusura | 21:00 | — |

Modalità **Singolo Slot** o **Intera Giornata** (generazione sequenziale di tutti gli slot).

#### 2b — Giornaliera Senza Segnale (10 slot)

Per i giorni senza segnale gratuito sul canale:

| Slot | Orario |
|------|--------|
| Buongiorno + Hype | 07:00 |
| Risultati Ieri VIP + Copy | 08:00 |
| Risultati Mattutini CopyTrading | 09:00 |
| Risultati Mattutini VIP | 09:30 |
| Hype Segnale Canale VIP | 10:30 |
| Hype Prossimo Segnale CopyTrading | 11:30 |
| Calendario Economico | 13:00 |
| Risultati Post News | 15:00 |
| Recensioni Clienti | 18:00 |
| Recap Finale + Chiusura | 21:00 |

#### 2c — Piano A (Con Free Signal, 12 slot)

Strategia mista: segnale gratuito come esca + marketing, mindset, social proof. Include slot colorati per categoria (mindset verde, proof blu, operativo arancio/oro, educativo arancio, chiusura viola).

#### 2d — Piano B (Solo VIP/Clienti, 12 slot)

Full funnel senza segnali free. Risultati, storytelling, social proof, Q&A obiezioni, hype setup e chiusure motivazionali. Per i giorni "chiusi".

#### 2e — Weekend Sabato (4 slot)

| Slot | Orario |
|------|--------|
| Buongiorno Weekend | 08:00 |
| Weekly Recap Macro+Tecnica | 11:00 |
| Offerta Scarsità | 15:00 |
| Risultati Pips Settimana | 18:00 |

#### 2f — Weekend Domenica (6 slot)

| Slot | Orario |
|------|--------|
| Quiete prima della Tempesta | 09:00 |
| Teaser Outlook | 11:00 |
| Weekly Outlook Calendario | 13:00 |
| Social Proof Screenshot | 15:00 |
| Recap VIP vs Copy | 17:00 |
| Avviso Ritardatari | 20:00 |

---

### Tab 3 — Calendario

Due modalità accessibili tramite toggle nella sezione:

#### 3a — Calendario Economico

Analisi AI da screenshot del calendario economico (ForexFactory, Investing.com, ecc.).

**Flusso:** carica screenshot → note opzionali → tono → "Genera 3 Versioni"

Le 3 versioni vengono generate in sequenza e appaiono progressivamente:

| Versione | Focus | Formato |
|----------|-------|---------|
| 🚨 **Market Mover** | Evento/cartella rossa principale, perché muove il prezzo, allerta urgente | Tono allerta, CTA Sala VIP |
| 📊 **Analisi Macro & Tecnica** | Timeline fasi giornata (🌅🌇🌙), correlazioni dati, gestione rischio | Strutturato per fasi orarie |
| ⚡ **Flash Report** | Riepilogo compatto con icone impatto 🔴🟠🟡, mood Gold finale | Massima leggibilità mobile Telegram |

Ogni versione è bilingue IT+EN.

#### 3b — Calendario Risultati

Analisi AI da screenshot del calendario dei tuoi risultati trading (equity curve, pips giornalieri, win rate).

**Flusso:** carica screenshot risultati → note/istruzioni opzionali → tono → "Genera 3 Strategie"

Le 3 strategie vengono generate in sequenza e appaiono progressivamente:

| Strategia | Focus | Tono |
|-----------|-------|------|
| 🏛️ **Autorità & Trasparenza** | Total PnL + win rate, spiega le giornate negative come risk management controllato, breakdown dettagliato | Istituzionale, fiducia a lungo termine |
| 🚀 **Hype / FOMO** | Cherrypick del dato migliore (settimana/giorno record), contrasto FOMO, urgenza CopyTrading | Energico, 🔥💰🚀, frasi brevi |
| 🌍 **Report Internazionale** | Formato tabellare pulito, metodologia, Total PnL + Best Week | Istituzionale, EN come versione principale |

Ogni strategia è bilingue IT+EN.

---

### Tab 4 — Ottimizza Post

Due pannelli selezionabili tramite toggle:

#### 4a — Ottimizza Messaggio

Incolla un post esistente scritto di getto e ottienilo riscritto con:
- 9 tipologie (Auto, Risultati, Segnale, Mindset, Social Proof, Notizie, CopyTrading, Chiusura, Engagement)
- Tono selezionabile
- Output bilingue IT+EN

#### 4b — Ottimizza Analisi XAUUSD

Incolla un'analisi XAUUSD trovata online o scritta in bozza — l'AI la riscrive come post Telegram branded:
- Selezione timeframe (M5, M15, M30, H1, H4, D1, Multi-TF)
- Mantiene tutti i livelli tecnici originali (entry, SL, TP, supporti, resistenze)
- Note aggiuntive opzionali (contesto geopolitico, news, commento personale)
- Output bilingue IT+EN

---

### Tab 5 — Traduci

Traduzione di testi in 5 lingue:
- 🇮🇹 Italiano
- 🇬🇧 Inglese
- 🇪🇸 Spagnolo
- 🇫🇷 Francese
- 🇩🇪 Tedesco

La traduzione utilizza sempre **Gemini 2.5 Flash** (modello index 3) indipendentemente dal modello selezionato nell'header, garantendo velocità e qualità ottimali per le traduzioni.

---

### Tab 6 — Impostazioni

Configurazione persistente del canale:

| Campo | Descrizione |
|-------|-------------|
| API Key Gemini | Chiave Google AI Studio (salvata in localStorage) |
| Nome Canale | Usato nei prompt per personalizzare il tono |
| Nome Trader | Firma dei messaggi |
| Link IT | Link Telegram canale italiano |
| Link EN | Link Telegram canale inglese |
| Valute Monitorate | Filtraggio eventi calendario |

---

## Sistema Modelli Gemini

4 modelli selezionabili manualmente dall'header:

| Indice | Modello | Label |
|--------|---------|-------|
| 0 | `gemini-3.1-pro-preview` | Gemini 3.1 Pro |
| 1 | `gemini-3.0-flash-preview` | Gemini 3 Flash |
| 2 | `gemini-2.5-pro` | Gemini 2.5 Pro |
| 3 | `gemini-2.5-flash` | Gemini 2.5 Flash |

Il badge del modello attivo nell'header è cliccabile — apre un dropdown per cambiare modello al volo. In caso di errore, il sistema prova automaticamente il modello successivo (fallback rotation).

### Counter Giornaliero

L'header mostra il numero di generazioni del giorno corrente, suddiviso per modello. Il counter si azzera automaticamente a mezzanotte. I dati sono salvati in `localStorage` con la chiave `xauusd_counter`.

---

## Sistema Toni

3 toni selezionabili per ogni generazione:

| Tono | Carattere |
|------|-----------|
| **Assertivo** | Professionale, diretto, autorevole |
| **Hype** | Energico, entusiasta, urgenza alta |
| **Essenziale** | Conciso, no fronzoli, solo i fatti |

---

## Output Bilingue

Tutti i post vengono generati in italiano e inglese nella stessa chiamata API. Il separatore interno `──────────────` divide le due versioni. Il componente `BilingualResult` offre:
- Tab IT / EN per visualizzare una lingua alla volta
- **Copia IT** — copia solo la versione italiana
- **Copia EN** — copia solo la versione inglese
- **Copia Bilingue** — copia entrambe separate dal divisore

---

## Sistema Prompt AI

Tutti i prompt sono costruiti in `src/services/prompts.ts` e seguono questi principi:

### Diversità Obbligatoria
Ogni prompt include il blocco **DIVERSITÀ OBBLIGATORIA** che impone:
- 6 tecniche concrete di apertura (domanda provocatoria, dato numerico secco, contrasto emotivo, scena cinematografica, affermazione controcorrente, tempo reale)
- Lista di frasi vietate ("Ancora una volta", "Come sempre", "Non perderti", "Sei pronto?", ecc.)
- Istruzione esplicita: scrivere come un trader umano, non come un bot

### Funzioni Prompt Disponibili

| Funzione | Descrizione |
|----------|-------------|
| `buildPrompt(type, cfg, tone, fields, photo)` | Genera section — 12 tipi base + 6 sub-stati risultati |
| `buildDailyPrompt(slot, ctx)` | Programmazione con segnale — 12 slot con `fields` specifici |
| `buildNSPrompt(slot, ctx)` | Programmazione senza segnale — 10 slot con `fields` specifici |
| `buildCalV1Prompt(cfg, tone, notes)` | Calendario Economico — Market Mover |
| `buildCalV2Prompt(cfg, tone, notes)` | Calendario Economico — Analisi Macro & Tecnica |
| `buildCalV3Prompt(cfg, tone, notes)` | Calendario Economico — Flash Report |
| `buildCalRisultatiV1Prompt(cfg, tone, notes)` | Calendario Risultati — Autorità & Trasparenza |
| `buildCalRisultatiV2Prompt(cfg, tone, notes)` | Calendario Risultati — Hype / FOMO |
| `buildCalRisultatiV3Prompt(cfg, tone, notes)` | Calendario Risultati — Report Internazionale |
| `buildAltPromptA/B(slot, ctx)` | Piani alternativi A e B |
| `buildWkPrompt(slot, ctx)` | Piani weekend |
| `buildOptPrompt(text, type, cfg, tone)` | Ottimizza Messaggio |
| `buildAnalisiPrompt(rawAnalysis, cfg, tone, tf, note)` | Ottimizza Analisi XAUUSD |
| `buildTrPrompt(text, from, to, cfg)` | Traduzione |

---

## Upload Foto

Supporto screenshot per i tipi che lo richiedono (risultati, segnali, calendario, ecc.). L'immagine viene convertita in base64 e inviata a Gemini come parte multimodale del prompt. Badge `📷 Screenshot` sui tipi/slot che supportano la foto.
