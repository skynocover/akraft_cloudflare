import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Convert markdown to HTML (for server-side rendering)
 * Supports: # headers, - lists, > quotes, >> references, **bold**, *italic*, newlines
 */
export function markdownToHtml(text: string): string {
	if (!text) return "";

	const lines = text.split("\n");
	const htmlLines: string[] = [];

	for (const line of lines) {
		let html = line;

		// Escape HTML first
		html = html
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;");

		// Headers
		if (html.startsWith("### ")) {
			html = `<h3 class="text-base font-semibold mt-2 mb-1">${html.slice(4)}</h3>`;
		} else if (html.startsWith("## ")) {
			html = `<h2 class="text-lg font-semibold mt-2 mb-1">${html.slice(3)}</h2>`;
		} else if (html.startsWith("# ")) {
			html = `<h1 class="text-xl font-bold mt-2 mb-1">${html.slice(2)}</h1>`;
		}
		// Reply reference (>> No.xxx) - must check before blockquote
		else if (html.startsWith("&gt;&gt; ")) {
			const refId = html.slice(9).trim();
			html = `<p class="text-blue-500 hover:underline cursor-pointer mb-1" onclick="document.getElementById('${refId}')?.scrollIntoView({behavior:'smooth'})">&gt;&gt; ${refId}</p>`;
		}
		// Blockquote (> text)
		else if (html.startsWith("&gt; ")) {
			html = `<blockquote class="border-l-4 border-gray-300 pl-4 italic my-1 text-gray-600">${html.slice(5)}</blockquote>`;
		}
		// Unordered list
		else if (html.startsWith("- ") || html.startsWith("* ")) {
			html = `<li class="ml-4 list-disc">${html.slice(2)}</li>`;
		}
		// Ordered list
		else if (/^\d+\. /.test(html)) {
			html = `<li class="ml-4 list-decimal">${html.replace(/^\d+\. /, "")}</li>`;
		}
		// Empty line
		else if (html.trim() === "") {
			html = "<br>";
		}
		// Regular paragraph with inline formatting
		else {
			// Bold and italic
			html = html
				.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
				.replace(/\*(.+?)\*/g, "<em>$1</em>");
			html = `<p class="mb-1">${html}</p>`;
		}

		htmlLines.push(html);
	}

	return htmlLines.join("");
}

/**
 * Get the markdownToHtml function as a string for inline JavaScript
 * This allows the same logic to be used in client-side preview
 */
export const markdownToHtmlScript = `
function markdownToHtml(text) {
  if (!text) return "";
  var lines = text.split("\\n");
  var htmlLines = [];
  for (var i = 0; i < lines.length; i++) {
    var html = lines[i];
    html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    if (html.startsWith("### ")) {
      html = '<h3 class="text-base font-semibold mt-2 mb-1">' + html.slice(4) + '</h3>';
    } else if (html.startsWith("## ")) {
      html = '<h2 class="text-lg font-semibold mt-2 mb-1">' + html.slice(3) + '</h2>';
    } else if (html.startsWith("# ")) {
      html = '<h1 class="text-xl font-bold mt-2 mb-1">' + html.slice(2) + '</h1>';
    } else if (html.startsWith("&gt;&gt; ")) {
      var refId = html.slice(9).trim();
      html = '<p class="text-blue-500 hover:underline cursor-pointer mb-1" onclick="document.getElementById(\\'' + refId + '\\')?.scrollIntoView({behavior:\\'smooth\\'})">&gt;&gt; ' + refId + '</p>';
    } else if (html.startsWith("&gt; ")) {
      html = '<blockquote class="border-l-4 border-gray-300 pl-4 italic my-1 text-gray-600">' + html.slice(5) + '</blockquote>';
    } else if (html.startsWith("- ") || html.startsWith("* ")) {
      html = '<li class="ml-4 list-disc">' + html.slice(2) + '</li>';
    } else if (/^\\d+\\. /.test(html)) {
      html = '<li class="ml-4 list-decimal">' + html.replace(/^\\d+\\. /, "") + '</li>';
    } else if (html.trim() === "") {
      html = "<br>";
    } else {
      html = html.replace(/\\*\\*(.+?)\\*\\*/g, "<strong>$1</strong>").replace(/\\*(.+?)\\*/g, "<em>$1</em>");
      html = '<p class="mb-1">' + html + '</p>';
    }
    htmlLines.push(html);
  }
  return htmlLines.join("");
}
`;
