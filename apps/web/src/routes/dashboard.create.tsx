import { authClient } from "@/lib/auth-client";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { setStoredServiceId } from "@/components/service-switcher";

export const Route = createFileRoute("/dashboard/create")({
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
	const navigate = useNavigate();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm({
		defaultValues: {
			name: "",
			slug: "",
		},
		onSubmit: async ({ value }) => {
			setIsSubmitting(true);
			try {
				const result = await authClient.organization.create({
					name: value.name,
					slug: value.slug || undefined,
				});

				if (result.error) {
					toast.error(result.error.message || "Failed to create service");
					return;
				}

				if (result.data) {
					// Store the new service ID
					setStoredServiceId(result.data.id);

					// Set it as active
					await authClient.organization.setActive({
						organizationId: result.data.id,
					});

					toast.success("Service created successfully!");

					// Navigate to the new service
					navigate({
						to: "/dashboard/$serviceId",
						params: { serviceId: result.data.id },
					});
				}
			} catch (error) {
				console.error("Error creating service:", error);
				toast.error("Failed to create service");
			} finally {
				setIsSubmitting(false);
			}
		},
		validators: {
			onSubmit: z.object({
				name: z.string().min(2, "Name must be at least 2 characters"),
				slug: z.string().optional(),
			}),
		},
	});

	// Auto-generate slug from name
	const handleNameChange = (name: string) => {
		form.setFieldValue("name", name);
		// Generate slug from name (lowercase, replace spaces with dashes)
		const slug = name
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, "")
			.replace(/\s+/g, "-")
			.replace(/-+/g, "-")
			.trim();
		form.setFieldValue("slug", slug);
	};

	return (
		<div className="container mx-auto max-w-lg py-8">
			<Card>
				<CardHeader>
					<CardTitle>Create New Service</CardTitle>
					<CardDescription>
						Create a new service to manage your discussion board.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							form.handleSubmit();
						}}
						className="space-y-4"
					>
						<div>
							<form.Field name="name">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Service Name</Label>
										<Input
											id={field.name}
											name={field.name}
											placeholder="My Awesome Board"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => handleNameChange(e.target.value)}
										/>
										{field.state.meta.errors.map((error) => (
											<p key={error?.message} className="text-sm text-red-500">
												{error?.message}
											</p>
										))}
									</div>
								)}
							</form.Field>
						</div>

						<div>
							<form.Field name="slug">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>
											Slug (URL-friendly name)
										</Label>
										<Input
											id={field.name}
											name={field.name}
											placeholder="my-awesome-board"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
										/>
										<p className="text-xs text-muted-foreground">
											This will be used in URLs. Leave empty to auto-generate.
										</p>
										{field.state.meta.errors.map((error) => (
											<p key={error?.message} className="text-sm text-red-500">
												{error?.message}
											</p>
										))}
									</div>
								)}
							</form.Field>
						</div>

						<div className="flex gap-2 pt-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => navigate({ to: "/dashboard" })}
								disabled={isSubmitting}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? "Creating..." : "Create Service"}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
