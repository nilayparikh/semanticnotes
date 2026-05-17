import React, { useCallback, useEffect, useRef } from "react";
import { useTheme, ThemeMode } from "@/hooks/useTheme";

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

const EMBEDDING_MODELS = [
  { value: "all-MiniLM-L6-v2", label: "MiniLM-L6-v2" },
  { value: "all-mpnet-base-v2", label: "MPNet-Base-v2" },
  { value: "paraphrase-multilingual-MiniLM-L12-v2", label: "Multilingual-MiniLM-L12-v2" },
];

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

/**
 * Settings panel modal with glass-panel styling.
 * Renders theme, model selection, storage usage, and WebGPU status sections.
 */
export function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const { theme, setTheme } = useTheme();
  const panelRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      panelRef.current?.focus();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      data-testid="settings-panel"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="glass-panel bg-surface-container/90 rounded-xl border border-white/10 p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-fixed-dim text-[22px]">
              settings
            </span>
            <h2 className="text-on-surface font-headline-md text-lg font-semibold">
              Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-white/5 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Theme Section */}
        <fieldset className="mb-6">
          <legend className="flex items-center gap-2 text-on-surface-variant font-label-caps text-label-caps uppercase tracking-widest mb-3">
            <span className="material-symbols-outlined text-[16px]">palette</span>
            Theme
          </legend>
          <div className="flex gap-3" role="radiogroup" aria-label="Theme selection">
            {THEME_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                  theme === option.value
                    ? "border-primary-fixed-dim bg-primary-fixed-dim/10 text-primary-fixed-dim"
                    : "border-white/10 bg-surface-container-highest/50 text-on-surface-variant hover:bg-white/5"
                }`}
              >
                <input
                  type="radio"
                  name="theme"
                  value={option.value}
                  checked={theme === option.value}
                  onChange={() => setTheme(option.value)}
                  className="sr-only"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        {/* Model Selection Section */}
        <fieldset className="mb-6">
          <legend className="flex items-center gap-2 text-on-surface-variant font-label-caps text-label-caps uppercase tracking-widest mb-3">
            <span className="material-symbols-outlined text-[16px]">model_training</span>
            Embedding Model
          </legend>
          <select
            aria-label="Embedding model selection"
            className="w-full bg-surface-container-highest border border-white/10 rounded-lg px-3 py-2 text-body-base text-on-surface focus:ring-1 focus:ring-primary-fixed-dim focus:outline-none"
          >
            {EMBEDDING_MODELS.map((model) => (
              <option key={model.value} value={model.value}>
                {model.label}
              </option>
            ))}
          </select>
        </fieldset>

        {/* Storage Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-on-surface-variant font-label-caps text-label-caps uppercase tracking-widest mb-3">
            <span className="material-symbols-outlined text-[16px]">storage</span>
            Storage
          </div>
          <div className="flex items-center justify-between bg-surface-container-highest/50 border border-white/10 rounded-lg px-4 py-3">
            <span className="text-on-surface text-sm">SQLite Usage</span>
            <span className="text-primary-fixed-dim font-code-editor text-sm">24MB</span>
          </div>
        </div>

        {/* WebGPU Status Section */}
        <div className="mb-2">
          <div className="flex items-center gap-2 text-on-surface-variant font-label-caps text-label-caps uppercase tracking-widest mb-3">
            <span className="material-symbols-outlined text-[16px]">memory</span>
            WebGPU
          </div>
          <div className="flex items-center gap-2 bg-surface-container-highest/50 border border-white/10 rounded-lg px-4 py-3">
            <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="text-secondary text-sm font-medium">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}