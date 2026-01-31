"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthGuard } from "@/app/context/authGuard";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  periodService,
  PeriodData,
} from "@/app/services/periodService";
import Breadcrumbs from "@/app/components/Breadcrumbs";
import { formatNumberInput, parseNumberInput } from "@/app/lib/numberInput";

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function PeriodPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  const today = useMemo(() => new Date(), []);
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isOpenModalOpen, setIsOpenModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [openCashIn, setOpenCashIn] = useState("");
  const [openCashOut, setOpenCashOut] = useState("");
  const [closeCashIn, setCloseCashIn] = useState("");
  const [closeCashOut, setCloseCashOut] = useState("");
  const [closeCashInAtm, setCloseCashInAtm] = useState("");
  const [closeSafeDrop, setCloseSafeDrop] = useState("");
  const [closeImages, setCloseImages] = useState<File[]>([]);
  const [message, setMessage] = useState("");
  const businessId = user?.businessId ?? "";

  const openPeriodMutation = useMutation({
    mutationFn: periodService.openPeriod,
    onSuccess: () => {
      setMessage("Period opened successfully.");
      setOpenCashIn("");
      setOpenCashOut("");
      setIsOpenModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["periods", businessId] });
      queryClient.invalidateQueries({ queryKey: ["active-period", businessId] });
    },
    onError: () => setMessage("Unable to open period. Try again."),
  });

  const closePeriodMutation = useMutation({
    mutationFn: periodService.closePeriod,
    onSuccess: () => {
      setMessage("Period closed successfully. You can open a new period.");
      setCloseCashIn("");
      setCloseCashOut("");
      setCloseCashInAtm("");
      setCloseSafeDrop("");
      setCloseImages([]);
      setSelectedDate(null);
      setIsCloseModalOpen(false);
      queryClient.setQueryData(["active-period", businessId], null);
      queryClient.invalidateQueries({ queryKey: ["periods", businessId] });
      queryClient.invalidateQueries({ queryKey: ["active-period", businessId] });
    },
    onError: () => setMessage("Unable to close period. Try again."),
  });

  const { data: activePeriod } = useQuery({
    queryKey: ["active-period", businessId],
    queryFn: () => periodService.getActivePeriod(businessId),
    enabled: Boolean(businessId),
  });

  const { data: periodList = [] } = useQuery({
    queryKey: ["periods", businessId],
    queryFn: () => periodService.getBusinessPeriods(businessId),
    enabled: Boolean(businessId),
  });

  useEffect(() => {
    if (activePeriod?.businessDate) {
      setSelectedDate(new Date(activePeriod.businessDate));
    }
  }, [activePeriod]);

  const periodByDate = useMemo(() => {
    const map = new Map<string, PeriodData>();
    periodList.forEach((period) => {
      map.set(period.businessDate, period);
    });
    return map;
  }, [periodList]);
  const selectedKey = selectedDate ? formatDate(selectedDate) : null;
  const selectedPeriod = selectedKey ? periodByDate.get(selectedKey) : null;

  const calendarDays = useMemo(() => {
    const start = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    );
    const end = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    );
    const startDay = start.getDay();
    const daysInMonth = end.getDate();
    const weeks: Array<Array<Date | null>> = [];
    let day = 1 - startDay;

    while (day <= daysInMonth) {
      const week: Array<Date | null> = [];
      for (let i = 0; i < 7; i += 1) {
        if (day < 1 || day > daysInMonth) {
          week.push(null);
        } else {
          week.push(
            new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
          );
        }
        day += 1;
      }
      weeks.push(week);
    }

    return weeks;
  }, [currentMonth]);

  const monthLabel = currentMonth.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <AuthGuard>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/" },
            { label: "Period" },
          ]}
        />
        <section className="rounded-2xl border border-slate-200 bg-white px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Period control
              </h2>
              <p className="text-xs text-slate-500">
                {activePeriod?.status === "OPEN"
                  ? `Close the open period for ${activePeriod.businessDate}.`
                  : "Select a day on the calendar to open a new period."}
              </p>
            </div>
            {activePeriod?.status === "OPEN" && (
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
                onClick={() => setIsCloseModalOpen(true)}
                disabled={closePeriodMutation.isPending || !businessId}
              >
                Close Period
              </button>
            )}
          </div>
          {activePeriod?.status === "OPEN" && (
            <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-emerald-600">
                    Active Period
                  </p>
                  <p className="font-semibold">
                    {activePeriod.businessDate} is currently open.
                  </p>
                </div>
                <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                  OPEN
                </span>
              </div>
            </div>
          )}
          {!businessId && (
            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-700">
              Assign a business to your account to manage periods.
            </div>
          )}
          {message && (
            <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-600">
              {message}
            </div>
          )}

        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Period Calendar
              </p>
              <h1 className="text-2xl font-semibold text-slate-900">
                Track open and closed periods
              </h1>
              <p className="text-sm text-slate-500">
                Click a day to open a new period if none are open.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                onClick={() =>
                  setCurrentMonth(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() - 1,
                      1
                    )
                  )
                }
                type="button"
              >
                Prev
              </button>
              <button
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                onClick={() =>
                  setCurrentMonth(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() + 1,
                      1
                    )
                  )
                }
                type="button"
              >
                Next
              </button>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
              <span className="text-sm font-semibold text-slate-700">
                {monthLabel}
              </span>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Open
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-slate-400" />
                  Closed
                </span>
              </div>
            </div>
            <div className="grid grid-cols-7 border-b border-slate-200 bg-white text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
              {weekDays.map((day) => (
                <div key={day} className="py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-rows-5 gap-px bg-slate-200">
              {calendarDays.map((week, index) => (
                <div key={`week-${index}`} className="grid grid-cols-7 gap-px">
                  {week.map((date, dayIndex) => {
                    if (!date) {
                      return (
                        <div
                          key={`empty-${index}-${dayIndex}`}
                          className="h-20 bg-white sm:h-24"
                        />
                      );
                    }
                    const isToday = isSameDay(date, today);
                    const isSelected = selectedDate
                      ? isSameDay(date, selectedDate)
                      : false;
                    const businessDate = formatDate(date);
                    const period = periodByDate.get(businessDate);
                    const status = period?.status;
                    const isActiveOpen =
                      activePeriod?.status === "OPEN" &&
                      activePeriod.businessDate === businessDate;
                    const netOpenValue =
                      period?.netOpen ??
                      (period
                        ? period.totalCashInOpen - period.totalCashOutOpen
                        : null);
                    const netCloseValue =
                      period?.netClose ??
                      (period
                        ? period.totalCashInClose - period.totalCashOutClose
                        : null);
                    const netValue =
                      netCloseValue != null && netOpenValue != null
                        ? netCloseValue - netOpenValue
                        : null;
                    return (
                      <button
                        key={date.toISOString()}
                        type="button"
                        onClick={() => {
                          if (period?.id) {
                            router.push(`/periods/${period.id}`);
                            return;
                          }
                          if (activePeriod?.status === "OPEN") {
                            setMessage(
                              "Close the active period before opening another."
                            );
                            return;
                          }
                          if (status === "CLOSED") {
                            setMessage(
                              "That day is already closed and cannot be reopened."
                            );
                            return;
                        }
                          setSelectedDate(date);
                          setMessage("");
                          setOpenCashIn("");
                          setOpenCashOut("");
                          setIsOpenModalOpen(true);
                        }}
                        className={`relative h-20 bg-white p-2 text-left text-sm transition hover:bg-slate-50 sm:h-24 ${
                          isSelected ? "ring-2 ring-emerald-400" : ""
                        }`}
                      >
                        <span
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                            isToday
                              ? "bg-emerald-500 text-white"
                              : "text-slate-600"
                          }`}
                        >
                          {date.getDate()}
                        </span>
                        {period && (
                          <div className="absolute top-2 right-2 space-y-1 text-[11px] text-slate-500">
                            <div className="text-right">
                              SafeDrop{" "}
                              <span className="font-medium text-slate-700">
                                {period.safeDrop ?? 0}
                              </span>
                            </div>
                            <div className="text-right">
                              Net{" "}
                              <span
                                className={`font-medium ${
                                  (netValue ?? 0) < 0
                                    ? "text-rose-600"
                                    : "text-emerald-600"
                                }`}
                              >
                                {netValue ?? 0}
                              </span>
                            </div>
                          </div>
                        )}
                        {status && (
                          <span
                            className={`absolute bottom-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              status === "OPEN"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {status === "OPEN" ? "Open" : "Closed"}
                          </span>
                        )}
                        {isActiveOpen && (
                          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </section>

        {isOpenModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">
                  Open Period
                </h3>
                <button
                  type="button"
                  className="text-slate-400 hover:text-slate-600"
                  onClick={() => setIsOpenModalOpen(false)}
                >
                  ✕
                </button>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Create a new period for the selected date.
              </p>

              <form
                className="mt-4 grid gap-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  setMessage("");
                  if (!selectedDate) {
                    setMessage("Please select a business date.");
                    return;
                  }
                  if (selectedPeriod?.status === "CLOSED") {
                    setMessage("That day is already closed and cannot be reopened.");
                    return;
                  }
                  if (
                    parseNumberInput(openCashIn) < 0 ||
                    parseNumberInput(openCashOut) < 0
                  ) {
                    setMessage("Cash values must be zero or greater.");
                    return;
                  }
                  openPeriodMutation.mutate({
                    businessDate: formatDate(selectedDate),
                    totalCashInOpen: parseNumberInput(openCashIn),
                    totalCashOutOpen: parseNumberInput(openCashOut),
                  });
                }}
              >
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">
                    Business Date
                  </label>
                  <input
                    className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                    value={selectedDate ? formatDate(selectedDate) : ""}
                    readOnly
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">
                    Total Cash In (Open)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    placeholder="55000"
                    value={openCashIn}
                    onChange={(event) =>
                      setOpenCashIn(formatNumberInput(event.target.value))
                    }
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">
                    Total Cash Out (Open)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    placeholder="11000"
                    value={openCashOut}
                    onChange={(event) =>
                      setOpenCashOut(formatNumberInput(event.target.value))
                    }
                    required
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                    onClick={() => setIsOpenModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                    disabled={openPeriodMutation.isPending || !businessId}
                  >
                    {openPeriodMutation.isPending ? "Opening..." : "Open Period"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isCloseModalOpen && activePeriod?.status === "OPEN" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4">
            <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">
                  Close Period
                </h3>
                <button
                  type="button"
                  className="text-slate-400 hover:text-slate-600"
                  onClick={() => setIsCloseModalOpen(false)}
                >
                  ✕
                </button>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Enter closing totals for {activePeriod.businessDate}.
              </p>

              <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span>Opened totals</span>
                  <span className="font-semibold text-slate-700">
                    In: {activePeriod.totalCashInOpen} / Out:{" "}
                    {activePeriod.totalCashOutOpen}
                  </span>
                </div>
              </div>

              <form
                className="mt-4 grid gap-4 md:grid-cols-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  setMessage("");
                  if (!activePeriod?.id) {
                    setMessage("No active period to close.");
                    return;
                  }
                  if (
                    parseNumberInput(closeCashIn) < 0 ||
                    parseNumberInput(closeCashOut) < 0 ||
                    parseNumberInput(closeCashInAtm) < 0 ||
                    parseNumberInput(closeSafeDrop) < 0
                  ) {
                    setMessage("Cash values must be zero or greater.");
                    return;
                  }
                  const basePayload = {
                    periodId: activePeriod.id,
                    totalCashInClose: parseNumberInput(closeCashIn),
                    totalCashOutClose: parseNumberInput(closeCashOut),
                    cashInAtmClose: parseNumberInput(closeCashInAtm),
                    safeDropClose: parseNumberInput(closeSafeDrop),
                  };
                  if (closeImages.length > 0) {
                    const formData = new FormData();
                    formData.append("periodId", basePayload.periodId);
                    formData.append(
                      "totalCashInClose",
                      String(basePayload.totalCashInClose)
                    );
                    formData.append(
                      "totalCashOutClose",
                      String(basePayload.totalCashOutClose)
                    );
                    formData.append(
                      "cashInAtmClose",
                      String(basePayload.cashInAtmClose ?? 0)
                    );
                    formData.append(
                      "safeDropClose",
                      String(basePayload.safeDropClose ?? 0)
                    );
                    closeImages.forEach((file) => {
                      formData.append("images", file);
                    });
                    closePeriodMutation.mutate(formData);
                    return;
                  }
                  closePeriodMutation.mutate(basePayload);
                }}
              >
                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">
                    Business Date
                  </label>
                  <input
                    className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                    value={activePeriod.businessDate}
                    readOnly
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">
                    Total Cash In (Close)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    placeholder="0"
                    value={closeCashIn}
                    onChange={(event) =>
                      setCloseCashIn(formatNumberInput(event.target.value))
                    }
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">
                    Total Cash Out (Close)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    placeholder="0"
                    value={closeCashOut}
                    onChange={(event) =>
                      setCloseCashOut(formatNumberInput(event.target.value))
                    }
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">
                    Cash In ATM (Close)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    placeholder="0"
                    value={closeCashInAtm}
                    onChange={(event) =>
                      setCloseCashInAtm(formatNumberInput(event.target.value))
                    }
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">
                    Safe Drop (Close)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    placeholder="0"
                    value={closeSafeDrop}
                    onChange={(event) =>
                      setCloseSafeDrop(formatNumberInput(event.target.value))
                    }
                    required
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">
                    Upload Close Images
                  </label>
                  <input
                    type="file"
                    name="images"
                    multiple
                    className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
                    onChange={(event) =>
                      setCloseImages(Array.from(event.target.files ?? []))
                    }
                  />
                </div>
                <div className="md:col-span-2 flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                    onClick={() => setIsCloseModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
                    disabled={closePeriodMutation.isPending || !businessId}
                  >
                    {closePeriodMutation.isPending ? "Closing..." : "Close Period"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
