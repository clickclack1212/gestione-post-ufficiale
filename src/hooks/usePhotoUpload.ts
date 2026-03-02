import { useState, useCallback, useRef } from 'react';

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip data URL prefix — keep only base64 data
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function usePhotoUpload(maxPhotos = 1) {
  const [photos, setPhotos] = useState<string[]>([]); // base64 strings
  const [previews, setPreviews] = useState<string[]>([]); // data URLs for display
  const inputRef = useRef<HTMLInputElement | null>(null);

  const addFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) return;
      if (photos.length >= maxPhotos) return;
      const b64 = await fileToBase64(file);
      const dataUrl = `data:${file.type};base64,${b64}`;
      setPhotos(prev => [...prev, b64].slice(0, maxPhotos));
      setPreviews(prev => [...prev, dataUrl].slice(0, maxPhotos));
    },
    [photos.length, maxPhotos],
  );

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const arr = Array.from(files);
      for (const f of arr) await addFile(f);
    },
    [addFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent | ClipboardEvent) => {
      const items = Array.from((e as ClipboardEvent).clipboardData?.items ?? []);
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) addFile(file);
        }
      }
    },
    [addFile],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) handleFiles(e.target.files);
      e.target.value = '';
    },
    [handleFiles],
  );

  const removePhoto = useCallback((idx: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => prev.filter((_, i) => i !== idx));
  }, []);

  const clear = useCallback(() => {
    setPhotos([]);
    setPreviews([]);
  }, []);

  const openPicker = useCallback(() => {
    inputRef.current?.click();
  }, []);

  return {
    photos,
    previews,
    inputRef,
    handleDrop,
    handlePaste,
    handleInputChange,
    removePhoto,
    clear,
    openPicker,
    hasPhoto: photos.length > 0,
  };
}
