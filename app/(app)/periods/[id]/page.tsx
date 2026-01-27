"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AuthGuard } from "@/app/context/authGuard";
import { periodService } from "@/app/services/periodService";
import {
  machineEntryService,
  MachineEntryData,
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
  const periodId = Array.isArray(params.id) ? params.id[0] : params.id;

  const { data: period, isLoading: periodLoading } = useQuery({
    queryKey: ["period", periodId],
    queryFn: () => periodService.getPeriodById(periodId),
    enabled: Boolean(periodId),
  });

  const { data: machineEntries = [], isLoading: entriesLoading } = useQuery({
    queryKey: ["machine-entries", periodId],
    queryFn: () => machineEntryService.getByPeriod(periodId),
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
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
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

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-slate-900">
              Machine Entries
            </h2>
            <span className="text-xs text-slate-400">
              {machineEntries.length} entries
            </span>
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
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <span>Machine</span>
                  <span>Cash In</span>
                  <span>Cash Out</span>
                  <span>Net</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {machineEntries.map((entry) => (
                    <div
                      key={entry.id ?? entry._id ?? entry.machineId ?? Math.random()}
                      className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-2 px-4 py-3 text-sm text-slate-600"
                    >
                      <div>
                        <p className="font-medium text-slate-800">
                          {entry.machineName ?? entry.machineId ?? "Machine"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {formatDateTime(entry.createdAt)}
                        </p>
                      </div>
                      <span>{formatCurrency(entry.cashIn ?? null)}</span>
                      <span>{formatCurrency(entry.cashOut ?? null)}</span>
                      <span className="font-medium text-slate-800">
                        {formatCurrency(entry.net ?? null)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 space-y-3 md:hidden">
                {machineEntries.map((entry) => (
                  <div
                    key={entry.id ?? entry._id ?? entry.machineId ?? Math.random()}
                    className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-slate-800">
                          {entry.machineName ?? entry.machineId ?? "Machine"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {formatDateTime(entry.createdAt)}
                        </p>
                      </div>
                      <span className="rounded-full bg-white px-2 py-1 text-xs text-slate-500">
                        Net {formatCurrency(entry.net ?? null)}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
                      <div>
                        Cash In
                        <div className="text-sm font-semibold text-slate-800">
                          {formatCurrency(entry.cashIn ?? null)}
                        </div>
                      </div>
                      <div>
                        Cash Out
                        <div className="text-sm font-semibold text-slate-800">
                          {formatCurrency(entry.cashOut ?? null)}
                        </div>
                      </div>
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
