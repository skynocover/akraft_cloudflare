import type { FC } from 'hono/jsx';
import type { Service, ThreadWithReplies } from '../../../lib/types';
import { TopLink } from '../../../components/layout/TopLink';
import { Title } from '../../../components/layout/Title';
import { ThreadComponent } from '../../../components/thread/Thread';

interface ThreadPageProps {
  service: Service;
  thread: ThreadWithReplies;
}

export const ThreadPage: FC<ThreadPageProps> = ({ service, thread }) => {
  return (
    <div class="container mx-auto p-6 max-w-6xl relative">
      <TopLink links={service.topLinks || []} serviceId={service.id} />
      <Title title={service.name || ''} links={service.headLinks || []} />
      <ThreadComponent
        serviceId={service.id}
        thread={thread}
        isPreview={false}
        serviceOwnerId={service.ownerId || ''}
      />
    </div>
  );
};
