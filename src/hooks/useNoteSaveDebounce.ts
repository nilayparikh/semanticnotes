import { useCallback, useRef, useState, useEffect } from "react";

export interface SaveData {
  title?: string;
  content?: string;
}

export interface SavePayload {
  id: string;
  title?: string;
  content?: string;
}

interface UseNoteSaveDebounceReturn {
  save: (data: SaveData) => void;
  isSaving: boolean;
}

const DEBOUNCE_INTERVAL = 1000;

export function useNoteSaveDebounce(
  noteId: string,
  saveCallback: (data: SavePayload) => void,
): UseNoteSaveDebounceReturn {
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Cleanup: clear timeout on unmount to prevent state updates on dead fiber
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const save = useCallback(
    (data: SaveData) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      setIsSaving(true);

      saveTimeoutRef.current = setTimeout(() => {
        saveCallback({
          id: noteId,
          title: data.title,
          content: data.content,
        });
        setIsSaving(false);
      }, DEBOUNCE_INTERVAL);
    },
    [noteId, saveCallback],
  );

  return { save, isSaving };
}
