/**
 * Loading State Orchestration Hook
 *
 * useReducer-based loading state for tracking component initialization.
 * Cross-compiled from `docs/architecture/07_ui_state_management_spec.md`.
 */

import { useReducer, useCallback } from "react";

// ── Types ────────────────────────────────────────────────────────────────

export type ComponentState = "idle" | "loading" | "ready" | "error";

export interface LoadingState {
  webgpu: ComponentState;
  sqlite: ComponentState;
  embeddingWorker: ComponentState;
  llmWorker: ComponentState;
}

export type LoadingAction =
  | { type: "COMPONENT_START"; component: keyof LoadingState }
  | { type: "COMPONENT_READY"; component: keyof LoadingState }
  | {
      type: "COMPONENT_ERROR";
      component: keyof LoadingState;
      error: string;
    };

// ── Reducer ──────────────────────────────────────────────────────────────

export const INITIAL_LOADING_STATE: LoadingState = {
  webgpu: "idle",
  sqlite: "idle",
  embeddingWorker: "idle",
  llmWorker: "idle",
};

export function loadingReducer(
  state: LoadingState,
  action: LoadingAction,
): LoadingState {
  switch (action.type) {
    case "COMPONENT_START":
      return { ...state, [action.component]: "loading" };
    case "COMPONENT_READY":
      return { ...state, [action.component]: "ready" };
    case "COMPONENT_ERROR":
      return { ...state, [action.component]: "error" };
    default:
      return state;
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────

export function isFullyReady(state: LoadingState): boolean {
  return Object.values(state).every((s) => s === "ready");
}

export function hasAnyError(state: LoadingState): boolean {
  return Object.values(state).some((s) => s === "error");
}

// ── Hook ─────────────────────────────────────────────────────────────────

export function useLoadingState() {
  const [state, dispatch] = useReducer(
    loadingReducer,
    INITIAL_LOADING_STATE,
  );

  const startComponent = useCallback(
    (component: keyof LoadingState) => {
      dispatch({ type: "COMPONENT_START", component });
    },
    [],
  );

  const readyComponent = useCallback(
    (component: keyof LoadingState) => {
      dispatch({ type: "COMPONENT_READY", component });
    },
    [],
  );

  const errorComponent = useCallback(
    (component: keyof LoadingState, error: string) => {
      dispatch({ type: "COMPONENT_ERROR", component, error });
    },
    [],
  );

  return {
    state,
    dispatch,
    startComponent,
    readyComponent,
    errorComponent,
    fullyReady: isFullyReady(state),
    hasError: hasAnyError(state),
  };
}
