import { ChangeEvent, FormEvent, useState, useEffect } from "react";
import { useGlobalContext } from "@/context/useGlobalContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiUrl } from "@/lib/utils";

const UserSignupView = () => {
  const { user, t } = useGlobalContext();
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
    email: "",
    password: "",
    rePassword: "",
    firstName: "",
    lastName: "",
  });

  const [error, setError] = useState("");

  function handleChange(e: ChangeEvent<HTMLInputElement>): void {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setError(""); // Clear previous errors

    // Validate passwords match
    if (formData.password !== formData.rePassword) {
      setError(t("auth.error.passwordMismatch"));
      return;
    }

    // Validate password length
    if (formData.password.length < 8) {
      setError(t("auth.error.passwordShort"));
      return;
    }

    try {
      const formPayload = new FormData();
      formPayload.append("username", formData.username);
      formPayload.append("email", formData.email);
      formPayload.append("password", formData.password);
      formPayload.append("first_name", formData.firstName);
      formPayload.append("last_name", formData.lastName);

      const response = await fetch(apiUrl("/api/signup"), {
        method: "POST",
        body: formPayload,
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || t("auth.error.signupFailed"));
        return;
      }

      // Check if there's a stored event ID
      const eventId = sessionStorage.getItem("eventId");

      if (eventId) {
        sessionStorage.removeItem("eventId");
        router.push(`/performances?event_id=${eventId}`);
      } else {
        router.push("/events");
      }
    } catch (error) {
      console.error("Signup failed:", error);
      setError(t("auth.error.signupFailed"));
    }
  }

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
            {t("auth.signup")}
          </h2>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t("auth.firstName")}
                </label>
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md 
                                            focus:outline-none focus:ring-2 focus:ring-yellow-500 
                                            focus:border-transparent"
                  placeholder="John"
                  onChange={handleChange}
                />
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t("auth.lastName")}
                </label>
                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md 
                                            focus:outline-none focus:ring-2 focus:ring-yellow-500 
                                            focus:border-transparent"
                  placeholder="Doe"
                  onChange={handleChange}
                />
              </div>
            </div>

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

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t("auth.email")}
              </label>
              <input
                type="email"
                name="email"
                id="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md 
                                        focus:outline-none focus:ring-2 focus:ring-yellow-500 
                                        focus:border-transparent"
                placeholder="your@email.com"
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
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                {t("auth.passwordMinLength")}
              </p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="rePassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t("auth.confirmPassword")}
              </label>
              <input
                type="password"
                name="rePassword"
                id="rePassword"
                className="w-full px-3 py-2 border border-gray-300 rounded-md 
                                        focus:outline-none focus:ring-2 focus:ring-yellow-500 
                                        focus:border-transparent"
                placeholder="••••••••"
                onChange={handleChange}
                required
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
              {t("auth.signup")}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <span className="text-sm text-gray-600">
              {t("auth.hasAccount")}{" "}
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
                router.push("/login");
              }}
              className="text-sm text-yellow-600 hover:text-yellow-800 font-medium bg-transparent border-none cursor-pointer"
            >
              {t("auth.login")}
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

export default UserSignupView;
