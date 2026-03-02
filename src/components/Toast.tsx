import { useApp } from '../context/AppContext';

export function Toast() {
  const { toast, hideToast } = useApp();
  if (!toast) return null;

  const colors: Record<string, string> = {
    info:    'bg-[var(--bg3)] border-[var(--gold)]   text-[var(--text)]',
    error:   'bg-[#2a1010]   border-[var(--red)]    text-[var(--red)]',
    success: 'bg-[#0f1f10]   border-[var(--green)]  text-[var(--green)]',
  };

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3
        px-5 py-3 rounded-[var(--radius-sm)] border shadow-xl
        animate-[slideUp_0.3s_ease] max-w-[90vw] cursor-pointer
        ${colors[toast.type]}`}
      onClick={hideToast}
    >
      <span className="text-sm font-medium">{toast.text}</span>
      <button className="opacity-60 hover:opacity-100 text-xs leading-none">✕</button>
    </div>
  );
}
