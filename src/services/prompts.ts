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
  const trader = cfg.traderName || 'Il Trader';

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

    engagement: base + `MESSAGGIO DI ENGAGEMENT — LEAD GENERATION. Scegli UN formato tra questi 10 — VARIA ogni volta, mai lo stesso tipo consecutivo, mai robotico.

I 10 FORMATI — scegli quello più adatto al momento della giornata:

1. 📊 SONDAGGIO (mattina / pre-news)
Hook: "DOVE VA L'ORO OGGI? VOGLIO LA VOSTRA OPINIONE. 🥇"
Chiedi la previsione direzionale con emoji come voto (es. 🔥=BUY 📉=SELL). Poi rivela che nel VIP hai già l'analisi pronta. CTA parola d'ordine: LIVELLI, SEGNALE, ANALISI.

2. 🪞 LO SPECCHIO (fine giornata)
Hook: "DOMANDA SCOMODA: QUANTO HAI GUADAGNATO OGGI? 💸"
Confronta la giornata lavorativa standard con i profitti automatici del CopyTrading nello stesso lasso di tempo. "Preferisci continuare a scambiare il tuo tempo per soldi, o vuoi che i tuoi soldi inizino a lavorare per te?" CTA: AUTOMATICO, LIBERTA, COPIA.

3. ⚡ CHECK ENERGIA (15 min prima del segnale gratuito)
Hook: "CI SIETE O STATE DORMENDO?! ⚡️"
Annuncia che sganci il segnale gratis solo se arrivi a X reazioni 🔥. Crea urgenza e attivazione istantanea. CTA: VIP, DENTRO, SEGNALE.

4. 🧠 PAIN POINT (pomeriggi lenti / weekend)
Hook: "QUAL È IL TUO NEMICO N.1 NEL TRADING? 🛑"
Proponi 3 scelte di problemi (1️⃣ ansia e chiudi troppo presto 2️⃣ no SL e bruci il conto 3️⃣ no tempo per guardare i grafici). Poi rivela che il CopyTrading risolve tutti e 3. CTA: AIUTO, SOLUZIONE, COPIA.

5. 🏆 APPELLO VINCITORI (subito dopo il segnale gratis è andato a target)
Hook: "FUORI I NOMI! CHI HA INCASSATO? 💰"
Chiedi a chi ha preso il segnale di mostrare il profitto nei commenti o con una reazione 💸. Social proof generato dagli utenti stessi. CTA: ANCORA, PROSSIMO, VIP.

6. 🤫 TEASER CURIOSO (dopo un profitto grosso nel VIP)
Hook: "OPS... L'ABBIAMO FATTO DI NUOVO. 🤫"
Accenna a risultati grandi senza rivelare i numeri ("Non vi dico i numeri esatti perché non ci credereste"). Crea curiosità irresistibile sul cosa si sono persi. CTA: CURIOSO, NUMERI, DENTRO.

7. 💼 OBIEZIONE CAPITALE (per convertire i "tiepidi" che seguono ma non comprano)
Hook: "'NON HO ABBASTANZA SOLDI PER INIZIARE.' 🛑 — Falso."
Smonta l'obiezione. Confronta il capitale minimo reale con quello che spendono in un weekend fuori. "L'aperitivo ti lascia il mal di testa. Il CopyTrading inizia a farti generare profitti passivi." CTA: CAPITALE, INIZIO, MINIMO.

8. 🎯 SFIDA SETTIMANALE (lunedì mattina)
Hook: "SFIDA DELLA SETTIMANA: QUAL È IL TUO OBIETTIVO? 🎯"
Chiedi l'obiettivo finanziario personale della settimana (pagare la rata, la spesa, un weekend fuori). Offri di valutare come il copy può aiutarlo a raggiungerlo. CTA: OBIETTIVO, META, LUNEDI.

9. 🚨 ALLERTA VOLATILITÀ (1-2 ore prima di news forti: CPI, NFP, FED)
Hook: "I MERCATI STANNO TRATTENENDO IL RESPIRO. 🌪"
Descrivi la quiete pre-tempesta. Avvisa che esploderà tutto. Chiedi di reagire con 💣 se pronti alla battaglia. CTA: SCUDO, BUNKER, PRONTO.

10. 🥂 FOMO WEEKEND (sabato o domenica mattina)
Hook: "COME STAI PAGANDO IL TUO WEEKEND? 🍸"
Confronta chi spende i soldi del lavoro vs chi spende i profitti del CopyTrading. "Pensa a questa cosa per tutto il weekend. E lunedì, decidi da che parte stare." CTA: LIFESTYLE, WEEKEND, LIBERTA.

REGOLE ASSOLUTE:
- Adatta il formato scelto alla situazione reale del giorno — non essere generico.
- MAI aprire con "Come sempre", "Ancora una volta", "Ciao ragazzi", "Buone notizie".
- Scrivi in modo autentico, come un trader che condivide qualcosa di reale — non come un bot di marketing.
- ZERO asterischi. Prima versione IT completa, poi ──────────────, poi versione EN.`,

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
Apri direttamente con il risultato — nessun preambolo. Screenshot allegato.

DIVERSITÀ OBBLIGATORIA — ogni generazione deve essere diversa:
- Immagina UNA situazione specifica del copy-trader mentre guadagnava: ancora sotto le coperte, davanti al caffè, nel tragitto in macchina, in palestra, con i figli a colazione, in coda al supermercato — MAI sempre la stessa scena.
- Usa vocabolario variato per il concetto di automatico: "profitto arrivato senza aprire un grafico", "conto cresciuto in silenzio", "guadagno senza toccare un tasto", "notifica di profitto al posto della sveglia", "sistema che ha operato per lui" — MAI solo "automaticamente" o "zero stress".
- Contrasto con chi ha fatto trading manuale: stesso mercato, stessa opportunità — esperienze radicalmente diverse.
CTA forte e diretta.`,

    copy_risultati_durante: base + `AGGIORNAMENTO LIVE COPYTRADING. Il sistema è ancora in posizione — aggiornamento in tempo reale.
Dati: ${v('pips_copy') || '+35'} pips attuali | ${v('ops_copy') || '1'} operazione in corso | Performance: ${v('perf_copy') || '+1.8%'}${v('note_copy') ? ' | Note: ' + v('note_copy') : ''}

