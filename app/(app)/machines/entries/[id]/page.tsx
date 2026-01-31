"use client";

import { useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AuthGuard } from "@/app/context/authGuard";
import Breadcrumbs from "@/app/components/Breadcrumbs";
import { machineEntryService } from "@/app/services/machineEntryService";
import Link from "next/link";

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function formatValue(value: unknown) {
  if (value == null) return "-";
  if (typeof value === "number") return value.toLocaleString();
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.length ? value.join(", ") : "-";
  return JSON.stringify(value);
}

function formatFieldValue(key: string, value: unknown) {
  const normalizedKey = key.toLowerCase();
  const isCurrencyField =
    normalizedKey.includes("cash") ||
    normalizedKey.includes("amount") ||
    normalizedKey.includes("safedrop") ||
    normalizedKey.includes("difference") ||
    normalizedKey.includes("reportcash") ||
    normalizedKey.includes("netfromreport");
  if (normalizedKey.includes("openedat")) {
    return formatDateTime(typeof value === "string" ? value : null);
  }
  if (isCurrencyField) {
    const numericValue =
      typeof value === "number" ? value : Number(value ?? 0);
    return formatCurrency(Number.isFinite(numericValue) ? numericValue : 0);
  }
  return formatValue(value);
}

function toNumber(value?: number | string | null) {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCurrency(value?: number | null) {
  if (value == null) return "-";
  return `$${value.toLocaleString()}`;
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

  const { data: recentEntry } = useQuery({
    queryKey: [
      "machine-entry-recent",
      entry?.machineId,
      entry?.periodId,
      entry?.id,
    ],
    queryFn: () =>
      machineEntryService.getRecentEntry(
        entry?.machineId ?? "",
        entry?.periodId ?? ""
      ),
    enabled: Boolean(entry?.machineId && entry?.periodId),
  });

  const comparison = useMemo(() => {
    if (!entry || !entry.hasPreviousEntry || !recentEntry) return null;
    const currentId = entry.id ?? entry.entryId ?? entry._id;
    const previousId = recentEntry.id ?? recentEntry.entryId ?? recentEntry._id;
    if (currentId && previousId && currentId === previousId) return null;

    const currentReportIn = toNumber(entry.reportCashIn);
    const previousReportIn = toNumber(recentEntry.reportCashIn);
    const deltaIn = currentReportIn - previousReportIn;
    const physicalCash = toNumber(entry.physicalCash);
    const expectedPhysicalCash = deltaIn;
    const difference = expectedPhysicalCash - physicalCash;

    return {
      previousId,
      previousOpenedAt: recentEntry.openedAt,
      previousReportIn,
      currentReportIn,
      deltaIn,
      expectedPhysicalCash,
      physicalCash,
      difference,
    };
  }, [entry, recentEntry]);

  const detailEntries = useMemo(() => {
    if (!entry) return [];
    return Object.entries(entry).filter(([key]) => {
      const normalizedKey = key.toLowerCase();
      return normalizedKey !== "entryid" && normalizedKey !== "machineid";
    });
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
              {entry?.machineId && (
                <p className="text-sm text-slate-500">
                  Machine ID:{" "}
                  <span className="font-semibold">{entry.machineId}</span>
                </p>
              )}
            </div>
            {entry?.openedAt && (
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Opened at: {formatDateTime(entry.openedAt)}
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
              {detailEntries.map(([key, value]) => {
                const normalizedKey = key.toLowerCase();
                const isPeriodId =
                  normalizedKey === "periodid" && typeof value === "string";
                const isDifferenceField =
                  normalizedKey === "difference" ||
                  normalizedKey.endsWith("difference");
                const differenceValue = isDifferenceField
                  ? Number(value ?? 0)
                  : 0;
                return (
                  <div
                    key={key}
                    className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm"
                  >
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      {key}
                    </p>
                    <p className="mt-2 text-base font-semibold text-slate-800">
                      {isPeriodId ? (
                        <Link
                          className="text-blue-700 hover:text-blue-900"
                          href={`/periods/${value}`}
                        >
                          {value}
                        </Link>
                      ) : isDifferenceField ? (
                        <span
                          className={
                            differenceValue < 0
                              ? "text-rose-600"
                              : differenceValue > 0
                              ? "text-emerald-600"
                              : "text-slate-800"
                          }
                        >
                          {formatFieldValue(key, value)}
                        </span>
                      ) : (
                        formatFieldValue(key, value)
                      )}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Difference breakdown
              </h2>
              <p className="text-sm text-slate-500">
                Cash-in only logic from the last entry for this machine.
              </p>
            </div>
            {comparison?.previousId && (
              <div className="text-xs text-slate-400">
                Previous entry: {comparison.previousId}
              </div>
            )}
          </div>

          {entry?.hasPreviousEntry === false && (
            <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              This is the first entry for this machine in the period. Difference
              is set to $0.
            </div>
          )}
          {entry?.hasPreviousEntry && !comparison && (
            <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              No previous entry found for this machine in the current period.
              Difference remains unchanged.
            </div>
          )}

          {comparison && (
            <div className="mt-4 space-y-4">
              {comparison.deltaIn < 0 && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  Cash-in counter decreased compared to the previous entry. This
                  may indicate a reset or an incorrect report.
                </div>
              )}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Cash-in counters
                  </p>
                  <div className="mt-3 space-y-2 text-sm text-slate-600">
                    <div className="flex items-center justify-between">
                      <span>Previous cash-in</span>
                      <span className="font-semibold text-slate-800">
                        {formatCurrency(comparison.previousReportIn)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Current cash-in</span>
                      <span className="font-semibold text-slate-800">
                        {formatCurrency(comparison.currentReportIn)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Delta cash-in</span>
                      <span className="font-semibold text-slate-800">
                        {formatCurrency(comparison.deltaIn)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 rounded-lg border border-slate-100 bg-white px-3 py-2 text-xs text-slate-500">
                    Cash-out is recorded but not used in the difference
                    calculation.
                  </div>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Expected cash vs. counted cash
                  </p>
                  <div className="mt-3 space-y-2 text-sm text-slate-600">
                    <div className="flex items-center justify-between">
                      <span>Expected physical cash</span>
                      <span className="font-semibold text-slate-800">
                        {formatCurrency(comparison.expectedPhysicalCash)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Physical cash counted</span>
                      <span className="font-semibold text-slate-800">
                        {formatCurrency(comparison.physicalCash)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Difference</span>
                      <span
                        className={`font-semibold ${
                          comparison.difference < 0
                            ? "text-rose-600"
                            : comparison.difference > 0
                            ? "text-amber-600"
                            : "text-emerald-600"
                        }`}
                      >
                        {formatCurrency(comparison.difference)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 rounded-lg border border-slate-100 bg-white px-3 py-2 text-xs text-slate-500">
                    Expected physical cash = Delta cash-in. Difference = Expected
                    physical cash − Physical cash.
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </AuthGuard>
  );
}
