import React from "react";

/**
 * Database vector metrics display component.
 * Shows dimensions, vector count, and average similarity.
 */
export function VectorMetrics() {
  return (
    <div className="glass-panel p-3 space-y-2">
      <div className="flex justify-between text-xs">
        <span className="text-on-surface-variant font-geist">Dimensions</span>
        <span className="text-on-surface font-jetbrains">384</span>
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-on-surface-variant font-geist">Vector Count</span>
        <span className="text-on-surface font-jetbrains">12</span>
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-on-surface-variant font-geist">
          Avg. Similarity
        </span>
        <span className="text-secondary font-jetbrains">0.78</span>
      </div>
    </div>
  );
}