DIVERSITÀ OBBLIGATORIA — ogni aggiornamento live deve avere un angolo diverso:
- Varia la prospettiva temporale: "mentre sei al lavoro in questo momento", "nell'esatto secondo in cui leggi questo", "mentre scorrevi il feed distrattamente".
- Varia il vocabolario del passivo: "il sistema gestisce tutto in autonomia", "l'algoritmo decide per te", "il trade avanza da solo", "nessun grafico da guardare, nessuna decisione da prendere" — MAI ripetere sempre la stessa frase.
- Varia l'urgenza FOMO: chi è dentro vede il profitto crescere ora; chi è fuori scoprirà solo il risultato finale, senza aver vissuto il percorso.
CTA con urgenza reale.`,

    copy_risultati_conclusi: base + `RECAP SESSIONE COPYTRADING. Sessione chiusa — ecco i numeri finali.
Risultati: ${v('pips_copy') || '+98'} pips totali | ${v('trades_copy') || '4'} operazioni | Performance: ${v('perf_copy') || '+3.5%'}${v('note_copy') ? ' | ' + v('note_copy') : ''}
Racconta la sessione in prospettiva — debriefing sui numeri del giorno. Screenshot allegato.

DIVERSITÀ OBBLIGATORIA — il recap deve ogni volta avere un'angolazione diversa:
- Varia la "giornata tipo" del copy-trader: cosa avrà fatto durante la sessione — non sempre "la sua normale giornata", sii specifico e vario (in ufficio, a fare sport, con la famiglia, in viaggio, a studiare).
- Varia il vocabolario del passivo: "rendita automatica", "profitto senza sacrifici", "conto che ha lavorato mentre lui viveva la sua giornata", "guadagno silenzioso" — MAI solo "zero stress" ripetuto ad ogni post.
- Varia la domanda retorica: può riguardare il tempo risparmiato, le opportunità non colte da chi aspetta, la semplicità della scelta, il confronto tra chi agisce e chi rimanda.
CTA con angolo configurazione — varia ogni volta: "non ti chiedo di fare trading", "ti chiedo 5 minuti per il setup", "un click per attivarlo, poi il sistema fa il resto", "la parte difficile l'abbiamo già fatta noi".`

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
    d_copy_live:       base + `RISULTATI ATTUALI COPYTRADING (12:00). Aggiornamento live: ${f('copy_pips') || '+60'} pips, ${f('copy_trades') || '4'} operazioni chiuse oggi. Screenshot allegato.

DIVERSITÀ OBBLIGATORIA — ogni volta la scena e il vocabolario devono essere diversi:
- Varia la "situazione di vita" del copy-trader durante questa sessione: era in palestra, con la famiglia, nel traffico, a pranzo, al lavoro, in vacanza, a fare la spesa, ancora a letto — MAI sempre la stessa scena.
- Varia il concetto di automatico: "sistema che opera per lui", "profitto silenzioso", "conto che cresce senza toccare nulla", "guadagno arrivato come una notifica", "macchina che lavora mentre lui vive" — MAI ripetere "zero stress" di post in post.
- Varia il contrasto: con chi ha guardato grafici per ore; con chi ha esitato all'ultimo secondo; con chi ha operato manualmente e ha gestito l'ansia.
CTA.`,
    d_notizie:         base + `CALENDARIO ECONOMICO (13:00). Focus ESCLUSIVO su cosa muove XAUUSD oggi.
${hasPhoto ? 'FOTO CALENDARIO ALLEGATA — analizza ogni evento: identifica le Cartelle Rosse (High Impact), spiega la logica causa→effetto (es. NFP sopra attese → USD forte → Gold giù), indica orari esatti. Tratta i dati già passati come \"appena usciti\" e quelli futuri come \"prossimo obiettivo da monitorare\".' : ''}
${f('note') ? 'NOTE: ' + f('note') : news ? 'NOTIZIE / NOTE: ' + news : ''}
${calEvents ? 'EVENTI MACRO OGGI (ForexFactory):\n' + calEvents : ''}
Direzione probabile Gold (🟢 rialzista / 🔴 ribassista / 🟡 neutro), orari chiave, cosa monitorare. L’analisi operativa è esclusiva VIP. CTA.`,
    d_copy_postnews:   base + `RISULTATI COPYTRADING POST NEWS (15:00). Le notizie macro sono uscite.
${f('news_ref') ? 'Notizia: ' + f('news_ref') : news ? 'Notizie: ' + news : ''}
${f('pips_postnews') ? 'Pips generati: ' + f('pips_postnews') : ''}
Racconta come ha reagito XAUUSD e i profitti generati durante la volatilità post-news. Screenshot allegato.

DIVERSITÀ OBBLIGATORIA — varia ogni volta:
- La "scena di vita" del copy-trader durante la news: stava facendo altro, ha ricevuto la notifica di profitto, non ha dovuto prendere nessuna decisione.
- Il vocabolario del passivo: "sistema ha incassato il movimento", "algoritmo ha operato nel caos", "profitto arrivato da solo", "conto cresciuto in autonomia" — MAI sempre "zero stress".
- L'angolo FOMO: chi era posizionato ha cavalcato la volatilità; chi aspettava il momento perfetto si è perso la finestra migliore.
CTA forte.`,
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

// ── CALENDARIO RISULTATI V1 — Autorità e Trasparenza ─────────────────────────
export function buildCalRisultatiV1Prompt(cfg: Config, tone: Tone, notes: string): string {
  const lIT = getLinkIT(cfg);
  const lEN = getLinkEN(cfg);
  const trader = cfg.traderName || 'Il Trader';
  const date = todayItalian();
  return `Sei il braccio destro del trader ${trader} sul canale Telegram XAUUSD. Data: ${date}.

HAI UNO SCREENSHOT DI UN CALENDARIO DI TRADING RISULTATI ALLEGATO. Analizzalo con cura prima di scrivere — estrai tutti i dati numerici visibili (pips, %, operazioni, win rate, equity curve se presente).

${notes ? 'Istruzioni aggiuntive: ' + notes : ''}

COMPITO — Versione "AUTORITÀ E TRASPARENZA":
Costruisci un post che racconta i risultati in modo onesto, professionale e autorevole. L'obiettivo è la fiducia a lungo termine — non il clickbait.

STRUTTURA OBBLIGATORIA:
🏛️ Titolo autorevole (es. "Report Risultati — [periodo visibile nello screenshot]")

