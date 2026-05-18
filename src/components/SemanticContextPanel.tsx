import React from "react";
import { AutoTags } from "./AutoTags";
import { AIChat } from "./AIChat";
import { VectorMetrics } from "./VectorMetrics";

export interface RelatedNote {
  id: string;
  title: string;
  similarity: number;
  content?: string;
}

export interface SemanticContextPanelProps {
  tags: string[];
  relatedNotes: RelatedNote[];
}

/**
 * Semantic context panel that displays auto-tags, related notes,
 * local AI Q&A, and vector metrics.
 * Matches the mock design from mock/code.html.
 */
export function SemanticContextPanel({
  tags,
  relatedNotes,
}: SemanticContextPanelProps) {
  const truncateExcerpt = (text: string, maxLen = 80) => {
    if (!text) return "";
    return text.length > maxLen ? text.slice(0, maxLen) + "..." : text;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Panel Header */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-2 font-headline-md text-headline-md text-on-surface">
          <span className="material-symbols-outlined text-primary-fixed-dim">psychology</span>
          🤖 Local AI Insights
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-8">
        {/* Auto-Tags Section */}
        <section>
          <h3 className="font-label-caps text-label-caps text-on-surface-variant mb-3 uppercase tracking-widest flex items-center gap-2">
            <span className="material-symbols-outlined text-[14px]">label</span>
            ✨ Auto-Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {tags.length > 0 ? (
              tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full border border-primary-fixed-dim/30 bg-primary-fixed-dim/5 text-primary-fixed-dim text-sm font-code-editor"
                >
                  {tag}
                </span>
              ))
            ) : (
              <span className="text-on-surface-variant text-sm">No tags detected yet</span>
            )}
          </div>
        </section>

        {/* Semantically Related Notes */}
        <section>
          <h3 className="font-label-caps text-label-caps text-on-surface-variant mb-3 uppercase tracking-widest flex items-center gap-2">
            <span className="material-symbols-outlined text-[14px]">link</span>
            🔗 Semantically Related
          </h3>
          <div className="space-y-2">
            {relatedNotes.length > 0 ? (
              relatedNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-3 rounded-lg border border-white/5 bg-surface-container/50 hover:bg-surface-container transition-colors cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm text-on-surface group-hover:text-primary-fixed-dim transition-colors">
                      {note.title}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-status-pill bg-secondary/20 text-secondary border border-secondary/30">
                      {Math.round(note.similarity * 100)}%
                    </span>
                  </div>
                  {note.content && (
                    <p className="text-xs text-on-surface-variant line-clamp-2">
                      {truncateExcerpt(note.content)}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <span className="text-on-surface-variant text-sm">No related notes found</span>
            )}
          </div>
        </section>
      </div>

      {/* Bottom: AI Chat */}
      <div className="border-t border-white/10 flex flex-col shrink-0">
        <AIChat />
      </div>

      {/* Bottom: Vector Metrics */}
      <div className="p-5 border-t border-white/10 bg-surface-container-highest/30">
        <h3 className="font-label-caps text-label-caps text-on-surface-variant mb-3 uppercase tracking-widest flex items-center gap-2">
          <span className="material-symbols-outlined text-[14px]">query_stats</span>
          📊 Database Vector Metrics
        </h3>
        <VectorMetrics />
      </div>
    </div>
  );
}
