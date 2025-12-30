import type { FC } from "hono/jsx";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { markdownToHtml } from "../../lib/utils";

// Upload SVG Icon
const UploadIcon = () => (
  <svg
    class="w-8 h-8 text-gray-400 mb-2"
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

// Link SVG Icon
const LinkIcon = () => (
  <svg
    class="h-4 w-4 text-gray-500 mr-2"
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
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
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

interface PostCardProps {
  description?: string;
  serviceId: string;
  threadId?: string;
  isReply?: boolean;
  isModal?: boolean;
  modalId?: string;
  initContent?: string;
}

export const PostCard: FC<PostCardProps> = ({
  description,
  serviceId,
  threadId,
  isReply = false,
  isModal = false,
  modalId,
  initContent = "",
}) => {
  const actionUrl = isReply
    ? `/api/service/${serviceId}/reply`
    : `/api/service/${serviceId}/thread`;

  // Use modalId for unique identification when in modal mode
  const uniqueId = modalId || `${threadId || "new"}-${isModal ? "modal" : "page"}`;
  const formId = `postcard-form-${uniqueId}`;
  const tabsId = `tabs-${uniqueId}`;
  const previewId = `preview-${uniqueId}`;
  const contentId = `content-${uniqueId}`;

  return (
    <Card
      class={`mb-4 shadow-md ${
        isReply ? "w-full max-w-md mx-auto" : "mx-auto max-w-3xl"
      }`}
    >
      <CardContent class={`p-3 ${isModal ? "relative" : ""}`}>
        {isModal && modalId && (
          <button
            type="button"
            class="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded"
            onclick={`document.getElementById('${modalId}').style.display='none'`}
          >
            <CloseIcon />
          </button>
        )}
        <form
          id={formId}
          action={actionUrl}
          method="post"
          enctype="multipart/form-data"
          class="space-y-2"
          onsubmit={`
            var content = document.getElementById('${contentId}').value.trim();
            var fileInput = document.querySelector('#${formId} input[name="image"]');
            var hasImage = fileInput && fileInput.files && fileInput.files.length > 0;
            if (!content && !hasImage) {
              alert('Please enter content or upload an image');
              return false;
            }
            if (hasImage && fileInput.files[0].size > 5 * 1024 * 1024) {
              alert('File size exceeds 5MB limit');
              return false;
            }
            return true;
          `}
        >
          {threadId && <input type="hidden" name="threadId" value={threadId} />}

          <div class="flex space-x-2">
            {!isReply && (
              <Input
                name="title"
                placeholder="Title"
                class="text-base"
                required={!isReply}
              />
            )}
            <Input
              name="name"
              placeholder="Name (optional)"
              class="text-base"
            />
          </div>

          <div class="relative">
            {/* Eye icon for preview toggle */}
            <button
              type="button"
              id={`${previewId}-btn`}
              class="absolute top-2 right-2 p-1 text-gray-400 hover:text-blue-500 hover:bg-gray-100 rounded z-10"
              title="Preview"
              onclick={`(function(){
                var textarea = document.getElementById('${contentId}');
                var preview = document.getElementById('${previewId}');
                var btn = document.getElementById('${previewId}-btn');
                var isPreviewMode = !preview.classList.contains('hidden');
                if (isPreviewMode) {
                  textarea.classList.remove('hidden');
                  preview.classList.add('hidden');
                  btn.title = 'Preview';
                  textarea.focus();
                } else {
                  var text = textarea.value || '';
                  if (!text.trim()) {
                    preview.innerHTML = '<span class=\"text-gray-400\">Nothing to preview...</span>';
                  } else {
                    preview.innerHTML = markdownToHtml(text);
                  }
                  textarea.classList.add('hidden');
                  preview.classList.remove('hidden');
                  btn.title = 'Edit';
                }
              })()`}
            >
              <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
            <Textarea
              id={contentId}
              name="content"
              placeholder="Content (supports Markdown: # Header, - List, **bold**, *italic*)"
              class="h-40 text-sm border pr-10"
              value={initContent}
            />
            <div
              id={previewId}
              class="h-40 p-3 bg-gray-50 rounded border text-sm overflow-y-auto hidden"
            >
              <span class="text-gray-400">Nothing to preview...</span>
            </div>
          </div>

          {/* Tabs for Upload/YouTube */}
          <div class="border rounded-md overflow-hidden">
            <div class="flex border-b" role="tablist">
              <button
                type="button"
                id={`${tabsId}-upload-tab`}
                class="flex-1 px-4 py-2 text-sm font-medium bg-gray-100 border-b-2 border-blue-500"
                onclick={`
                  document.getElementById('${tabsId}-upload').style.display='block';
                  document.getElementById('${tabsId}-youtube').style.display='none';
                  this.classList.add('bg-gray-100','border-blue-500');
                  this.classList.remove('bg-white','border-transparent');
                  document.getElementById('${tabsId}-youtube-tab').classList.remove('bg-gray-100','border-blue-500');
                  document.getElementById('${tabsId}-youtube-tab').classList.add('bg-white','border-transparent');
                `}
              >
                Upload
              </button>
              <button
                type="button"
                id={`${tabsId}-youtube-tab`}
                class="flex-1 px-4 py-2 text-sm font-medium bg-white border-b-2 border-transparent"
                onclick={`
                  document.getElementById('${tabsId}-upload').style.display='none';
                  document.getElementById('${tabsId}-youtube').style.display='block';
                  this.classList.add('bg-gray-100','border-blue-500');
                  this.classList.remove('bg-white','border-transparent');
                  document.getElementById('${tabsId}-upload-tab').classList.remove('bg-gray-100','border-blue-500');
                  document.getElementById('${tabsId}-upload-tab').classList.add('bg-white','border-transparent');
                `}
              >
                YouTube
              </button>
            </div>

            {/* Upload Tab Content */}
            <div id={`${tabsId}-upload`} class="p-3">
              <div class="flex items-center justify-center w-full h-24 border-2 border-dashed rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer">
                <label class="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                  <UploadIcon />
                  <p id={`${tabsId}-filename`} class="text-xs text-gray-500">
                    Click or drag to upload image
                  </p>
                  <input
                    type="file"
                    name="image"
                    class="hidden"
                    accept="image/*"
                    onchange={`
                      var label = document.getElementById('${tabsId}-filename');
                      var maxSize = 5 * 1024 * 1024;
                      if (this.files && this.files[0]) {
                        if (this.files[0].size > maxSize) {
                          alert('File size exceeds 5MB limit');
                          this.value = '';
                          label.textContent = 'Click or drag to upload image';
                          label.classList.add('text-gray-500');
                          label.classList.remove('text-blue-600', 'font-medium', 'text-red-500');
                          return;
                        }
                        label.textContent = this.files[0].name;
                        label.classList.remove('text-gray-500', 'text-red-500');
                        label.classList.add('text-blue-600', 'font-medium');
                      } else {
                        label.textContent = 'Click or drag to upload image';
                        label.classList.add('text-gray-500');
                        label.classList.remove('text-blue-600', 'font-medium', 'text-red-500');
                      }
                    `}
                  />
                </label>
              </div>
            </div>

            {/* YouTube Tab Content */}
            <div id={`${tabsId}-youtube`} class="p-3" style="display: none;">
              <div class="flex items-center">
                <LinkIcon />
                <Input
                  name="youtubeLink"
                  placeholder="https://www.youtube.com/watch?v=..."
                  class="flex-1"
                />
              </div>
            </div>
          </div>

          {!isReply && description && (
            <div
              class="text-sm text-gray-600 p-2 bg-gray-50 rounded prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: markdownToHtml(description) }}
            />
          )}

          <div class="flex gap-2">
            <Button
              type="submit"
              class="flex-1 bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200"
            >
              {isReply ? "Submit reply" : "Submit"}
            </Button>
            {isReply && (
              <label class="flex items-center space-x-2 text-sm">
                <input type="checkbox" name="sage" class="rounded" />
                <span>Sage</span>
              </label>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PostCard;