Apri con il dato principale — Total PnL o il rendimento complessivo del periodo visibile:
→ Formula: "Periodo: [X settimane/mesi]. Risultato netto: +[X] pips / +[X]%. Win rate: [X]%."

Breakdown dettagliato (usa i dati reali dallo screenshot):
→ Operazioni totali: X
→ Operazioni positive: X (Win Rate: X%)
→ Giornata migliore: [data se visibile] — +X pips / +X%
→ Giornata peggiore: [data se visibile] — -X pips (gestita entro lo stop loss predefinito)

Paragrafo sulla GESTIONE DEL RISCHIO (obbligatorio — è il differenziatore):
"Le giornate negative esistono nel trading professionale — non le nascondiamo. Quello che conta è come le gestiamo: ogni operazione ha uno Stop Loss predefinito, nessuna posizione viene tenuta a rischio incontrollato."

Chiudi con il VALORE del CopyTrading:
"Questi sono i numeri che i nostri copier hanno replicato automaticamente — senza studiare grafici, senza stare davanti allo schermo."

CTA alla Sala VIP / CopyTrading

TONO: professionale, diretto, da report istituzionale — ZERO superlativi vuoti, ZERO "incredibile" o "mai visto". I dati parlano da soli.
ZERO asterischi. Prima versione IT completa, poi ──────────────, poi versione EN.

CTA italiana:
👉 CLICCA QUI PER [TESTO VARIABILE]:
${lIT}

CTA inglese:
👉 CLICK HERE TO [VARIABLE TEXT]:
${lEN}`;
}

// ── CALENDARIO RISULTATI V2 — Hype / FOMO ────────────────────────────────────
export function buildCalRisultatiV2Prompt(cfg: Config, tone: Tone, notes: string): string {
  const lIT = getLinkIT(cfg);
  const lEN = getLinkEN(cfg);
  const trader = cfg.traderName || 'Il Trader';
  const date = todayItalian();
  return `Sei il braccio destro del trader ${trader} sul canale Telegram XAUUSD. Data: ${date}.

HAI UNO SCREENSHOT DI UN CALENDARIO DI TRADING RISULTATI ALLEGATO. Analizzalo prima di scrivere — estrai il dato più forte visibile: la settimana migliore, il giorno con il massimo profitto, il win rate più alto.

${notes ? 'Istruzioni aggiuntive: ' + notes : ''}

COMPITO — Versione "HYPE / FOMO":
Costruisci un post che crea desiderio di partecipare — ottimistico, energico, orientato all'azione immediata. Punta sulla migliore prestazione del periodo visibile.

STRUTTURA OBBLIGATORIA:
🚀 Titolo ad alto impatto — usa il dato migliore come aggancio (es. "Questa settimana: +[X]% su XAUUSD")

Apri con il dato record visibile — niente premesse, vai dritto al numero:
→ "Settimana record: +[X] pips / +[X]% — tutto su XAUUSD."
→ oppure: "Ieri: [X] operazioni, [X] chiuse in profitto. Giornata da manuale."

Crea il contrasto FOMO:
"Mentre molti guardavano i grafici senza sapere cosa fare, i nostri copier hanno incassato [dato] in automatico — senza muovere un dito."

Racconta 1-2 operazioni specifiche se visibili nello screenshot (con risultato concreto):
→ "Operazione BUY aperta a [X] — chiusa a +[Y] pips. Piano perfetto, eseguito."

Urgenza psicologica:
"I posti in CopyTrading sono limitati — il sistema di allocazione del broker prevede un cap sui copier attivi."

CTA forte, diretta, con senso di scarsità

TONO: energico, emozionale, da venditore di alto livello — usa emoji strategiche 🔥💰🚀📈. Frasi brevi, ritmo veloce. Usa i dati reali dallo screenshot.
ZERO asterischi. Prima versione IT, poi ──────────────, poi versione EN.

CTA italiana:
👉 CLICCA QUI PER [TESTO VARIABILE]:
${lIT}

CTA inglese:
👉 CLICK HERE TO [VARIABLE TEXT]:
${lEN}`;
}

// ── CALENDARIO RISULTATI V3 — Report Internazionale ──────────────────────────
export function buildCalRisultatiV3Prompt(cfg: Config, tone: Tone, notes: string): string {
  const lIT = getLinkIT(cfg);
  const lEN = getLinkEN(cfg);
  const trader = cfg.traderName || 'Il Trader';
  const date = todayItalian();
  return `Sei il braccio destro del trader ${trader} sul canale Telegram XAUUSD. Data: ${date}.

HAI UNO SCREENSHOT DI UN CALENDARIO DI TRADING RISULTATI ALLEGATO. Analizzalo prima di scrivere — estrai tutti i dati numerici: Total PnL, Best Week, Win Rate, numero operazioni.

${notes ? 'Istruzioni aggiuntive: ' + notes : ''}

COMPITO — Versione "REPORT INTERNAZIONALE":
Scrivi un post in stile report istituzionale — pulito, schematico, leggibile su mobile. La versione EN sarà la più importante — scritta come un vero performance report.

STRUTTURA OBBLIGATORIA:
📊 Titolo report (es. "XAUUSD Performance Report — [periodo]")

SEZIONE DATI — formato leggibile su Telegram:
→ Period: [X weeks / X months]
→ Net Result: +X pips / +X%
→ Total Trades: X
→ Win Rate: X%
→ Best Week: +X pips / +X%
→ Worst Week: -X pips (max drawdown controlled)
→ Avg. Daily: +X pips

SEZIONE METODOLOGIA (2-3 righe max):
"Strategy: XAUUSD intraday & swing | Risk per trade: max 1-2% | All positions managed with predefined SL/TP."

SEZIONE COPYTRADING:
"All results above have been replicated automatically by our active copiers — zero screen time, zero manual execution required."

CTA professionale

TONO: istituzionale, da report di asset management. Minimal emoji (solo 📊 e 📈). NIENTE esclamazioni, NIENTE hype. I numeri parlano da soli.
ZERO asterischi. Prima versione IT completa, poi ──────────────, poi versione EN (EN è la versione principale per questo stile).

CTA italiana:
👉 CLICCA QUI PER [TESTO VARIABILE]:
${lIT}

