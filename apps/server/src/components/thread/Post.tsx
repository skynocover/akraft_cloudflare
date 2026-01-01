import type { FC } from "hono/jsx";
import { ReplyNoButton } from "./ReplyButton";
import { ReportButton } from "./ReportButton";
import { markdownToHtml } from "../../lib/utils";

// Simple time formatting function
const formatTime = (date: Date): string => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${year}/${month}/${day} ${hours}:${minutes}`;
};

// Markdown rendering using shared markdownToHtml function
export const PostContent: FC<{ content: string }> = ({ content }) => {
  return (
    <div
      class="prose prose-sm max-w-none break-words"
      dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }}
    />
  );
};

// Media content (image or YouTube)
export const MediaContent: FC<{
  imageURL?: string | null;
  youtubeID?: string | null;
}> = ({ imageURL, youtubeID }) => {
  if (imageURL) {
    return (
      <div class="mb-4">
        <img
          src={imageURL}
          alt="Post image"
          class="max-w-full max-h-[800px] w-auto h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity object-contain"
          loading="lazy"
          onclick={`openLightbox('${imageURL}')`}
        />
      </div>
    );
  }
  if (youtubeID) {
    return (
      <div class="relative w-full pt-[56.25%] mb-4">
        <iframe
          src={`https://www.youtube.com/embed/${youtubeID}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          class="absolute top-0 left-0 w-full h-full rounded-lg"
        />
      </div>
    );
  }
  return null;
};

// Post content composition component
export const PostComponent: FC<{
  imageURL?: string | null;
  youtubeID?: string | null;
  content: string;
}> = ({ imageURL, youtubeID, content }) => (
  <div class="flex flex-col md:flex-row md:space-x-4">
    {imageURL || youtubeID ? (
      <>
        <div class="w-full md:w-1/2 mb-4 md:mb-0 h-auto">
          <MediaContent imageURL={imageURL} youtubeID={youtubeID} />
        </div>
        <div class="w-full md:w-1/2">
          <PostContent content={content} />
        </div>
      </>
    ) : (
      <div class="w-full md:w-1/2 mx-auto">
        <PostContent content={content} />
      </div>
    )}
  </div>
);

// Post metadata (author, time, etc.)
export const PostMeta: FC<{
  name: string;
  userId?: string;
  createdAt: Date;
  threadId?: string;
  replyId?: string;
  serviceId: string;
  serviceOwnerId?: string;
  reportedIp?: string;
  isAdmin?: boolean;
  isAdminPoster?: boolean;
}> = ({ name, userId, createdAt, threadId, replyId, serviceId, serviceOwnerId, reportedIp, isAdmin, isAdminPoster }) => {
  const displayId = replyId || threadId;

  return (
    <div
      class="flex flex-wrap items-center gap-2 text-sm text-gray-500"
    >
      <span class="font-semibold text-gray-700">{name}</span>
      {isAdminPoster ? (
        <span>
          ID:{" "}
          <span class="font-bold text-red-500">
            Admin
          </span>
        </span>
      ) : userId && (
        <span>
          ID:{" "}
          <span>
            {userId}
          </span>
        </span>
      )}
      <span class="ml-auto flex items-center">
        <span>{formatTime(createdAt)}</span>
        {displayId && threadId && (
          <ReplyNoButton
            serviceId={serviceId}
            threadId={threadId}
            replyId={replyId}
            serviceOwnerId={serviceOwnerId || ""}
            isAdmin={isAdmin}
          />
        )}
        <ReportButton
          serviceId={serviceId}
          threadId={threadId}
          replyId={replyId}
          reportedIp={reportedIp}
        />
      </span>
    </div>
  );
};

export default PostComponent;
