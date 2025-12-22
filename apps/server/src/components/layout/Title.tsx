import type { FC } from 'hono/jsx';
import type { LinkItem } from '../../lib/types';

interface TitleProps {
  title: string;
  links: LinkItem[];
}

export const Title: FC<TitleProps> = ({ title, links }) => {
  return (
    <>
      <h1 class="text-3xl font-bold text-center mb-2 mt-6 text-black">
        {title}
      </h1>
      <div class="flex justify-center mb-2 space-x-2">
        {links.map((link, index) => (
          <a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            class="text-blue-500 text-md py-1 px-2 rounded shadow-md border-2 border-blue-400 hover:bg-blue-500 hover:border-blue-500 hover:text-white transition duration-300"
          >
            {link.name}
          </a>
        ))}
      </div>
    </>
  );
};
