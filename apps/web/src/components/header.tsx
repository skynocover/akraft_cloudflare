import { Link } from "@tanstack/react-router";
import { Github } from "lucide-react";
import { Button } from "./ui/button";
import UserMenu from "./user-menu";
import { ServiceSwitcher } from "./service-switcher";
import { authClient } from "@/lib/auth-client";

export default function Header() {
	const { data: session } = authClient.useSession();

	return (
		<div className="flex items-center justify-between py-4 px-4 border-b">
			<div className="flex items-center space-x-4">
				<Link to="/">
					<Button variant="link" className="text-2xl font-bold p-0">
						Akraft
					</Button>
				</Link>
				{/* Show service switcher when logged in (like common SaaS apps) */}
				{session && <ServiceSwitcher />}
			</div>
			<nav className="flex items-center space-x-2">
				<Button variant="ghost">About</Button>
				<Button variant="outline" size="icon" asChild>
					<a
						href="https://github.com/skynocover/akraft"
						target="_blank"
						rel="noopener noreferrer"
					>
						<Github className="h-[1.2rem] w-[1.2rem]" />
						<span className="sr-only">GitHub</span>
					</a>
				</Button>
				<UserMenu />
			</nav>
		</div>
	);
}
