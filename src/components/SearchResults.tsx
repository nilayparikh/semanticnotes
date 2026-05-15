export interface SearchResultsProps {
  results: Array<{
    noteId: string;
    title: string;
    percentage: number;
  }>;
  onSelect: (noteId: string) => void;
  isLoading?: boolean;
}

export function SearchResults({
  results,
  onSelect,
  isLoading = false,
}: SearchResultsProps) {
  if (isLoading) {
    return <div className="p-4 text-sm text-on-surface-variant">Searching...</div>;
  }

  if (results.length === 0) {
    return null;
  }

  return (
    <ul className="space-y-1" data-testid="search-results" role="listbox">
      {results.map((result) => (
        <li key={result.noteId} role="option">
          <button
            type="button"
            onClick={() => onSelect(result.noteId)}
            className="w-full text-left px-3 py-2 rounded-md glass-panel hover:bg-white/5 transition-colors"
          >
            <div className="flex justify-between items-center">
              <span className="text-sm text-on-surface truncate">
                {result.title}
              </span>
              <span
                className="text-xs text-primary ml-2"
                data-testid={`score-${result.noteId}`}
              >
                {result.percentage}%
              </span>
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}
