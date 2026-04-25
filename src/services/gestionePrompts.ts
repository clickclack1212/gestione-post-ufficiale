import type { ToneVoice, PostVariant, ServizioItem, RecensioneItem } from '../types';

// ── Tone instructions ──────────────────────────────────────────────────────
function toneBlock(tone: ToneVoice): string {
  if (tone === 'aggressivo') {
    return `TONO — AGGRESSIVO/VENDITA:
- Usa 6-10 emoji distribuite nel post (🎧 🔥 ⚡️ 💳 🎵 💰 🚀 ✅)
- Frasi brevi e d'impatto: massimo 1 riga per frase
- FOMO forte: usa frasi come "Solo oggi", "Non aspettare", "Chi aspetta perde"
- Maiuscole strategiche per le parole chiave
- CTA diretta, urgente, imperativa alla fine`;
  }
  return `TONO — INFORMATIVO:
- Emoji moderate: 3-5 nel post, solo dove contestuali
- Tono calmo, professionale, dettagliato
- Spiega i benefit con chiarezza e logica
- Nessuna urgenza artificiale
- CTA gentile e invitante alla fine`;
}

// ── Variant rules ─────────────────────────────────────────────────────────
function variantBlock(variant: PostVariant): string {
  const map: Record<PostVariant, string> = {
    hype:  'VARIANTE HYPE: apertura esplosiva in **grassetto**, massima energia, emoji ovunque, ogni frase è un colpo',
    seria: 'VARIANTE SERIA/PROFESSIONALE: struttura pulita, tono equilibrato e credibile, nessuna frase vuota',
    breve: 'VARIANTE BREVE: massimo 60-80 parole totali, un solo benefit principale, una sola CTA, nessuna ripetizione',
  };
  return map[variant];
}

// ── Telegram formatting rules (shared) ────────────────────────────────────
const TG_RULES = `REGOLE TASSATIVE FORMATO TELEGRAM:
- Grassetto: **testo** (solo asterischi doppi, mai triplici)
- Corsivo: __testo__ (doppio underscore)
- Link: [testo cliccabile](URL)
- VIETATO usare ### o # — Telegram non li renderizza
- VIETATO usare liste con - o * — usa bullet emoji: ✅ 🎯 ⚡️ 🎧
- Righe vuote tra i blocchi per leggibilità
- Massimo 150-200 parole (una schermata smartphone)
- Genera SOLO il testo del post, zero spiegazioni extra`;

// ── 1. Nuovo Servizio ─────────────────────────────────────────────────────
export function buildNuovoServizioPrompt(
  s: ServizioItem,
  botHandle: string,
  tone: ToneVoice,
  variant: PostVariant,
): string {
  const benefitList = s.benefit.map(b => `✅ ${b}`).join('\n');
  return `Sei un copywriter esperto di marketing su Telegram per servizi digitali premium.

Genera UN SOLO post Telegram per promuovere questo servizio:

Servizio: ${s.emoji} ${s.nome}
Durata: ${s.durata}
Prezzo: ${s.prezzo}
Benefit:
${benefitList}

${toneBlock(tone)}

${variantBlock(variant)}

STRUTTURA CONSIGLIATA:
BLOCCO 1: titolo/gancio in **grassetto** con emoji
BLOCCO 2: lista benefit con bullet emoji
BLOCCO 3: prezzo con framing positivo
BLOCCO 4: CTA finale con tag bot

${TG_RULES}

Il post deve terminare con: ${botHandle}`;
}

// ── 2. Social Proof / Recensioni ──────────────────────────────────────────
export function buildSocialProofPrompt(
  recensioni: Pick<RecensioneItem, 'nomeUtente' | 'testo' | 'stelle'>[],
  botHandle: string,
  tone: ToneVoice,
  variant: PostVariant,
): string {
  const recList = recensioni.map(r => {
    const stars = '⭐️'.repeat(Math.min(r.stelle, 5));
    const nome = r.nomeUtente ? `**${r.nomeUtente}**` : '**Cliente verificato**';
    return `${stars}\n${nome}: ❝${r.testo}❞`;
  }).join('\n\n');

  return `Sei un copywriter esperto di marketing su Telegram per servizi digitali premium.

Genera UN SOLO post Telegram di social proof usando queste recensioni reali dei clienti:

${recList}

${toneBlock(tone)}

${variantBlock(variant)}

STRUTTURA CONSIGLIATA:
BLOCCO 1: apertura che introduce le recensioni (1 riga)
BLOCCO 2: le recensioni con stelle ed eventuali nomi
BLOCCO 3: frase di chiusura fissa — DEVI includere esattamente: "Unisciti ai nostri 80+ clienti soddisfatti 🙌"
BLOCCO 4: CTA con tag bot

${TG_RULES}

Il post deve terminare con: ${botHandle}`;
}

// ── 3. Promemoria Giornaliero ──────────────────────────────────────────────
export function buildPromemoriaPrompt(
  botHandle: string,
  tone: ToneVoice,
  variant: PostVariant,
): string {
  return `Sei un copywriter esperto di marketing su Telegram per servizi digitali premium.

Genera UN SOLO post Telegram promemoria giornaliero che comunichi queste 3 informazioni chiave:
1. 💳 PayPal è sempre attivo come metodo di pagamento sicuro
2. ⚡️ Gli account premium sono sempre disponibili e si attivano in pochi minuti
3. 🎵 È possibile attivare il premium direttamente sul profilo personale dell'utente (non serve un profilo separato)

${toneBlock(tone)}

${variantBlock(variant)}

STRUTTURA CONSIGLIATA:
BLOCCO 1: apertura breve e diretta (1 riga)
BLOCCO 2: le 3 info con bullet emoji
BLOCCO 3: CTA con tag bot

${TG_RULES}

Massimo 80-100 parole (più breve del solito, è un promemoria rapido).
Il post deve terminare con: ${botHandle}`;
}

// ── 4. Referral & Guadagno ────────────────────────────────────────────────
export function buildReferralPrompt(
  obiettivo: string,
  condizione: string,
  botHandle: string,
  tone: ToneVoice,
  variant: PostVariant,
): string {
  return `Sei un copywriter esperto di marketing su Telegram per servizi digitali premium.

Genera UN SOLO post Telegram che spieghi il programma referral con queste caratteristiche:

🎁 Premio: ${obiettivo}
👥 Condizione: ${condizione}
🤖 Bot: ${botHandle}

Il post DEVE spiegare questi 3 passi in modo chiaro:
1. Come trovare e generare il proprio link referral personale nel bot (${botHandle})
2. Come condividere il link ad amici o sui social
3. Cosa si ottiene quando gli amici si attivano (il premio: ${obiettivo})

${toneBlock(tone)}

${variantBlock(variant)}

STRUTTURA CONSIGLIATA:
BLOCCO 1: apertura con il premio come gancio
BLOCCO 2: i 3 passi numerati con emoji
BLOCCO 3: CTA finale con tag bot

${TG_RULES}

Il post deve terminare con: ${botHandle}`;
}
