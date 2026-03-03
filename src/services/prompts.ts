import type { Tone, DailySlot, AltType, WkType, CalendarEvent } from '../types';
import type { Config } from '../types';
import { getLinkIT, getLinkEN } from './storage';

// ── TONE INSTRUCTIONS ──────────────────────────────────────────────────────
export function toneInstructions(tone: Tone): string {
  const tones: Record<Tone, string> = {
    assertivo: `FORMATO OBBLIGATORIO — ASSERTIVO:

REGOLA ASSOLUTA: ogni blocco = massimo 2 righe. Tra un blocco e l'altro: 1 riga vuota. VIETATO scrivere 3+ righe consecutive senza riga vuota in mezzo. Se lo fai, il messaggio è sbagliato.

STRUTTURA FISSA — scrivi esattamente 4-5 blocchi in questo ordine:
BLOCCO 1 (1-2 righe): gancio d'apertura — fatto concreto o domanda che colpisce
BLOCCO 2 (1-2 righe): valore o risultato — cosa è successo / cosa ottieni
BLOCCO 3 (1 riga): contrasto dentro/fuori o domanda retorica
BLOCCO 4 (1 riga): spinta finale all'azione
BLOCCO 5 = CTA con link

Emoji: 1-2 per blocco, contestuali (📈 profitti, 🥇 risultati, ❓ domande, ✅ conferme, 🎯 precisione).
Tono: umano, diretto, motivante. Zero frasi di riempimento. Zero asterischi. Zero aperture robotiche.`,

    hype: `FORMATO OBBLIGATORIO — HYPE:

REGOLA ASSOLUTA: ogni blocco = 1 riga (massimo 2). Tra un blocco e l'altro: 1 riga vuota. VIETATO scrivere 3+ righe consecutive senza riga vuota. Se lo fai, il messaggio è sbagliato.

STRUTTURA FISSA — scrivi esattamente 4-5 blocchi in questo ordine:
BLOCCO 1 (1 riga): gancio ESPLOSIVO in maiuscolo — deve fermare il pollice
BLOCCO 2 (1 riga): dato o fatto che brucia — chi è dentro già ce l'ha
BLOCCO 3 (1 riga): contrasto brutale dentro/fuori
BLOCCO 4 (1 riga): domanda che fa male
BLOCCO 5 = CTA come un comando

Emoji aggressive: 🔥💰⚡️🎯🚀💣 — 1-2 per blocco, contestuali.
Tono: urlato, serrato, FOMO reale. Zero spiegazioni. Zero morbidezze. Zero asterischi.`,

    essenziale: `FORMATO OBBLIGATORIO — ESSENZIALE:

REGOLA ASSOLUTA: ogni blocco = 1-2 righe max. Tra i blocchi: 1 riga vuota. VIETATO 3+ righe consecutive.

STRUTTURA FISSA — esattamente 3-4 blocchi:
BLOCCO 1 (1-2 righe): dato o fatto principale
BLOCCO 2 (1-2 righe): contesto o numero chiave
BLOCCO 3 (1 riga): azione richiesta
BLOCCO 4 = CTA

Emoji: massimo 2-3 in tutto. Solo fatti. Zero enfasi. Zero asterischi.`,
  };
  return tones[tone] || tones.assertivo;
}

