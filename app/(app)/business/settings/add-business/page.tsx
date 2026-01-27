"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthGuard } from "@/app/context/authGuard";
import {
  businessService,
  BusinessUpsert,
} from "@/app/services/businessService";

export default function AddBusinessPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<BusinessUpsert>({
    name: "",
    location: "",
    numberOfMachines: 0,
  });
  const [error, setError] = useState("");

  const createMutation = useMutation({
    mutationFn: businessService.createBusiness,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
      router.push("/business/settings");
    },
    onError: () => setError("Unable to create business."),
  });

  return (
    <AuthGuard allowedRoles={["OWNER"]}>
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Add Business
            </h1>
            <p className="text-sm text-slate-500">
              Create a new business location.
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
            <label className="text-sm font-medium text-slate-700">Name</label>
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">
              Location
            </label>
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={form.location}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, location: event.target.value }))
              }
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">
              Number of Machines
            </label>
            <input
              type="number"
              min={0}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={form.numberOfMachines}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  numberOfMachines: Number(event.target.value),
                }))
              }
              required
            />
          </div>
          <button
            className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
            type="submit"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? "Creating..." : "Create Business"}
          </button>
        </form>
      </div>
    </AuthGuard>
  );
}
