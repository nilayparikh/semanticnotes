import React, { useEffect, useRef, useState } from "react";

interface PerformanceMetricsState {
  fps: number;
  bundleSize: string;
  memoryUsage: string;
}

export function PerformanceMetrics() {
  const [metrics, setMetrics] = useState<PerformanceMetricsState>({
    fps: 0,
    bundleSize: "0 KB",
    memoryUsage: "0 MB",
  });

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const lastUpdateRef = useRef(performance.now());

  useEffect(() => {
    const animate = () => {
      frameCountRef.current++;
      const now = performance.now();

      // Update metrics every second
      if (now - lastUpdateRef.current >= 1000) {
        const fps = Math.round(
          (frameCountRef.current * 1000) / (now - lastTimeRef.current)
        );
        frameCountRef.current = 0;
        lastTimeRef.current = now;
        lastUpdateRef.current = now;

        // Calculate bundle size (approximate)
        const bundleSize = (window.performance?.getEntriesByType(
          "resource"
        )?.length || 0) * 120;

        // Calculate memory usage (if Performance Observer is available)
        const memory =
          "performance" in window &&
          "memory" in (performance as any)
            ? ((performance as any).memory?.usedJSHeap || 0) / (1024 * 1024)
            : 0;

        setMetrics({
          fps,
          bundleSize: `${bundleSize} KB`,
          memoryUsage: `${memory.toFixed(1)} MB`,
        });
      }

      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div className="glass-panel px-3 py-2 text-xs text-secondary">
      <div className="grid grid-cols-3 gap-2">
        <div>
          <span className="font-bold text-primary">{metrics.fps} FPS</span>
        </div>
        <div>
          <span className="font-bold text-primary">{metrics.bundleSize} Bundle</span>
        </div>
        <div>
          <span className="font-bold text-primary">{metrics.memoryUsage} Memory</span>
        </div>
      </div>
    </div>
  );
}
