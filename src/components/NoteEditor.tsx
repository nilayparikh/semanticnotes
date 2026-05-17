import { Note } from "@/types/note";
import { MarkdownPreview } from "@/components/MarkdownPreview";

interface NoteEditorProps {
  note: Note;
  onUpdate: (data: { title?: string; content?: string }) => void;
}

export default function NoteEditor({ note, onUpdate }: NoteEditorProps) {
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ title: e.target.value });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ content: e.target.value });
  };

  return (
    <div className="flex flex-col h-full" data-testid="note-editor">
      {/* Title Bar */}
      <div className="px-8 py-4 flex items-center justify-between border-b border-white/5">
        <div className="font-headline-md text-headline-md text-on-surface font-bold">
          {note.title || "Untitled"}
        </div>
        <div className="flex gap-2">
          <span className="px-2 py-1 rounded border border-white/10 text-on-surface-variant font-status-pill text-status-pill">
            Markdown
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