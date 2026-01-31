"use client";

import { useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AuthGuard } from "@/app/context/authGuard";
import Breadcrumbs from "@/app/components/Breadcrumbs";
import { machineEntryService } from "@/app/services/machineEntryService";

function formatValue(value: unknown) {
  if (value == null) return "-";
  if (typeof value === "number") return value.toLocaleString();
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.length ? value.join(", ") : "-";
  return JSON.stringify(value);
}

export default function MachineEntryDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const entryId = Array.isArray(params.id) ? params.id[0] : params.id;
  const periodId = searchParams.get("periodId") ?? "";

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["machine-entries", periodId],
    queryFn: () => machineEntryService.getByPeriod(periodId),
    enabled: Boolean(periodId),
  });

  const entry = useMemo(() => {
    if (!entryId) return null;
    return (
      entries.find(
        (item) =>
          item.entryId === entryId || item.id === entryId || item._id === entryId
      ) ?? null
    );
  }, [entries, entryId]);

  const detailEntries = useMemo(() => {
    if (!entry) return [];
    return Object.entries(entry);
  }, [entry]);

  return (
    <AuthGuard>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/" },
            { label: "Machine Entry", href: "/machines/open" },
            { label: "Entry Details" },
          ]}
        />

        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Machine Entry Detail
              </p>
              <h1 className="text-2xl font-semibold text-slate-900">
                {entry?.machineName ?? entry?.machineId ?? "Entry"}
              </h1>
              <p className="text-sm text-slate-500">
                Entry ID: <span className="font-semibold">{entryId}</span>
              </p>
            </div>
            {entry?.openedAt && (
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Opened at: {entry.openedAt}
              </div>
            )}
          </div>

          {isLoading && (
            <div className="mt-6 text-sm text-slate-500">Loading entry...</div>
          )}

          {!isLoading && !entry && (
            <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">
              Entry not found. Open a period and select an entry from the list.
            </div>
          )}

          {entry && (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {detailEntries.map(([key, value]) => (
                <div
                  key={key}
                  className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm"
                >
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    {key}
                  </p>
                  <p className="mt-2 text-base font-semibold text-slate-800">
                    {formatValue(value)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AuthGuard>
  );
}
