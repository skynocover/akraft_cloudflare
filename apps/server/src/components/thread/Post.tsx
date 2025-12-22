import type { FC } from 'hono/jsx';
import { formatTime } from '../../lib/utils';
import { Button } from '../ui/Button';

interface PostContentProps {
  content: string;
}

export const PostContent: FC<PostContentProps> = ({ content }) => {
  const lines = content.split('\n');

  return (
    <div class="line-break prose prose-sm sm:prose lg:prose-lg max-w-none break-words">
      {lines.map((line, index) => {
        if (line.startsWith('# ')) {
          return <h1 key={index} class="text-3xl font-bold mb-4">{line.slice(2)}</h1>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={index} class="text-2xl font-semibold mb-3">{line.slice(3)}</h2>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={index} class="text-xl font-semibold mb-2">{line.slice(4)}</h3>;
        }
        if (line.startsWith('> ')) {
          return (
            <blockquote key={index} class="border-l-4 border-gray-300 pl-4 italic my-1">
              {line.slice(2)}
            </blockquote>
          );
        }
        if (line.startsWith('>> rec_')) {
          const id = line.slice(3).trim();
          return (
            <a
              key={index}
              href={`#${id}`}
              class="text-blue-500 transition-colors duration-300 hover:underline block"
            >
              {line}
            </a>
          );
        }
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return <li key={index} class="mb-1 ml-5">{line.slice(2)}</li>;
        }
        if (line.match(/^\d+\. /)) {
          return <li key={index} class="mb-1 ml-5 list-decimal">{line.replace(/^\d+\. /, '')}</li>;
        }
        if (line.startsWith('**') && line.endsWith('**')) {
          return <strong key={index} class="font-bold">{line.slice(2, -2)}</strong>;
        }
        if (line.trim() === '') {
          return <br key={index} />;
        }
        return <p key={index} class="mb-2">{line}</p>;
      })}
    </div>
  );
};

interface MediaContentProps {
  imageURL: string | null;
  youtubeID: string | null;
}

export const MediaContent: FC<MediaContentProps> = ({ imageURL, youtubeID }) => {
  if (imageURL) {
    return (
      <div>
        <img
          src={imageURL}
          alt="Post image"
          class="w-full h-full max-w-full max-h-[400px] object-contain cursor-pointer rounded-lg"
        />
      </div>
    );
  }
  if (youtubeID) {
    return (
      <div class="relative w-full pt-[56.25%]">
        <iframe
          src={`https://www.youtube.com/embed/${youtubeID}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          class="absolute top-0 left-0 w-full h-full rounded-lg"
        />
      </div>
    );
  }
  return null;
};

interface PostComponentProps {
  imageURL: string | null;
  youtubeID: string | null;
  content: string;
}

export const PostComponent: FC<PostComponentProps> = ({ imageURL, youtubeID, content }) => {
  return (
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
};

interface PostMetaProps {
  name: string;
  userId: string;
  createdAt: Date;
  threadId?: string;
  replyId?: string;
  serviceId: string;
  serviceOwnerId: string;
}

export const PostMeta: FC<PostMetaProps> = ({
  name,
  userId,
  createdAt,
  threadId,
  replyId,
  serviceId: _serviceId,
  serviceOwnerId: _serviceOwnerId,
}) => {
  void _serviceId;
  void _serviceOwnerId;
  const displayId = replyId || threadId;

  return (
    <div
      class="flex flex-wrap items-center gap-2 text-sm text-gray-500"
      id={displayId}
    >
      <span class="font-semibold text-gray-700">{name}</span>
      <span>
        ID:{' '}
        <span class={userId === 'admin' ? 'font-semibold text-purple-500' : ''}>
          {userId}
        </span>
      </span>
      <span class="ml-auto flex items-center">
        {formatTime(createdAt)}
        <span class="text-blue-300 ml-1 hover:underline cursor-pointer">
          No: {displayId}
        </span>
        <Button
          variant="ghost"
          size="icon"
          class="ml-1 h-6 w-6"
          title="Report this post"
        >
          <svg
            class="h-4 w-4 text-red-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
            <line x1="4" y1="22" x2="4" y2="15" />
          </svg>
        </Button>
      </span>
    </div>
  );
};
