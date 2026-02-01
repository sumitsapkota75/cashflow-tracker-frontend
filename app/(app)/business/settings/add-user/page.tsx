"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthGuard } from "@/app/context/authGuard";
import { businessService } from "@/app/services/businessService";
import { userService, UserCreateData } from "@/app/services/userService";
import { UserRole } from "@/app/lib/auth";
import Breadcrumbs from "@/app/components/Breadcrumbs";

const roleOptions: UserRole[] = ["OWNER", "MANAGER", "EMPLOYEE"];

export default function AddUserPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<UserCreateData>({
    username: "",
    password: "",
    role: "MANAGER",
    businessId: "",
  });
  const [error, setError] = useState("");

  const { data: businesses = [] } = useQuery({
    queryKey: ["businesses"],
    queryFn: businessService.getBusinesses,
  });

  const createMutation = useMutation({
    mutationFn: userService.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      router.push("/business/settings");
    },
    onError: () => setError("Unable to create user."),
  });

  return (
    <AuthGuard allowedRoles={["OWNER"]}>
      <div className="mx-auto max-w-2xl space-y-6">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/" },
            { label: "Business Settings", href: "/business/settings" },
            { label: "Add User" },
          ]}
        />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Add User</h1>
            <p className="text-sm text-slate-500">
              Invite a team member to this business.
            </p>
          </div>
          <Link
            className="text-sm font-medium text-slate-600 hover:text-slate-800"
            href="/business/settings"
          >
            Back to Settings
          </Link>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form
          className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 sm:p-6"
          onSubmit={(event) => {
            event.preventDefault();
            setError("");
            createMutation.mutate(form);
          }}
        >
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">username</label>
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={form.username}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, username: event.target.value }))
              }
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">
              Temporary Password
            </label>
            <input
              type="password"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={form.password}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, password: event.target.value }))
              }
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Role</label>
            <select
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={form.role}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  role: event.target.value as UserRole,
                }))
              }
            >
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">
              Business
            </label>
            <select
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={form.businessId}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  businessId: event.target.value,
                }))
              }
              required
            >
              <option value="" disabled>
                Select a business
              </option>
              {businesses.map((business) => {
                const id = business.id ?? business._id ?? "";
                return (
                  <option key={id || business.name} value={id}>
                    {business.name}
                  </option>
                );
              })}
            </select>
          </div>
          <button
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
            type="submit"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? "Creating..." : "Create User"}
          </button>
        </form>
      </div>
    </AuthGuard>
  );
}
