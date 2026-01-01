import type { FC } from "hono/jsx";
import { Layout } from "../../components/Layout";
import { Header } from "../../components/layout/Header";
import { OrganizationCard } from "../../components/home/OrganizationCard";
import type { Organization, ThreadWithReplies } from "../../types/forum";

interface HomePageProps {
  organizations: {
    organization: Organization;
    threads: ThreadWithReplies[];
  }[];
  dashboardUrl?: string;
}

export const HomePage: FC<HomePageProps> = ({ organizations, dashboardUrl }) => {
  const hasOrganizations = organizations.length > 0;

  return (
    <Layout title="Akraft - Discussion Forum">
      <Header dashboardUrl={dashboardUrl} />

      <main class="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero section */}
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-foreground mb-4">
            Akraft
          </h1>
          <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
            匿名掲示板プラットフォーム - 自由に議論しよう
          </p>
        </div>

        {/* Organizations grid */}
        {hasOrganizations ? (
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations.map(({ organization, threads }) => (
              <OrganizationCard
                key={organization.id}
                organization={organization}
                threads={threads}
              />
            ))}
          </div>
        ) : (
          /* Empty state */
          <div class="text-center py-16">
            <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <svg
                class="w-12 h-12 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h2 class="text-xl font-semibold text-foreground mb-2">
              まだ掲示板がありません
            </h2>
            <p class="text-muted-foreground mb-6">
              管理者が掲示板を作成すると、ここに表示されます
            </p>
            {dashboardUrl && (
              <a
                href={dashboardUrl}
                class="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground h-10 px-6 text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                管理画面へ
              </a>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer class="border-t mt-auto py-6">
        <div class="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            Powered by{" "}
            <a
              href="https://github.com/skynocover/akraft_cloudflare"
              target="_blank"
              rel="noopener noreferrer"
              class="text-primary hover:underline"
            >
              Akraft
            </a>
          </p>
        </div>
      </footer>
    </Layout>
  );
};

export default HomePage;
