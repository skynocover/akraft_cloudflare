import type { FC } from "hono/jsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../ui/card";
import { Separator } from "../ui/separator";
import { PostMeta, PostComponent } from "./Post";
import { ReplyButton } from "./ReplyButton";
import type { ThreadWithReplies } from "../../types/forum";

// ChevronDown Icon
const ChevronDownIcon = () => (
  <svg
    class="mr-2 h-4 w-4"
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
    <polyline points="6 9 12 15 18 9" />
  </svg>
);


interface ThreadComponentProps {
  serviceId: string;
  thread: ThreadWithReplies;
  isPreview: boolean;
  serviceOwnerId?: string;
}

export const Thread: FC<ThreadComponentProps> = ({
  thread,
  isPreview,
  serviceId,
  serviceOwnerId,
}) => {
  const visibleRepliesNum = 5;
  const hiddenRepliesCount = Math.max(0, thread.replies.length - visibleRepliesNum);
  const previewReplies = thread.replies.slice(-visibleRepliesNum);
  const hiddenReplies = thread.replies.slice(0, -visibleRepliesNum);

  const expandBtnId = `expand-btn-${thread.id}`;
  const hiddenRepliesId = `hidden-replies-${thread.id}`;

  return (
    <Card class="mb-6 overflow-hidden scroll-mt-20" id={thread.id}>
      <CardHeader class="pb-3">
        <div class="flex items-center justify-center">
          <CardTitle class="text-2xl font-bold text-center">
            {isPreview ? (
              <a
                href={`/service/${serviceId}/${thread.id}`}
                class="cursor-pointer hover:underline text-gray-900"
              >
                {thread.title}
              </a>
            ) : (
              <span class="text-gray-900">{thread.title}</span>
            )}
          </CardTitle>
          <ReplyButton
            serviceId={serviceId}
            threadId={thread.id}
            serviceOwnerId={serviceOwnerId || ""}
          />
        </div>

        <PostMeta
          name={thread.name || "Anonymous"}
          userId={thread.userId}
          createdAt={thread.createdAt}
          threadId={thread.id}
          serviceId={serviceId}
          serviceOwnerId={serviceOwnerId}
        />
      </CardHeader>

      <CardContent class="pt-3">
        <PostComponent
          content={thread.content || ""}
          imageURL={thread.image || thread.imageToken}
          youtubeID={thread.youtubeID}
        />
      </CardContent>

      {thread.replies.length > 0 && (
        <CardFooter class="flex flex-col pt-4">
          <Separator class="mb-4" />

          {/* Expand/Collapse Button for hidden replies */}
          {isPreview && hiddenRepliesCount > 0 && (
            <>
              <button
                type="button"
                id={expandBtnId}
                class="w-full mb-4 py-2 flex items-center justify-center text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded border border-blue-200 transition-colors"
                onclick={`
                  var hidden = document.getElementById('${hiddenRepliesId}');
                  var btn = document.getElementById('${expandBtnId}');
                  if (hidden.style.display === 'none') {
                    hidden.style.display = 'block';
                    btn.innerHTML = '<svg class="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg> Hide Replies';
                  } else {
                    hidden.style.display = 'none';
                    btn.innerHTML = '<svg class="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg> Show All ${thread.replies.length} Replies';
                  }
                `}
              >
                <ChevronDownIcon /> Show All {thread.replies.length} Replies
              </button>

              {/* Hidden Replies Container */}
              <div id={hiddenRepliesId} class="w-full" style="display: none;">
                {hiddenReplies.map((reply, index) => (
                  <div key={reply.id} class="scroll-mt-20 mb-4" id={reply.id}>
                    {index > 0 && <Separator class="mb-4" />}
                    <div>
                      <PostMeta
                        name={reply.name || "Anonymous"}
                        userId={reply.userId}
                        createdAt={reply.createdAt}
                        threadId={thread.id}
                        replyId={reply.id}
                        serviceId={serviceId}
                        serviceOwnerId={serviceOwnerId}
                      />
                      <div class="mt-2">
                        <PostComponent
                          imageURL={reply.image || reply.imageToken}
                          content={reply.content || ""}
                          youtubeID={reply.youtubeID}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <Separator class="mb-4" />
              </div>
            </>
          )}

          {/* Visible Replies (always shown) */}
          <div class="space-y-4 w-full">
            {previewReplies.map((reply, index) => (
              <div key={reply.id} class="scroll-mt-20" id={reply.id}>
                {index > 0 && <Separator class="mb-4" />}
                <div>
                  <PostMeta
                    name={reply.name || "Anonymous"}
                    userId={reply.userId}
                    createdAt={reply.createdAt}
                    threadId={thread.id}
                    replyId={reply.id}
                    serviceId={serviceId}
                    serviceOwnerId={serviceOwnerId}
                  />
                  <div class="mt-2">
                    <PostComponent
                      imageURL={reply.image || reply.imageToken}
                      content={reply.content || ""}
                      youtubeID={reply.youtubeID}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default Thread;
