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
    <div className="flex flex-col h-full glass-panel">
      <input
        type="text"
        className="text-2xl font-bold px-4 py-2 border-b text-on-surface font-geist focus:outline-none focus:border-primary bg-transparent"
        placeholder="Note title"
        value={note.title}
        onChange={handleTitleChange}
        data-testid="note-title-input"
      />
      <div className="flex flex-col flex-1">
        <textarea
          className="flex-1 w-full px-4 py-3 resize-none border-none focus:outline-none bg-transparent font-jetbrains text-sm leading-relaxed text-on-surface"
          placeholder="Start typing your note..."
          value={note.content}
          onChange={handleContentChange}
          data-testid="note-content-textarea"
        />
        <div className="border-t flex-1 overflow-auto p-4">
          <MarkdownPreview content={note.content} />
        </div>
      </div>
    </div>
  );
}
