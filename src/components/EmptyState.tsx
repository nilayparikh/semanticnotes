import React from "react";

interface EmptyStateProps {
  onNewNote: () => void;
}

/**
 * Welcome screen displayed when no note is selected.
 * Matches the mock design with glassmorphic card styling.
 */
export function EmptyState({ onNewNote }: EmptyStateProps) {
  return (
    <div
      className="flex-1 flex flex-col items-center justify-center h-full bg-[#0A0A0A] relative"
      data-testid="empty-state"
    >
      {/* Glassmorphic welcome card */}
      <div className="glass-panel rounded-xl p-12 max-w-md w-full mx-4 text-center ai-glow">
        {/* App Icon */}
        <div className="flex justify-center mb-6">
          <span
            className="material-symbols-outlined text-primary-fixed-dim text-6xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            note_stack
          </span>
        </div>

        {/* Title */}
        <h1 className="font-display-lg text-display-lg text-on-surface mb-3">
          SemanticNotes AI
        </h1>

        {/* Subtitle */}
        <p className="text-on-surface-variant text-body-base mb-8 leading-relaxed">
          Local-first, AI-enhanced Markdown note-taking with semantic search.
          <br />
          <span className="text-sm opacity-70">
            Your notes stay private. AI runs entirely in your browser.
          </span>
        </p>

        {/* Feature highlights */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <span className="px-3 py-1.5 rounded-full border border-secondary/30 bg-secondary/10 text-secondary text-sm font-status-pill">
            WebGPU Powered
          </span>
          <span className="px-3 py-1.5 rounded-full border border-primary-fixed-dim/30 bg-primary-fixed-dim/10 text-primary-fixed-dim text-sm font-status-pill">
            Semantic Search
          </span>
          <span className="px-3 py-1.5 rounded-full border border-tertiary-fixed-dim/30 bg-tertiary-fixed-dim/10 text-tertiary-fixed-dim text-sm font-status-pill">
            Local AI Chat
          </span>
        </div>

        {/* CTA Button */}
        <button
          type="button"
          onClick={onNewNote}
          className="w-full bg-primary-fixed-dim text-background font-label-caps text-label-caps py-3.5 rounded-lg hover:bg-primary-fixed transition-colors flex items-center justify-center gap-2 uppercase tracking-widest border border-transparent hover:border-white/20"
          data-testid="empty-state-new-note"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          + New Note
        </button>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-fixed-dim/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
