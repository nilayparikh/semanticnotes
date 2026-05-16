import React from "react";

export interface ModelSelectorProps {
  models: Array<{
    name: string;
    state: "idle" | "loading" | "ready" | "error" | "disposed";
  }>;
  selectedModel: string;
  onModelChange: (modelName: string) => void;
}

const STATE_LABELS: Record<string, string> = {
  idle: "●",
  loading: "◌",
  ready: "✓",
  error: "✗",
  disposed: "○",
};

/**
 * Model selector dropdown for choosing AI models.
 * Displays available models with state indicators.
 */
export function ModelSelector({
  models,
  selectedModel,
  onModelChange,
}: ModelSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <select
        value={selectedModel}
        onChange={(e) => onModelChange(e.target.value)}
        aria-label="Select AI model"
        className="glass-panel ai-glow px-2 py-1 text-xs text-primary hover:bg-white/5 transition-colors rounded-full border-none focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
      >
        {models.map((model) => (
          <option key={model.name} value={model.name}>
            {model.name}
          </option>
        ))}
      </select>
      <span
        aria-label={`Model state: ${models.find((m) => m.name === selectedModel)?.state}`}
        className="text-xs text-on-surface/70"
        title={models.find((m) => m.name === selectedModel)?.state}
      >
        {STATE_LABELS[models.find((m) => m.name === selectedModel)?.state ?? "idle"]}
      </span>
    </div>
  );
}
