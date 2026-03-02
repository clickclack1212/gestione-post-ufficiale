import type { MessageType, DailySlot, AltType, WkType, GeminiModel } from '../types';

export const STORE = 'xauusd_v3';
export const COUNTER_KEY = 'xauusd_counter';

export const GEMINI_MODELS: GeminiModel[] = [
  { id: 'gemini-3.1-pro-preview', label: 'Gemini 3.1 Pro' },
  { id: 'gemini-2.5-pro',         label: 'Gemini 2.5 Pro' },
];

export const DEFAULT_LINK_IT = 'https://t.me/m/jYmEudCONzYy';
export const DEFAULT_LINK_EN = 'https://t.me/m/b9dalhvdOWJh';

export const TYPES: MessageType[] = [
  { id: 'buongiorno',           icon: '🌅', name: 'Buongiorno',                 time: '07:00', shot: false },
  { id: 'risultati_ieri',       icon: '📊', name: 'Risultati Ieri',             time: '08:00', shot: true  },
  { id: 'ready_segnale',        icon: '🎯', name: 'Ready Segnale',              time: '09:30', shot: false },
  { id: 'segnale_xauusd',       icon: '📡', name: 'Segnale XAUUSD',             time: '10:00', shot: true  },
  { id: 'risultato_segnale',    icon: '✅', name: 'Risultato Segnale',          time: 'Dopo',  shot: true  },
  { id: 'notizie_giorno',       icon: '📰', name: 'Notizie Gold',               time: '13:00', shot: false },
  { id: 'risultati_clienti',    icon: '🏆', name: 'Risultati Clienti',          time: 'Live',  shot: true  },
  { id: 'aggiornamento',        icon: '🔄', name: 'Aggiornamento Trade',        time: 'Live',  shot: true  },
  { id: 'chiusura_giornata',    icon: '🌙', name: 'Chiusura Giornata',          time: '17:00', shot: true  },
  { id: 'engagement',           icon: '💡', name: 'Engagement',                 time: 'Varie', shot: false },
  { id: 'primi_risultati',      icon: '⚡', name: 'Primi Risultati',            time: 'Mat.',  shot: true  },
  { id: 'primi_risultati_copy', icon: '🚀', name: 'Primi Risultati\nCopyTrading', time: 'Mat.', shot: true  },
];

export const DAILY_SLOTS: DailySlot[] = [
  { id: 'd_buongiorno',      time: '07:00', label: 'Buongiorno + Hype Motivazione',        shot: false, tag: 'mindset'   },
  { id: 'd_risultati_ieri',  time: '08:00', label: 'Risultati Ieri VIP + CopyTrading',      shot: true,  tag: 'proof'     },
  { id: 'd_primi_risultati', time: '09:00', label: 'Primi Risultati della Mattina',          shot: true,  tag: 'proof'     },
  { id: 'd_ready',           time: '09:30', label: 'Ready Segnale',                          shot: false, tag: 'operativo' },
  { id: 'd_segnale',         time: '10:00', label: 'Segnale XAUUSD',                         shot: false, tag: 'operativo' },
  { id: 'd_risultato_segn',  time: '11:30', label: 'Risultato Segnale',                      shot: true,  tag: 'operativo' },
  { id: 'd_copy_live',       time: '12:00', label: 'Risultati Attuali CopyTrading',          shot: true,  tag: 'proof'     },
  { id: 'd_notizie',         time: '13:00', label: 'Calendario Economico',                   shot: true,  tag: 'operativo' },
  { id: 'd_copy_postnews',   time: '15:00', label: 'Risultati CopyTrading Post News',        shot: true,  tag: 'proof'     },
  { id: 'd_educativo',       time: '17:00', label: 'Post Educativo',                         shot: false, tag: 'educativo' },
  { id: 'd_recensioni',      time: '19:00', label: 'Recensioni del Giorno + Recap',          shot: true,  tag: 'proof'     },
  { id: 'd_chiusura',        time: '21:00', label: 'Chiusura',                               shot: false, tag: 'mindset'   },
];

