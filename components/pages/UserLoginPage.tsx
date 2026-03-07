import { useState, useEffect } from "react";
import { useGlobalContext, ActionType } from "@/context/useGlobalContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiUrl } from "@/lib/utils";

const UserLoginView = () => {
  const { user, dispatch, t } = useGlobalContext();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user.authenticated) {
      router.push("/events");
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.authenticated]);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission
    setError(""); // Clear previous errors

    // Handle login logic here
    try {
      const formPayload = new FormData();
      formPayload.append("username", formData.username);
      formPayload.append("password", formData.password);

      const response = await fetch(apiUrl("/api/login"), {
        method: "POST",
        body: formPayload,
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || t("auth.error.loginFailed"));
        return;
      }

      const loginData = await response.json();
      dispatch({
        type: ActionType.SET_USER,
        payload: {
          first_name: loginData.first_name,
          authenticated: true,
          email: loginData.email,
          role: loginData.role,
        },
      });

      // Check if there's a stored event ID
      const eventId = sessionStorage.getItem("eventId");

      if (eventId) {
        sessionStorage.removeItem("eventId");
        router.push(`/performances?event_id=${eventId}`);
      } else {
        router.push("/events");
      }
    } catch (error) {
      // Display error message on the login page
      console.error("Login failed:", error);
      setError(t("auth.error.loginFailed"));
    }
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (isLoading) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card Container */}
        <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8">
          {/* Form Header */}
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {t("auth.login")}
          </h2>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Username Field */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t("auth.username")}
              </label>
              <input
                type="text"
                name="username"
                id="username"
                className="w-full px-3 py-2 border border-gray-300 rounded-md 
                                        focus:outline-none focus:ring-2 focus:ring-yellow-500 
                                        focus:border-transparent"
                placeholder={t("auth.username")}
                onChange={handleChange}
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t("auth.password")}
              </label>
              <input
                type="password"
                name="password"
                id="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md 
                                        focus:outline-none focus:ring-2 focus:ring-yellow-500 
                                        focus:border-transparent"
                placeholder="••••••••"
                onChange={handleChange}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-yellow-600 text-white py-2 px-4 rounded-md
                                    hover:bg-yellow-700 focus:outline-none focus:ring-2 
                                    focus:ring-yellow-500 focus:ring-offset-2 
                                    transition duration-150 ease-in-out"
            >
              {t("auth.login")}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <span className="text-sm text-gray-600">
              {t("auth.noAccount")}{" "}
            </span>
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  const params = new URLSearchParams(window.location.search);
                  const eventId = params.get("event_id");
                  if (eventId) {
                    sessionStorage.setItem("eventId", eventId);
                  }
                }
                router.push("/signup");
              }}
              className="text-sm text-yellow-600 hover:text-yellow-800 font-medium bg-transparent border-none cursor-pointer"
            >
              {t("auth.signUpLink")}
            </button>
          </div>
          <div className="mt-2 text-center">
            <button
              onClick={() => {
                const eventId = sessionStorage.getItem("eventId");

                if (eventId) {
                  sessionStorage.removeItem("eventId");
                  router.push(`/performances?event_id=${eventId}`);
                } else {
                  router.push("/performances");
                }
              }}
              className="text-sm text-gray-500 hover:text-yellow-600 underline bg-transparent border-none cursor-pointer"
            >
              {t("auth.continueGuest")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLoginView;