CTA inglese:
👉 CLICK HERE TO [VARIABLE TEXT]:
${lEN}`;
}

// ── HYPE & VENDITA DAILY PROMPTS ─────────────────────────────────────────────
export function buildHypePrompt(
  slot: { id: string; time: string; label: string },
  ctx: { cfg: Config; date: string; fields?: Record<string, string>; tone?: Tone },
): string | null {
  const { cfg, date, fields = {}, tone = 'hype' } = ctx;
  const f = (k: string) => fields[k] || '';
  const trader = cfg.traderName || 'Il Trader';
  const toneNote = tone !== 'hype'
    ? `\nINTENSITÀ — ${tone === 'assertivo'
        ? 'ASSERTIVO: mantieni la struttura HOOK/CORPO/MEDIA/CTA ma abbassa l\'aggressività — tono diretto e deciso, FOMO reale non urlato, meno maiuscoli eccessivi, frasi incisive ma misurate.'
        : 'ESSENZIALE: massima sintesi — ogni blocco = 1-2 frasi secche, CTA cortissima, zero parole di riempimento, solo il dato chiave e l\'azione.'}`
    : '';

  const hvBase = `Sei il copywriter ufficiale del trader ${trader} su Telegram XAUUSD. Data: ${date}.

MODALITÀ: HYPE & VENDITA — Ogni messaggio ha un SOLO obiettivo: generare messaggi privati (DM/lead). Niente informazione pura, solo conversione.

I 3 PILASTRI da ruotare nei tuoi contenuti:
🥇 XAUUSD: il mercato più esplosivo e profittevole, domato solo dai nostri analisti.
⚙️ COPYTRADING: reddito passivo automatico — il conto cresce mentre l'utente vive la sua vita.
💎 SALA VIP: il dietro le quinte esclusivo dove si fanno i soldi veri.

ANATOMIA OBBLIGATORIA DEL POST:
1. HOOK IN MAIUSCOLO: 1 riga esplosiva che ferma il pollice — deve essere incisiva, diretta, legata al contenuto del post.
2. CORPO: 2-3 frasi brevi e veloci. Soggetto, verbo, profitto. Paragrafi di max 2 righe. Adrenalina e FOMO reale.
3. [ALLEGA MEDIA]: scrivi esattamente l'indicazione tra parentesi quadre e in grassetto su cosa allegare (**[ALLEGA SCREENSHOT...]**).
4. CTA OBBLIGATORIA — segui QUESTO formato esatto ogni volta:
👇 [FRASE IMPERATIVA IN MAIUSCOLO]
[ @${trader} — Scrivimi "{PAROLA D'ORDINE}" {EMOJI PERTINENTE} ]

La PAROLA D'ORDINE deve essere: 1 parola o acronimo pertinente al post (es. NFP, SUBITO, ORO, COPY, ACCESSO, PROFITTO, SISTEMA, WEEKEND, IO, VIP...).

REGOLE FORMATO:
- Emoji aggressivi e pertinenti: 🔥🚀⚡️🎯💰💣 — usali con strategia.
- Frasi cortissime. Ritmo veloce. Zero spiegazioni accademiche. Zero giri di parole.
- ZERO asterischi. Prima versione IT completa, poi ──────────────, poi versione EN.${toneNote}`;

  const prompts: Record<string, string> = {

    hv_buongiorno: hvBase + `

