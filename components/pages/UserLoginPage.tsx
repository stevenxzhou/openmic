import { useState, useEffect } from "react";
import { useGlobalContext } from "@/context/useGlobalContext";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useSession, signOut } from "next-auth/react";

const nextHostUrl = process.env.NEXT_PUBLIC_HOST_URL || "";

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
        redirect: false,
      });

      if (result?.error) {
        setError(t("auth.error.loginFailed"));
        return;
      } else {
        router.push("/events");
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
      callbackUrl: `${nextHostUrl}`,
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
            className="w-full mt-4 flex items-center justify-center gap-3 py-2 px-4 rounded-md border border-gray-300 bg-white text-gray-700 font-semibold shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150"
            style={{ minHeight: 44, letterSpacing: 0.1, fontSize: 16 }}
            aria-label="Sign in with Google"
          >
            <span
              className="flex items-center justify-center bg-white rounded-full"
              style={{ width: 24, height: 24 }}
            >
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                style={{ display: "block", width: 22, height: 22 }}
                aria-hidden="true"
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                ></path>
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                ></path>
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                ></path>
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                ></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
            </span>
            <span className="ml-1">Sign in with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserLoginView;
