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

Varia il testo della CTA ogni volta — parole diverse, struttura diversa ogni messaggio. Esempi: "UNIRTI AL COPYTRADING", "ACCEDERE ALLA SALA VIP", "COPIARE I SEGNALI IN AUTOMATICO", "REPLICARE I NOSTRI RISULTATI", "CONFIGURARE IL TUO COPY OGGI", "UNIRTI A CHI INCASSA GIÀ", "SMETTERE DI GUARDARE E INIZIARE", "scrivimi VIP / GOLD / COPY / START in DM" ecc. Non usare mai la stessa CTA due volte di fila.

DIVERSITÀ OBBLIGATORIA — REGOLA INVIOLABILE:
Ogni messaggio deve sembrare scritto da una persona reale in un momento specifico, non generato da un bot. Varia apertura, struttura interna e ritmo.

Tecniche di apertura — scegli una diversa ogni volta:
→ Numero secco senza preamboli: "+127 pips. Stamattina. Prima delle 10."
→ Contrasto immediato dentro/fuori: "Chi era dentro: +85 pips. Chi era fuori: 0 pips."
→ Domanda che brucia: "Ti sei mai chiesto quanto perdi ogni giorno restando a guardare?"
→ Scena vivida: "Questa mattina, mentre eri al lavoro, il copier ha già chiuso 3 trade."
→ Fatto tecnico diretto: "Il Gold ha toccato 2347 e rimbalzato esattamente dove l'analisi indicava."
→ Battuta secca da trader: "Setup confermato." / "Segnale attivo." / "I numeri parlano da soli."

FRASI ASSOLUTAMENTE VIETATE (non usarle mai):
"Ancora una volta", "Come sempre", "Non perderti questa occasione", "Opportunità imperdibile", "Sei pronto?", "Che giornata!", "Continuiamo così", "Non aspettare", "Agisci ora" come frase a sé.
MAI iniziare il messaggio con le parole "Oggi", "Ieri", "Buongiorno" (eccetto il messaggio dedicato al Buongiorno). Zero aperture robotiche, zero frasi di riempimento.

Stile: scrivi come un trader esperto che parla alla sua community — diretto, concreto, autentico. Il messaggio deve sembrare scritto da una persona reale in quel momento preciso.

ESEMPIO DI OUTPUT ATTESO ✅:
+127 pips su XAUUSD. 📈

3 operazioni, 3 chiuse in profitto. La mattinata è andata esattamente come previsto.

Chi era nel CopyTrading lo ha incassato senza aprire un grafico. 🥇

Tu quando entri?

👉 CLICCA QUI PER REPLICARE I RISULTATI:
${lIT}

──────────────

+127 pips on XAUUSD. 📈

