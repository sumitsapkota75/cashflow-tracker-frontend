"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AuthGuard } from "@/app/context/authGuard";
import { useAuth } from "@/app/context/AuthContext";
import Breadcrumbs from "@/app/components/Breadcrumbs";
import Card from "@/app/components/Card";
import Input from "@/app/components/Input";
import Button from "@/app/components/Button";
import { userService } from "@/app/services/userService";

export default function AccountPage() {
  const { user } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const updatePasswordMutation = useMutation({
    mutationFn: (payload: { id: string; password: string }) =>
      userService.updateUser(payload.id, { password: payload.password }),
    onSuccess: () => {
      setMessage("Password updated successfully.");
      setError("");
      setPassword("");
      setConfirmPassword("");
    },
    onError: () => {
      setError("Unable to update password. Try again.");
      setMessage("");
    },
  });

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!user?.userId) {
      setError("Unable to identify your account.");
      return;
    }
    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    updatePasswordMutation.mutate({ id: user.userId, password });
  };

  return (
    <AuthGuard>
      <div className="space-y-6">
        <Breadcrumbs
          items={[{ label: "Dashboard", href: "/" }, { label: "My Account" }]}
        />

        <Card className="bg-gradient-to-br from-white via-white to-blue-50/60 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-blue-600">
                Account
              </p>
              <h1 className="text-2xl font-semibold text-slate-900">
                Personal profile
              </h1>
              <p className="text-sm text-slate-500">
                Manage your credentials and account details.
              </p>
            </div>
            <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              Role: {user?.role ?? "—"}
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Username
              </p>
              <p className="mt-2 text-base font-semibold text-slate-800">
                {user?.username ?? "—"}
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Email
              </p>
              <p className="mt-2 text-base font-semibold text-slate-800">
                {user?.email ?? "—"}
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Business
              </p>
              <p className="mt-2 text-base font-semibold text-slate-800">
                {user?.businessName ?? "—"}
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Business ID
              </p>
              <p className="mt-2 text-base font-semibold text-slate-800">
                {user?.businessId ?? "—"}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900">
              Change password
            </h2>
            <p className="text-sm text-slate-500">
              Choose a strong password to keep your account secure.
            </p>
          </div>

          {message && (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
              {message}
            </div>
          )}
          {error && (
            <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
            <Input
              label="New password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              required
            />
            <Input
              label="Confirm password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Re-enter new password"
              required
            />
            <div className="md:col-span-2">
              <Button type="submit" disabled={updatePasswordMutation.isPending}>
                {updatePasswordMutation.isPending
                  ? "Updating..."
                  : "Update Password"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AuthGuard>
  );
}