SLOT 07:30 — BUONGIORNO URGENZA & HYPE:
Apertura della giornata esplosiva. Crea urgenza immediata intorno a XAUUSD — usa il contesto del giorno (apertura mercati europei, eventi macro in arrivo, volatilità attesa). Posiziona Sala VIP e CopyTrading come già pronti, con i motori caldi. Chi non è dentro parte già in ritardo rispetto a chi sta già operando.
Media: **[NESSUN MEDIA — solo testo esplosivo]**
Parola d'ordine suggerita: SVEGLIA, PRONTI, TODAY, GOLD, MOTORI`,

    hv_vip_mattina: hvBase + `

SLOT 08:00 — PRIMO SANGUE VIP MATTUTINO:
Pips: ${f('pips_vip') || 'X'} | Operazioni: ${f('trades_vip') || 'Y'}.
Apri direttamente con il numero — niente preamboli. Chi era nel VIP aveva il piano dalla sera prima. Ha eseguito con metodo. Ha già il primo profitto della giornata in tasca. Chi era fuori ha solo guardato.
Media: **[ALLEGA SCREENSHOT DEL PRIMO TRADE CHIUSO IN PROFITTO]**
Parola d'ordine suggerita: SUBITO, PRIMO, SANGUE, DENTRO`,

    hv_recap_ieri: hvBase + `

SLOT 09:00 — RECAP IERI — COPY & VIP HA PAGATO:
Ieri ha chiuso in verde. Mostra i numeri di ieri (VIP e CopyTrading) — il CopyTrading ha chiuso in profitto mentre molti erano semplicemente a lavoro, in palestra, a dormire. Poi gira il focus: "E oggi lo facciamo di nuovo."
${f('nota') ? 'Contesto aggiuntivo: ' + f('nota') : ''}
Media: **[ALLEGA SCREENSHOT RIEPILOGO IERI]**
Parola d'ordine suggerita: IERI, COPY, REPLICA, SISTEMA`,

    hv_segnale_free: hvBase + `

SLOT 10:00 — SEGNALE GRATIS — L'ESCA:
Direzione: ${f('dir') || 'BUY/SELL'} XAUUSD | Entry: ${f('entry') || 'X'} | SL: ${f('sl') || 'X'} | TP: ${f('tp') || 'X'}.
Presentalo come un assaggio della potenza della Sala VIP — la versione gratuita di ciò che i VIP ricevono ogni giorno con target avanzati. Invita a entrare ORA prima che il setup sia già in corso.
Media: **[NESSUN MEDIA — solo il segnale in testo]**
Parola d'ordine suggerita: ORO, SEGNALE, GRATIS, SETUP`,

    hv_fine_segnale: hvBase + `

SLOT 11:00 — TARGET PRESO — LA PROVA:
${f('pips') ? 'Risultato: ' + f('pips') + ' pips.' : 'Il segnale delle 10:00 ha colpito il target.'} ${f('nota') ? f('nota') + '.' : ''}
Erano lì per tutti. Gratis. Chi è entrato si è appena guadagnato qualcosa di concreto. Chi ha esitato ha guardato gli altri fare soldi. L'azione paga, i dubbi no.
Media: **[ALLEGA SCREENSHOT DEL GRAFICO XAUUSD AL TARGET]**
Parola d'ordine suggerita: PROFITTO, DENTRO, BOOM, COLPO`,

    hv_screen_clienti: hvBase + `

SLOT 12:00 — SOCIAL PROOF ESPLOSIVO:
Mostra le chat dei clienti soddisfatti — profitti reali, messaggi reali. Presenta ogni testimonianza come una storia di persona concreta, non come una lista di screenshot. Non serve essere maghi della finanza: serve essere nel posto giusto.
${f('nota') ? 'Contesto: ' + f('nota') : ''}
Media: **[ALLEGA 2-3 SCREENSHOT DI CHAT CON CLIENTI IN PROFITTO]**
Parola d'ordine suggerita: IO, VOGLIO, PROSSIMO, ANCHIO`,

    hv_calendario: hvBase + `

SLOT 13:00 — MASSIMA ALLERTA DATI MACRO:
${f('news_note') ? 'Dati attesi: ' + f('news_note') + '.' : 'Dati macro ad alto impatto in arrivo nel pomeriggio.'}
Il mercato esploderà. XAUUSD farà movimenti violentissimi. Chi opera da solo senza un piano rischia di farsi male. Chi è con noi nel VIP ha già le reti pronte — ogni scenario è coperto.
Media: **[NESSUN MEDIA — solo testo di allerta]**
Parola d'ordine suggerita: SCUDO, ALLERTA, DIFESA, BUNKER`,

    hv_passaggio_vip: hvBase + `

SLOT 14:00 — PORTE CHIUSE — CI SPOSTIAMO NEL PRIVATO:
I dati stanno per uscire. Da qui gestiamo tutto nella Sala VIP — live, in tempo reale. Il CopyTrading è già posizionato per estrarre profitto dal caos in autonomia totale. Sul canale gratuito non ci sarà nulla fino a stasera. Chi vuole fare soldi questo pomeriggio — il momento è ADESSO.
Media: **[NESSUN MEDIA — solo annuncio di passaggio]**
Parola d'ordine suggerita: ACCESSO, VIP, CHIAVI, DENTRO`,

    hv_risultati_live: hvBase + `

SLOT 15:30 — MERCATI DOMATI — PROFITTO INCASSATO:
${f('pips') ? 'Risultato: ' + f('pips') + ' pips.' : ''} ${f('trades') ? 'Operazioni chiuse: ' + f('trades') + '.' : ''}
Dati usciti, mercato impazzito, profitto incassato. Mentre i trader improvvisati bruciavano i conti, la nostra strategia VIP e l'algoritmo CopyTrading hanno colpito con precisione chirurgica.
Media: **[ALLEGA SCREENSHOT PROFITTI POST-NEWS / COPY SU XAUUSD]**
Parola d'ordine suggerita: SISTEMA, ALGORITMO, CECCHINO, PROFITTO`,

    hv_recap_finale: hvBase + `

SLOT 18:00 — SIPARIO CHIUSO — WEEKEND PAGATO DAL MERCATO:
Carrellata finale dei profitti della giornata. Chi era con noi stasera festeggia — conti cresciuti, clienti felici. Chi ha aspettato ha un altro giorno per pensarci. Lunedì si riparte — chi vuole essere operativo da subito scrive ora.
${f('nota') ? 'Contesto: ' + f('nota') : ''}
Media: **[ALLEGA CARRELLATA SCREENSHOT PROFITTI CLIENTI DEL GIORNO]**
Parola d'ordine suggerita: WEEKEND, RECAP, LUNEDI, STASERA`,
  };

  return prompts[slot.id] || null;
}

