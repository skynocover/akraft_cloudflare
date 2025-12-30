import { authClient } from "@/lib/auth-client";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState, useEffect } from "react";

import ServiceEditor from "@/components/service/ServiceEditor";
import ReportList from "@/components/service/ReportList";
import { getMockService, type Service } from "@/mock/data";

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

  useEffect(() => {
    const fetchService = async () => {
      try {
        // Mock: Replace with ORPC call later
        const serviceData = getMockService(serviceId);
        setService(serviceData || null);
      } catch (error) {
        console.error("Error fetching service:", error);
      }
      setLoading(false);
    };

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

  // Mock: Check if current user is owner (will use Better Auth later)
  const isOwner = service.ownerId === "admin-user-id" || session.data?.user?.id === service.ownerId;

  return (
    <div className="container mx-auto space-y-4 max-w-4xl py-8">
      {isOwner ? (
        <>
          <ServiceEditor service={service} serviceId={serviceId} />
          <ReportList serviceId={serviceId} />
        </>
      ) : (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">
            You are not the owner of this service.
          </span>
        </div>
      )}
    </div>
  );
}
