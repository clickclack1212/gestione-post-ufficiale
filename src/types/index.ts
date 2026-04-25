export type Tab = 'generate' | 'prog' | 'weekly' | 'calendar' | 'optimize' | 'translate' | 'chat' | 'settings';
export type AppScreen = 'landing' | 'app' | 'xauusd' | 'spotify';
export type XauusdTab = 'bias' | 'macro' | 'calendar' | 'pattern' | 'journal' | 'gonogo' | 'risk' | 'debrief' | 'chat';
export type Tone = 'assertivo' | 'hype' | 'essenziale';
export type EmojiLevel = '1-2' | '2-4' | '4-5';
export type ProgMode = 'daily_signal' | 'daily_nosignal' | 'alt_signal' | 'alt_nosignal' | 'weekend_sab' | 'weekend_dom';
export type AltPlan = 'A' | 'B';
export type WkDay = 'sabato' | 'domenica';
export type GenMode = 'single' | 'day';

export interface Config {
  apiKey: string;
  channelName: string;
  traderName: string;
  linkIT: string;
  linkEN: string;
  currencies: string[];
  calFrom: string;
  calTo: string;
}

export interface Counter {
  date: string;
  total: number;
  pro3: number;   // model index 0
  pro25: number;  // model index 1
  m2: number;     // model index 2
  m3: number;     // model index 3
}

export interface MessageType {
  id: string;
  icon: string;
  name: string;
  time: string;
  shot: boolean;
  desc: string;
}

export interface DailySlot {
  id: string;
  time: string;
  label: string;
  shot: boolean;
  tag?: string;
}

export interface AltType {
  id: string;
  icon: string;
  name: string;
  time: string;
  shot: boolean;
  color: string;
}

export interface WkType {
  id: string;
  icon: string;
  name: string;
  time: string;
  color: string;
}

export interface CalendarEvent {
  time: string;
  currency: string;
  title: string;
  impact: string;
  forecast?: string;
  previous?: string;
  date?: string;
}

export interface BilingualText {
  it: string;
  en: string;
}

export interface SlotResult {
  it: string;
  en: string;
}

export interface GeminiModel {
  id: string;
  label: string;
}

// ── Gestione Contenuti ─────────────────────────────────────────────────────
export type ToneVoice = 'aggressivo' | 'informativo';
export type PostVariant = 'hype' | 'seria' | 'breve';
export type PostBuilderType = 'nuovo_servizio' | 'social_proof' | 'promemoria' | 'referral';

export interface ServizioItem {
  id: string;
  nome: string;
  durata: string;
  prezzo: string;
  benefit: string[];
  emoji: string;
}

export interface RecensioneItem {
  id: string;
  nomeUtente?: string;
  testo: string;
  servizioId: string;
  stelle: number;
}

export interface ReferralItem {
  id: string;
  obiettivo: string;
  condizione: string;
}

export interface GestioneDB {
  servizi: ServizioItem[];
  recensioni: RecensioneItem[];
  referral: ReferralItem[];
  adminNotes: string;
  botHandle: string;
}
