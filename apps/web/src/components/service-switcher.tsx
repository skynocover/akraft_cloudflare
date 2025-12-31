import { useEffect, useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ChevronsUpDown, Plus, Check } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Skeleton } from "./ui/skeleton";

const STORAGE_KEY = "akraft-active-service";

interface Organization {
	id: string;
	name: string;
	slug: string | null;
	logo: string | null;
	createdAt: Date;
}

export function ServiceSwitcher() {
	const navigate = useNavigate();
	const params = useParams({ strict: false });
	const serviceId = (params as { serviceId?: string }).serviceId;

	const [organizations, setOrganizations] = useState<Organization[]>([]);
	const [loading, setLoading] = useState(true);
	const [activeOrg, setActiveOrg] = useState<Organization | null>(null);

	// Fetch user's organizations
	useEffect(() => {
		const fetchOrganizations = async () => {
			try {
				const result = await authClient.organization.list();
				if (result.data) {
					setOrganizations(result.data);

					// Find active organization
					const storedId = localStorage.getItem(STORAGE_KEY);
					let active: Organization | null = null;

					if (serviceId) {
						// If we're on a service page, use that
						active = result.data.find((org) => org.id === serviceId) || null;
					} else if (storedId) {
						// Otherwise try localStorage
						active = result.data.find((org) => org.id === storedId) || null;
					}

					// Fallback to first organization
					if (!active && result.data.length > 0) {
						active = result.data[0];
					}

					setActiveOrg(active);

					// Store the active organization
					if (active) {
						localStorage.setItem(STORAGE_KEY, active.id);
					}
				}
			} catch (error) {
				console.error("Failed to fetch organizations:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchOrganizations();
	}, [serviceId]);

	const handleSelectOrganization = (org: Organization) => {
		setActiveOrg(org);
		localStorage.setItem(STORAGE_KEY, org.id);

		// Set active organization in Better Auth
		authClient.organization.setActive({
			organizationId: org.id,
		});

		// Navigate to the selected service
		navigate({
			to: "/dashboard/$serviceId",
			params: { serviceId: org.id },
		});
	};

	const handleCreateNew = () => {
		navigate({ to: "/dashboard/create" });
	};

	if (loading) {
		return <Skeleton className="h-9 w-[180px]" />;
	}

	if (organizations.length === 0) {
		return (
			<Button variant="outline" onClick={handleCreateNew}>
				<Plus className="mr-2 h-4 w-4" />
				Create Service
			</Button>
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" className="w-[180px] justify-between">
					<span className="truncate">{activeOrg?.name || "Select Service"}</span>
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-[180px]" align="start">
				<DropdownMenuLabel>Services</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{organizations.map((org) => (
					<DropdownMenuItem
						key={org.id}
						onClick={() => handleSelectOrganization(org)}
						className="cursor-pointer"
					>
						<Check
							className={`mr-2 h-4 w-4 ${
								activeOrg?.id === org.id ? "opacity-100" : "opacity-0"
							}`}
						/>
						<span className="truncate">{org.name}</span>
					</DropdownMenuItem>
				))}
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={handleCreateNew} className="cursor-pointer">
					<Plus className="mr-2 h-4 w-4" />
					Create New
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

// Helper function to get stored service ID
export function getStoredServiceId(): string | null {
	if (typeof window === "undefined") return null;
	return localStorage.getItem(STORAGE_KEY);
}

// Helper function to set stored service ID
export function setStoredServiceId(serviceId: string): void {
	if (typeof window === "undefined") return;
	localStorage.setItem(STORAGE_KEY, serviceId);
}
