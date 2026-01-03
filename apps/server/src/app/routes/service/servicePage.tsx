import type { FC } from "hono/jsx";
import { Layout } from "../../../components/Layout";
import { TopLink } from "../../../components/layout/TopLink";
import { Title } from "../../../components/layout/Title";
import { Pagination } from "../../../components/layout/Pagination";
import { Footer } from "../../../components/layout/Footer";
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
  user?: { name: string; email: string } | null;
  isAdmin?: boolean;
  searchQuery?: string;
}

export const ServicePage: FC<ServicePageProps> = ({
  serviceId,
  page,
  service,
  threads,
  totalPages,
  adminUrl,
  user,
  isAdmin,
  searchQuery,
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

  // Build base URL with search query if present
  const baseUrl = searchQuery
    ? `/service/${serviceId}?q=${encodeURIComponent(searchQuery)}`
    : `/service/${serviceId}`;

  return (
    <Layout title={service.name}>
      <div class="container mx-auto px-6 pb-6 pt-2 max-w-6xl">
        <TopLink links={service.metadata?.topLinks || []} serviceId={serviceId} adminUrl={adminUrl} user={user} currentPath={`/service/${serviceId}`} searchQuery={searchQuery} />
        <Title title={service.name || ""} links={service.metadata?.headLinks || []} />

        <PostCard
          serviceId={serviceId}
          description={service.metadata?.description || ""}
          isAdmin={isAdmin}
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
            isAdmin={isAdmin}
          />
        ))}

        <Pagination
          totalPages={totalPages}
          currentPage={page}
          baseUrl={baseUrl}
        />

        <Footer />
      </div>
    </Layout>
  );
};

export default ServicePage;