export const DAILY_SLOTS_NS: DailySlot[] = [
  { id: 'ns_buongiorno',    time: '07:00', label: 'Buongiorno + Hype Motivazione',      shot: false },
  { id: 'ns_risultati_ieri',time: '08:00', label: 'Risultati Ieri VIP + CopyTrading',   shot: true  },
  { id: 'ns_copy_mattina',  time: '09:00', label: 'Risultati Mattutini CopyTrading',    shot: true  },
  { id: 'ns_vip_mattina',   time: '09:30', label: 'Risultati Mattutini VIP',            shot: true  },
  { id: 'ns_hype_vip',      time: '10:30', label: 'Hype Segnale Canale VIP',            shot: false },
  { id: 'ns_hype_copy',     time: '11:30', label: 'Hype Prossimo Segnale CopyTrading',  shot: false },
  { id: 'ns_calendario',    time: '13:00', label: 'Calendario Economico',               shot: true  },
  { id: 'ns_post_news',     time: '15:00', label: 'Risultati Post News',                shot: true  },
  { id: 'ns_recensioni',    time: '18:00', label: 'Recensioni Clienti del Giorno',      shot: true  },
  { id: 'ns_recap',         time: '21:00', label: 'Recap Finale + Chiusura Giorno',     shot: false },
];

export const ALT_TYPES: AltType[] = [
  { id: 'alt_mindset',   icon: '☀️', name: 'Mindset\nApertura',        time: '07:00', shot: false, color: '#22c55e' },
  { id: 'alt_social_am', icon: '🥇', name: 'Social Proof\nMattina',     time: '08:00', shot: true,  color: '#3b82f6' },
  { id: 'alt_ready',     icon: '🎯', name: 'Ready\nSegnale',            time: '09:00', shot: false, color: '#f97316' },
  { id: 'alt_segnale',   icon: '📡', name: 'Segnale\nGold',             time: '10:00', shot: false, color: '#FE9920' },
  { id: 'alt_update',    icon: '⚡️', name: 'Update +\nMini Lezione',    time: '11:30', shot: true,  color: '#FE9920' },
  { id: 'alt_educativo', icon: '📖', name: 'Post\nEducativo',           time: '13:00', shot: false, color: '#f97316' },
  { id: 'alt_social_pm', icon: '💬', name: 'Social Proof\n+ Scarsità',  time: '15:00', shot: true,  color: '#3b82f6' },
  { id: 'alt_segnale2',  icon: '📊', name: '2° Segnale\no Recap',       time: '16:30', shot: false, color: '#FE9920' },
  { id: 'alt_antiscuse', icon: '💪', name: 'Mindset\nAnti-Scuse',       time: '18:00', shot: false, color: '#22c55e' },
  { id: 'alt_carosello', icon: '🏆', name: 'Carosello\nRisultati',      time: '19:30', shot: true,  color: '#3b82f6' },
  { id: 'alt_recap',     icon: '📋', name: 'Recap\nGiornata',           time: '21:00', shot: false, color: '#a855f7' },
  { id: 'alt_chiusura',  icon: '🌙', name: 'Chiusura\nMotivazionale',   time: '22:30', shot: false, color: '#a855f7' },
];

