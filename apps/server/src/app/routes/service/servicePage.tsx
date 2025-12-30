import type { FC } from "hono/jsx";
import { Layout } from "../../../components/Layout";
import { TopLink } from "../../../components/layout/TopLink";
import { Title } from "../../../components/layout/Title";
import { Pagination } from "../../../components/layout/Pagination";
import { PostCard } from "../../../components/thread/PostCard";
import { Thread } from "../../../components/thread/Thread";
import { getMockService, getMockThreads } from "../../../mock/data";

interface ServicePageProps {
  serviceId: string;
  page: number;
}

export const ServicePage: FC<ServicePageProps> = ({ serviceId, page }) => {
  const service = getMockService(serviceId);

  if (!service) {
    return (
      <Layout title="找不到頁面">
        <div class="container mx-auto p-6 max-w-6xl">
          <div class="text-center py-20">
            <h1 class="text-4xl font-bold text-gray-800 mb-4">404</h1>
            <p class="text-gray-600">找不到此討論區</p>
            <a href="/" class="text-blue-500 hover:underline mt-4 inline-block">
              返回首頁
            </a>
          </div>
        </div>
      </Layout>
    );
  }

  const { threads, totalPages } = getMockThreads(serviceId, page, 10);
  const baseUrl = `/service/${serviceId}`;

  return (
    <Layout title={service.name}>
      <div class="container mx-auto p-6 max-w-6xl relative">
        <TopLink links={service.topLinks || []} serviceId={serviceId} />
        <Title title={service.name || ""} links={service.headLinks || []} />

        <PostCard
          serviceId={serviceId}
          description={service.description || ""}
        />

        <Pagination
          totalPages={totalPages}
          currentPage={page}
          baseUrl={baseUrl}
        />

        {threads.map((thread) => (
          <Thread
            key={thread.id}
            serviceId={serviceId}
            thread={thread}
            isPreview={true}
            serviceOwnerId={service.ownerId}
          />
        ))}

        <Pagination
          totalPages={totalPages}
          currentPage={page}
          baseUrl={baseUrl}
        />
      </div>
    </Layout>
  );
};

export default ServicePage;
