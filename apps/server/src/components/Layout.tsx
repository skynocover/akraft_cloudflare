import type { FC, PropsWithChildren } from "hono/jsx";
import { markdownToHtmlScript } from "../lib/utils";

// CSS 變數定義（與 shadcn 相容）
const cssVariables = `
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 0 0% 3.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 0 0% 3.9%;
  --primary: 0 0% 9%;
  --primary-foreground: 0 0% 98%;
  --secondary: 0 0% 96.1%;
  --secondary-foreground: 0 0% 9%;
  --muted: 0 0% 96.1%;
  --muted-foreground: 0 0% 45.1%;
  --accent: 0 0% 96.1%;
  --accent-foreground: 0 0% 9%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  --border: 0 0% 89.8%;
  --input: 0 0% 89.8%;
  --ring: 0 0% 3.9%;
  --radius: 0.5rem;
}

.dark {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  --card: 0 0% 3.9%;
  --card-foreground: 0 0% 98%;
  --popover: 0 0% 3.9%;
  --popover-foreground: 0 0% 98%;
  --primary: 0 0% 98%;
  --primary-foreground: 0 0% 9%;
  --secondary: 0 0% 14.9%;
  --secondary-foreground: 0 0% 98%;
  --muted: 0 0% 14.9%;
  --muted-foreground: 0 0% 63.9%;
  --accent: 0 0% 14.9%;
  --accent-foreground: 0 0% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 0 0% 98%;
  --border: 0 0% 14.9%;
  --input: 0 0% 14.9%;
  --ring: 0 0% 83.1%;
}

* {
  border-color: hsl(var(--border));
}

body {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
}

/* Lightbox styles */
#lightbox-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  z-index: 9999;
  cursor: pointer;
  animation: fadeIn 0.2s ease-out;
}

#lightbox-overlay.active {
  display: flex;
  align-items: center;
  justify-content: center;
}

#lightbox-image {
  max-width: 95vw;
  max-height: 95vh;
  object-fit: contain;
  cursor: default;
  animation: scaleIn 0.2s ease-out;
}

#lightbox-close {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  z-index: 10000;
}

#lightbox-close:hover {
  background: rgba(255, 255, 255, 0.4);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
`;

interface LayoutProps extends PropsWithChildren {
  title?: string;
}

export const Layout: FC<LayoutProps> = ({ children, title = "Forum" }) => {
  return (
    <html lang="zh-TW">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        {/* Tailwind CSS CDN */}
        <script src="https://cdn.tailwindcss.com"></script>
        {/* 自定義 Tailwind 配置 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              tailwind.config = {
                darkMode: 'class',
                theme: {
                  extend: {
                    colors: {
                      border: 'hsl(var(--border))',
                      input: 'hsl(var(--input))',
                      ring: 'hsl(var(--ring))',
                      background: 'hsl(var(--background))',
                      foreground: 'hsl(var(--foreground))',
                      primary: {
                        DEFAULT: 'hsl(var(--primary))',
                        foreground: 'hsl(var(--primary-foreground))',
                      },
                      secondary: {
                        DEFAULT: 'hsl(var(--secondary))',
                        foreground: 'hsl(var(--secondary-foreground))',
                      },
                      destructive: {
                        DEFAULT: 'hsl(var(--destructive))',
                        foreground: 'hsl(var(--destructive-foreground))',
                      },
                      muted: {
                        DEFAULT: 'hsl(var(--muted))',
                        foreground: 'hsl(var(--muted-foreground))',
                      },
                      accent: {
                        DEFAULT: 'hsl(var(--accent))',
                        foreground: 'hsl(var(--accent-foreground))',
                      },
                      popover: {
                        DEFAULT: 'hsl(var(--popover))',
                        foreground: 'hsl(var(--popover-foreground))',
                      },
                      card: {
                        DEFAULT: 'hsl(var(--card))',
                        foreground: 'hsl(var(--card-foreground))',
                      },
                    },
                    borderRadius: {
                      lg: 'var(--radius)',
                      md: 'calc(var(--radius) - 2px)',
                      sm: 'calc(var(--radius) - 4px)',
                    },
                  },
                },
              }
            `,
          }}
        />
        <style dangerouslySetInnerHTML={{ __html: cssVariables }} />
      </head>
      <body class="min-h-screen bg-background font-sans antialiased">
        <script dangerouslySetInnerHTML={{ __html: markdownToHtmlScript }} />
        {children}

        {/* Lightbox overlay */}
        <div id="lightbox-overlay" onclick="closeLightbox(event)">
          <button id="lightbox-close" onclick="closeLightbox(event)">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <img id="lightbox-image" src="" alt="Full size image" onclick="event.stopPropagation()" />
        </div>

        {/* Lightbox scripts */}
        <script dangerouslySetInnerHTML={{ __html: `
          function openLightbox(imageUrl) {
            var overlay = document.getElementById('lightbox-overlay');
            var image = document.getElementById('lightbox-image');
            image.src = imageUrl;
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
          }

          function closeLightbox(event) {
            if (event) event.stopPropagation();
            var overlay = document.getElementById('lightbox-overlay');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
          }

          // Close lightbox on ESC key
          document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
              closeLightbox();
            }
          });
        ` }} />
      </body>
    </html>
  );
};

export default Layout;
