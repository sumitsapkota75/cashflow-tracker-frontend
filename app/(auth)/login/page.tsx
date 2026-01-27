"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/app/context/AuthContext";
import { authService } from "@/app/services/loginService";

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // -----------------------
  // LOGIN MUTATION
  // -----------------------
  const loginMutation = useMutation({
    mutationFn: () => authService.login(username, password),

    onSuccess: async (token: string) => {
      await login(token);
      queryClient.clear();
      router.push("/");
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      console.error("Login failed:", err);

      // Axios-style error handling
      const status = err?.response?.status;
      const message = err?.response?.data?.message;

      if (status === 401) {
        setError("Invalid email or password.");
      } else if (message) {
        setError(message);
      } else {
        setError("Login failed. Please try again.");
      }
    },
  });

  // -----------------------
  // SUBMIT
  // -----------------------
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    loginMutation.mutate();
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
              Username
            </label>
            <input
              className="
                w-full rounded-lg border border-slate-300
                px-4 py-2.5 text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600
                transition
              "
              placeholder="you@company.com"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
            disabled={loginMutation.isPending}
            className="
              w-full flex items-center justify-center
              bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400
              text-white font-medium
              py-2.5 rounded-lg
              transition shadow-lg hover:shadow-xl
            "
          >
            {loginMutation.isPending ? "Signing in..." : "Sign In"}
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
