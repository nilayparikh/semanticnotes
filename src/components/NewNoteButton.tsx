interface NewNoteButtonProps {
  onClick: () => void;
}

/**
 * "+ NEW NOTE" button component for the sidebar.
 * Uses glassmorphic dark theme with cyan primary styling and AI glow.
 */
export default function NewNoteButton({ onClick }: NewNoteButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full px-4 py-3 glass-panel ai-glow hover:bg-white/5 text-primary-container font-medium rounded-md transition-colors text-sm font-geist"
      data-testid="new-note-button"
    >
      + NEW NOTE
    </button>
  );
}
