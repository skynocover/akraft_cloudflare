import type { FC } from 'hono/jsx';
import type { ThreadWithReplies } from '../../lib/types';
import { cn, getImageUrl } from '../../lib/utils';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import { Button, buttonVariants } from '../ui/Button';
import { Separator } from '../ui/Separator';
import { PostMeta, PostComponent } from './Post';

interface ThreadComponentProps {
  serviceId: string;
  thread: ThreadWithReplies;
  isPreview: boolean;
  serviceOwnerId: string;
}

export const ThreadComponent: FC<ThreadComponentProps> = ({
  thread,
  isPreview,
  serviceId,
  serviceOwnerId,
}) => {
  const visibleRepliesNum = 5;
  const visibleReplies = isPreview
    ? thread.replies.slice(-visibleRepliesNum)
    : thread.replies;
  const hasMoreReplies = isPreview && thread.replies.length > visibleRepliesNum;

  return (
    <Card id={thread.id} class="mb-6 overflow-hidden scroll-mt-20">
      <CardHeader class="pb-3">
        <div class="flex items-center justify-center">
          <CardTitle class="text-2xl font-bold text-center">
            {isPreview ? (
              <a
                class="cursor-pointer hover:underline text-gray-900"
                href={`/service/${serviceId}/${thread.id}`}
              >
                {thread.title}
              </a>
            ) : (
              <span>{thread.title}</span>
            )}
          </CardTitle>
          <Button variant="ghost" size="icon" class="hover:bg-blue-100 ml-2">
            <svg
              class="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </Button>
        </div>
        <PostMeta
          name={thread.name || ''}
          userId={thread.userId || ''}
          createdAt={thread.createdAt}
          threadId={thread.id}
          serviceId={serviceId}
          serviceOwnerId={serviceOwnerId}
        />
      </CardHeader>
      <CardContent class="pt-3">
        <PostComponent
          content={thread.content || ''}
          imageURL={thread.imageToken ? getImageUrl(thread.imageToken) : null}
          youtubeID={thread.youtubeID || null}
        />
      </CardContent>
      {thread.replies.length > 0 && (
        <CardFooter class="flex flex-col pt-4">
          <Separator class="mb-4" />
          {hasMoreReplies && (
            <a
              href={`/service/${serviceId}/${thread.id}`}
              class={cn(buttonVariants({ variant: 'outline' }), 'w-full mb-4')}
            >
              <svg
                class="mr-2 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
              Show All {thread.replies.length} Replies
            </a>
          )}
          <div class="space-y-4 w-full">
            {visibleReplies.map((reply, index) => (
              <div key={reply.id} class="mt-4 scroll-mt-20" id={reply.id}>
                {index > 0 && <Separator />}
                <div>
                  <PostMeta
                    name={reply.name || ''}
                    userId={reply.userId || ''}
                    createdAt={reply.createdAt}
                    threadId={thread.id}
                    replyId={reply.id}
                    serviceId={serviceId}
                    serviceOwnerId={serviceOwnerId}
                  />
                  <div class="mt-2">
                    <PostComponent
                      imageURL={reply.imageToken ? getImageUrl(reply.imageToken) : null}
                      content={reply.content || ''}
                      youtubeID={reply.youtubeID || null}
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
