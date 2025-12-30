import type { FC } from "hono/jsx";
import { Layout } from "../../../components/Layout";
import { TopLink } from "../../../components/layout/TopLink";
import { Title } from "../../../components/layout/Title";
import { Thread } from "../../../components/thread/Thread";
import { getMockService, getMockThread } from "../../../mock/data";

interface ThreadPageProps {
  serviceId: string;
  threadId: string;
}

export const ThreadPage: FC<ThreadPageProps> = ({ serviceId, threadId }) => {
  const service = getMockService(serviceId);
  const thread = getMockThread(serviceId, threadId);

  if (!service || !thread) {
    return (
      <Layout title="找不到頁面">
        <div class="container mx-auto p-6 max-w-6xl">
          <div class="text-center py-20">
            <h1 class="text-4xl font-bold text-gray-800 mb-4">404</h1>
            <p class="text-gray-600">找不到此討論串</p>
            <a
              href={`/service/${serviceId}`}
              class="text-blue-500 hover:underline mt-4 inline-block"
            >
              返回討論區
            </a>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`${thread.title} - ${service.name}`}>
      <div class="container mx-auto p-6 max-w-6xl relative">
        <TopLink links={service.topLinks || []} serviceId={serviceId} />
        <Title title={service.name || ""} links={service.headLinks || []} />

        {/* 返回討論區連結 */}
        <div class="mb-4">
          <a
            href={`/service/${serviceId}`}
            class="text-blue-500 hover:underline text-sm"
          >
            ← 返回討論區
          </a>
        </div>

        {/* 討論串完整內容 */}
        <Thread
          serviceId={serviceId}
          thread={thread}
          isPreview={false}
          serviceOwnerId={service.ownerId}
        />

      </div>
    </Layout>
  );
};

export default ThreadPage;
