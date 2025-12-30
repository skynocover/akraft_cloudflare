import type { FC } from "hono/jsx";
import { ReplyNoButton } from "./ReplyButton";
import { ReportButton } from "./ReportButton";

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

// Simple Markdown rendering (SSR compatible)
export const PostContent: FC<{ content: string }> = ({ content }) => {
  const lines = content.split("\n");

  return (
    <div class="prose prose-sm max-w-none break-words">
      {lines.map((line, index) => {
        // Handle headings
        if (line.startsWith("### ")) {
          return (
            <h3 key={index} class="text-lg font-semibold mb-2">
              {line.slice(4)}
            </h3>
          );
        }
        if (line.startsWith("## ")) {
          return (
            <h2 key={index} class="text-xl font-semibold mb-3">
              {line.slice(3)}
            </h2>
          );
        }
        if (line.startsWith("# ")) {
          return (
            <h1 key={index} class="text-2xl font-bold mb-4">
              {line.slice(2)}
            </h1>
          );
        }
        // Handle >> quotes (reply references)
        if (line.startsWith(">> ")) {
          const refId = line.slice(3).trim();
          return (
            <p
              key={index}
              class="text-blue-500 hover:underline cursor-pointer mb-1"
              onclick={`document.getElementById('${refId}')?.scrollIntoView({behavior:'smooth'})`}
            >
              {">> " + refId}
            </p>
          );
        }
        // Handle > quotes (blockquote)
        if (line.startsWith("> ")) {
          return (
            <blockquote
              key={index}
              class="border-l-4 border-gray-300 pl-4 italic my-1 text-gray-600"
            >
              {line.slice(2)}
            </blockquote>
          );
        }
        // Handle lists
        if (line.startsWith("- ") || line.startsWith("* ")) {
          return (
            <li key={index} class="ml-4 list-disc">
              {line.slice(2)}
            </li>
          );
        }
        if (/^\d+\. /.test(line)) {
          return (
            <li key={index} class="ml-4 list-decimal">
              {line.replace(/^\d+\. /, "")}
            </li>
          );
        }
        // Handle code block markers (simplified)
        if (line.startsWith("```")) {
          return null;
        }
        // Empty lines
        if (line.trim() === "") {
          return <br key={index} />;
        }
        // Handle bold text
        const boldProcessed = line.replace(
          /\*\*(.+?)\*\*/g,
          '<strong class="font-bold">$1</strong>'
        );

        // Regular paragraph
        return (
          <p
            key={index}
            class="mb-2"
            dangerouslySetInnerHTML={{ __html: boldProcessed }}
          />
        );
      })}
    </div>
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
          class="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
          loading="lazy"
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
}> = ({ name, userId, createdAt, threadId, replyId, serviceId, serviceOwnerId, reportedIp }) => {
  const displayId = replyId || threadId;

  return (
    <div
      class="flex flex-wrap items-center gap-2 text-sm text-gray-500"
    >
      <span class="font-semibold text-gray-700">{name}</span>
      {userId && (
        <span>
          ID:{" "}
          <span
            class={userId === "admin" ? "font-semibold text-purple-500" : ""}
          >
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
