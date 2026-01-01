import type { FC } from "hono/jsx";
import type { LinkItem } from "../../types/forum";

interface TopLinkProps {
  serviceId: string;
  links: LinkItem[];
  adminUrl?: string;
  user?: { name: string; email: string } | null;
  currentPath?: string;
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

export const TopLink: FC<TopLinkProps> = ({ serviceId, links, adminUrl, user, currentPath = "/" }) => {
  // Default to relative path if adminUrl not provided
  const dashboardUrl = adminUrl
    ? `${adminUrl}/dashboard/${serviceId}`
    : `/dashboard/${serviceId}`;

  const loginUrl = `/login?callbackURL=${encodeURIComponent(currentPath)}`;
  const logoutUrl = `/logout?callbackURL=${encodeURIComponent(currentPath)}`;

  return (
    <div class="absolute top-2 right-2 flex items-center space-x-2 text-xs">
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
  );
};

export default TopLink;
