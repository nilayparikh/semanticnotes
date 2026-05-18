import { Note } from "@/types/note";
import { MarkdownPreview } from "@/components/MarkdownPreview";
import { useRef, useState, useEffect, useCallback } from "react";

interface NoteEditorProps {
  note: Note;
  onUpdate: (data: { title?: string; content?: string }) => void;
}

const DEBOUNCE_MS = 1000;
type SaveStatus = "Saved" | "Unsaved" | "Saving...";

export default function NoteEditor({ note, onUpdate }: NoteEditorProps) {
  const timersRef = useRef<number[]>([]);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("Saved");

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  // Reset save status when note changes externally
  useEffect(() => {
    setSaveStatus("Saved");
  }, [note.id]);

  const scheduleUpdate = useCallback(
    (update: { title?: string; content?: string }) => {
      // Clear existing timers
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];

      // Show Unsaved immediately
      setSaveStatus("Unsaved");

      // Show Saving... after 500ms
      const savingTimer = window.setTimeout(() => {
        setSaveStatus("Saving...");
      }, 500);
      timersRef.current.push(savingTimer);

      // Call onUpdate after 1000ms debounce, then show Saved
      const updateTimer = window.setTimeout(() => {
        onUpdate(update);
        setSaveStatus("Saved");
      }, DEBOUNCE_MS);
      timersRef.current.push(updateTimer);
    },
    [onUpdate]
  );

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    if (newTitle !== note.title) {
      scheduleUpdate({ title: newTitle });
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    if (newContent !== note.content) {
      scheduleUpdate({ content: newContent });
    }
  };

  return (
    <div className="flex flex-col h-full" data-testid="note-editor">
      {/* Title Bar */}
      <div className="px-8 py-4 flex items-center justify-between border-b border-white/5">
        <input
          type="text"
          className="font-headline-md text-headline-md text-on-surface font-bold bg-transparent border-0 focus:ring-0 w-full"
          value={note.title}
          placeholder="Untitled"
          onChange={handleTitleChange}
          data-testid="note-title-input"
        />
        <div className="flex gap-2">
          <span className="px-2 py-1 rounded border border-white/10 text-on-surface-variant font-status-pill text-status-pill">
            Markdown
          </span>
          <span
            className="px-2 py-1 rounded text-on-surface-variant font-status-pill text-status-pill"
            data-testid="save-status"
          >
            {saveStatus}
          </span>
        </div>
      </div>

      {/* Textarea */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 p-8 overflow-y-auto">
          <textarea
            className="w-full h-full bg-transparent border-0 resize-none font-code-editor text-code-editor text-on-surface focus:ring-0 placeholder:text-on-surface-variant/30 leading-relaxed"
            placeholder="Start typing your note..."
            spellCheck={false}
            value={note.content}
            onChange={handleContentChange}
            data-testid="note-content-textarea"
          />
        </div>
      </div>

      {/* Divider */}
      <div className="h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent flex items-center justify-center relative my-1">
        <div className="absolute px-3 bg-[#0A0A0A] text-on-surface-variant font-label-caps text-label-caps tracking-widest uppercase">
          Live Preview
        </div>
      </div>

      {/* Markdown Preview */}
      <div className="flex-[0.8] p-8 overflow-y-auto bg-surface-container-low/30 prose prose-invert prose-p:text-body-base prose-headings:font-headline-md prose-code:font-code-editor prose-a:text-primary-fixed-dim max-w-none">
        <MarkdownPreview content={note.content} />
      </div>
    </div>
  );
}