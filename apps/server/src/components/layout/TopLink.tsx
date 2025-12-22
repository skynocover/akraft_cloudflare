import type { FC } from 'hono/jsx';
import type { LinkItem } from '../../lib/types';

interface TopLinkProps {
  serviceId: string;
  links: LinkItem[];
}

export const TopLink: FC<TopLinkProps> = ({ serviceId, links }) => {
  return (
    <div class="absolute top-2 right-2 flex items-center space-x-2 text-xs">
      {links.map((link, index) => (
        <a
          key={index}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          class="text-gray-400 hover:text-gray-600 flex items-center"
        >
          {link.name}
          <svg
            class="ml-1 h-3 w-3"
            xmlns="http://www.w3.org/2000/svg"
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
        </a>
      ))}
      <a
        href={`/dashboard/${serviceId}`}
        target="_blank"
        rel="noopener noreferrer"
        class="text-gray-400 hover:text-gray-600 flex items-center"
      >
        Admin
        <svg
          class="ml-1 h-3 w-3"
          xmlns="http://www.w3.org/2000/svg"
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
      </a>
      <select
        class="w-20 h-6 text-xs border rounded px-1"
        value="en"
      >
        <option value="en">EN</option>
        <option value="zh">中文</option>
      </select>
    </div>
  );
};
