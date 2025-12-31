import { authClient } from "@/lib/auth-client";
import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { getStoredServiceId } from "@/components/service-switcher";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
  beforeLoad: async ({ location }) => {
    const session = await authClient.getSession();
    if (!session.data) {
      redirect({
        to: "/login",
        throw: true,
      });
    }

    // If we're at exactly /dashboard, we need to redirect to a specific service
    if (location.pathname === "/dashboard" || location.pathname === "/dashboard/") {
      // Fetch user's organizations
      const orgsResult = await authClient.organization.list();
      const organizations = orgsResult.data || [];

      if (organizations.length === 0) {
        // No organizations - redirect to create page
        redirect({
          to: "/dashboard/create",
          throw: true,
        });
      }

      // Try to get stored service ID
      const storedId = getStoredServiceId();
      let targetOrg = organizations.find((org) => org.id === storedId);

      // Fallback to first organization
      if (!targetOrg) {
        targetOrg = organizations[0];
      }

      // Redirect to the target service
      redirect({
        to: "/dashboard/$serviceId",
        params: { serviceId: targetOrg.id },
        throw: true,
      });
    }

    return { session };
  },
});

function RouteComponent() {
  return <Outlet />;
}
