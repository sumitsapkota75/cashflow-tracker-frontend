"use client";

import { useMemo, useState } from "react";
import { AuthGuard } from "@/app/context/authGuard";

type PayoutRow = {
  id: string;
  winner: string;
  period: string;
  amount: string;
  status: string;
  reason: string;
  payoutDate: string;
  remarks: string;
};

const reasons = ["WINNER_PAYOUT", "MAINTENANCE", "CUSTOMER_ISSUE", "OTHER"];

export default function PayoutsPage() {
  const [rows, setRows] = useState<PayoutRow[]>([
    {
      id: "payout-1",
      winner: "Alex Morgan",
      period: "2026-01-24",
      amount: "$2,500",
      status: "PAID",
      reason: "WINNER_PAYOUT",
      payoutDate: "2026-01-25",
      remarks: "First installment",
    },
  ]);
  const [message, setMessage] = useState("");

  const winners = useMemo(
    () => ["Alex Morgan", "J. Patel", "Open (Other)"],
    []
  );

  return (
    <AuthGuard>
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-5 text-white sm:px-6 sm:py-6">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">
            Payouts
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold md:text-3xl">
                Log payouts with confidence
              </h1>
              <p className="text-sm text-slate-200">
                Record winner payouts or other cash outflows per period.
              </p>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm">
              {rows.length} payouts logged
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Create Payout
          </h2>
          <p className="text-sm text-slate-500">
            Attach to a winner or select another reason.
          </p>
          {message && (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
              {message}
            </div>
          )}
          <form
            className="mt-6 grid gap-4 md:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault();
              setMessage("Payout saved.");
              setRows((prev) => [
                {
                  id: `payout-${Date.now()}`,
                  winner: "Alex Morgan",
                  period: "2026-01-26",
                  amount: "$1,200",
                  status: "SCHEDULED",
                  reason: "WINNER_PAYOUT",
                  payoutDate: "2026-01-26",
                  remarks: "Auto logged from form",
                },
                ...prev,
              ]);
            }}
          >
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Winner / Reason
              </label>
              <select className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-base">
                {winners.map((winner) => (
                  <option key={winner} value={winner}>
                    {winner}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Period Date
              </label>
              <input
                type="date"
                className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-base"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Payout Amount
              </label>
              <input
                type="number"
                min={0}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-base"
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Status
              </label>
              <select className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-base">
                <option>SCHEDULED</option>
                <option>PAID</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Reason Type
              </label>
              <select className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-base">
                {reasons.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Payout Date
              </label>
              <input
                type="date"
                className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-base"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">
                Remarks
              </label>
              <textarea className="mt-2 min-h-[100px] w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-base" />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Save Payout
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Recent Payouts
              </h2>
              <p className="text-sm text-slate-500">
                Review payouts logged by staff.
              </p>
            </div>
            <button
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              type="button"
            >
              Export
            </button>
          </div>

          <div className="mt-4 hidden overflow-hidden rounded-xl border border-slate-100 md:block">
            <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr] gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <span>Winner / Reason</span>
              <span>Period</span>
              <span>Amount</span>
              <span>Status</span>
              <span>Reason</span>
              <span>Date</span>
            </div>
            <div className="divide-y divide-slate-100">
              {rows.map((row) => (
                <div
                  key={row.id}
                  className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr] gap-2 px-4 py-3 text-sm text-slate-600"
                >
                  <span className="font-semibold text-slate-800">
                    {row.winner}
                  </span>
                  <span>{row.period}</span>
                  <span>{row.amount}</span>
                  <span
                    className={`font-semibold ${
                      row.status === "PAID"
                        ? "text-emerald-600"
                        : "text-amber-600"
                    }`}
                  >
                    {row.status}
                  </span>
                  <span>{row.reason}</span>
                  <span>{row.payoutDate}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 space-y-3 md:hidden">
            {rows.map((row) => (
              <div
                key={row.id}
                className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-slate-800">{row.winner}</p>
                    <p className="text-xs text-slate-500">{row.payoutDate}</p>
                  </div>
                  <span className="rounded-full bg-white px-2 py-1 text-xs text-slate-600">
                    {row.status}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
                  <div>
                    Amount
                    <div className="text-sm font-semibold text-slate-800">
                      {row.amount}
                    </div>
                  </div>
                  <div>
                    Reason
                    <div className="text-sm font-semibold text-slate-800">
                      {row.reason}
                    </div>
                  </div>
                  <div>
                    Period
                    <div className="text-sm font-semibold text-slate-800">
                      {row.period}
                    </div>
                  </div>
                  <div>
                    Remarks
                    <div className="text-sm font-semibold text-slate-800">
                      {row.remarks}
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