// ── COSTANZA & METODO DAILY PROMPTS ──────────────────────────────────────────
export function buildCostanzaPrompt(
  slot: { id: string; time: string; label: string },
  ctx: { cfg: Config; date: string; fields?: Record<string, string>; tone?: Tone },
): string | null {
  const { cfg, date, fields = {}, tone = 'assertivo' } = ctx;
  const f = (k: string) => fields[k] || '';
  const trader = cfg.traderName || 'Il Trader';
  const lIT = getLinkIT(cfg);
  const lEN = getLinkEN(cfg);
  const toneNote = tone !== 'assertivo'
    ? `\nINTENSITÀ — ${tone === 'hype'
        ? 'ENERGETICA: mantieni l\'empatia e il metodo ma aumenta il ritmo — frasi più corte e incisive, tensione positiva, urgenza naturale (non forzata).'
        : 'ESSENZIALE: massima sintesi — riduci ogni blocco a 1-2 frasi, solo il dato chiave e la CTA, massima leggibilità su mobile.'}`
    : '';

  const cvBase = `Sei il copywriter ufficiale del trader ${trader} su Telegram XAUUSD. Data: ${date}.

MODALITÀ: COSTANZA & METODO — Ogni messaggio ha un SOLO obiettivo: costruire fiducia duratura, dimostrare consistenza e convertire in modo naturale. Niente urla, niente FOMO artificiale. Solo fatti, numeri reali e la realtà concreta di chi lavora con metodo ogni giorno.

I 3 PILASTRI da ruotare nei tuoi contenuti:
🥇 XAUUSD — I cecchini dell'Oro: analisi chirurgica, esecuzione precisa, nessuna improvvisazione.
⚙️ COPYTRADING — La leva del tempo libero: il conto cresce in automatico mentre l'utente vive la sua vita.
💎 SALA VIP — Il salotto buono: dove ogni setup viene discusso con calma e competenza, prima che il mercato si muova.

ANATOMIA OBBLIGATORIA DEL POST:
1. HOOK CALMO MA INCISIVO (1 riga): un fatto, un numero o una domanda empatica. Non urlare — colpisci con la verità.
2. CORPO (3-4 frasi fluide, mai meno di 3 blocchi logici):
   → Empatia breve: riconosci la realtà di chi legge ("Sappiamo che...", "Chi non è ancora dentro spesso pensa...", "La maggior parte dei trader...")
   → Fatto/Risultato: il dato concreto — pips, operazioni, win rate, profitto reale
   → Lezione/Perché: cosa significa questo per chi vuole entrare — il "perché il metodo funziona nel tempo"
3. [ALLEGA MEDIA]: scrivi esattamente l'indicazione tra parentesi quadre (**[ALLEGA SCREENSHOT...]**) su una riga separata.
4. CTA FLUIDA con link su riga nuova:
   👉 [TESTO VARIABILE]:
   ${lIT}

REGOLE FORMATO:
- Tono: calmo, autorevole, empatico — come un mentore che parla alla sua community con esperienza reale.
- Frasi fluide e discorsive. Paragrafi di 2-3 righe. Zero esclamazioni aggressive. Zero maiuscoli urlati (eccetto eventuale hook).
- Emoji moderate e contestuali: 📈🥇⚙️💎✅🎯⚡️ — 1-2 per blocco. Mai aggressivi o caotici.
- ZERO asterischi. Prima versione IT completa, poi ──────────────, poi versione EN.

CTA ITALIANA (alla fine della versione IT, link su riga nuova):
👉 [TESTO VARIABILE]:
${lIT}

CTA INGLESE (alla fine della versione EN, link su riga nuova):
👉 [VARIABLE TEXT]:
${lEN}

Varia il testo CTA ogni volta. Esempi IT: "Se vuoi capire come funziona il sistema, inizia da qui:", "Unisciti a chi costruisce ogni giorno:", "Replica anche tu i risultati:", "Scopri come entrare:", "Inizia oggi con il metodo giusto:", "Il prossimo passo è questo:". Esempi EN: "Start building your results here:", "Join those who work with method:", "Discover how the system works:", "Copy the results automatically:".${toneNote}
`;

  const prompts: Record<string, string> = {

    cv_buongiorno: cvBase + `

SLOT 07:30 — BUONGIORNO FLUIDO:
Apertura della giornata con tono calmo e determinato. Riconosci chi è già nella community ("chi è con noi sa già cosa succederà stamattina — il piano è pronto") e invita chi è fuori senza pressione ma con chiarezza: ogni mattina con il metodo è una mattina di vantaggio reale. Anticipa brevemente cosa arriva oggi (segnale, aggiornamento VIP, analisi Gold).
Media: **[NESSUN MEDIA — solo testo fluido e motivante]**
Parola chiave CTA: START, METODO, COSTANZA, OGGI`,

    cv_vip_mattina: cvBase + `

SLOT 08:00 — RISULTATI VIP MATTUTINI — PROVA TANGIBILE:
Pips: ${f('pips_vip') || 'X'} | Operazioni: ${f('trades_vip') || 'Y'}.
Presenta i risultati con calma — fai parlare i numeri. Spiega il contesto: perché questo risultato è significativo, cosa ha reso possibile questo trade (analisi fatta la sera prima, livello chiave identificato, esecuzione con stop definito). Chi era nel CopyTrading lo ha incassato senza guardare neanche un grafico.
Media: **[ALLEGA SCREENSHOT DEL TRADE CHIUSO IN PROFITTO]**
Parola chiave CTA: VIP, PROFITTO, AUTOMATICO, DENTRO`,

    cv_recap_ieri: cvBase + `

SLOT 09:00 — RECAP IERI — LA COSTANZA PAGA:
Ieri ha chiuso in verde. Racconta i risultati di ieri (VIP e CopyTrading) come conferma di un processo che si ripete — non come evento eccezionale, ma come routine. "È la stessa cosa che facciamo ogni giorno — analisi, esecuzione, gestione. Il mercato si muove, noi ci siamo pronti."
${f('nota') ? 'Contesto aggiuntivo: ' + f('nota') : ''}
Media: **[ALLEGA SCREENSHOT RIEPILOGO RISULTATI DI IERI]**
Parola chiave CTA: REPLICA, SISTEMA, COSTANZA, IERI`,

    cv_segnale_free: cvBase + `

SLOT 10:00 — SEGNALE GRATIS — LA GUIDA CONCRETA:
Direzione: ${f('dir') || 'BUY/SELL'} XAUUSD | Entry: ${f('entry') || 'X'} | SL: ${f('sl') || 'X'} | TP: ${f('tp') || 'X'}.
Presenta il segnale come parte di un processo educativo — non come un regalo casuale, ma come dimostrazione del metodo. Spiega brevemente il ragionamento: perché questo livello, cosa indica il grafico. Chi vuole capire di più e ricevere i setup avanzati sa dove andare.
Media: **[NESSUN MEDIA — solo il segnale in testo, pulito e leggibile]**
Parola chiave CTA: SEGNALE, GUIDA, SETUP, METODO`,

    cv_fine_segnale: cvBase + `

SLOT 11:00 — FINE SEGNALE — IL METODO DIMOSTRATO:
${f('pips') ? 'Risultato: ' + f('pips') + ' pips.' : 'Il segnale delle 10:00 ha raggiunto il target.'} ${f('nota') ? f('nota') + '.' : ''}
Non esultare — concludi con soddisfazione misurata. "Era previsto. Questo è il livello a cui operiamo ogni giorno." Spiega cosa ha funzionato: la zona di ingresso, la gestione dello stop, il target rispettato. Chi impara a leggere questi risultati capisce perché il metodo si replica nel tempo.
Media: **[ALLEGA SCREENSHOT DEL GRAFICO XAUUSD AL TARGET]**
Parola chiave CTA: PROFITTO, METODO, ACCESSO, SCUDO`,

    cv_screen_clienti: cvBase + `

SLOT 12:00 — PROVA SILENZIOSA — I RISULTATI DEI CLIENTI:
Mostra le chat dei clienti soddisfatti — profitti reali, messaggi reali. Tono rispettoso e umano: non sono numeri, sono persone con vite normali che hanno scelto di lavorare con metodo. "Non serve essere trader professionisti — serve affidarsi a chi lo è."
${f('nota') ? 'Contesto: ' + f('nota') : ''}
Media: **[ALLEGA 2-3 SCREENSHOT DI CHAT CON CLIENTI IN PROFITTO]**
Parola chiave CTA: VOGLIO, PROSSIMO, ACCESSO, SISTEMA`,

    cv_calendario: cvBase + `

SLOT 13:00 — CALENDARIO ECONOMICO — IL CONTESTO CHE CONTA:
${f('news_note') ? 'Dati attesi: ' + f('news_note') + '.' : 'Dati macro ad alto impatto nel pomeriggio.'}
Spiega con calma cosa ci aspetta nel pomeriggio — quali dati escono, cosa significano per il Gold, cosa fare (e soprattutto cosa evitare). "Il mercato si muoverà — la domanda è se vuoi muoverti con un piano o senza." Chi è nel VIP ha già tutto pronto.
Media: **[NESSUN MEDIA — solo analisi testuale chiara]**
Parola chiave CTA: PIANO, CONTESTO, SCUDO, ALLERTA`,

    cv_passaggio_vip: cvBase + `

SLOT 14:00 — PASSAGGIO AL VIP — LA SCELTA CONSAPEVOLE:
I dati stanno per uscire. Chi è nel VIP ha già il piano operativo, i livelli definiti, la gestione predisposta. Chi ha il CopyTrading attivo non deve fare nulla — il sistema opererà in autonomia. "Non è esclusività fine a se stessa — è avere gli strumenti giusti nel momento che conta di più."
Media: **[NESSUN MEDIA — solo invito chiaro e diretto]**
Parola chiave CTA: ACCESSO, VIP, PIANO, SCELTA`,

    cv_risultati_live: cvBase + `

SLOT 15:30 — RISULTATI LIVE — LA CONSISTENZA IN AZIONE:
${f('pips') ? 'Risultato: ' + f('pips') + ' pips.' : ''} ${f('trades') ? 'Operazioni chiuse: ' + f('trades') + '.' : ''}
I dati sono usciti, il mercato ha reagito, i risultati sono qui. Racconta con calma cosa è successo — non il caos, ma come il metodo ha gestito la volatilità con precisione. "Non è fortuna — è il risultato di un processo che si ripete ogni settimana."
Media: **[ALLEGA SCREENSHOT PROFITTI POST-NEWS / COPY SU XAUUSD]**
Parola chiave CTA: SISTEMA, AUTOMATICO, COSTANZA, PROFITTO`,

    cv_recap_finale: cvBase + `

SLOT 18:00 — RECAP FINALE — COSTRUIRE OGNI GIORNO:
Chiudi la giornata con soddisfazione autentica e prospettiva. Racconta cosa è successo oggi — un breve riassunto dei momenti chiave — e proietta verso domani. "Una giornata non fa un risultato — ma ogni giornata costruisce il sistema." Chi è già dentro sa cosa aspettarsi domani mattina.
${f('nota') ? 'Contesto: ' + f('nota') : ''}
Media: **[ALLEGA CARRELLATA SCREENSHOT RISULTATI DELLA GIORNATA]**
Parola chiave CTA: DOMANI, COSTRUISCI, METODO, LUNEDI`,
  };

  return prompts[slot.id] || null;
}

