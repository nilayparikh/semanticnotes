import { describe, it, expect } from "vitest";
import {
  loadingReducer,
  isFullyReady,
  hasAnyError,
  INITIAL_LOADING_STATE,
} from "@/hooks/useLoadingState";

describe("Loading State Reducer", () => {
  it("should start with all components idle", () => {
    expect(INITIAL_LOADING_STATE).toEqual({
      webgpu: "idle",
      sqlite: "idle",
      embeddingWorker: "idle",
      llmWorker: "idle",
    });
  });

  it("should transition component to loading", () => {
    const state = loadingReducer(INITIAL_LOADING_STATE, {
      type: "COMPONENT_START",
      component: "webgpu",
    });

    expect(state.webgpu).toBe("loading");
    expect(state.sqlite).toBe("idle");
  });

  it("should transition component to ready", () => {
    const loadingState = loadingReducer(INITIAL_LOADING_STATE, {
      type: "COMPONENT_START",
      component: "sqlite",
    });

    const readyState = loadingReducer(loadingState, {
      type: "COMPONENT_READY",
      component: "sqlite",
    });

    expect(readyState.sqlite).toBe("ready");
  });

  it("should transition component to error", () => {
    const state = loadingReducer(INITIAL_LOADING_STATE, {
      type: "COMPONENT_ERROR",
      component: "llmWorker",
      error: "GPU not available",
    });

    expect(state.llmWorker).toBe("error");
  });

  it("should report fully ready when all components are ready", () => {
    const state = {
      webgpu: "ready",
      sqlite: "ready",
      embeddingWorker: "ready",
      llmWorker: "ready",
    };

    expect(isFullyReady(state)).toBe(true);
  });

  it("should not report fully ready when one component is loading", () => {
    const state = {
      webgpu: "ready",
      sqlite: "ready",
      embeddingWorker: "loading",
      llmWorker: "ready",
    };

    expect(isFullyReady(state)).toBe(false);
  });

  it("should report any error when at least one component errors", () => {
    const state = {
      webgpu: "ready",
      sqlite: "error",
      embeddingWorker: "ready",
      llmWorker: "ready",
    };

    expect(hasAnyError(state)).toBe(true);
  });

  it("should not report error when all components are ready", () => {
    const state = {
      webgpu: "ready",
      sqlite: "ready",
      embeddingWorker: "ready",
      llmWorker: "ready",
    };

    expect(hasAnyError(state)).toBe(false);
  });

  it("should handle multiple component transitions", () => {
    let state = INITIAL_LOADING_STATE;

    state = loadingReducer(state, {
      type: "COMPONENT_START",
      component: "webgpu",
    });
    state = loadingReducer(state, {
      type: "COMPONENT_READY",
      component: "webgpu",
    });
    state = loadingReducer(state, {
      type: "COMPONENT_START",
      component: "sqlite",
    });
    state = loadingReducer(state, {
      type: "COMPONENT_READY",
      component: "sqlite",
    });
    state = loadingReducer(state, {
      type: "COMPONENT_START",
      component: "embeddingWorker",
    });
    state = loadingReducer(state, {
      type: "COMPONENT_READY",
      component: "embeddingWorker",
    });
    state = loadingReducer(state, {
      type: "COMPONENT_START",
      component: "llmWorker",
    });
    state = loadingReducer(state, {
      type: "COMPONENT_READY",
      component: "llmWorker",
    });

    expect(isFullyReady(state)).toBe(true);
    expect(hasAnyError(state)).toBe(false);
  });
});
