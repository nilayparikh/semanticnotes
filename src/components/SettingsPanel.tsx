import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTheme, ThemeMode } from "@/hooks/useTheme";
import { ModelManager } from "@/hooks/useModelManager";
import { ModelState } from "@/types/models";

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
 * Renders theme, model selection, storage usage, WebGPU status, and model management sections.
 */
export function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const { theme, setTheme } = useTheme();
  const panelRef = useRef<HTMLDivElement>(null);
  const modelManager = useMemo(() => new ModelManager(), []);
  const [embeddingState, setEmbeddingState] = useState<ModelState>("idle");
  const [llmState, setLlmState] = useState<ModelState>("idle");
  const [embeddingError, setEmbeddingError] = useState<string | null>(null);
  const [llmError, setLlmError] = useState<string | null>(null);

  const handleLoadEmbedding = useCallback(async () => {
    setEmbeddingState("loading");
    setEmbeddingError(null);
    try {
      await modelManager.loadEmbeddingModel();
      setEmbeddingState("ready");
    } catch (error) {
      setEmbeddingState("error");
      setEmbeddingError(
        error instanceof Error ? error.message : "Failed to load embedding model",
      );
    }
  }, [modelManager]);

  const handleLoadLLM = useCallback(async () => {
    setLlmState("loading");
    setLlmError(null);
    try {
      await modelManager.loadLLM();
      setLlmState("ready");
    } catch (error) {
      setLlmState("error");
      setLlmError(
        error instanceof Error ? error.message : "Failed to load LLM model",
      );
    }
  }, [modelManager]);

  const handleUnloadAll = useCallback(async () => {
    await modelManager.disposeAll();
    setEmbeddingState("disposed");
    setLlmState("disposed");
  }, [modelManager]);

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
        <div className="mb-6">
          <div className="flex items-center gap-2 text-on-surface-variant font-label-caps text-label-caps uppercase tracking-widest mb-3">
            <span className="material-symbols-outlined text-[16px]">memory</span>
            WebGPU
          </div>
          <div className="flex items-center gap-2 bg-surface-container-highest/50 border border-white/10 rounded-lg px-4 py-3">
            <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="text-secondary text-sm font-medium">Active</span>
          </div>
        </div>

        {/* Model Management Section */}
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant font-label-caps text-label-caps uppercase tracking-widest mb-3">
            <span className="material-symbols-outlined text-[16px]">smart_toy</span>
            Model Management
          </div>

          {/* Embedding Model */}
          <div className="bg-surface-container-highest/50 border border-white/10 rounded-lg px-4 py-3 mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-on-surface text-sm">Embedding Model</span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  embeddingState === "idle"
                    ? "bg-gray-500/20 text-gray-300"
                    : embeddingState === "loading"
                    ? "bg-cyan-500/20 text-cyan-300 animate-pulse"
                    : embeddingState === "ready"
                    ? "bg-green-500/20 text-green-300"
                    : embeddingState === "error"
                    ? "bg-red-500/20 text-red-300"
                    : "bg-amber-500/20 text-amber-300"
                }`}
              >
                {embeddingState}
              </span>
            </div>
            {embeddingError && (
              <p className="text-red-400 text-xs mb-2" data-testid="embedding-error">
                {embeddingError}
              </p>
            )}
            <button
              type="button"
              onClick={handleLoadEmbedding}
              disabled={embeddingState === "loading" || embeddingState === "ready"}
              className="w-full px-3 py-1.5 rounded-lg border border-white/10 bg-primary-fixed-dim/10 text-primary-fixed-dim text-sm font-medium hover:bg-primary-fixed-dim/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {embeddingState === "loading" ? "Loading..." : "Load Model"}
            </button>
          </div>

          {/* LLM Model */}
          <div className="bg-surface-container-highest/50 border border-white/10 rounded-lg px-4 py-3 mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-on-surface text-sm">LLM Model</span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  llmState === "idle"
                    ? "bg-gray-500/20 text-gray-300"
                    : llmState === "loading"
                    ? "bg-cyan-500/20 text-cyan-300 animate-pulse"
                    : llmState === "ready"
                    ? "bg-green-500/20 text-green-300"
                    : llmState === "error"
                    ? "bg-red-500/20 text-red-300"
                    : "bg-amber-500/20 text-amber-300"
                }`}
              >
                {llmState}
              </span>
            </div>
            {llmError && (
              <p className="text-red-400 text-xs mb-2" data-testid="llm-error">
                {llmError}
              </p>
            )}
            <button
              type="button"
              onClick={handleLoadLLM}
              disabled={llmState === "loading" || llmState === "ready"}
              className="w-full px-3 py-1.5 rounded-lg border border-white/10 bg-primary-fixed-dim/10 text-primary-fixed-dim text-sm font-medium hover:bg-primary-fixed-dim/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {llmState === "loading" ? "Loading..." : "Load Model"}
            </button>
          </div>

          {/* Unload All */}
          {(embeddingState === "ready" || llmState === "ready") && (
            <button
              type="button"
              onClick={handleUnloadAll}
              className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-on-surface-variant text-sm font-medium hover:bg-white/10 transition-colors"
            >
              Unload All Models
            </button>
          )}
        </div>
      </div>
    </div>
  );
}