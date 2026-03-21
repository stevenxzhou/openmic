"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

const baseUrl = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function ProfileSetupPage() {
  const [username, setUsername] = useState("");
  const [instagram, setInstagram] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  // Get profile info from query string
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setEmail(params.get("email") || "");
      setFirstName(params.get("first_name") || "");
      setLastName(params.get("last_name") || "");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${baseUrl}/api/users/setup-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          instagram,
          email,
          firstName,
          lastName,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        signIn("google", {
          callbackUrl: `${baseUrl}`,
          prompt: "none",
        });
      } else {
        setError(data.error || "Username already exists");
      }
    } catch (err) {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Complete Your Profile</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-xs">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="border p-2 w-full mb-2"
          required
        />
        <input
          type="text"
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
          placeholder="Instagram handle (optional)"
          className="border p-2 w-full mb-2"
        />
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded w-full"
          disabled={loading}
        >
          {loading ? "Checking..." : "Continue"}
        </button>
      </form>
    </div>
  );
}