3 trades, all closed in profit. The morning played out exactly as forecast.

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
    buongiorno: base + `BUONGIORNO (07:00) — l’unico messaggio della giornata che inizia con “Buongiorno Traders! 👋”.
Tono caldo e carico di energia genuina, come chi apre la giornata con chiarezza sul cosa fare. Anticipa brevemente cosa succederà oggi sul canale (segnale gratuito, analisi XAUUSD, aggiornamenti dalla Sala VIP). Fai sentire chi legge che fa parte di qualcosa, non che sta guardando da fuori.
Chiudi con CTA al CopyTrading — angolo: “chi è già configurato non deve fare nulla, parte tutto in automatico stamattina.”`,

    risultati_ieri: base + `RISULTATI DI IERI (08:00). Apri con il numero più forte — non elencare, racconta.
VIP Room (operazioni manuali gestite dal trader): ${v('vip_pips') || '85'} pips, ${v('vip_trades') || '5'} operazioni, win rate ${v('vip_winrate') || '80%'}.
CopyTrading (automatico, zero intervento): ${v('copy_pips') || '72'} pips, ${v('copy_trades') || '4'} operazioni, performance ${v('copy_perf') || '+3.2%'}.
Presenta i due servizi come percorsi complementari, non alternativi — VIP Room per chi vuole imparare e seguire ogni analisi, CopyTrading per chi incassa mentre fa altro. Menziona che lo screenshot è allegato.
Chiudi con una riga tagliente per chi non è ancora dentro — non aggressiva, ma concreta: ogni giorno senza entrare è un giorno di profitti regalati.`,

    primi_risultati: base + `PRIMI RISULTATI MATTUTINI (09:00). La giornata è appena iniziata e i numeri sono già chiari.
Dati: ${v('pips') || '40'} pips, ${v('trades') || '3'} operazioni già chiuse.
Apri direttamente con il dato — nessun preambolo. Poi aggiungi una riga che fa capire cosa significa per chi è nel CopyTrading (ha già quel profitto sul conto, senza aver fatto nulla). Contrasto netto con chi è ancora fuori. CTA con senso di urgenza reale, non artificiale.`,

    primi_risultati_copy: base + `PRIMI RISULTATI COPYTRADING (09:00). Il CopyTrading ha già operato stamattina.
Dati: ${v('pips_copy') || '+55'} pips / profitto, ${v('trades_copy') || '2'} operazioni chiuse ${v('ora_copy') || 'in mattinata'}.${v('ctx_copy') ? ' Contesto: ' + v('ctx_copy') + '.' : ''}
Il focus è TOTALMENTE sul concetto di automatico: mentre i nostri copy-trader erano al lavoro, a fare colazione, nel traffico — il sistema lavorava per loro. Zero grafici, zero decisioni, zero stress.
Crea contrasto concreto con chi fa trading manuale da solo (emotività, errori, ore davanti allo schermo). Fai sentire che ogni mattina senza copy è una mattina persa.
Screenshot allegato. CTA urgente e diretta.`,

    ready_segnale: base + `READY SEGNALE (09:30). L’analisi è già fatta, il livello è identificato — il segnale gratuito su XAUUSD arriva a breve.
Tono calmo e sicuro, da chi sa già cosa fare e aspetta solo il momento giusto. Breve accenno al contesto di mercato (senza rivelare il segnale). Aggiungi che nel VIP ci sono già altri setup avanzati rispetto a quello gratuito. CTA.`,

    segnale_xauusd: base + `SEGNALE XAUUSD (10:00). Struttura con emoji, senza asterischi:
📡 ${v('dir') || 'BUY'} XAUUSD
📍 Entry: ${v('entry') || '2345.00'}
🛑 Stop Loss: ${v('sl') || '2335.00'}
🎯 TP1: ${v('tp1') || '2355'}${v('tp2') ? ' | TP2: ' + v('tp2') : ''}${v('tp3') ? ' | TP3: ' + v('tp3') : ''}
Aggiungi 1-2 righe di contesto tecnico semplice (perché questa zona, cosa segnala il grafico). Breve disclaimer sul rischio (il trading comporta rischi, non è un servizio di investimento). Chiudi ricordando che chi è nel CopyTrading lo riceve in automatico senza fare nulla.`,

    risultato_segnale: base + `RISULTATO SEGNALE. Esito: ${v('result') || 'WIN'} | Entry: ${v('entry') || '2345'} | Chiusura: ${v('exit') || '2360'} | Pips: ${v('pips') || '+45'}
Se WIN → tono soddisfatto ma misurato, mai esaltato. “Il target è stato colpito esattamente come previsto.” Chi era nel CopyTrading lo ha incassato in automatico. Chi ha seguito il segnale manuale sa già com’è andata. CTA per chi non era ancora dentro.
Se LOSS → trasparenza totale, professionalità. Il trading non è una scienza esatta, il metodo si valuta sul lungo periodo. Gestione del rischio, stop rispettato, nessun dramma. CTA: il prossimo setup è già in analisi.
Se BREAK EVEN → chiusura in pareggio come decisione intelligente di gestione, non una resa. “Capitale protetto, si riparte.” CTA.`,

    notizie_giorno: base + `ANALISI NOTIZIE XAUUSD (13:00). Focus esclusivo su cosa muove il Gold oggi.
${newsPhoto ? 'SCREENSHOT CALENDARIO ALLEGATO — analizza ogni evento: identifica quelli con Cartella Rossa (High Impact), spiega la logica del prezzo (es. \"Se il CPI esce sopra le attese → Dollaro sale → Gold sotto pressione\"), indica gli orari esatti. Tratta i dati già usciti nelle ore precedenti come appena rilasciati e quelli futuri come prossimo obiettivo.' : ''}
${v('news') ? 'Note aggiuntive: ' + v('news') : ''}
Dai una direzione probabile con emoji 🟢 🔴 🟡 e spiega brevemente il ragionamento. Ricorda che l’analisi operativa approfondita e la gestione durante le news sono riservate alla Sala VIP. CTA.`,

    risultati_clienti: base + `RISULTATI CLIENTI (social proof con screenshot allegato).
${v('clienti') ? 'Descrizione: ' + v('clienti') : 'Screenshot o chat di membri del CopyTrading e della Sala VIP con risultati reali'}
${v('periodo') ? 'Periodo: ' + v('periodo') : ''}
Tono: fatti reali, zero esagerazioni. Questi non sono testimonial artefatti — sono persone normali che hanno scelto un metodo. Mostra la differenza concreta tra chi ha deciso di agire e chi aspetta ancora. Non elencare risultati — racconta cosa significa per chi li ha ottenuti. CTA forte ma credibile.`,

    aggiornamento: base + `AGGIORNAMENTO LIVE TRADE (messaggio in tempo reale).
Situazione: ${v('status') || 'in profitto'} | Pips attuali: ${v('pips') || '+30'}${v('comment') ? ' | Note: ' + v('comment') : ''}
Breve, diretto, come un messaggio inviato in quel preciso momento. Chi è nel CopyTrading lo vede già sul proprio conto — aggiornamento sul loro profitto in tempo reale. Chi segue il canale vede i numeri crescere. Chi è fuori vede cosa si sta perdendo. Una sola riga CTA, non invadente.`,

    chiusura_giornata: base + `CHIUSURA GIORNATA (17:00 / fine sessione). Le operazioni del giorno si stanno chiudendo.
Screenshot risultati clienti allegati. Racconta la giornata con 2-3 righe: com’è andata, cosa ha funzionato, qual è lo stato d’animo generale — non un elenco secco.
Poi metti in prospettiva il CopyTrading: automatico, zero esperienza richiesta, accessibile con qualsiasi budget, zero stress. Chi entra stasera domani mattina parte già configurato.
CTA forte — senso di finestra che si chiude, non paura ma logistica reale.`,

    engagement: base + `MESSAGGIO DI ENGAGEMENT. Scegli uno di questi 4 angoli — mai lo stesso due volte di fila, mai robotico:

1. TEASER SETUP: “Sto guardando qualcosa su XAUUSD da qualche ora. Se il livello regge, ci sarà un’operazione.” Crea curiosità senza spoilerare. Fai sentire chi legge privilegiato ad essere sul canale.
2. DOMANDA ALLA COMMUNITY: una domanda semplice e diretta sulla loro esperienza con il trading o con il Gold — coinvolge, genera risposte, costruisce relazione.
3. OSSERVAZIONE DI MERCATO: un’osservazione tecnica interessante su XAUUSD in quel momento — prezzo, livello chiave, pattern. Tono da analista che condivide un pensiero, non da venditore.
4. SCARSITÀ CONCRETA: “Sto valutando di aprire qualche posto nel programma questa settimana.” Urgenza reale, non costruita. 2-3 vantaggi pratici di chi è già dentro.

Tono autentico e umano in tutti i casi. CTA adeguata al tipo scelto.`,

    // ── Risultati Sala VIP — Primi ───────────────────────────────────────────
    vip_risultati_primi: base + `PRIME OPERAZIONI SALA VIP (mattina). Il VIP ha già operato: ${v('pips_vip') || '+65'} pips, ${v('trades_vip') || '3'} operazioni chiuse.
Apri direttamente con il risultato — nessun preambolo. Racconta cosa significa: chi è nella Sala VIP aveva il piano dalla sera precedente, ha eseguito con metodo, e ha già il primo profitto della giornata. Screenshot allegato.
Contrasto vivido: mentre altri cercavano ancora un'idea su dove il Gold stesse andando, i nostri erano già usciti con il target colpito.
CTA con angolo "il secondo setup della giornata è già in analisi — se vuoi essere nel prossimo, sai dove trovarci."`,

    vip_risultati_durante: base + `AGGIORNAMENTO LIVE SALA VIP. Il trade è ancora aperto — aggiornamento in tempo reale.
Situazione: ${v('status_vip') || 'in profitto'} | Pips attuali: ${v('pips_vip') || '+40'} | Ops aperte: ${v('ops_vip') || '2'}${v('note_vip') ? ' | Note: ' + v('note_vip') : ''}
Tono da aggiornamento diretto, come un messaggio inviato in quel preciso momento. Chi è nella Sala VIP vede tutto in tempo reale, segue ogni decisione del trader. Chi è fuori legge i numeri ma non sa il perché di ogni mossa.
Una riga che fa capire cosa sta succedendo + cosa potrebbe succedere. CTA con urgenza soft.`,

    vip_risultati_conclusi: base + `RECAP FINALE SALA VIP. Sessione chiusa — ecco com'è andata.
Risultati: ${v('pips_vip') || '+120'} pips totali | ${v('trades_vip') || '5'} operazioni | Win rate ${v('winrate_vip') || '80%'}${v('note_vip') ? ' | ' + v('note_vip') : ''}
Racconta la sessione come un debriefing con la tua squadra — cosa ha funzionato, com'è stata la gestione, qual è il bilancio del giorno. Non solo numeri: dai un senso a ciò che è successo. Screenshot allegato.
Chiudi con prospettiva: questo non è un caso isolato, è il metodo che si ripete. CTA per chi non era dentro e vuole esserci alla prossima sessione.`,

    // ── Risultati CopyTrading — Primi ────────────────────────────────────────
    copy_risultati_primi: base + `PRIME OPERAZIONI COPYTRADING (mattina). Il copy ha già lavorato: ${v('pips_copy') || '+55'} pips, ${v('trades_copy') || '2'} operazioni chiuse ${v('ora_copy') || 'stamattina'}.${v('ctx_copy') ? ' ' + v('ctx_copy') + '.' : ''}
Enfatizza il concetto di automatico puro: i copy-trader hanno questo profitto sul conto senza aver fatto assolutamente nulla. Erano al lavoro, nel traffico, a fare colazione, a dormire — il sistema ha operato per loro.
Crea la scena vivida: immagina cosa stava facendo il copy-trader medio mentre il suo conto guadagnava. Screenshot allegato.
Contrasto con il trading manuale: stesso mercato, stesso movimento, ma chi fa da solo ha gestito l'emotività — chi era nel copy ha solo ricevuto la notifica di profitto. CTA forte e diretta.`,

    copy_risultati_durante: base + `AGGIORNAMENTO LIVE COPYTRADING. Il sistema è ancora in posizione — aggiornamento in tempo reale.
Dati: ${v('pips_copy') || '+35'} pips attuali | ${v('ops_copy') || '1'} operazione in corso | Performance: ${v('perf_copy') || '+1.8%'}${v('note_copy') ? ' | Note: ' + v('note_copy') : ''}
Tono live: il copy sta lavorando ora, automaticamente, mentre chi legge questo messaggio probabilmente sta facendo altro. Questo è il punto — i copy-trader non devono guardare il grafico, non devono prendere decisioni, non devono stressarsi. Il sistema gestisce tutto.
Chi non è ancora nel copy sa cosa si sta perdendo in questo momento preciso. CTA con urgenza reale.`,

    copy_risultati_conclusi: base + `RECAP SESSIONE COPYTRADING. Sessione chiusa — ecco i numeri finali.
Risultati: ${v('pips_copy') || '+98'} pips totali | ${v('trades_copy') || '4'} operazioni | Performance: ${v('perf_copy') || '+3.5%'}${v('note_copy') ? ' | ' + v('note_copy') : ''}
Racconta la sessione mettendo in prospettiva il concetto di rendita passiva: oggi il copy-trader medio ha guadagnato questo mentre svolgeva la sua normale giornata. Zero tempo dedicato, zero stress, zero grafici.
Aggiungi la domanda che brucia: "Tu cosa stavi facendo mentre il tuo conto avrebbe potuto fare questo?" Non accusatorio — solo concreto. Screenshot allegato.
CTA con angolo configurazione: "non ti chiedo di fare trading — ti chiedo di connettere il copy una volta e lasciarlo lavorare."`,

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
    d_buongiorno:      base + `BUONGIORNO (07:00). Inizia con “Buongiorno Traders 👋” — unico messaggio della giornata con questo saluto. Energia genuina, non robotica. Anticipa la giornata: cosa succederà oggi sul canale, cosa ha già in mente il trader. Fai sentire chi legge parte di un gruppo, non spettatore. CTA al CopyTrading con angolo “già configurato = già pronto.”`,
    d_risultati_ieri:  base + `RISULTATI DI IERI (08:00). Presenta i risultati separati per i due servizi — apri con il numero più impattante, non con un’introduzione.
VIP Room (operazioni manuali): ${f('vip_pips') || '85'} pips, ${f('vip_trades') || '5'} operazioni, win rate ${f('vip_winrate') || '80%'}.
CopyTrading (automatico): ${f('copy_pips') || '72'} pips, ${f('copy_trades') || '4'} operazioni, performance ${f('copy_perf') || '+3.2%'}.
Screenshot allegato. Racconta cosa significa per chi è dentro — non solo i numeri ma il fatto che mentre tutti dormivano il sistema lavorava. CTA tagliente: ogni giorno fuori è un giorno di profitti regalati.`,
    d_primi_risultati: base + `PRIMI RISULTATI DELLA MATTINA (09:00). Apri direttamente con il dato: ${f('pips') || '+40'} pips, ${f('trades') || '3'} operazioni chiuse. Screenshot allegato. Una riga sul fatto che il CopyTrading ha già lavorato mentre i follower facevano altra cosa. Contrasto netto: chi è dentro incassa, chi è fuori guarda. CTA breve e diretta.`,
    d_ready:           base + `READY SEGNALE (09:30). Il segnale gratuito su XAUUSD sta per arrivare. Tono calmo e sicuro — l’analisi è fatta, il livello è chiaro. Breve accenno al contesto di mercato senza spoilerare. Ricorda che nel VIP ci sono già altri setup, non solo quello gratuito. CTA.`,
    d_segnale:         base + `SEGNALE XAUUSD (10:00). Struttura con emoji, zero asterischi:
📡 ${f('dir') || 'BUY'} XAUUSD
📍 Entry: ${f('entry') || '2345.00'}
🛑 SL: ${f('sl') || '2335.00'}
🎯 TP1: ${f('tp1') || '2355'}${f('tp2') ? ' | TP2: ' + f('tp2') : ''}${f('tp3') ? ' | TP3: ' + f('tp3') : ''}
1-2 righe contesto tecnico essenziale (perché questa zona, cosa segnala). Breve disclaimer. CTA copytrading automatico per chi non vuole operare manualmente.`,
    d_risultato_segn:  base + `RISULTATO SEGNALE (11:30). Esito: ${f('esito') || 'WIN'} | Pips: ${f('pips') || '+45'}. Screenshot allegato. Se WIN: diretto e soddisfatto, target colpito come previsto, chi era nel VIP aveva i target avanzati. Se LOSS: onesto e professionale, stop rispettato, il metodo si valuta nel lungo periodo. CTA con angolo diverso in base all’esito.`,
    d_copy_live:       base + `RISULTATI ATTUALI COPYTRADING (12:00). Aggiornamento live: ${f('copy_pips') || '+60'} pips, ${f('copy_trades') || '4'} operazioni chiuse oggi. Screenshot allegato. Automatico, senza che i copy-trader abbiano fatto nulla. Racconta la scena: mentre qualcuno guardava i grafici con stress, il loro conto cresceva da solo. CTA.`,
    d_notizie:         base + `CALENDARIO ECONOMICO (13:00). Focus ESCLUSIVO su cosa muove XAUUSD oggi.
${hasPhoto ? 'FOTO CALENDARIO ALLEGATA — analizza ogni evento: identifica le Cartelle Rosse (High Impact), spiega la logica causa→effetto (es. NFP sopra attese → USD forte → Gold giù), indica orari esatti. Tratta i dati già passati come \"appena usciti\" e quelli futuri come \"prossimo obiettivo da monitorare\".' : ''}
${f('note') ? 'NOTE: ' + f('note') : news ? 'NOTIZIE / NOTE: ' + news : ''}
${calEvents ? 'EVENTI MACRO OGGI (ForexFactory):\n' + calEvents : ''}
Direzione probabile Gold (🟢 rialzista / 🔴 ribassista / 🟡 neutro), orari chiave, cosa monitorare. L’analisi operativa è esclusiva VIP. CTA.`,
    d_copy_postnews:   base + `RISULTATI COPYTRADING POST NEWS (15:00). Le notizie macro sono uscite.
${f('news_ref') ? 'Notizia: ' + f('news_ref') : news ? 'Notizie: ' + news : ''}
${f('pips_postnews') ? 'Pips generati: ' + f('pips_postnews') : ''}
Racconta come ha reagito XAUUSD e i profitti generati in automatico durante la volatilità. Chi non era posizionato si è perso la finestra. Screenshot allegato. CTA forte.`,
    d_educativo:       base + `POST EDUCATIVO (17:00).${f('topic') ? ' Tema: ' + f('topic') + '.' : ''} Breve lezione pratica su XAUUSD — un concetto tecnico concreto, un errore comune da evitare, una strategia semplice. Tono da mentore che condivide una cosa utile, non da professore che tiene lezione. Chiudi con CTA: chi vuole applicarlo in tempo reale lo fa dentro il VIP o il CopyTrading.`,
    d_recensioni:      base + `RECENSIONI DEL GIORNO + RECAP (19:00).${f('nota') ? ' Nota: ' + f('nota') + '.' : ''} Mostra le testimonianze / messaggi positivi ricevuti oggi. Screenshot allegato. Non elencare le recensioni — presentale come storie di persone reali. Poi aggiungi un breve recap numerico della giornata. Social proof autentico, non gonfiato. CTA.`,
    d_chiusura:        base + `CHIUSURA (21:00). Bilancio sintetico della giornata — cosa è successo, com’è andata, come ci si sente. Poi contrasto netto: chi è già dentro sa cosa ha guadagnato, chi è fuori sa cosa si è perso. Non accusatorio, solo concreto. CTA finale — domani si riparte, ma chi entra oggi è già pronto per domani mattina.`,
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
    ns_buongiorno:     base + `BUONGIORNO (07:00). Inizia con “Buongiorno Traders 👋”. Tono da insider: oggi la giornata parte in modo diverso per chi è già nel VIP o nel Copy. Accenna alle opportunità del mercato senza rivelare nulla — tutto è riservato ai clienti. CTA.`,
    ns_risultati_ieri: base + `RISULTATI DI IERI (08:00). Apri con il numero più forte.
VIP Room (operazioni manuali): ${f('vip_pips') || '85'} pips, ${f('vip_trades') || '5'} operazioni, win rate ${f('vip_winrate') || '80%'}.
CopyTrading (automatico): ${f('copy_pips') || '72'} pips, ${f('copy_trades') || '4'} operazioni, performance ${f('copy_perf') || '+3.2%'}.
Screenshot allegato. Enfatizza che non ci sono segnali gratuiti qui — i risultati sono esclusivamente di chi ha scelto di investire in se stesso. CTA tagliente.`,
    ns_copy_mattina:   base + `RISULTATI MATTUTINI COPYTRADING (09:00). Il copy ha già operato stamattina: ${f('copy_pips') || '+35'} pips, ${f('copy_trades') || '2'} operazioni chiuse — automaticamente, mentre i follower dormivano o erano al lavoro. Screenshot allegato. Zero segnali gratuiti qui: questo è ciò che ottieni quando decidi di smettere di guardare e iniziare ad agire. CTA forte.`,
    ns_vip_mattina:    base + `RISULTATI MATTUTINI VIP (09:30). La sala VIP ha già lavorato: ${f('vip_pips') || '+50'} pips, ${f('vip_trades') || '3'} operazioni. Screenshot allegato. Chi è dentro aveva il piano da ieri sera, ha eseguito stamattina, ha già il risultato. Chi è fuori non sa nemmeno cosa sta succedendo sul Gold oggi. Contrasto netto ma rispettoso. CTA.`,
    ns_hype_vip:       base + `HYPE SEGNALE VIP (10:30). Un nuovo segnale sta per essere rilasciato esclusivamente sul canale VIP — non qui, non gratis. Crea tensione e curiosità senza rivelare nulla: direzione, livello, orario — tutto riservato. Chi vuole il segnale conosce già la strada. CTA urgente.`,
    ns_hype_copy:      base + `HYPE SEGNALE COPYTRADING (11:30). Il CopyTrading sta per ricevere un nuovo segnale in automatico — i copy-trader lo avranno sul conto senza muovere un dito. Chi non è ancora connesso si perderà questa operazione come ha perso quelle di stamattina. Crea urgenza concreta, non artificiale. CTA.`,
    ns_calendario:     base + `CALENDARIO ECONOMICO (13:00). Analisi macro con focus ESCLUSIVO sull’impatto XAUUSD.
${hasPhoto ? 'FOTO CALENDARIO ALLEGATA — identifica gli High Impact, spiega la logica prezzo (es. \"ADP sopra attese → USD forte → Gold pressione ribassista\"), indica orari esatti. Tratta i dati già usciti come recenti, quelli futuri come prossimo obiettivo.' : ''}
${f('note') ? 'NOTE: ' + f('note') : news ? 'NOTIZIE / NOTE: ' + news : ''}
Direzione probabile (🟢/🔴/🟡), orari chiave. Ricorda: la gestione operativa durante le news è esclusiva VIP + CopyTrading — qui condividiamo solo il contesto macro. CTA.`,
    ns_post_news:      base + `RISULTATI POST NEWS (15:00). Le notizie macro sono uscite.
${f('news_ref') ? 'Notizia: ' + f('news_ref') : news ? 'Notizie: ' + news : ''}
${f('pips_postnews') ? 'Pips generati: ' + f('pips_postnews') : ''}
Racconta come ha reagito XAUUSD e cosa hanno ottenuto VIP + CopyTrading durante la volatilità — screenshot allegato. Chi era fuori ha assistito alla finestra senza un piano. CTA.`,
    ns_recensioni:     base + `RECENSIONI CLIENTI DEL GIORNO (18:00).${f('nota') ? ' Nota: ' + f('nota') + '.' : ''} Mostra le testimonianze / messaggi positivi ricevuti oggi. Screenshot allegato. Presentale come storie reali di persone che hanno smesso di aspettare — non come materiale pubblicitario. Social proof che convince, non che vende. CTA.`,
    ns_recap:          base + `RECAP FINALE + CHIUSURA GIORNO (21:00).${f('nota_finale') ? ' Note finali: ' + f('nota_finale') + '.' : ''} Riepilogo della giornata: risultati totali VIP e CopyTrading, operazioni chiuse, bilancio complessivo. Tono trasparente — buona o media che sia, il metodo si valuta nel lungo periodo. Chiudi con un messaggio motivante per domani e CTA finale per chi vuole iniziare prima del prossimo segnale.`,
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
  return `Sei il braccio destro del trader ${trader} sul canale Telegram XAUUSD. Data: ${date}.

HAI UNO SCREENSHOT DEL CALENDARIO ECONOMICO ALLEGATO. Analizzalo con cura prima di scrivere.

${notes ? 'Note aggiuntive: ' + notes : ''}

COMPITO — Versione “MARKET MOVER”:
Identifica immediatamente l’evento con la Cartella Rossa (High Impact) più vicino o più significativo per XAUUSD.

STRUTTURA OBBLIGATORIA:
🚨 Titolo d’allerta — nome evento + orario esatto (usa il timing reale dallo screenshot)
1-2 righe: spiega la logica del prezzo in modo semplice e diretto
  → Es: “Se l’occupazione ADP esce sopra le attese, il Dollaro sale e il Gold scende”
  → Es: “Un CPI più alto del previsto = pressione ribassista sull’Oro”
Scenario con emoji:
  🟢 Se il dato è debole per il Dollaro → Gold sale
  🔴 Se il dato è forte per il Dollaro → Gold scende
Timing esatto da segnare sul calendario
Chiudi con: “Noi nel VIP abbiamo già il piano operativo pronto per questo momento — entry, SL e TP definiti.”
CTA alla Sala VIP

REGOLE:
- Usa il “Noi” per rafforzare il brand del team, non l’“Io”
- Tono: allerta operativa, da analista di fiducia — emoji 🚨⚡️🎯🔴🟢
- Se lo screenshot mostra dati già usciti nelle ore precedenti, trattali come “appena rilasciati” con il loro actual value
- Frasi corte, massima leggibilità su mobile
- ZERO asterischi. Prima versione IT completa, poi ──────────────, poi versione EN.

CTA italiana:
👉 CLICCA QUI PER [TESTO VARIABILE]:
${lIT}

CTA inglese:
👉 CLICK HERE TO [VARIABLE TEXT]:
${lEN}`;
}

