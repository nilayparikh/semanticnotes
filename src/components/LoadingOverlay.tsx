import React, { useEffect, useState } from "react";

interface LoadingOverlayProps {
  progress: number;
  message: string;
  visible: boolean;
}

export function LoadingOverlay({
  progress = 0,
  message = "Loading Model...",
  visible = true,
}: LoadingOverlayProps) {
  const [opacity, setOpacity] = useState(visible ? 1 : 0);

  useEffect(() => {
    if (visible) {
      setOpacity(1);
    } else {
      const timer = setTimeout(() => setOpacity(0), 300);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  return (
    <div
      role="status"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center glass-panel transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="text-primary text-2xl font-geist mb-4">{message}</div>
      <div className="w-64 h-2 bg-white/20 rounded-full overflow-hidden">
        <div
          role="progressbar"
          className="h-full bg-cyan-400 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-secondary mt-2">{progress}%</span>
    </div>
  );
}
