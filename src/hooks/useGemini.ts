import { useState, useRef, useCallback } from 'react';
import { gemini } from '../services/gemini';
import { useApp } from '../context/AppContext';
import { getCounter } from '../services/storage';

export function useGemini() {
  const { config, showToast, setActiveModelIdx, setCounter } = useApp();
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback(() => {
    setElapsed(0);
    timerRef.current = setInterval(() => {
      setElapsed(s => s + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setElapsed(0);
  }, []);

  const run = useCallback(
    async (
      prompt: string,
      temp = 0.88,
      img: string | string[] | null = null,
    ): Promise<string> => {
      if (!config.apiKey) {
        showToast('Inserisci prima la tua API Key nelle impostazioni.', 'error');
        return '';
      }
      setLoading(true);
      startTimer();
      try {
        const result = await gemini(
          prompt,
          config.apiKey,
          temp,
          img,
          (msg) => showToast(msg),
          (idx) => {
            setActiveModelIdx(idx);
            setCounter(getCounter());
          },
        );
        setCounter(getCounter());
        return result;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        showToast(msg, 'error');
        return '';
      } finally {
        setLoading(false);
        stopTimer();
      }
    },
    [config.apiKey, showToast, setActiveModelIdx, setCounter, startTimer, stopTimer],
  );

  return { loading, elapsed, run };
}