export const ALT_TYPES_B: AltType[] = [
  { id: 'b_buongiorno',  icon: '🌅', name: 'Buongiorno\nSolo Chi È Dentro', time: '07:00', shot: false, color: '#22c55e' },
  { id: 'b_risultato',   icon: '💰', name: 'Risultato VIP/Copy\ndi Ieri',   time: '08:00', shot: true,  color: '#3b82f6' },
  { id: 'b_carosello',   icon: '💬', name: 'Carosello\nMini Feedback',      time: '09:00', shot: true,  color: '#3b82f6' },
  { id: 'b_mindset',     icon: '🧠', name: 'Perché Chi È\nDentro Resta',    time: '10:30', shot: false, color: '#22c55e' },
  { id: 'b_copytrading', icon: '⚙️', name: 'Come Funziona\nil CopyTrading', time: '12:00', shot: false, color: '#FE9920' },
  { id: 'b_story',       icon: '📖', name: 'Storytelling\nViaggio Cliente', time: '13:30', shot: false, color: '#f97316' },
  { id: 'b_recap_sett',  icon: '📊', name: 'Recap Settimanale\nVIP/Copy',   time: '15:00', shot: false, color: '#FE9920' },
  { id: 'b_obiezioni',   icon: '❓', name: 'Q&A\nObiez. Classiche',         time: '16:30', shot: false, color: '#f97316' },
  { id: 'b_hype_prox',   icon: '🔥', name: 'Hype\nSetup in Arrivo',         time: '18:00', shot: false, color: '#ef4444' },
  { id: 'b_lifestyle',   icon: '🏖', name: 'Lifestyle +\nRisultati Cliente',time: '19:30', shot: true,  color: '#a855f7' },
  { id: 'b_recap_day',   icon: '📋', name: 'Recap Giornata\nSolo Clienti',  time: '21:00', shot: false, color: '#a855f7' },
  { id: 'b_chiusura',    icon: '🌙', name: 'Chiusura\nMentale Forte',       time: '22:30', shot: false, color: '#a855f7' },
];

export const WK_TYPES_SAB: WkType[] = [
  { id: 'sab_buongiorno', icon: '☀️', name: 'Buongiorno\nWeekend',        time: '08:00', color: '#22c55e' },
  { id: 'sab_recap',      icon: '📊', name: 'Weekly Recap\nMacro+Tecnica', time: '11:00', color: '#FFAD47' },
  { id: 'sab_offerta',    icon: '🔥', name: 'Offerta\nScarsità',           time: '15:00', color: '#ef4444' },
  { id: 'sab_risultati',  icon: '💰', name: 'Risultati Pips\nSettimana',   time: '18:00', color: '#3b82f6' },
];

export const WK_TYPES_DOM: WkType[] = [
  { id: 'dom_quiete',       icon: '⛈',  name: 'Quiete prima\ndella Tempesta', time: '09:00', color: '#22c55e' },
  { id: 'dom_teaser',       icon: '🙂',  name: 'Teaser\nOutlook',              time: '11:00', color: '#f97316' },
  { id: 'dom_outlook',      icon: '🚀',  name: 'Weekly Outlook\nCalendario',   time: '13:00', color: '#FFAD47' },
  { id: 'dom_social_proof', icon: '💬',  name: 'Social Proof\nScreenshot',     time: '15:00', color: '#a855f7' },
  { id: 'dom_recap',        icon: '📈',  name: 'Recap\nVIP vs Copy',           time: '17:00', color: '#3b82f6' },
  { id: 'dom_urgenza',      icon: '⚠️',  name: 'Avviso\nRitardatari',          time: '20:00', color: '#ef4444' },
];

