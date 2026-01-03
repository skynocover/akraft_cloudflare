import type { FC } from "hono/jsx";

interface SearchBoxProps {
  serviceId: string;
  query?: string;
  placeholder?: string;
}

// Search Icon
const SearchIcon = () => (
  <svg
    class="h-4 w-4 text-gray-400"
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

// Clear Icon
const ClearIcon = () => (
  <svg
    class="h-4 w-4"
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const SearchBox: FC<SearchBoxProps> = ({
  serviceId,
  query = "",
  placeholder = "Search threads by title or content...",
}) => {
  const formId = `search-form-${serviceId}`;
  const inputId = `search-input-${serviceId}`;
  const clearBtnId = `search-clear-${serviceId}`;

  return (
    <div class="max-w-xl mx-auto mb-4">
      <form
        id={formId}
        action={`/service/${serviceId}`}
        method="get"
        class="relative"
      >
        <div class="relative flex items-center">
          <div class="absolute left-3 pointer-events-none">
            <SearchIcon />
          </div>
          <input
            id={inputId}
            type="text"
            name="q"
            value={query}
            placeholder={placeholder}
            class="w-full pl-10 pr-20 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            oninput={`
              var clearBtn = document.getElementById('${clearBtnId}');
              if (this.value) {
                clearBtn.classList.remove('hidden');
              } else {
                clearBtn.classList.add('hidden');
              }
            `}
          />
          <button
            id={clearBtnId}
            type="button"
            class={`absolute right-14 p-1 text-gray-400 hover:text-gray-600 ${query ? "" : "hidden"}`}
            onclick={`
              var input = document.getElementById('${inputId}');
              input.value = '';
              this.classList.add('hidden');
              input.focus();
            `}
          >
            <ClearIcon />
          </button>
          <button
            type="submit"
            class="absolute right-2 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
          >
            Search
          </button>
        </div>
      </form>
      {query && (
        <div class="mt-2 flex items-center justify-between text-sm text-gray-600">
          <span>
            Search results for: <strong class="text-gray-800">"{query}"</strong>
          </span>
          <a
            href={`/service/${serviceId}`}
            class="text-blue-500 hover:underline"
          >
            Clear search
          </a>
        </div>
      )}
    </div>
  );
};

export default SearchBox;
