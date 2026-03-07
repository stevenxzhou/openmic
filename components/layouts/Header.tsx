import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ActionType,
  useGlobalContext,
  InitialUser,
} from "@/context/useGlobalContext";
import { apiUrl } from "@/lib/utils";

interface HeaderProps {
  showBackButton?: boolean; // Optional prop to show/hide back button
}
const Header: React.FC<HeaderProps> = ({ showBackButton = false }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const { user, dispatch, language, setLanguage, t } = useGlobalContext();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Checking click bubble
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    // top -> down capture phase before bubling.
    document.addEventListener("mousedown", handleClickOutside, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside, true);
    };
  }, []);

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const userLogoutHandler = async () => {
    toggleProfileMenu();
    const response = await fetch(apiUrl("/api/logout"), {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Logout failed");
    }

    const logoutData: { authenticated: boolean } = await response.json();
    dispatch({
      type: ActionType.SET_USER,
      payload: { ...InitialUser, authenticated: logoutData.authenticated },
    });
  };

  return (
    <>
      <header className="flex justify-between items-center px-4 bg-yellow-500 w-full fixed z-50">
        <div className="flex-shrink-0 w-6">
          {showBackButton && (
            <button
              className="hover:opacity-50 transition-opacity"
              onClick={() => router.back()}
              aria-label={t("header.back")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}
        </div>
        <div className="flex-1 flex justify-center">
          <div className="relative" ref={menuRef}>
            {user.authenticated ? (
              <>
                <button
                  ref={buttonRef}
                  onClick={toggleProfileMenu}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-yellow-500 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-900">
                    {user.first_name || user.email}
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-900"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900">
                        {user.first_name}
                      </p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      {user.role && (
                        <p className="text-xs text-gray-500 mt-1 capitalize">
                          {user.role}
                        </p>
                      )}
                    </div>
                    <Link
                      href="/events"
                      onClick={() => setShowProfileMenu(false)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      {t("header.eventsList")}
                    </Link>
                    <button
                      onClick={userLogoutHandler}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      {t("header.logout")}
                    </button>
                    <div className="px-4 py-3 border-t border-gray-200">
                      <p className="text-xs text-gray-400 font-mono text-center">
                        v{process.env.NEXT_PUBLIC_APP_VERSION || "dev"}
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      const params = new URLSearchParams(
                        window.location.search,
                      );
                      const eventId = params.get("event_id");
                      if (eventId) {
                        sessionStorage.setItem("eventId", eventId);
                      }
                    }
                    router.push("/login");
                  }}
                  className="px-3 py-2 text-sm font-medium text-gray-900 hover:bg-yellow-500 rounded-lg transition-colors bg-transparent border-none cursor-pointer"
                >
                  {t("header.login")}
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex-shrink-0">
          <div className="flex items-center gap-1 rounded-md bg-yellow-500/40 p-1">
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={`rounded px-2 py-1 text-xs font-semibold transition-colors ${
                language === "en"
                  ? "bg-white text-gray-900"
                  : "text-gray-900 hover:bg-yellow-700/40"
              }`}
              aria-label="Switch language to English"
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage("zh")}
              className={`rounded px-2 py-1 text-xs font-semibold transition-colors ${
                language === "zh"
                  ? "bg-white text-gray-900"
                  : "text-gray-900 hover:bg-yellow-700/40"
              }`}
              aria-label="切换语言到中文"
            >
              中文
            </button>
          </div>
        </div>
      </header>
      <div className="h-[45px]" />
    </>
  );
};

export default Header;
