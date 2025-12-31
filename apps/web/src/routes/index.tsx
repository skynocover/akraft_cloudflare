import { createFileRoute, redirect } from "@tanstack/react-router";
import { orpc } from "@/utils/orpc";
import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { getStoredServiceId } from "@/components/service-switcher";

export const Route = createFileRoute("/")({
	component: HomeComponent,
	beforeLoad: async () => {
		// Check if user is logged in
		const session = await authClient.getSession();
		if (session.data) {
			// User is logged in, redirect to their service
			const orgsResult = await authClient.organization.list();
			const organizations = orgsResult.data || [];

			if (organizations.length > 0) {
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
			} else {
				// No organizations - redirect to create page
				redirect({
					to: "/dashboard/create",
					throw: true,
				});
			}
		}
	},
});

const TITLE_TEXT = `
 ██████╗ ███████╗████████╗████████╗███████╗██████╗
 ██╔══██╗██╔════╝╚══██╔══╝╚══██╔══╝██╔════╝██╔══██╗
 ██████╔╝█████╗     ██║      ██║   █████╗  ██████╔╝
 ██╔══██╗██╔══╝     ██║      ██║   ██╔══╝  ██╔══██╗
 ██████╔╝███████╗   ██║      ██║   ███████╗██║  ██║
 ╚═════╝ ╚══════╝   ╚═╝      ╚═╝   ╚══════╝╚═╝  ╚═╝

 ████████╗    ███████╗████████╗ █████╗  ██████╗██╗  ██╗
 ╚══██╔══╝    ██╔════╝╚══██╔══╝██╔══██╗██╔════╝██║ ██╔╝
    ██║       ███████╗   ██║   ███████║██║     █████╔╝
    ██║       ╚════██║   ██║   ██╔══██║██║     ██╔═██╗
    ██║       ███████║   ██║   ██║  ██║╚██████╗██║  ██╗
    ╚═╝       ╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝
 `;

function HomeComponent() {
	const healthCheck = useQuery(orpc.healthCheck.queryOptions());

	return (
		<div className="container mx-auto max-w-3xl px-4 py-2">
			<pre className="overflow-x-auto font-mono text-sm">{TITLE_TEXT}</pre>
			<div className="grid gap-6">
				<section className="rounded-lg border p-4">
					<h2 className="mb-2 font-medium">API Status</h2>
					<div className="flex items-center gap-2">
						<div
							className={`h-2 w-2 rounded-full ${healthCheck.data ? "bg-green-500" : "bg-red-500"}`}
						/>
						<span className="text-sm text-muted-foreground">
							{healthCheck.isLoading
								? "Checking..."
								: healthCheck.data
									? "Connected"
									: "Disconnected"}
						</span>
					</div>
				</section>
			</div>
		</div>
	);
}
