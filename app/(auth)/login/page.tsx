"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/app/context/AuthContext";
import { authService } from "@/app/services/loginService";
import Button from "@/app/components/Button";
import Input from "@/app/components/Input";

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
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-blue-100 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-slate-200 blur-3xl" />

      <div className="mx-auto flex min-h-screen max-w-5xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 px-6 py-6 text-white shadow-2xl sm:px-8">
            <div className="max-w-md space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-200">
                Machine Tracker
              </p>
              <h1 className="text-2xl font-semibold sm:text-3xl">
                Secure daily cash operations in one place.
              </h1>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white px-6 py-8 shadow-xl sm:px-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-slate-900">
                Sign in
              </h2>
              <p className="text-sm text-slate-500">
                Use your assigned credentials to continue.
              </p>
            </div>

            {error && (
              <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <Input
                label="Username"
                placeholder="you@company.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-500">
              Need access? Ask your manager to add your account.
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
