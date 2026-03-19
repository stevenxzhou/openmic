// Custom interfaces moved from user code

interface QRCodeProps {
	url: string;
	size?: number;
}

interface HeaderProps {
	showBackButton?: boolean; // Optional prop to show/hide back button
}

interface LoginUserType {
	authenticated: boolean;
	first_name: string;
	email: string;
	role: string;
}

interface GlobalContextType {
	user: LoginUserType;
	dispatch: React.Dispatch<Action>;
	language: Language;
	setLanguage: (language: Language) => void;
	t: (key: string, replacements?: Record<string, string | number>) => string;
}