// ── CALENDARIO MT — MetaTrader 5 Summary Report ───────────────────────────────
export function buildCalMTV1Prompt(cfg: Config, tone: Tone, notes: string): string {
  const lIT = getLinkIT(cfg);
  const lEN = getLinkEN(cfg);
  const trader = cfg.traderName || 'Il Trader';
  const date = todayItalian();
  return `Sei il braccio destro del trader ${trader} sul canale Telegram XAUUSD. Data: ${date}.

HAI UNO SCREENSHOT DEL SUMMARY DI METATRADER 5 ALLEGATO. Analizzalo con massima precisione prima di scrivere — estrai TUTTI i valori numerici visibili: Total Net Profit (in valuta), Growth %, Max Drawdown %, Profit Factor, Sharpe Ratio, Recovery Factor, Average Hold Time, Trades, Commissions, Swaps, Max Deposit Load.

⚠️ REGOLA ASSOLUTA — ZERO ARROTONDAMENTI: I numeri nel post devono essere IDENTICI allo screenshot. Se il drawdown è 1.79%, scrivi "1.79%" — non "circa 1%" o "quasi 2%". La credibilità dipende dall'esattezza.

${notes ? 'Istruzioni aggiuntive: ' + notes : ''}

COMPITO — Versione 1: "RAPPORTO RENDIMENTO/RISCHIO" (Psicologia dell'investitore):
L'obiettivo è rassicurare chi ha paura di perdere soldi. La SICUREZZA e la PROTEZIONE DEL CAPITALE sono la vendita principale.

STRUTTURA OBBLIGATORIA:
🛡️ Titolo focalizzato sul controllo del rischio (es. "Il sistema che cresce proteggendo il capitale")

PROTAGONISTA — Il Max. Drawdown (estrai il valore esatto):
→ Se è sotto il 10%: aprì con questo come prova di sicurezza e affidabilità
→ Formula: "Calo massimo registrato nella storia del conto: -X%. Questo significa che in nessun momento il capitale è sceso di più di X%."

CONTRASTO CRESCITA vs RISCHIO:
→ Metti in relazione Growth % con Max Drawdown — "Per ogni punto percentuale di rischio corso, abbiamo generato X volte tanto in rendimento"
→ Usa il Total Net Profit in valuta per dare concretezza al numero astratto

COMMISSIONI E SWAP (se visibili):
→ Se Commissions e Swaps sono 0.00 o molto bassi: "Zero commissioni nascoste. Zero costi di mantenimento notturno. Il profitto rimane interamente nell'account."

EQUITY LINE (se linea dell'equity è visibile e cresce in modo costante senza spike negativi):
→ "La curva del conto cresce in modo organico e costante — nessuna caduta brusca, nessuna rimonta emotiva. Stabilità istituzionale."

Chiudi con: "Nel CopyTrading questi risultati vengono replicati automaticamente sul tuo conto — con lo stesso profilo di rischio controllato, senza che tu debba fare nulla."

CTA alla Sala VIP / CopyTrading

LINGUAGGIO OBBLIGATORIO: usa "protezione del capitale", "crescita organica", "rischio controllato", "stabilità sistematica" — almeno 2 di questi.
TONO: rassicurante, professionale, da gestore patrimoniale. NON hype, NON urlato. La sicurezza è il messaggio.
ZERO asterischi. Prima versione IT completa, poi ──────────────, poi versione EN.

CTA italiana:
👉 CLICCA QUI PER [TESTO VARIABILE]:
${lIT}

CTA inglese:
👉 CLICK HERE TO [VARIABLE TEXT]:
${lEN}`;
}

