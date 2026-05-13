interface ContextPanelProps {
  children?: React.ReactNode;
}

export function ContextPanel({ children }: ContextPanelProps) {
  return (
    <aside className="w-[25%] glass-panel border-l border-white/10 flex flex-col">
      <div className="p-4 text-on-surface font-geist">
        <h2 className="text-lg font-semibold mb-4">Context Panel</h2>
        {children || (
          <p className="text-sm text-on-surface-variant">
            Select a note to see context...
          </p>
        )}
      </div>
    </aside>
  );
}
