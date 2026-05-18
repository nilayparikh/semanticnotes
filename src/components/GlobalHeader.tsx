import React from "react";

interface GlobalHeaderProps {
  webgpuActive?: boolean;
  sqliteConnected?: boolean;
  sqliteSize?: string;
  sqliteStatus?: string;
  modelLoaded?: boolean;
  modelStatus?: string;
  onSettingsClick?: () => void;
  onHelpClick?: () => void;
  onloadModel?: () => void;
}

export function GlobalHeader({
  webgpuActive = true,
  sqliteConnected = true,
  sqliteSize = "24MB",
  sqliteStatus = "Ready",
  modelLoaded = false,
  modelStatus = "Loading",
  onSettingsClick,
  onHelpClick,
  onloadModel,
}: GlobalHeaderProps) {
  return (
    <header
      className="flex justify-between items-center w-full px-8 h-16 z-50 bg-surface/80 backdrop-blur-xl border-b border-white/10 shrink-0"
      data-testid="global-header"
      role="banner"
    >
      {/* Left: Brand */}
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-primary-fixed-dim" style={{ fontVariationSettings: "'FILL' 1" }}>
          note_stack
        </span>
        <span className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight">
          SemanticNotes AI
        </span>
      </div>

      {/* Right: Status Badges + Actions */}
      <div className="flex items-center gap-4">
        {/* Status Badges */}
        {webgpuActive && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-secondary/30 bg-secondary/10">
            <div className="w-2 h-2 rounded-full bg-secondary" />
            <span className="font-status-pill text-status-pill text-secondary">
              WebGPU Active
            </span>
          </div>
        )}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary-fixed-dim/30 bg-primary-fixed-dim/10"
          data-testid="sqlite-status"
        >
          <span className="material-symbols-outlined text-[14px] text-primary-fixed-dim">
            save
          </span>
          <span className="font-status-pill text-status-pill text-primary-fixed-dim">
            SQLite {sqliteStatus}{sqliteConnected ? `: ${sqliteSize}` : ""}
          </span>
        </div>

        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5"
          data-testid="model-status"
        >
          <span className="material-symbols-outlined text-[14px] text-on-surface-variant">
            memory
          </span>
          <span className="font-status-pill text-status-pill text-on-surface-variant">
            Model {modelStatus}
          </span>
        </div>

        {/* Load Model Button (shown when model is not loaded) */}
        {!modelLoaded && modelStatus !== "Loading" && onloadModel && (
          <button
            type="button"
            onClick={onloadModel}
            className="px-3 py-1.5 rounded-full border border-primary-fixed-dim/50 bg-primary-fixed-dim/10 text-primary-fixed-dim font-status-pill text-status-pill hover:bg-primary-fixed-dim/20 transition-colors"
            data-testid="load-model-button"
            aria-label="Load AI Model"
          >
            Load Model
          </button>
        )}

        {/* Separator + Action Buttons */}
        <div className="flex items-center gap-2 ml-4 border-l border-white/10 pl-4">
          <button
            type="button"
            onClick={onSettingsClick}
            className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-colors rounded"
            data-testid="settings-button"
            aria-label="Open settings"
          >
            <span className="material-symbols-outlined">settings</span>
          </button>
          <button
            type="button"
            onClick={onHelpClick}
            className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-colors rounded"
            data-testid="help-button"
            aria-label="Help"
          >
            <span className="material-symbols-outlined">help_outline</span>
          </button>
        </div>
      </div>
    </header>
  );
}
