import { useState, useEffect } from "react";
import { useGlobalContext } from "@/context/useGlobalContext";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useSession, signOut } from "next-auth/react";

const baseUrl = process.env.NEXT_PUBLIC_BASE_PATH || "";

const UserLoginView = () => {
  const { t } = useGlobalContext();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/events");
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");

  // Handle form submission
  const handleCredentialsLogin = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault(); // Prevent default form submission
    setError(""); // Clear previous errors

    try {
      const result = await signIn("credentials", {
        username: formData.username,
        password: formData.password,
      });

      console.log(result);

      if (result?.error) {
        setError(result?.error);
        return;
      }
    } catch (error) {
      // Display error message on the login page
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

  const handleGoogleLogin = () => {
    signIn("google", {
      callbackUrl: `${baseUrl}`,
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
          <form className="space-y-4" onSubmit={handleCredentialsLogin}>
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

          {/* Google Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full bg-yellow-600 text-white py-2 px-4 rounded-md mt-4
                hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2
                transition duration-150 ease-in-out flex items-center justify-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21.805 10.023h-9.765v3.977h5.588c-.241 1.285-1.445 3.777-5.588 3.777-3.363 0-6.104-2.777-6.104-6.2 0-3.423 2.741-6.2 6.104-6.2 2.011 0 3.363.857 4.136 1.577l2.827-2.777c-1.857-1.714-4.241-2.777-6.963-2.777-5.241 0-9.5 4.257-9.5 9.477 0 5.22 4.259 9.477 9.5 9.477 5.445 0 9.063-3.857 9.063-9.477 0-.641-.073-1.285-.168-1.923z"
                fill="#fff"
              />
            </svg>
            Sign in with Google
          </button>

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
