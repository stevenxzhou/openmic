import type { DefaultSession } from "next-auth";

declare module "next-auth" {
	interface Session {
		user: {
			id?: string;
			role?: string;
			first_name?: string;
		} & DefaultSession["user"];
	}
}
// Custom interfaces moved from user code
declare global {
interface QRCodeProps {
	url: string;
	size?: number;
}

interface HeaderProps {
	showBackButton?: boolean; // Optional prop to show/hide back button
}

interface GlobalContextType {
	dispatch: React.Dispatch<Action>;
	language: Language;
	setLanguage: (language: Language) => void;
	t: (key: string, replacements?: Record<string, string | number>) => string;
}
}


