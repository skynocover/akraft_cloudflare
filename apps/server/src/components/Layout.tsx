import type { FC, PropsWithChildren } from "hono/jsx";
import { markdownToHtmlScript } from "../lib/utils";

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
        {/* Tailwind CSS - Workers Assets */}
        <link rel="stylesheet" href="/styles.css" />
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
