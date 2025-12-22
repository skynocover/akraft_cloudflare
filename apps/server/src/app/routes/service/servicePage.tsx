import type { FC } from 'hono/jsx';
import type { Service, ThreadWithReplies } from '../../../lib/types';
import { TopLink } from '../../../components/layout/TopLink';
import { Title } from '../../../components/layout/Title';
import { Pagination } from '../../../components/layout/Pagination';
import { ThreadComponent } from '../../../components/thread/Thread';
import { PostCard } from '../../../components/thread/PostCard';

interface ServicePageProps {
  service: Service;
  threads: ThreadWithReplies[];
  totalPages: number;
  currentPage: number;
}

export const ServicePage: FC<ServicePageProps> = ({
  service,
  threads,
  totalPages,
  currentPage,
}) => {
  const baseUrl = `/service/${service.id}`;

  return (
    <div class="container mx-auto p-6 max-w-6xl relative">
      <TopLink links={service.topLinks || []} serviceId={service.id} />
      <Title title={service.name || ''} links={service.headLinks || []} />
      <PostCard serviceId={service.id} description={service.description || ''} />
      <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        baseUrl={baseUrl}
      />
      {threads.map((thread) => (
        <ThreadComponent
          key={thread.id}
          serviceId={service.id}
          thread={thread}
          isPreview={true}
          serviceOwnerId={service.ownerId || ''}
        />
      ))}
      <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        baseUrl={baseUrl}
      />
    </div>
  );
};
