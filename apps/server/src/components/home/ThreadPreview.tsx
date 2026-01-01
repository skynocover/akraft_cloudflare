import type { FC } from "hono/jsx";
import type { ThreadWithReplies } from "../../types/forum";

interface ThreadPreviewProps {
  thread: ThreadWithReplies;
  organizationId: string;
}

// Format relative time (e.g., "5分前", "2時間前")
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay > 0) return `${diffDay}日前`;
  if (diffHour > 0) return `${diffHour}時間前`;
  if (diffMin > 0) return `${diffMin}分前`;
  return "たった今";
}

// Truncate text to a certain length
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export const ThreadPreview: FC<ThreadPreviewProps> = ({
  thread,
  organizationId,
}) => {
  const threadUrl = `/service/${organizationId}/${thread.id}`;
  const hasImage = !!thread.image;
  const hasYoutube = !!thread.youtubeID;
  const youtubeThumb = thread.youtubeID
    ? `https://img.youtube.com/vi/${thread.youtubeID}/mqdefault.jpg`
    : null;

  return (
    <a
      href={threadUrl}
      class="block group hover:bg-accent/50 rounded-lg p-3 transition-colors"
    >
      <div class="flex gap-3">
        {/* Thumbnail */}
        {(hasImage || hasYoutube) && (
          <div class="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-muted">
            {hasImage ? (
              <img
                src={thread.image}
                alt=""
                class="w-full h-full object-cover"
              />
            ) : hasYoutube ? (
              <div class="relative w-full h-full">
                <img
                  src={youtubeThumb!}
                  alt=""
                  class="w-full h-full object-cover"
                />
                {/* YouTube play icon overlay */}
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                    <svg
                      class="w-3 h-3 text-white ml-0.5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Content */}
        <div class="flex-1 min-w-0">
          <h4 class="font-medium text-sm text-foreground group-hover:text-primary truncate">
            {thread.title}
          </h4>
          {!hasImage && !hasYoutube && thread.content && (
            <p class="text-xs text-muted-foreground mt-1 line-clamp-2">
              {truncateText(thread.content, 80)}
            </p>
          )}
          <div class="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <span>{formatRelativeTime(thread.replyAt)}</span>
            {thread.replyCount !== undefined && thread.replyCount > 0 && (
              <>
                <span>·</span>
                <span>{thread.replyCount} 件の返信</span>
              </>
            )}
          </div>
        </div>
      </div>
    </a>
  );
};

export default ThreadPreview;