// ── CALENDARIO V2 — Analisi Macro & Tecnica ─────────────────────────────
export function buildCalV2Prompt(cfg: Config, tone: Tone, notes: string): string {
  const lIT = getLinkIT(cfg);
  const lEN = getLinkEN(cfg);
  const trader = cfg.traderName || 'Il Trader';
  const date = todayItalian();
  return `Sei il braccio destro del trader ${trader} sul canale Telegram XAUUSD. Data: ${date}.

HAI UNO SCREENSHOT DEL CALENDARIO ECONOMICO ALLEGATO. Analizzalo con attenzione prima di scrivere.

${notes ? 'Note aggiuntive (includi geopolitica, eventi speciali, cigni neri se rilevanti per il Gold): ' + notes : ''}

COMPITO — Versione “ANALISI MACRO & TECNICA”:
Scrivi un post articolato che racconta l’intera sessione di oggi — posizionamento e autorità.

STRUTTURA OBBLIGATORIA:
📊 Titolo professionale (es. “Giornata macro intensa su XAUUSD — ecco il piano”)

Timeline della sessione divisa in 3 blocchi logici:
🌅 MATTINATA (7:00–12:00): eventi Euro/GBP + impatto atteso sull’umore prima di Wall Street
🌇 POMERIGGIO (12:00–17:00): dati USA/CAD + eventi principali che muovono il Gold
🌙 SERA/NOTTE (17:00+): dati Asia/AUD/NZD se presenti, volatilità notturna prevista

Correlazioni tra dati: collega i dati tra loro
→ Es: “PMI europei deboli → umore risk-off → Gold come bene rifugio prima dell’apertura USA”
→ Es: “CPI forte → Fed hawkish → USD sale → pressione ribassista sul Gold”

Se nelle note è presente una notizia geopolitica (conflitti, tensioni, decisioni macro straordinarie):
→ Spiega come questo “cigno nero” distorce i pattern standard: “I grafici tecnici oggi vanno letti con cautela perché la geopolitica sta alterando le correlazioni normali”

Risk Management — sempre presente, 1 riga concreta:
→ Es: “Giornata ad alta volatilità: ridurre le size rispetto alla norma”
→ Es: “Evitare posizioni overnight in vista dei dati notturni”
→ Es: “Aspettare la reazione post-news prima di entrare”

Chiudi con: “Noi nel VIP gestiamo ogni evento in tempo reale con un piano già definito — entry, SL e livelli TP pronti prima che il dato esca.”
CTA

REGOLE:
- Usa il “Noi” per rafforzare il brand del team
- Tono professionale e diretto, da analista che parla alla sua squadra
- Usa gli orari reali dallo screenshot
- ZERO asterischi. Prima versione IT completa, poi ──────────────, poi versione EN.

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
  return `Sei il braccio destro del trader ${trader} sul canale Telegram XAUUSD. Data: ${date}.

HAI UNO SCREENSHOT DEL CALENDARIO ECONOMICO ALLEGATO. Analizzalo prima di scrivere.

${notes ? 'Note aggiuntive: ' + notes : ''}

COMPITO — Versione “FLASH REPORT” (Sintetica):
Il post perfetto per chi legge da mobile in 10 secondi mentre lavora. Massima scansionabilità.

STRUTTURA OBBLIGATORIA:
⚡ Titolo brevissimo — es: “Flash Calendar XAUUSD — ${date}”

Lista degli eventi rilevanti per il Gold, formato ESATTO per ogni riga:
[EMOJI IMPATTO] [ORARIO] [VALUTA] [NOME EVENTO] — [impatto in max 4 parole]

Codifica colori impatto — usa SOLO questi:
🔴 = Alto (High Impact / Cartella Rossa)
🟠 = Medio (Medium Impact)
🟡 = Basso (Low Impact)

Estrai solo l’essenziale: Orario | Valuta | Nome Evento. Niente spiegazioni lunghe.
Usa gli orari reali dallo screenshot.

Riga finale obbligatoria (1 riga sola):
“Mood Gold oggi: 🟢 RIALZISTA / 🔴 RIBASSISTA / 🟡 NEUTRO — [motivazione in 5 parole]”

CTA cortissima (max 1 riga)

REGOLE FORMATO:
- Niente paragrafi, niente blocchi di testo
- Solo icone + dati + parole chiave
- Massima leggibilità su Telegram mobile
- ZERO asterischi. Prima versione IT, poi ──────────────, poi versione EN.

CTA italiana:
👉 CLICCA QUI PER [TESTO VARIABILE]:
${lIT}

CTA inglese:
👉 CLICK HERE TO [VARIABLE TEXT]:
${lEN}`;
}
