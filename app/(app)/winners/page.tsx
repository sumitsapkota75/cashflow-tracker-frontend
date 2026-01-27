"use client";

import { useMemo, useState } from "react";
import { AuthGuard } from "@/app/context/authGuard";

type PlanItem = {
  id: string;
  date: string;
  amount: string;
};

type WinnerRow = {
  id: string;
  playerName: string;
  totalWinAmount: string;
  amountPaid: string;
  remainingAmount: string;
  status: string;
  createdAt: string;
};

export default function WinnersPage() {
  const [planItems, setPlanItems] = useState<PlanItem[]>([
    { id: "plan-1", date: "2026-01-30", amount: "2500" },
  ]);
  const [message, setMessage] = useState("");

  const winners = useMemo<WinnerRow[]>(
    () => [
      {
        id: "winner-1",
        playerName: "Alex Morgan",
        totalWinAmount: "$12,500",
        amountPaid: "$4,000",
        remainingAmount: "$8,500",
        status: "ACTIVE",
        createdAt: "2026-01-26 9:20 AM",
      },
      {
        id: "winner-2",
        playerName: "J. Patel",
        totalWinAmount: "$6,800",
        amountPaid: "$6,800",
        remainingAmount: "$0",
        status: "PAID",
        createdAt: "2026-01-20 1:05 PM",
      },
    ],
    []
  );

  const totalPlanned = planItems.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0
  );

  return (
    <AuthGuard allowedRoles={["OWNER", "MANAGER"]}>
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-6 text-white">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-200">
            Winners
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold md:text-3xl">
                Payout plans for high-value winners
              </h1>
              <p className="text-sm text-slate-200">
                Track win totals, remaining balances, and scheduled payouts.
              </p>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm">
              Total planned: ${totalPlanned.toLocaleString()}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Create Winner + Payment Plan
            </h2>
            <p className="text-sm text-slate-500">
              Log a new winner and schedule their payments.
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
                setMessage("Winner saved. Payment plan queued.");
              }}
            >
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Player Name
                </label>
                <input
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-base"
                  placeholder="Full name"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Status
                </label>
                <select className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-base">
                  <option>ACTIVE</option>
                  <option>PAID</option>
                  <option>ON_HOLD</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Total Win Amount
                </label>
                <input
                  type="number"
                  min={0}
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-base"
                  placeholder="12500"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Amount Paid
                </label>
                <input
                  type="number"
                  min={0}
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-base"
                  placeholder="4000"
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-700">
                    Payment Plan
                  </h3>
                  <button
                    type="button"
                    className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    onClick={() =>
                      setPlanItems((prev) => [
                        ...prev,
                        {
                          id: `plan-${Date.now()}`,
                          date: "",
                          amount: "",
                        },
                      ])
                    }
                  >
                    Add Payment
                  </button>
                </div>
                <div className="mt-3 space-y-3">
                  {planItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                    >
                      <input
                        type="date"
                        className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                        value={item.date}
                        onChange={(event) =>
                          setPlanItems((prev) =>
                            prev.map((plan) =>
                              plan.id === item.id
                                ? { ...plan, date: event.target.value }
                                : plan
                            )
                          )
                        }
                      />
                      <input
                        type="number"
                        min={0}
                        className="w-40 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                        placeholder="Amount"
                        value={item.amount}
                        onChange={(event) =>
                          setPlanItems((prev) =>
                            prev.map((plan) =>
                              plan.id === item.id
                                ? { ...plan, amount: event.target.value }
                                : plan
                            )
                          )
                        }
                      />
                      <button
                        type="button"
                        className="rounded-full border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                        onClick={() =>
                          setPlanItems((prev) =>
                            prev.filter((plan) => plan.id !== item.id)
                          )
                        }
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Save Winner
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="text-sm font-semibold text-slate-700">
                Plan Overview
              </h3>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                ${totalPlanned.toLocaleString()}
              </p>
              <p className="text-sm text-slate-500">
                scheduled across {planItems.length} payments
              </p>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                {planItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                  >
                    <span>{item.date || "Select date"}</span>
                    <span className="font-semibold">
                      {item.amount ? `$${item.amount}` : "-"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="text-sm font-semibold text-slate-700">
                Follow-up Reminders
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li>Confirm payout method and ID verification.</li>
                <li>Log partial payouts in the Payouts page.</li>
                <li>Close winner once remaining amount is zero.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Winners Snapshot
              </h2>
              <p className="text-sm text-slate-500">
                Current tracked winners and balances.
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
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <span>Player</span>
              <span>Total Win</span>
              <span>Paid</span>
              <span>Remaining</span>
              <span>Status</span>
              <span>Created</span>
            </div>
            <div className="divide-y divide-slate-100">
              {winners.map((winner) => (
                <div
                  key={winner.id}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] gap-2 px-4 py-3 text-sm text-slate-600"
                >
                  <span className="font-semibold text-slate-800">
                    {winner.playerName}
                  </span>
                  <span>{winner.totalWinAmount}</span>
                  <span>{winner.amountPaid}</span>
                  <span className="font-semibold text-slate-800">
                    {winner.remainingAmount}
                  </span>
                  <span
                    className={`font-semibold ${
                      winner.status === "PAID"
                        ? "text-emerald-600"
                        : "text-amber-600"
                    }`}
                  >
                    {winner.status}
                  </span>
                  <span>{winner.createdAt}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 space-y-3 md:hidden">
            {winners.map((winner) => (
              <div
                key={winner.id}
                className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-slate-800">
                      {winner.playerName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {winner.createdAt}
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-2 py-1 text-xs text-slate-600">
                    {winner.status}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
                  <div>
                    Total Win
                    <div className="text-sm font-semibold text-slate-800">
                      {winner.totalWinAmount}
                    </div>
                  </div>
                  <div>
                    Paid
                    <div className="text-sm font-semibold text-slate-800">
                      {winner.amountPaid}
                    </div>
                  </div>
                  <div>
                    Remaining
                    <div className="text-sm font-semibold text-slate-800">
                      {winner.remainingAmount}
                    </div>
                  </div>
                  <div>
                    Status
                    <div className="text-sm font-semibold text-slate-800">
                      {winner.status}
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