// ── DATE HELPER ────────────────────────────────────────────────────────────
export function todayItalian(): string {
  return new Date().toLocaleDateString('it-IT', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

// ── BILINGUAL SPLITTER ─────────────────────────────────────────────────────
export function parseBilingual(text: string): { it: string; en: string } {
  const sepMatch = text.match(/\n([\u2500\u2014\-─—]{6,})\n/);
  if (sepMatch) {
    const idx = text.indexOf(sepMatch[0]);
    return { it: text.slice(0, idx).trim(), en: text.slice(idx + sepMatch[0].length).trim() };
  }
  const seps = ['──────────────', '─────────────', '———————————————', '----------', '---'];
  for (const sep of seps) {
    if (text.includes(sep)) {
      const idx = text.indexOf(sep);
      return { it: text.slice(0, idx).trim(), en: text.slice(idx + sep.length).trim() };
    }
  }
  return { it: text.trim(), en: '' };
}

// ── ESCAPE HTML ────────────────────────────────────────────────────────────
export function escH(s: string): string {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ── BASE PROMPT ────────────────────────────────────────────────────────────
function basePrompt(cfg: Config, tone: Tone, date: string): string {
  const lIT = getLinkIT(cfg);
  const lEN = getLinkEN(cfg);
  const trader = cfg.traderName || 'Il Trader';
  return `Sei il gestore del canale Telegram XAUUSD di ${trader}. Data di oggi: ${date}.

${toneInstructions(tone)}

ISTRUZIONI TECNICHE:
- Output = SOLO il testo del messaggio. Zero etichette, zero prefissi, zero commenti.
- Scrivi PRIMA la versione italiana COMPLETA con la sua CTA italiana.
- Poi scrivi ESATTAMENTE questa riga: ──────────────
- Poi scrivi la versione inglese COMPLETA con la sua CTA inglese.
- NON usare asterischi (*) o markdown.

CTA ITALIANA (alla fine della versione IT, link su riga nuova):
👉 CLICCA QUI PER [TESTO VARIABILE]:
${lIT}

CTA INGLESE (alla fine della versione EN, link su riga nuova):
👉 CLICK HERE TO [VARIABLE TEXT]:
${lEN}

Varia il testo della CTA ogni volta: "UNIRTI AL COPYTRADING", "ACCEDERE ALLA SALA VIP", "COPIARE I SEGNALI IN AUTOMATICO", "REPLICARE I NOSTRI RISULTATI", "ENTRARE NEL PROGRAMMA" ecc.

DIVERSITÀ OBBLIGATORIA: non usare mai le stesse parole di apertura due volte di fila. Varia l'incipit — puoi partire da: un dato numerico secco, una domanda diretta, un'esclamazione corta, un contrasto Inside/Outside, un fatto tecnico sul Gold, una frase provocatoria. MAI iniziare con "Oggi", "Ieri", "Buongiorno" come prima parola (eccetto il messaggio buongiorno dedicato). Ogni messaggio deve sentirsi UNICO — stop al pollice, non la routine.

ESEMPIO DI OUTPUT ATTESO ✅:
Ieri +127 pips su XAUUSD. 📈

3 operazioni, 3 chiuse in profitto.

Chi era nel CopyTrading lo ha incassato senza aprire un grafico. 🥇

Tu quando entri?

👉 CLICCA QUI PER REPLICARE I RISULTATI:
${lIT}

──────────────

Yesterday +127 pips on XAUUSD. 📈

3 trades, all closed in profit.

CopyTrading members collected it automatically. 🥇

When are you joining?

👉 CLICK HERE TO REPLICATE THE RESULTS:
${lEN}
`;
}

// ── SINGLE MESSAGE PROMPTS ─────────────────────────────────────────────────
export function buildPrompt(
  type: string,
  cfg: Config,
  tone: Tone,
  fields: Record<string, string>,
  newsPhoto: string | null,
): string | null {
  const date = todayItalian();
  const base = basePrompt(cfg, tone, date);
  const v = (k: string) => fields[k] || '';

  const map: Record<string, string> = {
    buongiorno: base + `Scrivi il messaggio di buongiorno per aprire la giornata sul canale (intorno alle 7:00).
Inizia con "Buongiorno Traders! 👋" — è l'unico messaggio della giornata che usa questo saluto.
Tono caldo e motivante, come chi apre la giornata con energia genuina. Fai un accenno a cosa succederà oggi sul canale (segnale gratuito, analisi XAUUSD, aggiornamenti dalla Sala VIP). Chiudi con la CTA al CopyTrading.`,

    risultati_ieri: base + `Scrivi il messaggio per condividere i risultati di ieri su XAUUSD.
VIP Room (operazioni manuali gestite dal trader): ${v('vip_pips') || '85'} pips, ${v('vip_trades') || '5'} operazioni, win rate ${v('vip_winrate') || '80%'}.
CopyTrading (automatico, senza intervento): ${v('copy_pips') || '72'} pips, ${v('copy_trades') || '4'} operazioni, performance ${v('copy_perf') || '+3.2%'}.
Presenta i due servizi in modo distinto ma complementare — VIP Room per chi segue in prima persona, CopyTrading per chi incassa senza fare nulla. Menziona che lo screenshot è allegato. Chiudi con CTA urgente per chi non è ancora dentro.`,

    primi_risultati: base + `Scrivi un aggiornamento live sui primi risultati di oggi su XAUUSD.
Dati: ${v('pips') || '40'} pips, ${v('trades') || '3'} operazioni già chiuse.
Tono entusiasta ma concreto — la giornata è appena iniziata. Chi è nel CopyTrading lo ha già sul conto. CTA per chi vuole entrare.`,

    primi_risultati_copy: base + `Scrivi un messaggio che annuncia i primi profitti del CopyTrading di oggi su XAUUSD.
Dati: ${v('pips_copy') || '+55'} pips / profitto, ${v('trades_copy') || '2'} operazioni chiuse ${v('ora_copy') ? v('ora_copy') : 'stamattina'}.${v('ctx_copy') ? ' Contesto: ' + v('ctx_copy') + '.' : ''}
Il focus TOTALE è sul CopyTrading automatico: i nostri copy-trader hanno già incassato questo mentre erano a lavoro / dormivano / facevano colazione — senza aprire un grafico, senza prendere decisioni, senza stress.
Crea forte contrasto con chi trading ancora da solo (stress, errori, emotività). Fai sentire che chi non è nel copy sta regalando soldi al mercato ogni mattina.
Screenshot allegato con i risultati. CTA urgente e diretta al CopyTrading.`,

    ready_segnale: base + `Scrivi il messaggio "ready" per avvisare che il segnale gratuito su XAUUSD sta per arrivare (intorno alle 9:30).
Tono calmo e determinato, come chi ha già fatto l'analisi e sa cosa fare. Accenna che l'operazione è gratuita per tutti, ma chi vuole segnali ogni giorno e il CopyTrading automatico trova tutto nella Sala VIP. CTA.`,

    segnale_xauusd: base + `Scrivi il messaggio per pubblicare il segnale operativo su XAUUSD.
Direzione: ${v('dir') || 'BUY'}
Entry: ${v('entry') || '2345.00'} | Stop Loss: ${v('sl') || '2335.00'}
TP1: ${v('tp1') || '2355'} | TP2: ${v('tp2') || '2365'} | TP3: ${v('tp3') || '2375'}
Presenta i dati in modo chiaro e leggibile con le emoji giuste. Aggiungi 1-2 righe di contesto semplice sul Gold. Breve disclaimer sul rischio. CTA al CopyTrading automatico.`,

    risultato_segnale: base + `Scrivi il messaggio per comunicare il risultato dell'operazione su XAUUSD.
Esito: ${v('result') || 'WIN'} | Entry: ${v('entry') || '2345'} | Chiusura: ${v('exit') || '2360'} | Pips: ${v('pips') || '+45'}
Se WIN: tono soddisfatto ma misurato, ricorda che chi è nel CopyTrading lo ha incassato in automatico.
Se LOSS: onesto e professionale, il trading ha sempre i suoi rischi e il metodo si valuta nel lungo periodo.
Se BREAK EVEN: chiusura in pareggio come scelta intelligente di gestione del rischio. CTA.`,

    notizie_giorno: base + `Scrivi il messaggio di analisi notizie focalizzato esclusivamente su XAUUSD (Oro).
${newsPhoto ? 'Ho allegato una foto con le notizie/il calendario economico di oggi — analizzala e usa solo le notizie che impattano direttamente il Gold.' : ''}
${v('news') ? 'Note aggiuntive: ' + v('news') : ''}
Spiega in modo semplice e chiaro cosa muove il Gold oggi (CPI, Fed, NFP, dollaro, geopolitica), dai una direzione probabile con emoji 🟢 🔴 🟡, e indica gli orari chiave da monitorare. Accenna che le analisi approfondite sono nella Sala VIP. CTA.`,

    risultati_clienti: base + `Scrivi il messaggio per mostrare i risultati dei nostri clienti/membri — c'è uno screenshot o una chat allegata.
${v('clienti') ? 'Descrizione: ' + v('clienti') : 'Risultati positivi dai membri del CopyTrading e della Sala VIP'}
${v('periodo') ? 'Periodo: ' + v('periodo') : ''}
Tono: fatti reali, niente esagerazioni. Mostra la differenza tra chi ha scelto il CopyTrading e chi invece è ancora a fare tutto da solo con lo stress quotidiano. CTA forte.`,

    aggiornamento: base + `Scrivi un aggiornamento live sull'operazione XAUUSD in corso.
Situazione attuale: ${v('status') || 'in profitto'} | Pips attuali: ${v('pips') || '+30'} ${v('comment') ? '| Note: ' + v('comment') : ''}
Breve e diretto, come un aggiornamento in tempo reale. Chi è nel CopyTrading lo vede già sul proprio conto. CTA.`,

    chiusura_giornata: base + `Scrivi il messaggio di chiusura della giornata operativa su XAUUSD.
Le operazioni del giorno si stanno chiudendo. Menziona che gli screenshot dei risultati dei clienti sono allegati. Parla dei vantaggi del CopyTrading (automatico, nessuna esperienza richiesta, budget accessibile, zero stress). CTA forte per chi vuole iniziare domani.`,

    engagement: base + `Scrivi un messaggio di engagement per il canale. Scegli casualmente uno di questi 4 approcci e non usare mai lo stesso due volte di fila:

1. TEASER ANALISI: crea curiosità sul prossimo segnale XAUUSD con domande retoriche e suspense genuina
2. ANNUNCIO IN ARRIVO: comunica che un setup interessante sull'Oro è stato identificato, segnale in preparazione
3. OCCHI SUL MERCATO: il team sta monitorando livelli chiave su XAUUSD, analisi riservata alla Sala VIP
4. ULTIMI POSTI COPYTRADING: crea urgenza concreta per entrare nel programma, con 2-3 vantaggi pratici

Tono caldo e genuino, non meccanico. CTA.`,
  };

  return map[type] || null;
}

// ── DAILY PLAN PROMPT ──────────────────────────────────────────────────────
export function buildDailyPrompt(
  slot: DailySlot,
  ctx: {
    cfg: Config; date: string; tone: Tone;
    news: string; extra: string; hasPhoto: boolean; calEvents: string;
    fields?: Record<string, string>;
  },
): string | null {
  const { cfg, date, tone, news, extra, hasPhoto, calEvents, fields = {} } = ctx;
  const f = (k: string) => fields[k] || '';
  const trader = cfg.traderName || 'Il Trader';
  const lIT = getLinkIT(cfg);
  const lEN = getLinkEN(cfg);

  const base = `Sei il gestore di un canale Telegram XAUUSD professionale.
Trader: ${trader} | Data: ${date}

Scrivi UN SOLO messaggio Telegram pronto da pubblicare.

${toneInstructions(tone)}

REGOLE FISSE:
- Output = solo testo del messaggio. ZERO metadati. ZERO prefissi.
- Scrivi PRIMA la versione italiana COMPLETA con la sua CTA italiana.
- Poi scrivi ESATTAMENTE questa riga: ──────────────
- Poi scrivi la versione inglese COMPLETA con la sua CTA inglese.
- NON usare asterischi (*).
- CopyTrading = automatico, contrapposto allo stress del trading manuale.

CTA ITALIANA (alla fine versione IT, link su riga nuova):
👉 CLICCA QUI PER [TESTO VARIABILE]:
${lIT}

CTA INGLESE (alla fine versione EN, link su riga nuova):
👉 CLICK HERE TO [VARIABLE TEXT]:
${lEN}

ESEMPIO DI OUTPUT ATTESO ✅:
Il Gold si muove oggi. 📡

CPI USA alle 14:30 — attesa volatilità alta sul XAUUSD.

Chi è nel VIP ha già i livelli pronti. Chi è fuori improvvisa. ⚡️

👉 CLICCA QUI PER ACCEDERE ALLA SALA VIP:
${lIT}

──────────────

Gold is moving today. 📡

US CPI at 14:30 — high volatility expected on XAUUSD.

VIP members already have their levels ready. Everyone else improvises. ⚡️

👉 CLICK HERE TO ACCESS THE VIP ROOM:
${lEN}
`;

  const prompts: Record<string, string> = {
    d_buongiorno:      base + `BUONGIORNO (07:00). Inizia con "Buongiorno Traders 👋" — unico messaggio con questo saluto. Motivazione concreta legata al Gold di oggi, hype sul fatto che la giornata è piena di opportunità per chi è già dentro. Frasi corte, ritmo alto. CTA.`,
    d_risultati_ieri:  base + `RISULTATI DI IERI (08:00). Presenta i risultati separati per i due servizi:
VIP Room (operazioni manuali): ${f('vip_pips') || '85'} pips, ${f('vip_trades') || '5'} operazioni, win rate ${f('vip_winrate') || '80%'}.
CopyTrading (automatico): ${f('copy_pips') || '72'} pips, ${f('copy_trades') || '4'} operazioni, performance ${f('copy_perf') || '+3.2%'}.
Screenshot allegato. Chi era nel CopyTrading ha incassato tutto in automatico mentre dormiva. CTA urgente per chi non è ancora dentro.`,
    d_primi_risultati: base + `PRIMI RISULTATI DELLA MATTINA (09:00). Il copytrading è già attivo: ${f('pips') || '+40'} pips, ${f('trades') || '3'} operazioni chiuse. Screenshot risultati allegato. Contrasto netto: chi è dentro incassa, chi è fuori guarda. CTA con urgenza reale.`,
    d_ready:           base + `READY SEGNALE (09:30). Segnale gratuito XAUUSD in arrivo a breve sul canale. Breve, determinato, crea attesa. Chi vuole continuità e segnali ogni giorno entra nel VIP. CTA.`,
    d_segnale:         base + `SEGNALE XAUUSD (10:00). Senza asterischi, usa emoji per strutturare:
📡 ${f('dir') || 'BUY'} | 📍 Entry: ${f('entry') || '2345.00'} | 🛑 SL: ${f('sl') || '2335.00'} | 🎯 TP1: ${f('tp1') || '2355'}${f('tp2') ? ' | TP2: ' + f('tp2') : ''}${f('tp3') ? ' | TP3: ' + f('tp3') : ''}
1-2 righe contesto tecnico essenziale. Disclaimer rischio. CTA copytrading automatico per chi non vuole operare manualmente.`,
    d_risultato_segn:  base + `RISULTATO SEGNALE (11:30). Esito: ${f('esito') || 'WIN'} | Pips: ${f('pips') || '+45'}. Il segnale gratuito pubblicato stamattina ha raggiunto il target. Screenshot allegato. Breve, diretto, fatti e numeri. Chi era nel VIP aveva già i target avanzati. CTA.`,
    d_copy_live:       base + `RISULTATI ATTUALI COPYTRADING (12:00). Il copytrading continua a lavorare: ${f('copy_pips') || '+60'} pips live, ${f('copy_trades') || '4'} operazioni già chiuse oggi. Screenshot allegato. Automatico, senza fare nulla. CTA.`,
    d_notizie:         base + `CALENDARIO ECONOMICO (13:00). Focus ESCLUSIVO su cosa muove XAUUSD oggi.
${hasPhoto ? 'FOTO ALLEGATA — analizza il calendario economico nello screenshot ed estrai tutti gli eventi rilevanti per il Gold (Fed, CPI, NFP, PMI, dati lavoro USA, geopolitica).' : ''}
${f('note') ? 'NOTE: ' + f('note') : news ? 'NOTIZIE / NOTE: ' + news : ''}
${calEvents ? 'EVENTI MACRO OGGI (ForexFactory):\n' + calEvents : ''}
Direzione probabile Gold (🟢 rialzista / 🔴 ribassista / 🟡 neutro), orari chiave, livelli da monitorare. Analisi dettagliata disponibile nel VIP. CTA.`,
    d_copy_postnews:   base + `RISULTATI COPYTRADING POST NEWS (15:00). Le notizie macro sono uscite.
${f('news_ref') ? 'Notizia di riferimento: ' + f('news_ref') : news ? 'Notizie: ' + news : ''}
${f('pips_postnews') ? 'Pips generati: ' + f('pips_postnews') : ''}
Mostra come ha reagito XAUUSD e i profitti generati in automatico dal copytrading durante la volatilità. Screenshot allegato. Chi non era posizionato si è perso tutto. CTA forte.`,
    d_educativo:       base + `POST EDUCATIVO (17:00).${f('topic') ? ' Tema: ' + f('topic') + '.' : ''} Breve lezione pratica su XAUUSD — un concetto tecnico, una strategia, un errore comune da evitare. Tono da mentore, non da professore. Conclude con CTA: chi vuole applicarlo subito entra nel VIP o nel CopyTrading.`,
    d_recensioni:      base + `RECENSIONI DEL GIORNO + RECAP (19:00).${f('nota') ? ' Nota: ' + f('nota') + '.' : ''} Mostra le testimonianze / messaggi positivi ricevuti oggi dai clienti. Screenshot allegato. Social proof forte — persone reali, risultati reali. Breve recap numerico della giornata. CTA.`,
    d_chiusura:        base + `CHIUSURA (21:00). Messaggio di chiusura giornata — bilancio sintetico, tono motivante per domani. Chi è già dentro sa cosa ha guadagnato oggi. Chi è fuori sa cosa si è perso. CTA finale.`,
  };
  return prompts[slot.id] || null;
}

// ── NS (no signal) DAILY PROMPTS ───────────────────────────────────────────
export function buildNSPrompt(
  slot: DailySlot,
  ctx: { cfg: Config; date: string; tone: Tone; news: string; extra: string; hasPhoto: boolean; fields?: Record<string, string> },
): string | null {
  const { cfg, date, tone, news, extra, hasPhoto, fields = {} } = ctx;
  const f = (k: string) => fields[k] || '';
  const trader = cfg.traderName || 'Il Trader';
  const lIT = getLinkIT(cfg);
  const lEN = getLinkEN(cfg);

  const base = `Sei il gestore di un canale Telegram XAUUSD professionale. NON vengono mai pubblicati segnali gratuiti sul canale — tutto il valore è riservato ai clienti VIP Room e CopyTrading.
Trader: ${trader} | Data: ${date}

Scrivi UN SOLO messaggio Telegram pronto da pubblicare.
${toneInstructions(tone)}

REGOLE FISSE:
- Output = solo testo del messaggio. ZERO metadati. ZERO prefissi.
- Scrivi PRIMA la versione italiana COMPLETA con la sua CTA italiana.
- Poi scrivi ESATTAMENTE questa riga: ──────────────
- Poi scrivi la versione inglese COMPLETA con la sua CTA inglese.
- NON usare asterischi (*).
- Mai menzionare segnali gratuiti — solo VIP Room e CopyTrading come canali di accesso ai risultati.

CTA ITALIANA:
👉 CLICCA QUI PER [TESTO VARIABILE]:
${lIT}

CTA INGLESE:
👉 CLICK HERE TO [VARIABLE TEXT]:
${lEN}
`;

  const prompts: Record<string, string> = {
    ns_buongiorno:     base + `BUONGIORNO (07:00). Inizia con "Buongiorno Traders 👋". Motivazione concreta legata ai mercati di oggi, hype sul fatto che la giornata è piena di opportunità per chi è già dentro VIP o CopyTrading. CTA.`,
    ns_risultati_ieri: base + `RISULTATI DI IERI (08:00). Presenta i risultati separati per i due servizi:
VIP Room (operazioni manuali): ${f('vip_pips') || '85'} pips, ${f('vip_trades') || '5'} operazioni, win rate ${f('vip_winrate') || '80%'}.
CopyTrading (automatico): ${f('copy_pips') || '72'} pips, ${f('copy_trades') || '4'} operazioni, performance ${f('copy_perf') || '+3.2%'}.
Screenshot allegato. CTA urgente: chi non è dentro sta perdendo ogni giorno.`,
    ns_copy_mattina:   base + `RISULTATI MATTUTINI COPYTRADING (09:00). Il copytrading ha già aperto: ${f('copy_pips') || '+35'} pips, ${f('copy_trades') || '2'} operazioni chiuse stamattina — automaticamente, mentre i follower dormivano o lavoravano. Screenshot risultati allegato. CTA forte.`,
    ns_vip_mattina:    base + `RISULTATI MATTUTINI VIP (09:30). La sala VIP ha già operato stamattina: ${f('vip_pips') || '+50'} pips, ${f('vip_trades') || '3'} operazioni. Chi è dentro VIP ha già posizioni aperte in profitto. Screenshot allegato. Contrasto netto: chi è fuori non ha nulla. CTA.`,
    ns_hype_vip:       base + `HYPE SEGNALE CANALE VIP (10:30). Annuncia che un nuovo segnale sta per essere rilasciato ESCLUSIVAMENTE sul canale VIP — non qui, non gratis. Crea urgenza e curiosità senza rivelare dettagli. Chi vuole il segnale deve entrare nel VIP. CTA.`,
    ns_hype_copy:      base + `HYPE SEGNALE COPYTRADING (11:30). Il CopyTrading sta per ricevere un nuovo segnale automaticamente — i copier lo avranno sul conto in automatico senza fare nulla. Chi non è ancora connesso si perderà questa operazione. CTA urgente.`,
    ns_calendario:     base + `CALENDARIO ECONOMICO (13:00). Analisi delle notizie macro con focus ESCLUSIVO su impatto XAUUSD.
${hasPhoto ? 'FOTO ALLEGATA — analizza il calendario economico nello screenshot ed estrai tutti gli eventi rilevanti per il Gold.' : ''}
${f('note') ? 'NOTE: ' + f('note') : news ? 'NOTIZIE / NOTE: ' + news : ''}
Direzione probabile (🟢/🔴/🟡), orari chiave. La gestione durante le news è esclusiva VIP + CopyTrading. CTA.`,
    ns_post_news:      base + `RISULTATI POST NEWS (15:00). Le notizie macro sono uscite.
${f('news_ref') ? 'Notizia: ' + f('news_ref') : news ? 'Notizie: ' + news : ''}
${f('pips_postnews') ? 'Pips generati: ' + f('pips_postnews') : ''}
Ecco come ha reagito XAUUSD e i risultati in tempo reale dei clienti VIP e CopyTrading. Screenshot allegato. Chi non era posizionato ha perso l'opportunità. CTA.`,
    ns_recensioni:     base + `RECENSIONI CLIENTI DEL GIORNO (18:00).${f('nota') ? ' Nota: ' + f('nota') + '.' : ''} Mostra le testimonianze / recensioni / messaggi positivi ricevuti oggi dai clienti. Screenshot allegato. Social proof forte — persone reali con risultati reali. CTA.`,
    ns_recap:          base + `RECAP FINALE + CHIUSURA GIORNO (21:00).${f('nota_finale') ? ' Note finali: ' + f('nota_finale') + '.' : ''} Riepiloga la giornata: risultati totali VIP e CopyTrading, operazioni chiuse, bilancio del giorno. Messaggio di chiusura motivante per domani. CTA finale.`,
  };
  return prompts[slot.id] || null;
}

// ── ALT PLAN A PROMPTS ─────────────────────────────────────────────────────
export function buildAltPromptA(
  type: string,
  cfg: Config,
  tone: Tone,
  fields: Record<string, string>,
  ctx?: { date?: string; news?: string; mktCtx?: string },
): string | null {
  const date = ctx?.date || todayItalian();
  const lIT = getLinkIT(cfg);
  const lEN = getLinkEN(cfg);
  const trader = cfg.traderName || 'Il Trader';
  const news = ctx?.news || '';
  const mktCtx = ctx?.mktCtx || '';
  const av = (k: string) => fields[k] || '';

  const base = `Sei il gestore del canale Telegram XAUUSD di ${trader}. Data di oggi: ${date}.
${news ? 'Notizie del giorno: ' + news : ''}${mktCtx ? ' | Contesto mercato: ' + mktCtx : ''}

${toneInstructions(tone)}

ISTRUZIONI TECNICHE:
- Scrivi SOLO il testo del messaggio — zero prefissi, zero etichette, zero metadati
- Scrivi PRIMA la versione italiana COMPLETA con la sua CTA italiana.
- Poi scrivi ESATTAMENTE questa riga: ──────────────
- Poi scrivi la versione inglese COMPLETA con la sua CTA inglese.
- NON usare asterischi (*) o qualsiasi altro markdown

CTA ITALIANA (alla fine versione IT, link su riga nuova):
👉 CLICCA QUI PER [TESTO VARIABILE]:
${lIT}

CTA INGLESE (alla fine versione EN, link su riga nuova):
👉 CLICK HERE TO [VARIABLE TEXT]:
${lEN}

Varia la CTA ogni volta: "UNIRTI AL VIP", "REPLICARE QUESTI RISULTATI", "COPIARE IL METODO", "ENTRARE NELLA SALA VIP", "ACCEDERE AL PROGRAMMA", "scrivimi START in DM", "scrivimi GOLD in DM", "scrivimi VIP in DM" ecc.

ESEMPIO DI OUTPUT ATTESO ✅:
Ieri +127 pips su XAUUSD. 📈

3 operazioni, tutte chiuse in profitto.

Chi era nel VIP lo sapeva già ieri sera. 🥇

Scrivimi GOLD in DM se vuoi essere il prossimo.

👉 CLICCA QUI PER ENTRARE NELLA SALA VIP:
${lIT}

──────────────

Yesterday +127 pips on XAUUSD. 📈

3 trades, all closed in profit.

VIP members already knew last night. 🥇

DM me GOLD if you want to be next.

👉 CLICK HERE TO JOIN THE VIP ROOM:
${lEN}
`;

  const map: Record<string, string> = {
    alt_mindset: base + `MINDSET D'APERTURA (07:00). Inizia con "Buongiorno traders 🔥" — unico messaggio del giorno con questo saluto.
Accendi il mindset: nuovo giorno = nuova opportunità sul Gold. Tema del giorno: cosa succederà sui mercati oggi.
Angolo 9-5: rispetta chi va al lavoro ("massimo rispetto, stai facendo il tuo dovere per la tua famiglia") ma apri una porta — con 15-20 minuti al giorno si può costruire qualcosa di diverso.
Soft CTA: "Scrivimi START in DM se vuoi che ti segua passo passo su Gold."`,

    alt_social_am: base + `SOCIAL PROOF MATTINA (08:00). Risultato/feedback: ${av('af_feedback') || 'Un membro ha fatto profitto ieri seguendo il segnale Gold in pausa pranzo'}. Periodo: ${av('af_periodo') || 'ieri'}.
Inizia citando il membro come se stessi riportando quello che ti ha scritto (cita tra virgolette o in corsivo). Poi: "Questo non è fortuna — è il metodo che si ripete ogni settimana."
Contrasto spettatore/protagonista. Chi è dentro incassa, chi guarda aspetta ancora.
CTA: "Vuoi ricevere gli stessi livelli in tempo reale? Scrivimi GOLD in DM."`,

    alt_ready: base + `READY SEGNALE (09:00). Prepara il pubblico: tra poco arriva il segnale gratuito su Gold di oggi. Tono determinato — hai già fatto l'analisi, sai cosa fare.
Crea attesa e anticipazione: breve accenno al contesto di mercato (senza spoilerare l'operazione).
Accenna che nel VIP ci sono già altri 2-3 setup della giornata pronti.
CTA: "Scrivimi VIP in DM se vuoi tutti i setup, non solo quello gratuito."`,

    alt_segnale: base + `SEGNALE GOLD GRATUITO (10:00). Presenta il segnale operativo in modo chiaro e leggibile.
Direzione: ${av('af_dir') || 'BUY'} | Entry: ${av('af_entry') || '2345.00'} | SL: ${av('af_sl') || '2335.00'} | TP1: ${av('af_tp1') || '2355'} | TP2: ${av('af_tp2') || '2365'} ${av('af_tp3') ? '| TP3: ' + av('af_tp3') : ''}
Usa emoji per strutturare (📡 📍 🛑 🎯). 1-2 righe di contesto tecnico semplice. Breve disclaimer rischio.
Chiudi ricordando che chi è nel CopyTrading riceve questo in automatico senza dover guardare i grafici.`,

    alt_update: base + `UPDATE TRADE + MINI LEZIONE (11:30). Situazione: ${av('af_esito') || 'TP1 colpito'} | ${av('af_pips') ? 'Pips: ' + av('af_pips') : ''} ${av('af_note') ? '| ' + av('af_note') : ''}.
Prima comunica l'update in modo diretto (1-2 righe). Poi mini-lezione: estrai un insegnamento concreto da questo trade (gestione del rischio, perché non spostare lo SL, come si gestisce un TP parziale).
CTA: "Se vuoi imparare questa gestione nel dettaglio, scrivimi ANALISI in DM."`,

    alt_educativo: base + `POST EDUCATIVO (13:00). Spiega un concetto pratico su XAUUSD in 2-3 righe semplici — come se lo spiegassi a un amico che non sa nulla di trading. Scegli un tema tra: zone di liquidità, pattern tipici del Gold, come le news macro muovono XAUUSD, perché il Gold è diverso dagli altri asset.
È un assaggio di valore reale che crea curiosità. Non è una lezione accademica.
Chiudi con: "Nel gruppo privato mostro la stessa cosa in tempo reale sul grafico ogni giorno."
CTA con link.`,

    alt_social_pm: base + `SOCIAL PROOF + SCARSITÀ (15:00). Storia: ${av('af_storia') || 'Un membro che lavora 9-5 ha fatto profitto questa settimana in 15 minuti al giorno seguendo i segnali Gold'}.
Racconta la storia in modo umano e concreto (nome, contesto di vita, risultato). Poi: "Ho appena aperto ${av('af_posti') || 'pochi'} nuovi posti per chi vuole iniziare oggi — quando sono pieni chiudo."
Scadenza: ${av('af_scad') || 'stasera'}. Urgenza reale, non forzata.
CTA: link + "oppure scrivimi VIP in DM."`,

    alt_segnale2: base + (av('af_tipo2') === 'recap'
      ? `RECAP MULTI-TRADE (16:30). ${av('af_recap_note') || 'Riepilogo dei trade di oggi su XAUUSD con risultati e gestione.'} Racconta come hai gestito la giornata operativa in modo trasparente e professionale — includi anche eventuali trade negativi con una spiegazione onesta. Rafforza la narrativa di consistenza e metodo. CTA: "Se vuoi vedere questa gestione in tempo reale ogni giorno, scrivimi o clicca qui."`
      : `SECONDO SEGNALE GOLD (16:30). Direzione: ${av('af_dir2') || 'SELL'} | Entry: ${av('af_entry2') || '2360.00'} | SL: ${av('af_sl2') || '2370.00'} | TP1: ${av('af_tp1b') || '2350'}. Struttura uguale al primo segnale: emoji, contesto breve, disclaimer, CTA al CopyTrading.`),

    alt_antiscuse: base + `MINDSET ANTI-SCUSE (18:00). Abbatti le scuse più comuni che impediscono alle persone di iniziare. Scegli uno di questi angoli (o combinali): "Non ho tempo" → 15-20 minuti al giorno bastano. "Non ho esperienza" → ho membri che partivano da zero. "Non è il momento giusto" → il momento giusto era ieri, il secondo momento migliore è adesso. "Ho già perso soldi con il trading" → senza un metodo e un supporto è normale, con il giusto affiancamento cambia tutto.
Tono rispettoso ma diretto. Non giudicare, capisci i dubbi ma rispondi con fatti.
CTA con parola chiave in DM (START, CAMBIO, LIBERTÀ — varia ogni volta).`,

    alt_carosello: base + `CAROSELLO RISULTATI (19:30). Presenta più risultati di membri in un unico post — come una rassegna settimanale. Stile: "FEEDBACK MEMBRI — guardate cosa hanno fatto questa settimana." Elenca 3-4 risultati brevissimi (1 riga ognuno), inventandoli in modo realistico e credibile (nomi italiani, cifre moderate, contesti di vita normali come lavoratori, studenti, mamme).
Conclude: "Queste non sono eccezioni — è il metodo che funziona ogni giorno."
CTA forte: "Se vuoi che ti aiuti a impostare tutto oggi stesso, clicca qui."`,

    alt_recap: base + `RECAP TRASPARENTE GIORNATA (21:00). Riepiloga la giornata operativa in modo onesto: numero trade, esito complessivo, pips, commento sincero. Se è stata una buona giornata: soddisfazione misurata. Se è stata "mid" o negativa: onestà professionale — il metodo si valuta nel lungo periodo, non su una singola sessione.
Richiamo al risk management: niente promesse di risultato garantito, solo metodo e disciplina costante.
CTA soft: "Domani si riparte — se vuoi arrivare preparato entra nel gruppo prima che chiudiamo l'accesso di oggi."`,

    alt_chiusura: base + `CHIUSURA MOTIVAZIONALE (22:30). Colpisci forte il contrasto tra chi sta scrollando Netflix/social e chi invece sta costruendo qualcosa di diverso per la sua vita.
Angolo potente: "Domani mattina alle 7:00 sono qui — con l'analisi Gold pronta, i livelli già identificati, e tutto quello che serve per iniziare la giornata con un vantaggio reale. Vuoi essere tra quelli che arrivano preparati o tra quelli che aspettano di vedere cosa succede?"
Crea urgenza legata a oggi: X posti / offerta che scade a mezzanotte / accesso che si chiude.
CTA forte finale con link.`,
  };

  return map[type] || null;
}

// ── ALT PLAN B PROMPTS ─────────────────────────────────────────────────────
export function buildAltPromptB(
  type: string,
  cfg: Config,
  tone: Tone,
  fields: Record<string, string>,
  ctx?: { date?: string; news?: string; mktCtx?: string },
): string | null {
  const date = ctx?.date || todayItalian();
  const lIT = getLinkIT(cfg);
  const lEN = getLinkEN(cfg);
  const trader = cfg.traderName || 'Il Trader';
  const news = ctx?.news || '';
  const mktCtx = ctx?.mktCtx || '';
  const bv = (k: string) => fields[k] || '';

  const base = `Sei il gestore del canale Telegram XAUUSD di ${trader}. Data: ${date}.
${news ? 'Notizie del giorno: ' + news : ''}${mktCtx ? ' | Contesto mercato: ' + mktCtx : ''}

${toneInstructions(tone)}

ISTRUZIONI TECNICHE:
- Scrivi SOLO il testo del messaggio — zero prefissi, zero etichette, zero metadati
- Prima versione italiana completa, poi separatore ──────────────, poi versione inglese
- NON usare asterischi (*) o markdown
- Rispetta RIGOROSAMENTE il limite di righe/blocchi del tono
- CTA alla fine, formato esatto:

👉 CLICCA QUI PER [TESTO VARIABILE]:
${lIT}

👉 CLICK HERE TO [VARIABLE TEXT]:
${lEN}

Varia CTA ogni volta: "UNIRTI AL VIP", "REPLICARE I RISULTATI", "COPIARE IL METODO", "ACCEDERE AL PROGRAMMA", "scrivimi JOIN/GOLD/VIP/START/STORIA/PIANO/VIDEO/PRONTO in DM", ecc.
`;

  const map: Record<string, string> = {
    b_buongiorno: base + `BUONGIORNO "SOLO PER CHI È DENTRO" (07:00). Inizia con "Buongiorno traders 🌅".
Tono di squadra: riconosci chi è già con te ("chi è nel copy si è svegliato con le posizioni già gestite, chi è nel VIP ha il piano già pronto"). Sottolinea con rispetto che chi non è ancora dentro sta ancora guardando da fuori — non è un insulto, è un invito.
CTA soft: "Scrivimi JOIN in DM se vuoi unirti al gruppo che lavora su Gold mentre fa altro."`,

    b_risultato: base + `RISULTATO VIP/COPY DI IERI (08:00). ${bv('bf_nome') ? 'Membro: ' + bv('bf_nome') + '.' : ''} ${bv('bf_risultato') ? 'Risultato: ' + bv('bf_risultato') + '.' : 'Racconta un caso credibile: un membro che ieri ha chiuso un profitto su XAUUSD.'} ${bv('bf_dettaglio') ? bv('bf_dettaglio') + '.' : ''}
Dettagli realistici: nome italiano, contesto di vita normale. Nessuna cifra esorbitante — credibilità prima di tutto.
CTA: "Vuoi che ti aiuti a impostare anche il tuo copy su Gold in modo serio? Clicca qui."`,

    b_carosello: base + `CAROSELLO MINI FEEDBACK (09:00). Usa questi feedback reali se forniti:
${bv('bf_f1') ? '"' + bv('bf_f1') + '" — ' + (bv('bf_c1') || 'membro') : ''}
${bv('bf_f2') ? '"' + bv('bf_f2') + '" — ' + (bv('bf_c2') || 'membro') : ''}
${bv('bf_f3') ? '"' + bv('bf_f3') + '" — ' + (bv('bf_c3') || 'membro') : ''}
Se non ci sono feedback forniti, inventane 3 credibili (nomi italiani, cifre moderate, contesti normali).
Ogni citazione 1 riga, tra virgolette, con contesto. Poi: "Non è fortuna — è un metodo che funziona per persone normali."
CTA: "Scrivimi VALUTO in privato se vuoi capire se il servizio è adatto a te."`,

    b_mindset: base + `MINDSET — PERCHÉ CHI È DENTRO RESTA (10:30). Spiega cosa rende il metodo sostenibile nel tempo: routine semplice (15-20 minuti al giorno), compatibile col lavoro 9-5, nessuna promessa di guadagno garantito ma un processo chiaro e trasparente.
Fai capire la differenza tra "trading emotivo" e "trading sistematico con supporto". Chi è nel programma non è solo: ha livelli pronti, gestione guidata, e una community che lavora insieme.
CTA soft: "Se vuoi che ti mostri come strutturiamo le giornate su Gold, manda GOLD STRATEGY in DM."`,

    b_copytrading: base + `COME FUNZIONA IL COPYTRADING (12:00). Spiega in modo semplice e rassicurante: cosa controlla l'utente (dimensione, rischio, stop totale), cosa controlli tu (analisi, esecuzione, gestione). Smentisci le paure principali: "non è un bot misterioso — vedi tutto sul tuo conto in tempo reale, puoi disattivare quando vuoi."
Tono educativo ma coinvolgente — non stai facendo una lezione, stai togliendo un dubbio a qualcuno che ci sta pensando.
CTA: "Se vuoi un video/spiegazione di 2 minuti dove ti mostro tutto, scrivimi VIDEO in privato."`,

    b_story: base + `STORYTELLING — VIAGGIO DI UN CLIENTE (13:30). Racconta la storia di un membro dalla A alla Z: come è arrivato (scettico, poco tempo, aveva già perso con altri), le prime settimane (curva di apprendimento, disciplina), i risultati dopo qualche mese (senza overpromise — pips, costanza, mindset migliorato). Fai leva su: tempo limitato al giorno, compatibilità con famiglia e lavoro, niente "all in".
È una storia vera e umana, non un testimonial esagerato.
CTA: "Se ti rivedi in questa storia, probabilmente sei il profilo giusto. Scrivimi STORIA per parlarne."`,

    b_recap_sett: base + `RECAP SETTIMANALE VIP/COPY (15:00). ${bv('bf_ops') ? 'Operazioni: ' + bv('bf_ops') + '. Win: ' + bv('bf_win') + ', Loss: ' + bv('bf_loss') + '. Pips totali: ' + bv('bf_pips') + '.' : 'Presenta i numeri della settimana in modo credibile e realistico.'} ${bv('bf_note') ? 'Note: ' + bv('bf_note') + '.' : ''} ${bv('bf_periodo') ? 'Periodo: ' + bv('bf_periodo') + '.' : ''}
Sottolinea che non serve vincere sempre — conta costanza e gestione del rischio. Nessuna promessa.
CTA: "Per capire come potresti inserirti con il tuo capitale, scrivimi PIANO."`,

    b_obiezioni: base + `Q&A OBIEZIONI CLASSICHE (16:30). Prendi 2 domande reali: "Non ho tempo", "È troppo tardi", "Parto da poco capitale", "Ho già perso con il trading". Rispondi empatico e diretto, con esempi concreti (18-55 anni, diversi background). Non difensivo — capisce il dubbio, risponde con fatti.
CTA: "Se hai un dubbio che non ho coperto, scrivimi DOMANDA — ti rispondo personalmente."`,

    b_hype_prox: base + `HYPE SETUP IN ARRIVO (18:00). Crea anticipazione per i prossimi setup su Gold: domani/lunedì ci sono condizioni interessanti (cita news o volatilità attesa in modo generico ma credibile). Chi è dentro avrà tutto pronto la sera prima.
CTA: "Se vuoi arrivare alla prossima settimana già pronto, entra adesso prima che chiudiamo l'accesso di oggi."`,

    b_lifestyle: base + `LIFESTYLE + RISULTATO CLIENTE (19:30). ${bv('bf_attivita') && bv('bf_outcome') ? 'Mentre ' + (bv('bf_profilo') || 'un nostro membro') + ' ' + bv('bf_attivita') + ', il suo conto ha chiuso ' + bv('bf_outcome') + ' grazie al copy su XAUUSD. Zero ore ai grafici.' : 'Immagine mentale: mentre il membro era al lavoro/con la famiglia, il suo conto chiudeva in profitto con il copy su Gold.'} Contrasto con chi lavora solo per lo stipendio senza costruire nulla di parallelo.
CTA: "Se vuoi che il tuo tempo libero non sia solo fuga dal lavoro, scrivimi LIBERTÀ."`,

    b_recap_day: base + `RECAP GIORNATA SOLO CLIENTI (21:00). Nessun dettaglio operativo sui segnali — solo: quanti membri hanno scritto oggi, quante chiusure positive, tono complessivo della giornata (buona/media/difficile). Trasparenza assoluta, anche nelle giornate "mid".
Ribadisci l'approccio: il trading si valuta su settimane e mesi, non su un singolo giorno.
CTA soft: "Se vuoi un recap personalizzato di cosa potresti aspettarti nei tuoi primi 30 giorni con noi, scrivimi 30GG in DM."`,

    b_chiusura: base + `CHIUSURA MENTALE FORTE (22:30). Messaggio potente: chi è già dei nostri va a dormire sapendo che domani ha un piano chiaro su Gold — livelli pronti, gestione definita, nessuna improvvisazione. Chi è fuori, domani ricomincia da zero come ogni giorno.
"Non devi avere fretta, devi iniziare con la testa giusta e con un metodo. Ma ogni giorno che aspetti senza muoverti non è un giorno neutro — è un giorno perso."
CTA forte finale: "Se vuoi essere dentro dal prossimo ciclo, questo è l'ultimo slot di oggi. Manda PRONTO in DM e ti rispondo domani mattina con priorità."`,
  };

  return map[type] || null;
}

// ── WEEKEND PROMPTS ────────────────────────────────────────────────────────
export function buildWkPrompt(
  type: string,
  cfg: Config,
  tone: Tone,
  fields: Record<string, string>,
  wkRecapPhotos: string[],
  wkSPPhotos: string[],
  wkOutlookPhoto: string | null,
  ctx?: { date?: string },
): string | null {
  const date = ctx?.date || todayItalian();
  const lIT = getLinkIT(cfg);
  const lEN = getLinkEN(cfg);
  const trader = cfg.traderName || 'Il Trader';
  const wv = (k: string) => fields[k] || '';

  const base = `Sei il gestore del canale Telegram XAUUSD di ${trader}. Data: ${date}.

${toneInstructions(tone)}

REGOLE FISSE:
- Output = SOLO il testo del messaggio. Zero prefissi, zero metadati.
- Scrivi PRIMA la versione italiana COMPLETA con la sua CTA italiana.
- Poi scrivi ESATTAMENTE questa riga: ──────────────
- Poi scrivi la versione inglese COMPLETA con la sua CTA inglese.
- NON usare asterischi (*).
- STRUTTURA A BLOCCHI: max 2 righe per blocco, riga vuota tra blocchi.

CTA ITALIANA (alla fine versione IT, link su riga nuova):
👉 CLICCA QUI PER [TESTO VARIABILE]:
${lIT}

CTA INGLESE (alla fine versione EN, link su riga nuova):
👉 CLICK HERE TO [VARIABLE TEXT]:
${lEN}

ESEMPIO DI OUTPUT ATTESO ✅:
Buon weekend traders. ☀️

La settimana è andata — ci siamo meritati il riposo.

Se vuoi essere pronto lunedì, il link è aperto tutto il weekend. 👇

👉 CLICCA QUI PER CONFIGURARE IL COPYTRADING:
${lIT}

──────────────

Happy weekend traders. ☀️

The week is done — we earned the rest.

If you want to be ready Monday, the link is open all weekend. 👇

👉 CLICK HERE TO SET UP COPYTRADING:
${lEN}
`;

  const map: Record<string, string> = {
    sab_buongiorno: base + `BUONGIORNO WEEKEND (Sabato ~08:00).
Stile originale: "Buongiorno! Oggi inizia il weekend quindi possiamo riposarci la mente e chiudere i grafici! La settimana è stata movimentata, tante operazioni. Rimaniamo attivi per chi vuole configurare il copytrading ed essere pronto per lunedì."
Mantieni questo angolo: ✅ relax meritato + ✅ porte aperte per chi vuole configurarsi nel weekend + ✅ si riparte lunedì.
Tono caldo, da trader che parla alla sua community dopo una settimana di lavoro.
CTA al CopyTrading con angolo "configurati adesso, pronto lunedì".`,

    sab_recap: base + `WEEKLY RECAP SABATO (~11:00). Analisi settimanale su XAUUSD in stile professionale ma accessibile.
${wkRecapPhotos.length > 0 ? 'Hai ' + wkRecapPhotos.length + ' screenshot delle notizie della settimana (Lun→Ven) allegati. ANALIZZALI TUTTI. Estrai i dati reali (date, valori usciti, attesi, impatto su USD e Gold) e costruisci la narrativa: cosa è successo ogni giorno → perché il Gold si è mosso così.' : 'Nessuno screenshot fornito — usa un contesto macro verosimile per la settimana.'}
${wv('wk_gold') ? 'Prezzo Gold / livello chiave: ' + wv('wk_gold') : ''}
${wv('wk_tech') ? 'Note aggiuntive: ' + wv('wk_tech') : ''}

Struttura OBBLIGATORIA (messaggio lungo strutturato — NON usare blocchi brevi):
- Titolo: "🚀 WEEKLY RECAP XAUUSD: [evento chiave], l'Oro [cosa ha fatto]"
- "Buon sabato traders." + rimando all'outlook di domenica scorsa
- Sezione "1. IL RISVEGLIO MACROECONOMICO (I Market Drivers) 🇺🇸": bullet per ogni giorno rilevante con evento, dato uscito vs atteso, impatto Gold
- Sezione "2. ANALISI TECNICA: [titolo] 📈": livello rotto, chiusura, wick/volumi come conferma istituzionale
- "🔮 COSA ASPETTARSI LUNEDÌ?" + CTA CopyTrading`,

    sab_offerta: base + `OFFERTA / SCARSITÀ (Sabato ~15:00).
Scadenza: ${wv('wk_scad') || 'chiusura settimanale'}
${wv('wk_offerta_note') ? 'Note: ' + wv('wk_offerta_note') : ''}

Struttura originale da replicare con variazioni:
- Titolo urgenza (🚨 RECAP FLASH / ⚡️ ULTIMA CHIAMATA ecc.)
- Cos'è incluso nell'accesso: CopyTrading automatico (h24, replica operazioni) + Sala VIP (analisi, community, supporto)
- Il concetto "2 servizi al prezzo di 1"
- Urgenza reale: scadenza con nome + countdown emotivo
- CTA finale forte con link

Tono: urgente, diretto, FOMO reale. Non inventare prezzi. Non promettere rendimenti garantiti.`,

    sab_risultati: base + `RISULTATI PIPS SETTIMANALI (Sabato ~18:00).
${wv('wk_giorni') ? 'Giorni: ' + wv('wk_giorni') : 'Usa dati verosimili'}
Pips totali: ${wv('wk_pips_tot') || '+1300'}
Operazioni: ${wv('wk_ops') || '12'}
${wv('wk_nota') ? 'Nota: ' + wv('wk_nota') : ''}

Struttura originale:
- Titolo "TRADING RESULTS VIP CHANNEL WEEKLY"
- Lista giorni con pips e emoji ✅/😴 (formato esatto: MONDAY +X PIPS)
- Riga eventuale spiegazione giorni a 0 (es. "riposo per volatilità")
- TOTAL PROFIT PIPS: +XXXX pips
- CTA "CLICCA E COPIA I SEGNALI"

Mantieni questo formato tabellare — non convertire in paragrafi.`,

    dom_quiete: base + `QUIETE PRIMA DELLA TEMPESTA (Domenica ~09:00).
Stile originale: "LA QUIETE PRIMA DELLA TEMPESTA! Buongiorno. Godetevi le ultime 24h di relax. Domani si riparte! Vuoi guardare un'altra settimana di profitti altrui o vuoi prenderli tu?"
Mantieni: ✅ senso di calma ma con l'elettricità della settimana che si avvicina + ✅ contrasto tra chi guarda e chi agisce + ✅ urgenza soft — è l'ultimo giorno utile per entrare.
Tono energetico ma non urlato. CTA al CopyTrading.`,

    dom_teaser: base + `TEASER OUTLOOK (Domenica ~11:00).
Stile originale: "Pronti a sapere cosa ci spetta da lunedì?" — breve, curioso, crea attesa per l'outlook del pomeriggio.
Messaggio cortissimo: 1-2 righe + domanda retorica + senso di anticipazione.
NON svelare ancora nulla del calendario. Solo creare attesa. Nessuna CTA con link — al massimo invita a restare sul canale.`,

    dom_outlook: base + `WEEKLY OUTLOOK (Domenica ~13:00). Analisi prospettica settimana prossima su XAUUSD.
${wkOutlookPhoto ? 'Hai lo screenshot del calendario economico allegato. ANALIZZALO: estrai tutti gli eventi rilevanti per XAUUSD (Fed, inflazione, lavoro USA, PMI, geopolitica) con data, ora CET, valore atteso e impatto probabile sul Gold.' : ''}
${wv('wk_ctx_tech') ? 'Contesto tecnico: ' + wv('wk_ctx_tech') : ''}
${wv('wk_cal_next') ? 'Calendario testuale: ' + wv('wk_cal_next') : ''}
${wv('wk_target') ? 'Target / scenario: ' + wv('wk_target') : ''}

Struttura narrativa dell'outlook originale:
- Titolo impatto (es. "WEEKLY OUTLOOK XAUUSD: [target] vs [evento]")
- Intro domenica + commento chiusura venerdì
- ⚠️ Avvertimento: settimana carica di market mover
- Lista numerata giorni/eventi macro con orari CET, valuta, atteso, impatto previsto su XAUUSD
- Analisi: cosa significa ogni dato per Gold
- Chiusura + CTA "Gestione esclusiva dei segnali durante le notizie"

Usa formato calendare numerato — non blocchi brevi. Sii specifico e professionale.`,

    dom_recap: base + `RECAP VIP vs COPYTRADING (Domenica ~17:00).
VIP Room: ${wv('wk_vip_eur') || '+3.998€'} · ${wv('wk_vip_pct') || '+7.31%'} ${wv('wk_vip_note') ? '· ' + wv('wk_vip_note') : ''}
CopyTrading: ${wv('wk_copy_eur') || '+329€'} · ${wv('wk_copy_pct') || '+1.34%'} ${wv('wk_copy_note') ? '· ' + wv('wk_copy_note') : ''}

Struttura originale:
- Titolo "WEEKLY RECAP: Manuale vs Automatico"
- Due sezioni numerate: 1️⃣ VIP ROOM (High Performance) + 2️⃣ COPYTRADING (Passive Income)
- Per ogni sezione: profitto €, performance %, caratteristica chiave (es. "4 operazioni chirurgiche", "drawdown ridicolo")
- Ideale per: profilo del cliente tipico
- Chiusura: "Non importa quale scegli, l'importante è esserci"
- CTA forte

Mantieni il format tabellare con emoji numerate — non paragrafo.`,

    dom_social_proof: base + `SOCIAL PROOF DOMENICA POMERIGGIO (~15:00).
${wkSPPhotos.length > 0 ? 'Hai ' + wkSPPhotos.length + ' screenshot dei risultati/chat dei clienti allegati. GUARDALI e costruisci il messaggio partendo da quello che vedi — profitti reali, chat reali, numeri reali.' : 'Non hai screenshot — crea un messaggio social proof generico ma credibile con risultati verosimili.'}
Angolo scelto: ${wv('wk_sp_angle') || 'automatico — scegli il più efficace tra fomo/prova sociale/numeri'}
${wv('wk_sp_note') ? 'Contesto: ' + wv('wk_sp_note') : ''}

Stile e struttura ispirata a questo esempio (adattala, non copiarla):
"NON FIDATEVI DI ME. FIDATEVI DI LORO. 👆
Avete appena visto i risultati di chi ha deciso di smettere di 'provare' e ha iniziato a copiare. Potrei stare qui a spiegarvi la strategia per ore, ma i profitti dei nostri membri parlano più di mille parole. 🥇
❓ Perché sei ancora fuori a guardare mentre loro incassano? La differenza tra te e loro è solo un click.
🚀 ATTIVA IL TUO SISTEMA DI RENDITA: Mentre tu pensi, noi continuiamo a chiudere operazioni POSITIVE ✅"

Mantieni questo angolo: chi ha scelto di agire ottiene risultati reali e misurabili. Chi guarda ancora da fuori perde ogni weekend. CTA forte al CopyTrading.`,

    dom_urgenza: base + `AVVISO RITARDATARI (Domenica ~20:00).
Stile originale: "AVVISO AI RITARDATARI. Domani mattina il mio supporto sarà BLOCCATO. Tutti si svegliano all'ultimo minuto. Se mi scrivi domani alle 09:00: farai la fila, perderai l'apertura mattutina, perderai il primo profitto. Se vuoi operare, il setup si fa ADESSO."
Mantieni: ✅ urgenza reale e credibile + ✅ lista conseguenze concrete per chi aspetta + ✅ call finale "fallo adesso non domani".
Tono diretto, quasi secco. Nessuna promessa di guadagno. Solo logistica operativa + FOMO pratica.`,
  };

  return map[type] || null;
}

// ── OPTIMIZE PROMPT ────────────────────────────────────────────────────────
export function buildOptPrompt(
  rawText: string,
  typeVal: string,
  cfg: Config,
  tone: Tone,
): string {
  const lIT = getLinkIT(cfg);
  const lEN = getLinkEN(cfg);
  const trader = cfg.traderName || 'Il Trader';
  const date = todayItalian();

  const typeHint: Record<string, string> = {
    risultati: 'Messaggio di risultati/profitti su XAUUSD.',
    segnale: 'Segnale operativo su XAUUSD.',
    mindset: 'Messaggio motivazionale / mindset.',
    social_proof: 'Social proof con feedback di clienti.',
    notizie: 'Analisi notizie e movimenti Gold.',
    copytrading: 'Promozione del CopyTrading automatico.',
    chiusura: 'Recap / chiusura giornata.',
    engagement: 'Messaggio di engagement / domanda alla community.',
  };

  return `Sei il gestore del canale Telegram XAUUSD di ${trader}. Data: ${date}.

Hai ricevuto questo testo grezzo scritto di getto:

"""
${rawText}
"""

Tipo di messaggio: ${typeHint[typeVal] || 'Rileva tu il tipo di messaggio più adatto in base al contenuto.'}

Il tuo compito è OTTIMIZZARLO mantenendo il senso e le informazioni originali, ma riscrivendolo in modo professionale e ad alto impatto per Telegram.

${toneInstructions(tone)}

REGOLE OBBLIGATORIE:
- Non inventare dati o cifre non presenti nel testo originale
- Output = SOLO il testo ottimizzato — zero prefissi, zero commenti, zero metadati
- NON usare asterischi (*) o markdown
- Scrivi PRIMA la versione italiana COMPLETA (con la sua CTA italiana)
- Poi scrivi ESATTAMENTE questa riga di separazione: ──────────────
- Poi scrivi la versione inglese COMPLETA (con la sua CTA inglese)

CTA ITALIANA — mettila alla fine della versione italiana, formato esatto con link su riga nuova:
👉 CLICCA QUI PER [TESTO VARIABILE]:
${lIT}

CTA INGLESE — mettila alla fine della versione inglese, formato esatto con link su riga nuova:
👉 CLICK HERE TO [VARIABLE TEXT]:
${lEN}

Varia il testo CTA ogni volta: "UNIRTI AL COPYTRADING", "ACCEDERE ALLA SALA VIP", "REPLICARE I RISULTATI", "ENTRARE NEL PROGRAMMA", "COPIARE I SEGNALI IN AUTOMATICO" ecc.`;
}

// ── TRANSLATE PROMPT ───────────────────────────────────────────────────────
export function buildTrPrompt(text: string, fromName: string, toName: string): string {
  return `Sei un traduttore professionale specializzato in contenuti per canali Telegram di trading e finanza.

Traduci il seguente testo da ${fromName} a ${toName}.

REGOLE FONDAMENTALI:
- Traduzione fedele all'originale — mantieni il significato esatto, senza aggiungere o togliere nulla
- Mantieni TUTTE le emoji esattamente dove si trovano nell'originale
- Mantieni la formattazione (maiuscole, punteggiatura, paragrafi, asterischi, link)
- Mantieni il tono: se è urgente, rimane urgente; se è professionale, rimane professionale
- Non aggiungere note, spiegazioni o commenti — solo la traduzione pura
- Per termini tecnici di trading (pip, spread, drawdown, CopyTrading, VIP Room, XAUUSD, ecc.) mantienili invariati in inglese

TESTO DA TRADURRE:
${text}

Rispondi SOLO con la traduzione, nient'altro.`;
}

// ── ANALISI XAUUSD PROMPT ──────────────────────────────────────────────────
export function buildAnalisiPrompt(
  rawAnalysis: string,
  cfg: Config,
  tone: Tone,
  timeframe: string,
  note: string,
): string {
  const lIT = getLinkIT(cfg);
  const lEN = getLinkEN(cfg);
  const trader = cfg.traderName || 'Il Trader';
  const date = todayItalian();

  return `Sei il gestore del canale Telegram XAUUSD di ${trader}. Data: ${date}.

Hai trovato questa analisi su XAUUSD:

"""
${rawAnalysis}
"""

${timeframe ? 'Timeframe di riferimento: ' + timeframe : ''}
${note ? 'Tue note / contesto aggiuntivo: ' + note : ''}

COMPITO: Riscrivi questa analisi come post Telegram professionale per il tuo canale XAUUSD, con il tuo stile e il tuo brand.

REGOLE FONDAMENTALI:
- Mantieni TUTTI i livelli tecnici, le direzioni e i target presenti nell'analisi originale — non inventare dati nuovi
- Aggiungi il tuo angolo personale: commento sul setup, cosa rende questo livello interessante, come gestirlo
- Chiudi con: "Chi è nella Sala VIP riceve il setup operativo preciso nel momento in cui il prezzo si attiva."
- Output = SOLO il testo del messaggio — zero prefissi, zero metadati, zero etichette
- Prima versione italiana COMPLETA con CTA, poi ESATTAMENTE questa riga: ──────────────, poi versione inglese COMPLETA con CTA
- NON usare asterischi (*)

${toneInstructions(tone)}

CTA ITALIANA (alla fine della versione IT, link su riga nuova):
👉 CLICCA QUI PER [TESTO VARIABILE]:
${lIT}

CTA INGLESE (alla fine della versione EN, link su riga nuova):
👉 CLICK HERE TO [VARIABLE TEXT]:
${lEN}

Varia il testo CTA ogni volta: "ACCEDERE AL VIP", "RICEVERE IL SEGNALE OPERATIVO", "COPIARE LA GESTIONE IN AUTOMATICO", "ENTRARE NELLA SALA VIP", "REPLICARE L'ANALISI IN TEMPO REALE" ecc.`;
}

// ── CALENDAR PARSE PROMPT ──────────────────────────────────────────────────
export function buildCalendarParsePrompt(rawText: string, dateLabel: string): string {
  return `Sei un esperto di mercati finanziari. Ti fornisco del testo grezzo estratto dalla pagina del calendario economico di ForexFactory (o simile).
Data di riferimento: ${dateLabel}.

Estrai TUTTI gli eventi economici presenti nel testo e restituisci SOLO un array JSON valido, senza markdown, senza backtick, senza testo aggiuntivo.

Formato esatto per ogni evento:
{"time":"8:30am","currency":"USD","title":"CPI m/m","impact":"High","forecast":"0.3%","previous":"0.4%"}

Regole:
- "time": orario nel formato originale (es. "8:30am", "2:00pm", "All Day", "Tentative")
- "currency": codice valuta 3 lettere maiuscole (USD, EUR, GBP, JPY, CAD, AUD, CHF, NZD, XAU, CNY)
- "title": nome esatto dell'evento economico
- "impact": esattamente "High", "Medium", "Low" o "None"
- "forecast": valore previsto se presente, altrimenti ""
- "previous": valore precedente se presente, altrimenti ""

Restituisci SOLO l'array JSON. Esempio:
[{"time":"8:30am","currency":"USD","title":"CPI m/m","impact":"High","forecast":"0.3%","previous":"0.4%"}]

Testo del calendario:
${rawText.substring(0, 8000)}`;
}

// ── CALENDAR NEWS PROMPT ───────────────────────────────────────────────────
export function buildCalendarNewsPrompt(
  events: CalendarEvent[],
  cfg: Config,
  tone: Tone,
): string {
  const lIT = getLinkIT(cfg);
  const lEN = getLinkEN(cfg);
  const trader = cfg.traderName || 'Il Trader';
  const date = todayItalian();
  const impMap: Record<string, string> = { High: '🔴', Medium: '🟠', Low: '🟡', None: '⚪' };
  const eventsFormatted = events
    .sort((a, b) => {
      const order: Record<string, number> = { High: 0, Medium: 1, Low: 2, None: 3 };
      return (order[a.impact] || 3) - (order[b.impact] || 3);
    })
    .map(e => `${impMap[e.impact] || '⚪'} ${e.time} [${e.currency}] ${e.title}`)
    .join('\n');

  return `Sei il gestore del canale Telegram XAUUSD di ${trader}. Data: ${date}.

${toneInstructions(tone)}

Scrivi il messaggio di analisi notizie per oggi, focalizzato esclusivamente su XAUUSD (Oro).

Ecco gli eventi macro di oggi che potrebbero impattare il Gold:
${eventsFormatted || 'Nessun evento specifico — analisi macro generale'}

Seleziona solo gli eventi davvero rilevanti per il Gold (ignora quelli che non hanno impatto su XAUUSD).
Spiega in modo semplice e scorrevole cosa ci aspettiamo oggi, la direzione probabile con 🟢 🔴 🟡, e gli orari chiave.
Ricorda che l'analisi approfondita è nella Sala VIP.

ISTRUZIONI: Solo testo del messaggio, no prefissi. Prima italiano → separatore ────────────── → inglese. No asterischi.

CTA italiana:
👉 CLICCA QUI PER [TESTO]:
${lIT}

CTA inglese:
👉 CLICK HERE TO [TEXT]:
${lEN}`;
}

// ── CALENDARIO V1 — Market Mover ────────────────────────────────────────────
export function buildCalV1Prompt(cfg: Config, tone: Tone, notes: string): string {
  const lIT = getLinkIT(cfg);
  const lEN = getLinkEN(cfg);
  const trader = cfg.traderName || 'Il Trader';
  const date = todayItalian();
  return `Sei il gestore del canale Telegram XAUUSD di ${trader}. Data: ${date}.

HAI UNO SCREENSHOT DEL CALENDARIO ECONOMICO ALLEGATO. Analizzalo attentamente.

${notes ? 'Note aggiuntive: ' + notes : ''}

COMPITO: Scrivi la versione "MARKET MOVER" — il post che identifica IL SINGOLO evento macro più esplosivo per XAUUSD di oggi.

STRUTTURA OBBLIGATORIA:
🚨 Titolo d'allerta (evento + orario)
1-2 righe: perché questo dato MUOVE l'Oro (causa → effetto su USD → effetto su XAUUSD)
Scenario rialzista vs ribassista (🟢 se dato debole / 🔴 se dato forte per USD)
Orario esatto da segnare sul calendario
Chiudi con: "Chi è nel VIP ha già il piano operativo pronto per questo momento."
CTA alla Sala VIP

Tono: urgente, da allerta operativa — emoji 🚨⚡️🎯, frasi corte, massima leggibilità.
ZERO asterischi. Prima versione IT completa, poi ──────────────, poi versione EN.

CTA italiana:
👉 CLICCA QUI PER [TESTO VARIABILE]:
${lIT}

CTA inglese:
👉 CLICK HERE TO [VARIABLE TEXT]:
${lEN}`;
}

// ── CALENDARIO V2 — Analisi Macro & Tecnica ─────────────────────────────────
export function buildCalV2Prompt(cfg: Config, tone: Tone, notes: string): string {
  const lIT = getLinkIT(cfg);
  const lEN = getLinkEN(cfg);
  const trader = cfg.traderName || 'Il Trader';
  const date = todayItalian();
  return `Sei il gestore del canale Telegram XAUUSD di ${trader}. Data: ${date}.

HAI UNO SCREENSHOT DEL CALENDARIO ECONOMICO ALLEGATO. Analizzalo attentamente.

${notes ? 'Note aggiuntive: ' + notes : ''}

COMPITO: Scrivi la versione "ANALISI MACRO & TECNICA" — post articolato che racconta l'intera giornata.

STRUTTURA OBBLIGATORIA:
📊 Titolo (es. "Giornata macro intensa — ecco il piano")
Timeline della giornata divisa in fasi:
  🌅 Mattina (7:00–12:00): eventi + impatto atteso
  🌇 Pomeriggio (12:00–17:00): eventi principali
  🌙 Sera/Notte (17:00+): eventuali dati notturni
Correlazioni tra dati (es. CPI forte → USD sale → Gold sotto pressione)
Consiglio gestione rischio per la giornata (size ridotte? no overnight? attenzione a orario X?)
Chiudi con: "Nel VIP gestiremo ogni evento in tempo reale con il piano già definito."
CTA

Tono: professionale ma diretto, da analista che parla alla sua squadra.
ZERO asterischi. Prima versione IT completa, poi ──────────────, poi versione EN.

CTA italiana:
👉 CLICCA QUI PER [TESTO VARIABILE]:
${lIT}

CTA inglese:
👉 CLICK HERE TO [VARIABLE TEXT]:
${lEN}`;
}

// ── CALENDARIO V3 — Flash Report ────────────────────────────────────────────
export function buildCalV3Prompt(cfg: Config, tone: Tone, notes: string): string {
  const lIT = getLinkIT(cfg);
  const lEN = getLinkEN(cfg);
  const trader = cfg.traderName || 'Il Trader';
  const date = todayItalian();
  return `Sei il gestore del canale Telegram XAUUSD di ${trader}. Data: ${date}.

HAI UNO SCREENSHOT DEL CALENDARIO ECONOMICO ALLEGATO. Analizzalo attentamente.

${notes ? 'Note aggiuntive: ' + notes : ''}

COMPITO: Scrivi la versione "FLASH REPORT" — il calendario in formato ultra-compatto, perfetto per essere letto in 10 secondi su mobile.

STRUTTURA OBBLIGATORIA:
⚡ Titolo brevissimo (es. "Flash Calendar XAUUSD — ${date}")
Lista eventi rilevanti per il Gold, formato:
  🔴 HH:MM [VALUTA] EVENTO — impatto in 3 parole
  🟠 HH:MM [VALUTA] EVENTO — impatto in 3 parole
  🟡 HH:MM [VALUTA] EVENTO — impatto in 3 parole
Usa SOLO 🔴 (Alto) 🟠 (Medio) 🟡 (Basso) per ogni evento
Riga finale: "Sentiment giornata: 🟢 RIALZISTA / 🔴 RIBASSISTA / 🟡 NEUTRO per il Gold"
CTA cortissima

Regole formato: massimo leggibilità su mobile Telegram. Niente paragrafi. Solo icone + dati. Zero asterischi.
Prima versione IT, poi ──────────────, poi versione EN.

CTA italiana:
👉 CLICCA QUI PER [TESTO VARIABILE]:
${lIT}

CTA inglese:
👉 CLICK HERE TO [VARIABLE TEXT]:
${lEN}`;
}
