import type { FC } from "hono/jsx";

interface HeaderProps {
  dashboardUrl?: string;
}

export const Header: FC<HeaderProps> = ({ dashboardUrl }) => {
  return (
    <header class="flex items-center justify-between py-4 px-4 border-b bg-background">
      {/* Left side - Logo */}
      <div class="flex items-center space-x-4">
        <a href="/" class="text-2xl font-bold hover:opacity-80 transition-opacity">
          Akraft
        </a>
      </div>

      {/* Right side - Navigation */}
      <nav class="flex items-center space-x-2">
        {/* GitHub button */}
        <a
          href="https://github.com/skynocover/akraft_cloudflare"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center justify-center rounded-md border border-input bg-background h-9 w-9 hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
            <path d="M9 18c-4.51 2-5-2-7-2" />
          </svg>
          <span class="sr-only">GitHub</span>
        </a>

        {/* Dashboard button */}
        {dashboardUrl && (
          <a
            href={dashboardUrl}
            class="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground h-9 px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            管理
          </a>
        )}
      </nav>
    </header>
  );
};

export default Header;
