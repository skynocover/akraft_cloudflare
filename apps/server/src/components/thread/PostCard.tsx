import type { FC } from 'hono/jsx';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs';
import { Checkbox } from '../ui/Checkbox';
import { Label } from '../ui/Label';

interface PostCardProps {
  description?: string;
  serviceId: string;
  threadId?: string;
  isReply?: boolean;
}

export const PostCard: FC<PostCardProps> = ({
  description,
  serviceId,
  threadId,
  isReply = false,
}) => {
  const formAction = isReply
    ? `/api/service/${serviceId}/reply`
    : `/api/service/${serviceId}/thread`;

  const tabScript = `
    (function() {
      const triggers = document.querySelectorAll('[data-slot="tabs-trigger"]');
      const contents = document.querySelectorAll('[data-slot="tabs-content"]');

      // Initialize: show first tab content, hide others
      contents.forEach((content, index) => {
        if (index === 0) {
          content.style.display = 'block';
        } else {
          content.style.display = 'none';
        }
      });

      // Set first trigger as active
      if (triggers.length > 0) {
        triggers[0].setAttribute('data-state', 'active');
      }

      triggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
          const targetValue = trigger.getAttribute('data-value');

          // Update trigger states
          triggers.forEach(t => t.removeAttribute('data-state'));
          trigger.setAttribute('data-state', 'active');

          // Update content visibility
          contents.forEach(content => {
            const contentValue = content.getAttribute('data-value');
            content.style.display = contentValue === targetValue ? 'block' : 'none';
          });
        });
      });
    })();
  `;

  return (
    <Card class={isReply ? 'w-full max-w-md mx-auto shadow-md' : 'mx-auto max-w-3xl shadow-md'}>
      <CardContent class="p-4">
        <form class="space-y-4" action={formAction} method="post" enctype="multipart/form-data">
          {threadId && <input type="hidden" name="threadId" value={threadId} />}

          <div class="flex gap-2">
            {!isReply && (
              <Input
                type="text"
                name="title"
                placeholder="Title"
              />
            )}
            <Input
              type="text"
              name="name"
              placeholder="Name"
            />
          </div>

          <Textarea
            name="content"
            placeholder="Content (Markdown supported)"
            rows={6}
          />

          {/* Tabs */}
          <Tabs defaultValue="upload">
            <TabsList class="w-full grid grid-cols-2">
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="youtube">YouTube</TabsTrigger>
            </TabsList>

            {/* Upload Tab Content */}
            <TabsContent value="upload" class="mt-3">
              <div class="flex items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
                <label class="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                  <svg
                    class="w-8 h-8 text-gray-400 mb-2"
                    xmlns="http://www.w3.org/2000/svg"
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
                  <p class="text-xs text-gray-500">Click or drag to upload image</p>
                  <Input
                    type="file"
                    name="image"
                    class="hidden"
                    accept="image/*"
                  />
                </label>
              </div>
            </TabsContent>

            {/* YouTube Tab Content */}
            <TabsContent value="youtube" class="mt-3">
              <div class="flex items-center gap-2">
                <svg
                  class="w-5 h-5 text-gray-400 flex-shrink-0"
                  xmlns="http://www.w3.org/2000/svg"
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
                <Input
                  type="text"
                  name="youtubeLink"
                  placeholder="YouTube Link"
                  class="flex-1"
                />
              </div>
            </TabsContent>
          </Tabs>

          {!isReply && description && (
            <p class="text-sm text-gray-500 whitespace-pre-wrap">
              {description}
            </p>
          )}

          <div class="flex items-center gap-4">
            <Button type="submit" class="flex-1">
              {isReply ? 'Submit reply' : 'Submit'}
            </Button>
            {isReply && (
              <div class="flex items-center gap-2">
                <Checkbox id="sage" name="sage" />
                <Label for="sage">Sage</Label>
              </div>
            )}
          </div>
        </form>
        <script dangerouslySetInnerHTML={{ __html: tabScript }} />
      </CardContent>
    </Card>
  );
};
