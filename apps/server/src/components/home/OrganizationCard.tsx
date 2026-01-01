import type { FC } from "hono/jsx";
import type { Organization, ThreadWithReplies } from "../../types/forum";
import { ThreadPreview } from "./ThreadPreview";

interface OrganizationCardProps {
  organization: Organization;
  threads: ThreadWithReplies[];
}

export const OrganizationCard: FC<OrganizationCardProps> = ({
  organization,
  threads,
}) => {
  const orgUrl = `/service/${organization.id}`;

  return (
    <div class="bg-card border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <a href={orgUrl} class="block p-4 border-b hover:bg-accent/30 transition-colors">
        <div class="flex items-center gap-3">
          {/* Logo */}
          {organization.logo ? (
            <img
              src={organization.logo}
              alt={organization.name}
              class="w-10 h-10 rounded-lg object-cover"
            />
          ) : (
            <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <span class="text-lg font-bold text-primary">
                {organization.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-foreground truncate">
              {organization.name}
            </h3>
            {organization.metadata?.description && (
              <p class="text-xs text-muted-foreground truncate">
                {organization.metadata.description}
              </p>
            )}
          </div>
          {/* Arrow icon */}
          <svg
            class="w-5 h-5 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </a>

      {/* Threads list */}
      <div class="divide-y">
        {threads.length > 0 ? (
          threads.map((thread) => (
            <ThreadPreview
              key={thread.id}
              thread={thread}
              organizationId={organization.id}
            />
          ))
        ) : (
          <div class="p-4 text-center text-muted-foreground text-sm">
            まだ投稿がありません
          </div>
        )}
      </div>

      {/* Footer - View all link */}
      {threads.length > 0 && (
        <a
          href={orgUrl}
          class="block p-3 text-center text-sm text-primary hover:bg-accent/30 transition-colors border-t"
        >
          すべて見る →
        </a>
      )}
    </div>
  );
};

export default OrganizationCard;
