import type { FC } from "hono/jsx";
import type { LinkItem } from "../../types/forum";

interface TopLinkProps {
  serviceId: string;
  links: LinkItem[];
  adminUrl?: string;
  user?: { name: string; email: string } | null;
  currentPath?: string;
  searchQuery?: string;
  showSearch?: boolean;
}

// 簡單的 External Link SVG Icon
const ExternalLinkIcon = () => (
  <svg
    class="ml-1 h-3 w-3 inline"
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

// Search Icon
const SearchIcon = () => (
  <svg
    class="h-3 w-3 text-gray-400"
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
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
    class="h-3 w-3"
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
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

export const TopLink: FC<TopLinkProps> = ({ serviceId, links, adminUrl, user, currentPath = "/", searchQuery, showSearch = true }) => {
  // Default to relative path if adminUrl not provided
  const dashboardUrl = adminUrl
    ? `${adminUrl}/dashboard/${serviceId}`
    : `/dashboard/${serviceId}`;

  const loginUrl = `/login?callbackURL=${encodeURIComponent(currentPath)}`;
  const logoutUrl = `/logout?callbackURL=${encodeURIComponent(currentPath)}`;

  const inputId = `search-input-${serviceId}`;
  const clearBtnId = `search-clear-${serviceId}`;

  return (
    <div class="flex items-center justify-between mb-2">
      {/* Left side - Search box */}
      {showSearch ? (
        <form
          action={`/service/${serviceId}`}
          method="get"
          class="flex items-center"
        >
          <div class="relative flex items-center">
            <div class="absolute left-2 pointer-events-none">
              <SearchIcon />
            </div>
            <input
              id={inputId}
              type="text"
              name="q"
              value={searchQuery || ""}
              placeholder="Search..."
              class="w-40 sm:w-48 pl-7 pr-7 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
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
              class={`absolute right-2 p-0.5 text-gray-400 hover:text-gray-600 ${searchQuery ? "" : "hidden"}`}
              onclick={`
                var input = document.getElementById('${inputId}');
                input.value = '';
                this.classList.add('hidden');
                input.focus();
              `}
            >
              <ClearIcon />
            </button>
          </div>
          <button
            type="submit"
            class="ml-1 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
          >
            Search
          </button>
          {searchQuery && (
            <a
              href={`/service/${serviceId}`}
              class="ml-2 text-xs text-blue-500 hover:underline"
            >
              Clear
            </a>
          )}
        </form>
      ) : (
        <div />
      )}

      {/* Right side - Links */}
      <div class="flex items-center space-x-2 text-xs">
        {/* Login/Logout - subtle style */}
        {user ? (
          <>
            <span class="text-gray-400">{user.name}</span>
            <a
              href={logoutUrl}
              class="text-gray-400 hover:text-gray-600"
            >
              Logout
            </a>
            <span class="text-gray-300">|</span>
          </>
        ) : (
          <>
            <a
              href={loginUrl}
              class="text-gray-400 hover:text-gray-600"
            >
              Login
            </a>
            <span class="text-gray-300">|</span>
          </>
        )}
        {links.map((link, index) => (
          <a
            key={index}
            href={link.url}
            target="_blank"
            class="text-gray-400 hover:text-gray-600 flex items-center"
          >
            {link.name}
            <ExternalLinkIcon />
          </a>
        ))}
        <a
          href={dashboardUrl}
          target="_blank"
          class="text-gray-400 hover:text-gray-600 flex items-center"
        >
          Dashboard
          <ExternalLinkIcon />
        </a>
      </div>
    </div>
  );
};

export default TopLink;
