import type { FC } from "hono/jsx";
import { Textarea } from "../ui/textarea";

// Red Flag Icon
const FlagIcon = () => (
  <svg
    class="h-4 w-4"
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="red"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" />
  </svg>
);

// X Close Icon
const CloseIcon = () => (
  <svg
    class="h-4 w-4"
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
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

interface ReportButtonProps {
  serviceId: string;
  threadId?: string;
  replyId?: string;
  reportedIp?: string;
}

export const ReportButton: FC<ReportButtonProps> = ({
  serviceId,
  threadId,
  replyId,
  reportedIp,
}) => {
  const targetId = replyId || threadId || "unknown";
  const modalId = `report-modal-${targetId}`;
  const formId = `report-form-${targetId}`;

  return (
    <>
      <button
        type="button"
        class="ml-1 p-1 hover:bg-red-50 rounded"
        onclick={`document.getElementById('${modalId}').style.display='flex'`}
        title="Report this post"
      >
        <FlagIcon />
      </button>

      {/* Report Modal */}
      <div
        id={modalId}
        class="fixed inset-0 bg-black bg-opacity-50 items-center justify-center z-50"
        style="display: none;"
        onclick={`if(event.target === this) this.style.display='none'`}
      >
        <div
          class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4"
          onclick="event.stopPropagation()"
        >
          <div class="flex justify-between items-center p-4 border-b">
            <h3 class="text-lg font-semibold">Report</h3>
            <button
              type="button"
              class="p-1 hover:bg-gray-100 rounded"
              onclick={`document.getElementById('${modalId}').style.display='none'`}
            >
              <CloseIcon />
            </button>
          </div>

          <form
            id={formId}
            action={`/api/service/${serviceId}/report`}
            method="post"
            class="p-4 space-y-4"
          >
            {threadId && <input type="hidden" name="threadId" value={threadId} />}
            {replyId && <input type="hidden" name="replyId" value={replyId} />}
            {reportedIp && <input type="hidden" name="reportedIp" value={reportedIp} />}

            <Textarea
              name="content"
              placeholder="Enter reason for reporting"
              class="min-h-[100px]"
              required
            />

            <div class="flex justify-end gap-2">
              <button
                type="button"
                class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                onclick={`document.getElementById('${modalId}').style.display='none'`}
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Report
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ReportButton;
