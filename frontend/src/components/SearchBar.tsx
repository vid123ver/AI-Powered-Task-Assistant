interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

function SearchBar({
  value,
  onChange,
}: SearchBarProps) {
  const handleClear = () => {
    onChange("");
  };

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <svg
          className="h-4 w-4 text-gray-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </div>

      <input
        type="text"
        placeholder="Search tasks..."
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-10 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
      />

      {value && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="!m-0 !absolute !right-2 !top-1/2 !flex !h-7 !w-7 !-translate-y-1/2 !items-center !justify-center !rounded-full !bg-transparent !p-0 !text-gray-400 hover:!bg-gray-100 hover:!text-gray-700"
        >
          ×
        </button>
      )}
    </div>
  );
}

export default SearchBar;