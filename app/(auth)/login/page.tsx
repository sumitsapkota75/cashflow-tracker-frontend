"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);

        // Better error messaging
        if (res.status === 401) {
          setError("Invalid email or password.");
        } else if (body?.message) {
          setError(body.message);
        } else {
          setError("Login failed. Please try again.");
        }

        return;
      }

      const data = await res.json();
      await login(data.token);
      router.push("/"); // dashboard
    } catch (err) {
      setError("Server unreachable. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full max-w-md bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 space-y-6">

        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Machine Tracker
          </h1>
          <p className="text-sm text-slate-500">
            Secure access to cash tracking system
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Email */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              className="
                w-full rounded-lg border border-slate-300
                px-4 py-2.5 text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600
                transition
              "
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              className="
                w-full rounded-lg border border-slate-300
                px-4 py-2.5 text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600
                transition
              "
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="
              w-full flex items-center justify-center
              bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400
              text-white font-medium
              py-2.5 rounded-lg
              transition shadow-lg hover:shadow-xl
            "
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-slate-400">
          Internal Cash Control System
        </div>
      </div>
    </div>
  );
}
