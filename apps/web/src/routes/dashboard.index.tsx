import { createFileRoute } from "@tanstack/react-router";
import Loader from "@/components/loader";

export const Route = createFileRoute("/dashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  // This component should rarely be seen because dashboard.tsx
  // redirects to either /dashboard/$serviceId or /dashboard/create
  // Show a loading state while the redirect happens
  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="flex items-center justify-center">
        <Loader />
      </div>
    </div>
  );
}
