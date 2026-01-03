import type { FC } from "hono/jsx";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  baseUrl: string;
}

// 簡單的 Chevron SVG Icons
const ChevronLeftIcon = () => (
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
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRightIcon = () => (
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
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export const Pagination: FC<PaginationProps> = ({
  totalPages,
  currentPage,
  baseUrl,
}) => {
  const getPageLink = (page: number) => {
    // Handle URLs that already have query parameters
    const separator = baseUrl.includes("?") ? "&" : "?";
    return `${baseUrl}${separator}page=${page}`;
  };

  const renderPageNumbers = () => {
    const items: any[] = [];

    // 如果總頁數小於等於10，顯示所有頁碼
    if (totalPages <= 10) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <a
            key={i}
            href={getPageLink(i)}
            class={`w-10 h-10 rounded-md flex items-center justify-center text-sm font-medium transition-colors
              ${
                currentPage === i
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "text-gray-600 hover:bg-blue-50"
              }`}
          >
            {i}
          </a>
        );
      }
    } else {
      // 當頁數超過10頁時的邏輯
      const alwaysVisible = [1, totalPages];
      const siblingsCount = 2;

      let startPage = Math.max(1, currentPage - siblingsCount);
      let endPage = Math.min(totalPages, currentPage + siblingsCount);

      if (endPage - startPage + 1 < 5) {
        if (currentPage <= 3) {
          endPage = Math.min(5, totalPages);
          startPage = 1;
        } else if (currentPage >= totalPages - 2) {
          startPage = Math.max(1, totalPages - 4);
          endPage = totalPages;
        }
      }

      for (let i = 1; i <= totalPages; i++) {
        if (alwaysVisible.includes(i) || (i >= startPage && i <= endPage)) {
          items.push(
            <a
              key={i}
              href={getPageLink(i)}
              class={`w-10 h-10 rounded-md flex items-center justify-center text-sm font-medium transition-colors
                ${
                  currentPage === i
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "text-gray-600 hover:bg-blue-50"
                }`}
            >
              {i}
            </a>
          );
        } else if (
          (i === startPage - 1 && startPage > 2) ||
          (i === endPage + 1 && endPage < totalPages - 1)
        ) {
          items.push(
            <span
              key={`ellipsis-${i}`}
              class="w-10 h-10 flex items-center justify-center text-gray-400"
            >
              ...
            </span>
          );
        }
      }
    }

    return items;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav class="flex justify-center mb-4">
      <div class="flex flex-wrap gap-1 items-center">
        <a
          href={getPageLink(Math.max(1, currentPage - 1))}
          class={`w-10 h-10 rounded-md flex items-center justify-center transition-colors hover:bg-blue-50
            ${
              currentPage === 1
                ? "pointer-events-none opacity-50"
                : "text-gray-600"
            }`}
        >
          <ChevronLeftIcon />
          <span class="sr-only">Previous page</span>
        </a>

        {renderPageNumbers()}

        <a
          href={getPageLink(Math.min(totalPages, currentPage + 1))}
          class={`w-10 h-10 rounded-md flex items-center justify-center transition-colors hover:bg-blue-50
            ${
              currentPage === totalPages
                ? "pointer-events-none opacity-50"
                : "text-gray-600"
            }`}
        >
          <ChevronRightIcon />
          <span class="sr-only">Next page</span>
        </a>
      </div>
    </nav>
  );
};

export default Pagination;
