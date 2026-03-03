import type { Config, Counter } from '../types';
import { STORE, COUNTER_KEY } from '../constants/data';

const DEFAULTS: Config = {
  apiKey: '',
  channelName: '',
  traderName: '',
  linkIT: 'https://t.me/m/jYmEudCONzYy',
  linkEN: 'https://t.me/m/b9dalhvdOWJh',
  currencies: ['USD', 'EUR', 'GBP', 'XAU'],
  calFrom: '',
  calTo: '',
};

export function getConfig(): Config {
  try {
    const raw = localStorage.getItem(STORE);
    return { ...DEFAULTS, ...(raw ? JSON.parse(raw) : {}) };
  } catch {
    return DEFAULTS;
  }
}

export function saveConfig(cfg: Partial<Config>): Config {
  const current = getConfig();
  const next = { ...current, ...cfg };
  localStorage.setItem(STORE, JSON.stringify(next));
  return next;
}

export function getCounter(): Counter {
  try {
    const raw = localStorage.getItem(COUNTER_KEY);
    const d: Counter = raw ? JSON.parse(raw) : {};
    const today = new Date().toDateString();
    if ((d as { date?: string }).date !== today) {
      return { date: today, total: 0, pro3: 0, pro25: 0, m2: 0, m3: 0 };
    }
    // Migrate old format (missing m2/m3)
    if (d.m2 === undefined) d.m2 = 0;
    if (d.m3 === undefined) d.m3 = 0;
    return d;
  } catch {
    return { date: new Date().toDateString(), total: 0, pro3: 0, pro25: 0, m2: 0, m3: 0 };
  }
}

export function incCounter(modelIdx: number): Counter {
  const d = getCounter();
  d.total++;
  if (modelIdx === 0) d.pro3++;
  else if (modelIdx === 1) d.pro25++;
  else if (modelIdx === 2) d.m2++;
  else d.m3++;
  localStorage.setItem(COUNTER_KEY, JSON.stringify(d));
  return d;
}

export function getLinkIT(cfg: Config): string {
  return cfg.linkIT || DEFAULTS.linkIT;
}

export function getLinkEN(cfg: Config): string {
  return cfg.linkEN || DEFAULTS.linkEN;
}
