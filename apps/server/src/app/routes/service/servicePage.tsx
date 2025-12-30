import type { FC } from "hono/jsx";
import { Layout } from "../../../components/Layout";
import { TopLink } from "../../../components/layout/TopLink";
import { Title } from "../../../components/layout/Title";
import { Pagination } from "../../../components/layout/Pagination";
import { PostCard } from "../../../components/thread/PostCard";
import { Thread } from "../../../components/thread/Thread";
import type { Service, ThreadWithReplies } from "../../../types/forum";

interface ServicePageProps {
  serviceId: string;
  page: number;
  service: Service | null;
  threads: ThreadWithReplies[];
  totalPages: number;
  adminUrl?: string;
}

export const ServicePage: FC<ServicePageProps> = ({
  serviceId,
  page,
  service,
  threads,
  totalPages,
  adminUrl,
}) => {
  if (!service) {
    return (
      <Layout title="Not Found">
        <div class="container mx-auto p-6 max-w-6xl">
          <div class="text-center py-20">
            <h1 class="text-4xl font-bold text-gray-800 mb-4">404</h1>
            <p class="text-gray-600">Service not found</p>
            <a href="/" class="text-blue-500 hover:underline mt-4 inline-block">
              Back to Home
            </a>
          </div>
        </div>
      </Layout>
    );
  }

  const baseUrl = `/service/${serviceId}`;

  return (
    <Layout title={service.name}>
      <div class="container mx-auto p-6 max-w-6xl relative">
        <TopLink links={service.topLinks || []} serviceId={serviceId} adminUrl={adminUrl} />
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
