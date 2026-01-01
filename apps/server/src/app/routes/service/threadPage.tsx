import type { FC } from "hono/jsx";
import { Layout } from "../../../components/Layout";
import { TopLink } from "../../../components/layout/TopLink";
import { Title } from "../../../components/layout/Title";
import { Thread } from "../../../components/thread/Thread";
import type { Service, ThreadWithReplies } from "../../../types/forum";

interface ThreadPageProps {
  serviceId: string;
  service: Service | null;
  thread: ThreadWithReplies | null;
  adminUrl?: string;
}

export const ThreadPage: FC<ThreadPageProps> = ({
  serviceId,
  service,
  thread,
  adminUrl,
}) => {
  if (!service || !thread) {
    return (
      <Layout title="Not Found">
        <div class="container mx-auto p-6 max-w-6xl">
          <div class="text-center py-20">
            <h1 class="text-4xl font-bold text-gray-800 mb-4">404</h1>
            <p class="text-gray-600">Thread not found</p>
            <a
              href={`/service/${serviceId}`}
              class="text-blue-500 hover:underline mt-4 inline-block"
            >
              ← Back
            </a>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`${thread.title} - ${service.name}`}>
      <div class="container mx-auto p-6 max-w-6xl relative">
        <TopLink links={service.metadata?.topLinks || []} serviceId={serviceId} adminUrl={adminUrl} />
        <Title title={service.name || ""} links={service.metadata?.headLinks || []} />

        {/* Back link */}
        <div class="mb-4">
          <a
            href={`/service/${serviceId}`}
            class="text-blue-500 hover:underline text-sm"
          >
            ← Back
          </a>
        </div>

        {/* Full thread content */}
        <Thread
          serviceId={serviceId}
          thread={thread}
          isPreview={false}
        />
      </div>
    </Layout>
  );
};

export default ThreadPage;
