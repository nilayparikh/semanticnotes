export interface SemanticSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SemanticSearchInput({
  value,
  onChange,
  placeholder = "🔍 AI Semantic Search...",
}: SemanticSearchInputProps) {
  return (
    <div className="p-4">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="AI Semantic Search"
        className="glass-panel w-full px-3 py-2 text-sm text-on-surface border-none focus:outline-none focus:border-b focus:border-primary"
        data-testid="semantic-search-input"
      />
    </div>
  );
}
