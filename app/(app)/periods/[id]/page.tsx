"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AuthGuard } from "@/app/context/authGuard";
import { periodService } from "@/app/services/periodService";
import {
  machineEntryService,
} from "@/app/services/machineEntryService";

function formatCurrency(value?: number | null) {
  if (value == null) return "-";
  return `$${value.toLocaleString()}`;
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  return date.toLocaleString();
}

export default function PeriodDetailPage() {
  const params = useParams();
  const periodId = Array?.isArray(params.id) ? params.id[0] : params.id;

  const { data: period, isLoading: periodLoading } = useQuery({
    queryKey: ["period", periodId],
    queryFn: () => periodService.getPeriodById(periodId as string),
    enabled: Boolean(periodId),
  });

  const { data: machineEntries = [], isLoading: entriesLoading } = useQuery({
    queryKey: ["machine-entries", periodId],
    queryFn: () => machineEntryService.getByPeriod(periodId as string),
    enabled: Boolean(periodId),
  });

  const netOpenValue =
    period?.netOpen ?? (period ? period.totalCashInOpen - period.totalCashOutOpen : null);
  const netCloseValue =
    period?.netClose ??
    (period ? period.totalCashInClose - period.totalCashOutClose : null);
  const finalNet =
    netOpenValue != null && netCloseValue != null
      ? netCloseValue - netOpenValue
      : null;

  return (
    <AuthGuard>
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Period Detail
              </p>
              <h1 className="text-2xl font-semibold text-slate-900">
                {period?.businessDate ?? "Loading..."}
              </h1>
              <p className="text-sm text-slate-500">
                Status:{" "}
                <span className="font-semibold text-slate-700">
                  {period?.status ?? "-"}
                </span>
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <div>Opened: {formatDateTime(period?.openedAt)}</div>
              <div>Closed: {formatDateTime(period?.closedAt)}</div>
            </div>
          </div>

          {periodLoading ? (
            <div className="mt-6 text-sm text-slate-500">Loading period...</div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: "Total Cash In (Open)",
                  value: formatCurrency(period?.totalCashInOpen),
                },
                {
                  label: "Total Cash Out (Open)",
                  value: formatCurrency(period?.totalCashOutOpen),
                },
                {
                  label: "Cash In ATM (Open)",
                  value: formatCurrency(period?.cashInAtmOpen ?? null),
                },
                {
                  label: "Safe Drop",
                  value: formatCurrency(period?.safeDrop ?? null),
                  emphasis: "safedrop",
                },
                {
                  label: "Total Cash In (Close)",
                  value: formatCurrency(period?.totalCashInClose),
                },
                {
                  label: "Total Cash Out (Close)",
                  value: formatCurrency(period?.totalCashOutClose),
                },
                {
                  label: "Cash In ATM (Close)",
                  value: formatCurrency(period?.cashInAtmClose ?? null),
                },
                {
                  label: "Net Open",
                  value: formatCurrency(netOpenValue),
                },
                {
                  label: "Net Close",
                  value: formatCurrency(netCloseValue),
                },
                {
                  label: "Final Net",
                  value: formatCurrency(finalNet),
                  emphasis: "net",
                },
                {
                  label: "Payout",
                  value: formatCurrency(period?.payout ?? null),
                },
                {
                  label: "Physical Cash Collected",
                  value: formatCurrency(period?.physicalCashCollected ?? null),
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`rounded-xl border px-4 py-3 text-sm ${
                    item.emphasis === "safedrop"
                      ? "border-amber-200 bg-amber-50"
                      : item.emphasis === "net"
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-slate-100 bg-slate-50"
                  }`}
                >
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    {item.label}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-slate-900">
              Machine Entries
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">
                {machineEntries.length} entries
              </span>
              <Link
                href="/machines/open"
                className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                New Entry
              </Link>
            </div>
          </div>

          {entriesLoading ? (
            <div className="mt-4 text-sm text-slate-500">
              Loading machine entries...
            </div>
          ) : machineEntries.length === 0 ? (
            <div className="mt-4 text-sm text-slate-500">
              No machine entries linked to this period yet.
            </div>
          ) : (
            <>
              <div className="mt-4 hidden overflow-hidden rounded-xl border border-slate-100 md:block">
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <span>Machine</span>
                  <span>Report CashIn</span>
                  <span>Report CashOut</span>
                  <span>Physical Cash Collected</span>
                  <span>Safe Drop</span>
                  <span>Difference</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {machineEntries.map((entry, index) => (
                    <div
                      key={
                        entry.entryId ??
                        entry.id ??
                        entry._id ??
                        entry.machineId ??
                        index
                      }
                      className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] gap-2 px-4 py-3 text-sm text-slate-600"
                    >
                      <div>
                        <p className="font-medium text-slate-800">
                          {entry.username || entry.machineId || "Machine"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {formatDateTime(entry.openedAt)}
                        </p>
                        <p className="text-xs text-slate-400">
                          {entry.reason ?? "—"}
                        </p>
                      </div>
                      <span>{formatCurrency(entry.reportCashIn ?? null)}</span>
                      <span>{formatCurrency(entry.reportCashOut ?? null)}</span>
                      <span>{formatCurrency(entry.physicalCash ?? null)}</span>
                      <span>{formatCurrency(entry.safeDroppedAmount ?? null)}</span>
                      <span
                        className={`font-medium ${
                          (entry.difference ?? 0) < 0
                            ? "text-rose-600"
                            : "text-emerald-600"
                        }`}
                      >
                        {formatCurrency(entry.difference ?? null)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 space-y-3 md:hidden">
                {machineEntries.map((entry, index) => (
                  <div
                    key={
                      entry.entryId ??
                      entry.id ??
                      entry._id ??
                      entry.machineId ??
                      index
                    }
                    className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-slate-800">
                          {entry.machineName ?? entry.machineId ?? "Machine"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {formatDateTime(entry.openedAt)}
                        </p>
                        <p className="text-xs text-slate-400">
                          {entry.reason ?? "—"}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          (entry.difference ?? 0) < 0
                            ? "bg-rose-100 text-rose-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        Diff {formatCurrency(entry.difference ?? null)}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
                      <div>
                        Report Cash In
                        <div className="text-sm font-semibold text-slate-800">
                          {formatCurrency(entry.reportCashIn ?? null)}
                        </div>
                      </div>
                      <div>
                        Report Cash Out
                        <div className="text-sm font-semibold text-slate-800">
                          {formatCurrency(entry.reportCashOut ?? null)}
                        </div>
                      </div>
                      <div>
                        Physical Cash Collected
                        <div className="text-sm font-semibold text-slate-800">
                          {formatCurrency(entry.physicalCash ?? null)}
                        </div>
                      </div>
                      <div>
                        Safe Drop
                        <div className="text-sm font-semibold text-slate-800">
                          {formatCurrency(entry.safeDroppedAmount ?? null)}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-slate-500">
                      Net From Report{" "}
                      <span className="font-semibold text-slate-700">
                        {formatCurrency(entry.netFromReport ?? null)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </AuthGuard>
  );
}