export const ALT_PLAN_INFO = {
  A: {
    title: '◈ Piano A — Con Free Signal · 12 Slot',
    desc: 'Strategia mista: segnale gratuito come esca + marketing, mindset e social proof. 3 slot tecnici, 3 social proof, 4 mindset, 2 educativi.',
    slots: [
      { label: '07:00 Mindset',       bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.2)',   color: '#22c55e' },
      { label: '08:00 Proof',          bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.2)',  color: '#3b82f6' },
      { label: '09:00 Ready',          bg: 'rgba(249,115,22,0.1)',  border: 'rgba(249,115,22,0.2)',  color: '#f97316' },
      { label: '10:00 Segnale',        bg: 'rgba(254,153,32,0.1)', border: 'rgba(254,153,32,0.25)', color: '#FFAD47' },
      { label: '11:30 Update',         bg: 'rgba(254,153,32,0.1)', border: 'rgba(254,153,32,0.25)', color: '#FFAD47' },
      { label: '13:00 Edu',            bg: 'rgba(249,115,22,0.1)',  border: 'rgba(249,115,22,0.2)',  color: '#f97316' },
      { label: '15:00 Proof+Scarsità', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.2)',  color: '#3b82f6' },
      { label: '16:30 Segnale2',       bg: 'rgba(254,153,32,0.1)', border: 'rgba(254,153,32,0.25)', color: '#FFAD47' },
      { label: '18:00 Anti-Scuse',     bg: 'rgba(34,197,94,0.1)',  border: 'rgba(34,197,94,0.2)',   color: '#22c55e' },
      { label: '19:30 Carosello',      bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.2)',  color: '#3b82f6' },
      { label: '21:00 Recap',          bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.2)',  color: '#a855f7' },
      { label: '22:30 Chiusura',       bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.2)',  color: '#a855f7' },
    ],
  },
  B: {
    title: '◈ Piano B — Solo VIP/Clienti · 12 Slot',
    desc: 'Full funnel senza segnali free. Risultati, storytelling, social proof, Q&A obiezioni, hype setup e chiusure motivazionali. Per i giorni "chiusi".',
    slots: [
      { label: '07:00 Buongiorno',   bg: 'rgba(34,197,94,0.1)',  border: 'rgba(34,197,94,0.2)',   color: '#22c55e' },
      { label: '08:00 Risultato VIP',bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.2)',  color: '#3b82f6' },
      { label: '09:00 Carosello',    bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.2)',  color: '#3b82f6' },
      { label: '10:30 Mindset',      bg: 'rgba(34,197,94,0.1)',  border: 'rgba(34,197,94,0.2)',   color: '#22c55e' },
      { label: '12:00 CopyTrading',  bg: 'rgba(254,153,32,0.1)',border: 'rgba(254,153,32,0.25)', color: '#FFAD47' },
      { label: '13:30 Storytelling', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.2)',  color: '#f97316' },
      { label: '15:00 Recap Sett.',  bg: 'rgba(254,153,32,0.1)',border: 'rgba(254,153,32,0.25)', color: '#FFAD47' },
      { label: '16:30 Q&A Obiezioni',bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.2)',  color: '#f97316' },
      { label: '18:00 Hype Setup',   bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.2)',   color: '#ef4444' },
      { label: '19:30 Lifestyle',    bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.2)',  color: '#a855f7' },
      { label: '21:00 Recap Clienti',bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.2)',  color: '#a855f7' },
      { label: '22:30 Chiusura',     bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.2)',  color: '#a855f7' },
    ],
  },
};

export const ALL_CURRENCIES = ['USD','EUR','GBP','JPY','CAD','AUD','CHF','NZD','XAU','CNY'];

export const LANG_LABELS: Record<string,string> = {
  it: '🇮🇹 Italiano', en: '🇬🇧 Inglese', es: '🇪🇸 Spagnolo', fr: '🇫🇷 Francese', de: '🇩🇪 Tedesco',
};
export const LANG_NAMES: Record<string,string> = {
  it: 'italiano', en: 'inglese', es: 'spagnolo', fr: 'francese', de: 'tedesco',
};

export const NO_FIELDS_MAIN = ['buongiorno','ready_segnale','engagement','chiusura_giornata'];
export const WK_NO_FIELDS   = ['sab_buongiorno','dom_quiete','dom_teaser','dom_urgenza'];
export const ALT_NO_FIELDS_A = ['alt_mindset','alt_ready','alt_educativo','alt_antiscuse','alt_carosello','alt_recap','alt_chiusura'];
export const ALT_NO_FIELDS_B = ['b_buongiorno','b_mindset','b_copytrading','b_story','b_obiezioni','b_hype_prox','b_recap_day','b_chiusura'];
