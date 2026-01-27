"use client";

import { useEffect, useMemo, useState } from "react";
import { AuthGuard } from "@/app/context/authGuard";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  WinnerCreatePayload,
  WinnerData,
  winnerService,
} from "@/app/services/winnerService";
import Link from "next/link";
import Breadcrumbs from "@/app/components/Breadcrumbs";

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
  createdByUsername: string;
};

export default function WinnersPage() {
  const queryClient = useQueryClient();
  const [planItems, setPlanItems] = useState<PlanItem[]>([
    { id: "plan-1", date: "2026-01-30", amount: "2500" },
  ]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [playerName, setPlayerName] = useState("");
  const [playerContact, setPlayerContact] = useState("");
  const [winningDate, setWinningDate] = useState("");
  const [totalWinAmount, setTotalWinAmount] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [status, setStatus] = useState("PARTIALLY_PAID");

  const createWinnerMutation = useMutation({
    mutationFn: winnerService.createWinner,
    onSuccess: () => {
      setMessage("Winner saved successfully.");
      setError("");
      setPlayerName("");
      setPlayerContact("");
      setWinningDate("");
      setTotalWinAmount("");
      setAmountPaid("");
      setStatus("PARTIALLY_PAID");
      queryClient.invalidateQueries({ queryKey: ["winners"] });
    },
    onError: () => {
      setError("Unable to save winner. Try again.");
      setMessage("");
    },
  });

  const { data: winners = [] } = useQuery({
    queryKey: ["winners"],
    queryFn: winnerService.getWinners,
  });

  useEffect(() => {
    const hasDefaultPlan =
      planItems.length === 1 &&
      planItems[0].id === "plan-1" &&
      !planItems[0].date &&
      !planItems[0].amount;
    if (!hasDefaultPlan) return;

    const winnerWithPlan = winners.find(
      (winner) => winner.paymentPlan && winner.paymentPlan.length > 0
    );
    if (!winnerWithPlan?.paymentPlan) return;

    const mapped = winnerWithPlan.paymentPlan.map((item, index) => ({
      id: `${winnerWithPlan.id}-plan-${index}`,
      date: item.date,
      amount: String(item.amount),
    }));
    setPlanItems(mapped);
  }, [winners, planItems]);

  const upcomingPlans = useMemo(() => {
    const today = new Date();
    return winners.flatMap((winner) => {
      const plan = winner.paymentPlan ?? [];
      return plan
        .filter((item) => new Date(item.date) >= today)
        .map((item) => ({
          id: `${winner.id}-${item.date}-${item.amount}`,
          playerName: winner.playerName,
          date: item.date,
          amount: item.amount,
          status: item.status ?? "SCHEDULED",
        }));
    });
  }, [winners]);

  const winnerRows = useMemo<WinnerRow[]>(
    () =>
      winners.map((winner: WinnerData) => ({
        id: winner.id,
        playerName: winner.playerName,
        totalWinAmount: `$${winner.totalWinAmount.toLocaleString()}`,
        amountPaid: `$${winner.amountPaid.toLocaleString()}`,
        remainingAmount: `$${(winner.remainingAmount ?? 0).toLocaleString()}`,
        status: winner.status,
        createdAt: winner.createdAt ?? "-",
        createdByUsername: winner.createdByUsername ?? "-",
      })),
    [winners]
  );

  const totalPlanned = planItems.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0
  );

  return (
    <AuthGuard allowedRoles={["OWNER", "MANAGER"]}>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/" },
            { label: "Winners" },
          ]}
        />
        <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-5 text-white sm:px-6 sm:py-6">
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
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
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
            {error && (
              <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
                {error}
              </div>
            )}
            <form
              className="mt-6 grid gap-4 md:grid-cols-2"
              onSubmit={(event) => {
                event.preventDefault();
                const paymentPlan = planItems
                  .filter((item) => item.date && item.amount)
                  .map((item) => ({
                    date: item.date,
                    amount: Number(item.amount),
                    status: "SCHEDULED",
                  }));
                const payload: WinnerCreatePayload = {
                  playerName,
                  playerContact,
                  winningDate: winningDate || undefined,
                  totalWinAmount: Number(totalWinAmount),
                  amountPaid: Number(amountPaid || 0),
                  status,
                  paymentPlan: paymentPlan.length > 0 ? paymentPlan : null,
                };
                createWinnerMutation.mutate(payload);
              }}
            >
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Player Name
                </label>
                <input
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-base"
                  placeholder="Full name"
                  value={playerName}
                  onChange={(event) => setPlayerName(event.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Status
                </label>
                <select
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-base"
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                >
                  <option>PARTIALLY_PAID</option>
                  <option>PAID</option>
                  <option>UNPAID</option>
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
                  value={totalWinAmount}
                  onChange={(event) => setTotalWinAmount(event.target.value)}
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
                  value={amountPaid}
                  onChange={(event) => setAmountPaid(event.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Player Contact
                </label>
                <input
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-base"
                  placeholder="+1-972-555-1234"
                  value={playerContact}
                  onChange={(event) => setPlayerContact(event.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Winning Date
                </label>
                <input
                  type="datetime-local"
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-base"
                  value={winningDate}
                  onChange={(event) => setWinningDate(event.target.value)}
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
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
                  disabled={createWinnerMutation.isPending}
                >
                  {createWinnerMutation.isPending ? "Saving..." : "Save Winner"}
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
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

            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
              <h3 className="text-sm font-semibold text-slate-700">
                Upcoming Payment Plans
              </h3>
              {upcomingPlans.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">
                  No scheduled payments found.
                </p>
              ) : (
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  {upcomingPlans.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                    >
                      <div>
                        <p className="font-semibold text-slate-800">
                          {item.playerName}
                        </p>
                        <p className="text-xs text-slate-500">{item.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-800">
                          ${item.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500">{item.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
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
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <span>Player</span>
              <span>Total Win</span>
              <span>Paid</span>
              <span>Remaining</span>
              <span>Status</span>
              <span>Created</span>
              <span>Added By</span>
            </div>
            <div className="divide-y divide-slate-100">
              {winnerRows.map((winner) => (
                <div
                  key={winner.id}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-2 px-4 py-3 text-sm text-slate-600"
                >
                  <Link
                    className="font-semibold text-slate-800 hover:text-slate-900"
                    href={`/winners/${winner.id}`}
                  >
                    {winner.playerName}
                  </Link>
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
                  <span>{new Date(winner.createdAt).toLocaleString("en-US")}</span>
                  <span>{winner.createdByUsername}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 space-y-3 md:hidden">
            {winnerRows.map((winner) => (
              <div
                key={winner.id}
                className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <Link
                      className="font-semibold text-slate-800 hover:text-slate-900"
                      href={`/winners/${winner.id}`}
                    >
                      {winner.playerName}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {winner.createdAt} · {winner.createdByUsername}
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
