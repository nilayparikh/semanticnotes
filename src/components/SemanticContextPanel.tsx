import React from "react";
import { AutoTags } from "./AutoTags";
import { AIChat } from "./AIChat";
import { VectorMetrics } from "./VectorMetrics";

export interface SemanticContextPanelProps {
  tags: string[];
  relatedNotes: Array<{
    id: string;
    title: string;
    similarity: number;
  }>;
}

/**
 * Semantic context panel that displays auto-tags, related notes,
 * local AI Q&A, and vector metrics.
 */
export function SemanticContextPanel({
  tags,
  relatedNotes,
}: SemanticContextPanelProps) {
  return (
    <div className="p-4 space-y-6">
      {/* Auto-Tags Section */}
      <section>
        <h3 className="text-on-surface font-geist text-sm font-semibold mb-3">
          Auto-Tags
        </h3>
        <AutoTags tags={tags} />
      </section>

      {/* Semantically Related Notes */}
      <section>
        <h3 className="text-on-surface font-geist text-sm font-semibold mb-3">
          Related Notes
        </h3>
        <div className="space-y-2">
          {relatedNotes.map((note) => (
            <div key={note.id} className="glass-panel px-3 py-2">
              <div className="text-on-surface text-sm font-geist">
                {note.title}
              </div>
              <div className="text-secondary text-xs font-jetbrains">
                {Math.round(note.similarity * 100)}% similar
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Local AI Q&A */}
      <section>
        <h3 className="text-on-surface font-geist text-sm font-semibold mb-3">
          Local AI Q&A
        </h3>
        <AIChat />
      </section>

      {/* Database Vector Metrics */}
      <section>
        <h3 className="text-on-surface font-geist text-sm font-semibold mb-3">
          Vector Metrics
        </h3>
        <VectorMetrics />
      </section>
    </div>
  );
}
