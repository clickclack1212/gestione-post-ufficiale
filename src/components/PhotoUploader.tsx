import { useRef, useState } from 'react';

interface Props {
  onPhoto: (base64: string) => void;
  onClear: () => void;
  preview: string | null;
  label?: string;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function PhotoUploader({ onPhoto, onClear, preview, label = 'Allega Screenshot / Foto' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) return;
    const b64 = await fileToBase64(file);
    onPhoto(b64);
  }

  return (
    <div>
      <label className="block text-xs text-[var(--text3)] uppercase tracking-widest mb-2">{label}</label>

      {preview ? (
        <div className="relative inline-block">
          <img
            src={preview}
            alt="preview"
            className="max-h-48 rounded-lg border border-[var(--bg3)] object-contain"
          />
          <button
            className="absolute top-1 right-1 bg-[var(--bg)] border border-[var(--bg3)] text-[var(--text3)]
              rounded-full w-6 h-6 flex items-center justify-center text-xs hover:text-[var(--red)] transition-colors"
            onClick={onClear}
            title="Rimuovi foto"
          >
            ✕
          </button>
        </div>
      ) : (
        <div
          className={`drop-zone ${dragging ? 'over' : ''}`}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => {
            e.preventDefault();
            setDragging(false);
            const f = e.dataTransfer.files[0];
            if (f) handleFile(f);
          }}
          onPaste={e => {
            const items = Array.from(e.clipboardData.items);
            for (const item of items) {
              if (item.type.startsWith('image/')) {
                const f = item.getAsFile();
                if (f) handleFile(f);
                break;
              }
            }
          }}
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
        >
          <span className="text-2xl mb-2 block">📷</span>
          <span className="text-xs text-[var(--text3)]">
            Clicca, trascina o incolla (Ctrl+V) un&apos;immagine
          </span>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = '';
            }}
          />
        </div>
      )}
    </div>
  );
}

// Multi-photo version
interface MultiProps {
  onPhotos: (base64List: string[]) => void;
  previews: string[];
  onRemove: (idx: number) => void;
  label?: string;
  max?: number;
}

export function MultiPhotoUploader({ onPhotos, previews, onRemove, label = 'Allega Foto', max = 5 }: MultiProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  async function handleFiles(files: FileList | File[]) {
    const arr = Array.from(files).filter(f => f.type.startsWith('image/'));
    const remaining = max - previews.length;
    const toProcess = arr.slice(0, remaining);
    const results: string[] = [];
    for (const f of toProcess) {
      const b64 = await fileToBase64(f);
      results.push(b64);
    }
    if (results.length > 0) onPhotos(results);
  }

  return (
    <div>
      <label className="block text-xs text-[var(--text3)] uppercase tracking-widest mb-2">
        {label} <span className="normal-case opacity-60">({previews.length}/{max})</span>
      </label>

      {/* Previews */}
      {previews.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {previews.map((src, i) => (
            <div key={i} className="relative">
              <img
                src={src}
                alt={`foto ${i + 1}`}
                className="h-20 w-20 object-cover rounded-lg border border-[var(--bg3)]"
              />
              <button
                className="absolute top-0.5 right-0.5 bg-[var(--bg)] border border-[var(--bg3)] text-[var(--text3)]
                  rounded-full w-5 h-5 flex items-center justify-center text-[10px] hover:text-[var(--red)] transition-colors"
                onClick={() => onRemove(i)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {previews.length < max && (
        <div
          className={`drop-zone ${dragging ? 'over' : ''}`}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => {
            e.preventDefault();
            setDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => inputRef.current?.click()}
        >
          <span className="text-xl mb-1 block">📷</span>
          <span className="text-xs text-[var(--text3)]">
            Clicca o trascina le immagini (max {max})
          </span>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={e => {
              if (e.target.files) handleFiles(e.target.files);
              e.target.value = '';
            }}
          />
        </div>
      )}
    </div>
  );
}
