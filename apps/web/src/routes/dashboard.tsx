import { authClient } from "@/lib/auth-client";
import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockServices } from "@/mock/data";

export const Route = createFileRoute("/dashboard")({
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
  const { session } = Route.useRouteContext();

  // Mock: Get services list (will be replaced with ORPC call later)
  const services = Object.values(mockServices);

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome, {session.data?.user.name}
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Services</h2>
        {services.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No services found. Create a new service to get started.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {services.map((service) => (
              <Card key={service.id}>
                <CardHeader>
                  <CardTitle>{service.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Created: {new Date(service.createdAt).toLocaleDateString()}
                    </span>
                    <Link
                      to="/dashboard/$serviceId"
                      params={{ serviceId: service.id }}
                    >
                      <Button variant="outline">Manage</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
