import { authClient } from "@/lib/auth-client";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import ServiceEditor from "@/components/service/ServiceEditor";
import ReportList from "@/components/service/ReportList";
import { client } from "@/utils/orpc";

export interface Service {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  topLinks: { name: string; url: string }[];
  headLinks: { name: string; url: string }[];
  forbidContents: string[];
  blockedIPs: string[];
  auth: Record<string, string>;
}

export const Route = createFileRoute("/dashboard/$serviceId")({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) {
      redirect({
        to: "/login",
        throw: true,
      });
    }
    return { session };
  },
});

function RouteComponent() {
  const { serviceId } = Route.useParams();
  const { session } = Route.useRouteContext();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchService = async () => {
    try {
      const serviceData = await client.admin.getService({ serviceId });
      setService(serviceData);
      setError(null);
    } catch (err: unknown) {
      console.error("Error fetching service:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load service";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchService();
  }, [serviceId]);

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">Service not found.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-4 max-w-4xl py-8">
      <ServiceEditor
        service={service}
        serviceId={serviceId}
        onUpdate={fetchService}
      />
      <ReportList serviceId={serviceId} />
    </div>
  );
}
