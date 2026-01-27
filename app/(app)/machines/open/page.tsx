"use client";

import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthGuard } from "@/app/context/authGuard";
import { useAuth } from "@/app/context/AuthContext";
import { periodService } from "@/app/services/periodService";
import { businessService } from "@/app/services/businessService";
import {
  machineEntryService,
  MachineEntryPayload,
} from "@/app/services/machineEntryService";
import ImageUpload, { ImageFile } from "@/app/components/ImageUpload";
import Breadcrumbs from "@/app/components/Breadcrumbs";

const reasons: MachineEntryPayload["reason"][] = [
  "MID_DAY",
  "END_DAY",
  "SHIFT_OPEN",
  "SHIFT_CLOSE",
];

export default function MachineEntryPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const businessId = user?.businessId ?? "";
  const [message, setMessage] = useState("");
  const entriesRef = useRef<HTMLDivElement | null>(null);

  const [machineId, setMachineId] = useState("");
  const [reportCashIn, setReportCashIn] = useState("");
  const [reportCashOut, setReportCashOut] = useState("");
  const [physicalCash, setPhysicalCash] = useState("");
  const [netFromReport, setNetFromReport] = useState("");
  const [safeDroppedAmount, setSafeDroppedAmount] = useState("");
  const [remarks, setRemarks] = useState("");
  const [reason, setReason] = useState<MachineEntryPayload["reason"]>("MID_DAY");
  const [images, setImages] = useState<ImageFile[]>([]);

  const { data: activePeriod } = useQuery({
    queryKey: ["active-period", businessId],
    queryFn: () => periodService.getActivePeriod(businessId),
    enabled: Boolean(businessId),
  });
  const periodId = activePeriod?.id ?? "";

  const { data: businesses = [] } = useQuery({
    queryKey: ["businesses"],
    queryFn: businessService.getBusinesses,
    enabled: Boolean(businessId),
  });

  const business = useMemo(
    () =>
      businesses.find((item) => item.id === businessId || item._id === businessId),
    [businesses, businessId]
  );

  const machineOptions = useMemo(() => {
    const ids = business?.machineIds ?? [];
    return ids.map((id, index) => ({
      id,
      label: `Machine ${index + 1}`,
    }));
  }, [business]);

  const createEntryMutation = useMutation({
    mutationFn: machineEntryService.createEntry,
    onSuccess: () => {
      setMessage("Machine entry saved successfully.");
      setReportCashIn("");
      setReportCashOut("");
      setPhysicalCash("");
      setNetFromReport("");
      setSafeDroppedAmount("");
      setRemarks("");
      setReason("MID_DAY");
      setImages([]);
      queryClient.invalidateQueries({
        queryKey: ["machine-entries", periodId],
      });
      setTimeout(() => {
        entriesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    },
    onError: () => setMessage("Unable to save machine entry. Try again."),
  });

  const hasOpenPeriod = activePeriod?.status === "OPEN";

  const { data: machineEntries = [] } = useQuery({
    queryKey: ["machine-entries", periodId],
    queryFn: () => machineEntryService.getByPeriod(periodId),
    enabled: Boolean(periodId),
  });

  const formatCurrency = (value?: number | null) => {
    if (value == null) return "-";
    return `$${value.toLocaleString()}`;
  };

  const formatDateTime = (value?: string | null) => {
    if (!value) return "-";
    const date = new Date(value);
    return date.toLocaleString();
  };

  return (
    <AuthGuard>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/" },
            { label: "Machine Entry" },
          ]}
        />
        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Machine Entry
              </p>
              <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">
                Quick cash log
              </h1>
              <p className="text-base text-slate-500">
                Enter the latest machine report and safe drop details.
              </p>
            </div>
            {hasOpenPeriod ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-base font-semibold text-emerald-700">
                Period for {activePeriod?.businessDate} is open.
              </div>
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-base font-semibold text-amber-700">
                No open period found. Open a period before logging entries.
              </div>
            )}
          </div>
          {message && (
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
              {message}
            </div>
          )}
          {!businessId && (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">
              Assign a business to your account to log machine entries.
            </div>
          )}
          {businessId && machineOptions.length === 0 && (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">
              No machines found for this business.
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
          {!hasOpenPeriod ? (
            <div className="space-y-3 text-center">
              <p className="text-base font-semibold text-slate-700">
                No open period found.
              </p>
              <p className="text-sm text-slate-500">
                Please open a period before submitting machine entries.
              </p>
              <a
                href="/period"
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Go to Periods
              </a>
            </div>
          ) : (
            <form
              className="grid gap-5 md:grid-cols-2"
              onSubmit={(event) => {
                event.preventDefault();
                setMessage("");

                if (!machineId) {
                  setMessage("Please select a machine.");
                  return;
                }

                const numericFields = [
                  reportCashIn,
                  reportCashOut,
                  physicalCash,
                  netFromReport,
                  safeDroppedAmount,
                ];
                if (numericFields.some((value) => Number(value) < 0)) {
                  setMessage("Values must be zero or greater.");
                  return;
                }

                createEntryMutation.mutate({
                  machineId,
                  reportCashIn,
                  reportCashOut,
                  physicalCash: Number(physicalCash),
                  netFromReport,
                  remarks,
                  safeDroppedAmount: Number(safeDroppedAmount),
                  reason,
                });
              }}
            >
              <div className="md:col-span-2">
                <label className="text-base font-semibold text-slate-700">
                  Machine
                </label>
                <select
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-base"
                  value={machineId}
                  onChange={(event) => setMachineId(event.target.value)}
                  required
                >
                  <option value="" disabled>
                    Select a machine
                  </option>
                  {machineOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-base font-semibold text-slate-700">
                  Report Cash In
                </label>
                <input
                  type="number"
                  min={0}
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-base"
                  value={reportCashIn}
                  onChange={(event) => setReportCashIn(event.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-base font-semibold text-slate-700">
                  Report Cash Out
                </label>
                <input
                  type="number"
                  min={0}
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-base"
                  value={reportCashOut}
                  onChange={(event) => setReportCashOut(event.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-base font-semibold text-slate-700">
                  Physical Cash
                </label>
                <input
                  type="number"
                  min={0}
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-base"
                  value={physicalCash}
                  onChange={(event) => setPhysicalCash(event.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-base font-semibold text-slate-700">
                  Net From Report
                </label>
                <input
                  type="number"
                  min={0}
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-base"
                  value={netFromReport}
                  onChange={(event) => setNetFromReport(event.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-base font-semibold text-slate-700">
                  Safe Dropped Amount
                </label>
                <input
                  type="number"
                  min={0}
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-base"
                  value={safeDroppedAmount}
                  onChange={(event) => setSafeDroppedAmount(event.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-base font-semibold text-slate-700">
                  Reason
                </label>
                <select
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-base"
                  value={reason}
                  onChange={(event) =>
                    setReason(event.target.value as MachineEntryPayload["reason"])
                  }
                  required
                >
                  {reasons.map((option) => (
                    <option key={option} value={option}>
                      {option.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-base font-semibold text-slate-700">
                  Remarks
                </label>
                <textarea
                  className="mt-2 min-h-[120px] w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-base"
                  value={remarks}
                  onChange={(event) => setRemarks(event.target.value)}
                  placeholder="Add any notes for this entry"
                />
              </div>
              <div className="md:col-span-2">
                <ImageUpload
                  images={images}
                  setImages={setImages}
                  maxImages={4}
                  label="Attach Machine Photos"
                />
                <p className="mt-2 text-sm text-slate-500">
                  Optional. Photos help verify counters or issues on-site.
                </p>
              </div>

              <div className="md:col-span-2">
                <button
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 px-8 py-3 text-base font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
                  type="submit"
                  disabled={
                    createEntryMutation.isPending ||
                    !businessId ||
                    machineOptions.length === 0
                  }
                >
                  {createEntryMutation.isPending ? "Saving..." : "Save Entry"}
                </button>
              </div>
            </form>
          )}
        </section>

        {hasOpenPeriod && (
          <section
            ref={entriesRef}
            className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Recent Machine Entries
                </h2>
                <p className="text-sm text-slate-500">
                  Entries for period {activePeriod?.businessDate}.
                </p>
              </div>
              <span className="text-xs text-slate-400">
                {machineEntries.length} entries
              </span>
            </div>

            {machineEntries.length === 0 ? (
              <div className="mt-4 text-sm text-slate-500">
                No entries recorded yet for this period.
              </div>
            ) : (
              <>
                <div className="mt-4 hidden overflow-hidden rounded-xl border border-slate-100 md:block">
                  <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <span>Machine</span>
                    <span>Report In</span>
                    <span>Report Out</span>
                    <span>Physical</span>
                    <span>Safe Drop</span>
                    <span>Difference</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {machineEntries.map((entry) => (
                      <div
                        key={
                          entry.entryId ??
                          entry.id ??
                          entry._id ??
                          entry.machineId ??
                          Math.random()
                        }
                        className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] gap-2 px-4 py-3 text-sm text-slate-600"
                      >
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
                        <span>
                          {formatCurrency(entry.reportCashIn ?? null)}
                        </span>
                        <span>
                          {formatCurrency(entry.reportCashOut ?? null)}
                        </span>
                        <span>
                          {formatCurrency(entry.physicalCash ?? null)}
                        </span>
                        <span>
                          {formatCurrency(entry.safeDroppedAmount ?? null)}
                        </span>
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
                  {machineEntries.map((entry) => (
                    <div
                      key={
                        entry.entryId ??
                        entry.id ??
                        entry._id ??
                        entry.machineId ??
                        Math.random()
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
                          Report In
                          <div className="text-sm font-semibold text-slate-800">
                            {formatCurrency(entry.reportCashIn ?? null)}
                          </div>
                        </div>
                        <div>
                          Report Out
                          <div className="text-sm font-semibold text-slate-800">
                            {formatCurrency(entry.reportCashOut ?? null)}
                          </div>
                        </div>
                        <div>
                          Physical
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
        )}
      </div>
    </AuthGuard>
  );
}
