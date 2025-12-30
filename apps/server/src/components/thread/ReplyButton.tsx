import type { FC } from "hono/jsx";
import { PostCard } from "./PostCard";

// MessageSquare Icon (reply icon)
const MessageSquareIcon = () => (
  <svg
    class="h-6 w-6"
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

interface ReplyButtonProps {
  serviceId: string;
  threadId: string;
  serviceOwnerId: string;
}

export const ReplyButton: FC<ReplyButtonProps> = ({
  serviceId,
  threadId,
  serviceOwnerId: _serviceOwnerId,
}) => {
  const modalId = `reply-modal-${threadId}`;

  return (
    <>
      <button
        type="button"
        class="p-2 hover:bg-blue-100 hover:border-blue-300 transition-colors duration-200 rounded"
        onclick={`document.getElementById('${modalId}').style.display='flex'`}
        title="Reply"
      >
        <MessageSquareIcon />
      </button>

      {/* Reply Modal */}
      <div
        id={modalId}
        class="fixed inset-0 bg-black bg-opacity-50 items-center justify-center z-50"
        style="display: none;"
        onclick={`if(event.target === this) this.style.display='none'`}
      >
        <div class="w-full max-w-md" onclick="event.stopPropagation()">
          <PostCard
            serviceId={serviceId}
            threadId={threadId}
            isReply={true}
            isModal={true}
            modalId={modalId}
          />
        </div>
      </div>
    </>
  );
};

interface ReplyNoButtonProps {
  serviceId: string;
  threadId: string;
  replyId?: string;
  serviceOwnerId: string;
}

export const ReplyNoButton: FC<ReplyNoButtonProps> = ({
  serviceId,
  threadId,
  replyId,
  serviceOwnerId: _serviceOwnerId,
}) => {
  const targetId = replyId || threadId;
  const modalId = `reply-no-modal-${targetId}`;
  const initContent = `>> ${targetId}\n`;

  return (
    <>
      <span
        class="text-blue-400 ml-1 hover:underline cursor-pointer"
        onclick={`document.getElementById('${modalId}').style.display='flex'`}
      >
        No. {targetId}
      </span>

      {/* Reply Modal with quote */}
      <div
        id={modalId}
        class="fixed inset-0 bg-black bg-opacity-50 items-center justify-center z-50"
        style="display: none;"
        onclick={`if(event.target === this) this.style.display='none'`}
      >
        <div class="w-full max-w-md" onclick="event.stopPropagation()">
          <PostCard
            serviceId={serviceId}
            threadId={threadId}
            isReply={true}
            isModal={true}
            modalId={modalId}
            initContent={initContent}
          />
        </div>
      </div>
    </>
  );
};

export default ReplyButton;
