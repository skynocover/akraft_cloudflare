import type { FC, PropsWithChildren } from "hono/jsx";
import { markdownToHtmlScript } from "../lib/utils";

interface LayoutProps extends PropsWithChildren {
  title?: string;
  turnstileSiteKey?: string;
}

export const Layout: FC<LayoutProps> = ({ children, title = "Forum", turnstileSiteKey }) => {
  return (
    <html lang="zh-TW">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        {/* Tailwind CSS - Workers Assets */}
        <link rel="stylesheet" href="/styles.css" />
        {/* Google AdSense */}
        <meta name="google-adsense-account" content="ca-pub-4832588143134491" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4832588143134491"
          crossorigin="anonymous"
        />
        {/* Cloudflare Turnstile */}
        {turnstileSiteKey && (
          <>
            <script
              src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onTurnstileLoad"
              async
              defer
            />
            <script dangerouslySetInnerHTML={{ __html: `
              window.__TURNSTILE_SITE_KEY = ${JSON.stringify(turnstileSiteKey)};
              function renderTurnstileWidget(containerId, retries) {
                var el = document.getElementById(containerId);
                if (!el || el.dataset.rendered === 'true') return;
                retries = retries || 0;
                if (window.turnstile) {
                  turnstile.render(el, {
                    sitekey: window.__TURNSTILE_SITE_KEY,
                    theme: 'light'
                  });
                  el.dataset.rendered = 'true';
                } else if (retries < 10) {
                  setTimeout(function() { renderTurnstileWidget(containerId, retries + 1); }, 500);
                }
              }
              function renderVisibleWidgets() {
                var widgets = document.querySelectorAll('.turnstile-widget');
                for (var i = 0; i < widgets.length; i++) {
                  if (widgets[i].offsetParent !== null) {
                    renderTurnstileWidget(widgets[i].id);
                  }
                }
              }
              function onTurnstileLoad() {
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', renderVisibleWidgets);
                } else {
                  renderVisibleWidgets();
                }
              }
            ` }} />
          </>
        )}
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
