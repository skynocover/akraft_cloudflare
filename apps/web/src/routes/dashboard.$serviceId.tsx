import { authClient } from "@/lib/auth-client";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ExternalLink, Copy, Check } from "lucide-react";

import ServiceEditor from "@/components/service/ServiceEditor";
import ReportList from "@/components/service/ReportList";
import { client } from "@/utils/orpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  const [copied, setCopied] = useState(false);

  // Get the frontend URL from environment or construct it
  const serverUrl = import.meta.env.VITE_SERVER_URL || "";
  const frontendUrl = `${serverUrl}/service/${serviceId}`;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(frontendUrl);
      setCopied(true);
      toast.success("URL copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  const handleOpenFrontend = () => {
    window.open(frontendUrl, "_blank", "noopener,noreferrer");
  };

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
      {/* Frontend URL Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-muted-foreground">
              Forum URL
            </label>
            <div className="flex items-center gap-2">
              <Input
                value={frontendUrl}
                readOnly
                className="flex-1 bg-muted font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyUrl}
                title="Copy URL"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="default"
                size="icon"
                onClick={handleOpenFrontend}
                title="Open in new tab"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ServiceEditor
        service={service}
        serviceId={serviceId}
        onUpdate={fetchService}
      />
      <ReportList serviceId={serviceId} />
    </div>
  );
}
