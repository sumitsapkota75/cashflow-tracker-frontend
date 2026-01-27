"use client";

import { useMemo } from "react";
import { AuthGuard } from "@/app/context/authGuard";
import Breadcrumbs from "@/app/components/Breadcrumbs";

type SummaryCard = {
  label: string;
  value: string;
  delta: string;
  accent: string;
};

export default function ReportsPage() {
  const summaryCards = useMemo<SummaryCard[]>(
    () => [
      {
        label: "Total Cash In",
        value: "$182,640",
        delta: "+12.4% vs prior",
        accent: "border-emerald-500",
      },
      {
        label: "Total Cash Out",
        value: "$61,280",
        delta: "-3.1% vs prior",
        accent: "border-rose-500",
      },
      {
        label: "Safe Drop",
        value: "$45,920",
        delta: "+5.6% vs prior",
        accent: "border-amber-500",
      },
      {
        label: "Final Net",
        value: "$76,430",
        delta: "+9.8% vs prior",
        accent: "border-indigo-500",
      },
    ],
    []
  );

  const periodRows = [
    {
      date: "2026-01-24",
      status: "Closed",
      cashIn: "$12,450",
      cashOut: "$3,210",
      safeDrop: "$2,100",
      net: "$7,140",
    },
    {
      date: "2026-01-25",
      status: "Closed",
      cashIn: "$14,980",
      cashOut: "$4,020",
      safeDrop: "$2,600",
      net: "$8,360",
    },
    {
      date: "2026-01-26",
      status: "Open",
      cashIn: "$9,320",
      cashOut: "$2,410",
      safeDrop: "$1,850",
      net: "$5,060",
    },
  ];

  const machineHighlights = [
    { machine: "Machine 1", trend: "+9%", value: "$4,320" },
    { machine: "Machine 2", trend: "+4%", value: "$3,840" },
    { machine: "Machine 3", trend: "-2%", value: "$3,120" },
  ];

  return (
    <AuthGuard allowedRoles={["OWNER", "MANAGER"]}>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/" },
            { label: "Reports" },
          ]}
        />
        <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-5 text-white sm:px-6 sm:py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">
                Reports
              </p>
              <h1 className="text-2xl font-semibold md:text-3xl">
                Cash flow intelligence center
              </h1>
              <p className="text-sm text-slate-200">
                Compare period performance, machine variance, and safe drop
                outcomes in one view.
              </p>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm">
              Last refresh: 2 mins ago
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Report Filters
              </h2>
              <p className="text-sm text-slate-500">
                Narrow down by date, business, or status.
              </p>
            </div>
            <button
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              type="button"
            >
              Export CSV
            </button>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Date Range
              </label>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="date"
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
                  defaultValue="2026-01-01"
                />
                <span className="text-slate-400">to</span>
                <input
                  type="date"
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
                  defaultValue="2026-01-31"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Business
              </label>
              <select className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm">
                <option>All Locations</option>
                <option>Akshiv</option>
                <option>Loop</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Period Status
              </label>
              <select className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm">
                <option>All</option>
                <option>Open</option>
                <option>Closed</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Reason Tag
              </label>
              <select className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm">
                <option>All Reasons</option>
                <option>Mid Day</option>
                <option>End Day</option>
                <option>Shift Open</option>
                <option>Shift Close</option>
              </select>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className={`rounded-xl border-l-4 ${card.accent} bg-white p-5 shadow-sm`}
            >
              <p className="text-xs uppercase tracking-wide text-slate-400">
                {card.label}
              </p>
              <div className="mt-3 flex items-end justify-between gap-3">
                <p className="text-2xl font-semibold text-slate-900">
                  {card.value}
                </p>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                  {card.delta}
                </span>
              </div>
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-2/3 rounded-full bg-slate-900/80" />
              </div>
            </div>
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Period Net Trend
                </h2>
                <p className="text-sm text-slate-500">
                  Net close vs net open over time.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Net Close
                <span className="ml-3 h-2 w-2 rounded-full bg-slate-300" />
                Net Open
              </div>
            </div>
            <div className="mt-6 grid grid-cols-12 items-end gap-2">
              {[90, 70, 85, 60, 95, 78, 88, 72, 92, 68, 86, 74].map(
                (height, index) => (
                  <div key={`net-${index}`} className="space-y-1">
                    <div
                      className="rounded-lg bg-emerald-500"
                      style={{ height: `${height}px` }}
                    />
                    <div
                      className="rounded-lg bg-slate-200"
                      style={{ height: `${Math.max(30, height - 35)}px` }}
                    />
                  </div>
                )
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Machine Highlights
            </h2>
            <p className="text-sm text-slate-500">
              Biggest movers in the current range.
            </p>
            <div className="mt-5 space-y-4">
              {machineHighlights.map((item) => (
                <div
                  key={item.machine}
                  className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {item.machine}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.value} cash in
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-2 py-1 text-xs text-slate-600">
                      {item.trend}
                    </span>
                  </div>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white">
                    <div className="h-full w-3/4 rounded-full bg-slate-900" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Period Summary
              </h2>
              <p className="text-sm text-slate-500">
                View daily status and financial totals.
              </p>
            </div>
            <button
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              type="button"
            >
              View Periods
            </button>
          </div>

          <div className="mt-4 hidden overflow-hidden rounded-xl border border-slate-100 md:block">
            <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr] gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <span>Date</span>
              <span>Status</span>
              <span>Cash In</span>
              <span>Cash Out</span>
              <span>Safe Drop</span>
              <span>Net</span>
            </div>
            <div className="divide-y divide-slate-100">
              {periodRows.map((row) => (
                <div
                  key={row.date}
                  className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr] gap-2 px-4 py-3 text-sm text-slate-600"
                >
                  <span className="font-medium text-slate-800">{row.date}</span>
                  <span
                    className={`font-semibold ${
                      row.status === "Open"
                        ? "text-emerald-600"
                        : "text-slate-600"
                    }`}
                  >
                    {row.status}
                  </span>
                  <span>{row.cashIn}</span>
                  <span>{row.cashOut}</span>
                  <span>{row.safeDrop}</span>
                  <span className="font-semibold text-slate-800">{row.net}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 space-y-3 md:hidden">
            {periodRows.map((row) => (
              <div
                key={row.date}
                className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-800">{row.date}</p>
                    <p className="text-xs text-slate-500">{row.status}</p>
                  </div>
                  <span className="rounded-full bg-white px-2 py-1 text-xs text-slate-600">
                    Net {row.net}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
                  <div>
                    Cash In
                    <div className="text-sm font-semibold text-slate-800">
                      {row.cashIn}
                    </div>
                  </div>
                  <div>
                    Cash Out
                    <div className="text-sm font-semibold text-slate-800">
                      {row.cashOut}
                    </div>
                  </div>
                  <div>
                    Safe Drop
                    <div className="text-sm font-semibold text-slate-800">
                      {row.safeDrop}
                    </div>
                  </div>
                  <div>
                    Net
                    <div className="text-sm font-semibold text-slate-800">
                      {row.net}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AuthGuard>
  );
}
