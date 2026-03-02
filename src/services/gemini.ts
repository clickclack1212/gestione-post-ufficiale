import { GEMINI_MODELS } from '../constants/data';
import { incCounter } from './storage';

let activeModelIdx = 0;

export function getActiveModelIdx() { return activeModelIdx; }
export function getActiveModelLabel() { return GEMINI_MODELS[activeModelIdx].label; }

export type ModelChangeCallback = (modelIdx: number) => void;
export type ToastCallback = (msg: string) => void;

async function callModel(
  modelId: string,
  prompt: string,
  apiKey: string,
  temp: number,
  img: string | string[] | null,
): Promise<{ res: Response; d: unknown }> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;
  const parts: unknown[] = [];
  const imgs = Array.isArray(img) ? img : (img ? [img] : []);
  for (const i of imgs) {
    let mime = 'image/jpeg';
    let data = i;
    if (i.startsWith('data:')) {
      const commaIdx = i.indexOf(',');
      const meta = i.slice(0, commaIdx);
      data = i.slice(commaIdx + 1);
      mime = meta.match(/:(.*?);/)?.[1] || 'image/jpeg';
    }
    parts.push({ inline_data: { mime_type: mime, data } });
  }
  parts.push({ text: prompt });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { temperature: temp, maxOutputTokens: 4096 },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const d = await res.json();
    return { res, d };
  } catch (e) {
    clearTimeout(timeout);
    if ((e as Error).name === 'AbortError') throw new Error('TIMEOUT');
    throw e;
  }
}

export async function gemini(
  prompt: string,
  apiKey: string,
  temp = 0.88,
  img: string | string[] | null = null,
  onToast?: ToastCallback,
  onModelChange?: ModelChangeCallback,
): Promise<string> {
  for (let i = activeModelIdx; i < GEMINI_MODELS.length; i++) {
    const model = GEMINI_MODELS[i];
    let res: Response, d: unknown;
    try {
      ({ res, d } = await callModel(model.id, prompt, apiKey, temp, img));
    } catch (e) {
      if ((e as Error).message === 'TIMEOUT') {
        if (i + 1 < GEMINI_MODELS.length) {
          onToast?.(`${model.label} timeout (60s) → ${GEMINI_MODELS[i+1].label}...`);
          continue;
        }
        throw new Error('Timeout su tutti i modelli. Riprova tra poco.');
      }
      if (i + 1 < GEMINI_MODELS.length) {
        onToast?.(`${model.label} non raggiungibile → ${GEMINI_MODELS[i+1].label}...`);
        continue;
      }
      throw new Error('Nessun modello raggiungibile. Controlla la connessione.');
    }
    if (res.ok) {
      const text = (d as { candidates?: { content?: { parts?: { text?: string }[] } }[] })
        ?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        if (i + 1 < GEMINI_MODELS.length) {
          onToast?.(`${model.label} risposta vuota — passo a ${GEMINI_MODELS[i+1].label}...`);
          continue;
        }
        throw new Error('Risposta vuota da tutti i modelli');
      }
      if (i > activeModelIdx) {
        activeModelIdx = i;
        onModelChange?.(i);
        onToast?.(`Passato a ${model.label}`);
      }
      incCounter(i);
      return text;
    }
    const msg = (d as { error?: { message?: string } })?.error?.message || '';
    const status = res.status;
    if (status === 403 || msg.toLowerCase().includes('api key') || msg.toLowerCase().includes('api_key')) {
      throw new Error('API Key non valida. Controlla le impostazioni.');
    }
    if ([429, 404, 503, 500, 502].includes(status)) {
      if (i + 1 < GEMINI_MODELS.length) {
        const reason = status === 429 ? 'limite quota' : status === 503 ? 'sovraccarico' : `errore ${status}`;
        onToast?.(`${model.label} (${reason}) → ${GEMINI_MODELS[i+1].label}...`);
        continue;
      }
      throw new Error(
        status === 429
          ? 'Limite quota raggiunto su tutti i modelli. Riprova tra qualche minuto.'
          : `Tutti i modelli non disponibili (${status}). Riprova tra poco.`,
      );
    }
    throw new Error(`Errore ${status}: ${msg}`);
  }
  throw new Error('Nessun modello disponibile.');
}
