// DeepL Free API client
// https://api-free.deepl.com

const DEEPL_KEY = '10425c19-c785-4d5a-90a4-39504f225ecf:fx';
const DEEPL_URL  = 'https://api-free.deepl.com/v2/translate';

/** Map dalle nostre lingua-code ai codici DeepL */
const LANG_MAP: Record<string, string> = {
  it: 'IT',
  en: 'EN-GB',
  es: 'ES',
  fr: 'FR',
  de: 'DE',
};

export async function translateWithDeepL(
  text: string,
  fromCode: string,
  toCode: string,
): Promise<string> {
  const sourceLang = LANG_MAP[fromCode];
  const targetLang = LANG_MAP[toCode];

  if (!sourceLang || !targetLang) {
    throw new Error(`Lingua non supportata: ${fromCode} → ${toCode}`);
  }

  const res = await fetch(DEEPL_URL, {
    method: 'POST',
    headers: {
      'Authorization': `DeepL-Auth-Key ${DEEPL_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: [text],
      source_lang: sourceLang,
      target_lang: targetLang,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    if (res.status === 403) throw new Error('Chiave DeepL non valida o scaduta (403)');
    if (res.status === 456) throw new Error('Quota DeepL esaurita per questo mese (456)');
    throw new Error(`DeepL errore ${res.status}: ${body}`);
  }

  const data = await res.json() as { translations: { text: string }[] };
  return data.translations[0]?.text ?? '';
}