export function buildCalMTV2Prompt(cfg: Config, tone: Tone, notes: string): string {
  const lIT = getLinkIT(cfg);
  const lEN = getLinkEN(cfg);
  const trader = cfg.traderName || 'Il Trader';
  const date = todayItalian();
  return `Sei il braccio destro del trader ${trader} sul canale Telegram XAUUSD. Data: ${date}.

HAI UNO SCREENSHOT DEL SUMMARY DI METATRADER 5 ALLEGATO. Analizzalo e cerca questi coefficienti tecnici specifici: Profit Factor, Sharpe Ratio, Recovery Factor, Expected Payoff, Average Hold Time, Max Deposit Load, Commissions, Swaps, Total Trades, Growth %.

⚠️ REGOLA ASSOLUTA — ZERO ARROTONDAMENTI: copia i numeri esattamente come appaiono nello screenshot. La precisione è la credibilità.

${notes ? 'Istruzioni aggiuntive: ' + notes : ''}

COMPITO — Versione 2: "ANALISI DEI COEFFICIENTI PROFESSIONALI" (Autorità tecnica):
L'obiettivo è convincere i trader esperti che la strategia è sistematica e non emotiva. Ogni coefficiente va spiegato con il suo significato reale.

STRUTTURA OBBLIGATORIA:
📊 Titolo tecnico e autorevole (es. "XAUUSD Performance Analysis — Coefficienti Professionali")

PROFIT FACTOR (indispensabile — estrai il valore esatto):
→ Spiega: "Il Profit Factor misura il rapporto tra profitti lordi e perdite lorde. Ogni valore sopra 1.0 indica una strategia profittevole nel tempo — il nostro è X.XX, ovvero per ogni euro perso ne generiamo X.XX di profitto."
→ Se sopra 1.5: sottolinealo come benchmark di qualità istituzionale

EFFICIENZA — SHARPE RATIO & RECOVERY FACTOR:
→ Sharpe Ratio (se presente): "Misura il rendimento aggiustato per il rischio — un valore alto indica che ogni punto di rendimento è stato ottenuto con un rischio proporzionalmente basso."
→ Recovery Factor (se presente): "Indica quante volte il profitto totale supera il massimo drawdown. Il nostro è X.XX — significa che il sistema recupera ogni fase negativa con X.XX volte il profitto."

STILE OPERATIVO — AVERAGE HOLD TIME:
→ Se breve (sotto 2 ore): "Scalping Chirurgico — le posizioni vengono aperte, gestite e chiuse in pochi minuti/ore. Nessuna operazione lasciata aperta a caso durante la notte."
→ Se lungo (oltre 12 ore): "Approccio swing disciplinato — ogni operazione ha un piano preciso dall'ingresso alla chiusura, senza improvvisazioni."

CARICO DEL MARGINE — MAX DEPOSIT LOAD:
→ "L'utilizzo massimo del margine non ha mai superato il X% — conferma che la strategia gestisce il rischio in modo professionale, senza leva eccessiva."

COMMISSIONI E SWAP (se presenti):
→ Se 0 o molto bassi: "Costi operativi: zero commissioni, zero swap significativi. Il profitto netto corrisponde quasi esattamente al profitto lordo."

Chiudi con: "Questi non sono numeri casuali — sono i coefficienti di una macchina operativa sistematica e replicabile. Per questo viene offerta in CopyTrading automatico."

TONO: da analista quantitativo — preciso, autorevole, da white paper. NIENTE hype. I dati parlano da soli.
ZERO asterischi. Prima versione IT completa, poi ──────────────, poi versione EN.

CTA italiana:
👉 CLICCA QUI PER [TESTO VARIABILE]:
${lIT}

CTA inglese:
👉 CLICK HERE TO [VARIABLE TEXT]:
${lEN}`;
}

export function buildCalMTV3Prompt(cfg: Config, tone: Tone, notes: string): string {
  const lIT = getLinkIT(cfg);
  const lEN = getLinkEN(cfg);
  const trader = cfg.traderName || 'Il Trader';
  const date = todayItalian();
  return `Sei il braccio destro del trader ${trader} sul canale Telegram XAUUSD. Data: ${date}.

HAI UNO SCREENSHOT DEL SUMMARY DI METATRADER 5 ALLEGATO. Individua immediatamente i 4 numeri più impattanti: Total Net Profit (in valuta esatta), Growth %, numero Trades totali o settimanali, Max Drawdown %.

⚠️ REGOLA ASSOLUTA — ZERO ARROTONDAMENTI: i numeri devono essere identici allo screenshot. Se il profitto è +$660.90, scrivi "+$660.90" — non "+660" o "+$660". La precisione è la credibilità.

${notes ? 'Istruzioni aggiuntive: ' + notes : ''}

COMPITO — Versione 3: "SOCIAL PROOF E RISULTATI FLASH" (Impatto visivo immediato):
L'obiettivo è fermare il pollice in 3 secondi. Post ottimizzato per chi vuole vedere solo il segno + sul conto.

STRUTTURA OBBLIGATORIA:
🔥 Apertura con il profitto totale in valuta — es. "+$660.90 su XAUUSD. Ecco i numeri reali."

LISTA DELLA SPESA — formato ESATTO per ogni riga (icona + dato + valore esatto + breve contesto):
💰 Profitto Totale: +X [valuta] (+X%)
📈 Crescita del Conto: +X%
🛡️ Drawdown Massimo: -X% (il rischio è rimasto sempre sotto controllo)
📊 Operazioni Totali: X trades
⚡ Attività Media: X trades/settimana [calcola se visibile il periodo, altrimenti usa il totale]
🔄 Costi Operativi: X commissioni / X swap [se 0: "zero commissioni, zero swap — tutto profitto"]

RIGA CHIUSURA (scegli in base a ciò che vedi nello screenshot):
→ Se la linea dell'equity è liscia e crescente senza spike negativi: "La curva del conto cresce in modo costante — nessuna montagna russa emotiva, solo risultati sistematici."
→ Se ci sono molti trade: "Il sistema è attivo ogni giorno — lavora anche quando tu non guardi lo schermo. Questo è il vero reddito passivo."

CTA forte e diretta con link

TONO: energico, visuale, orientato all'impatto immediato. Emoji strategici: 🔥💰📈🛡️⚡. Frasi brevissime. Zero spiegazioni accademiche.
ZERO asterischi. Prima versione IT completa, poi ──────────────, poi versione EN.

CTA italiana:
👉 CLICCA QUI PER [TESTO VARIABILE]:
${lIT}

CTA inglese:
👉 CLICK HERE TO [VARIABLE TEXT]:
${lEN}`;
}
