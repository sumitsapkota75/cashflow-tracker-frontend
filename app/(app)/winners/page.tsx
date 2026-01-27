"use client";

import { useMemo, useState } from "react";
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
  date: string; // LocalDate: YYYY-MM-DD (backend uses LocalDate)
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

type PaymentPlanPayloadItem = {
  date: string; // LocalDate
  amount: number; // BigDecimal-friendly
  status: string;
};

const DEFAULT_STATUS = "PARTIALLY_PAID";

const formatMoney = (value: number) => `$${value.toLocaleString("en-US")}`;

const toNumber = (value: string) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const buildPaymentPlan = (items: PlanItem[]): PaymentPlanPayloadItem[] => {
  return items
    .map((i) => ({
      date: (i.date ?? "").trim(),
      amount: toNumber(i.amount),
      status: "SCHEDULED",
    }))
    .filter((i) => i.date && i.amount > 0);
};

const newPlanItem = (): PlanItem => ({
  id: `plan-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  date: "",
  amount: "",
});

export default function WinnersPage() {
  const queryClient = useQueryClient();

  // form state
  const [playerName, setPlayerName] = useState("");
  const [playerContact, setPlayerContact] = useState("");
  const [winningDate, setWinningDate] = useState(""); // keep as-is from datetime-local
  const [totalWinAmount, setTotalWinAmount] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [status, setStatus] = useState(DEFAULT_STATUS);

  // payment plan state
  const [planItems, setPlanItems] = useState<PlanItem[]>([newPlanItem()]);

  // ui state
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const { data: winners = [] } = useQuery({
    queryKey: ["winners"],
    queryFn: winnerService.getWinners,
  });

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
      setStatus(DEFAULT_STATUS);
      setPlanItems([newPlanItem()]);

      queryClient.invalidateQueries({ queryKey: ["winners"] });
    },
    onError: () => {
      setError("Unable to save winner. Try again.");
      setMessage("");
    },
  });

  // derived
  const totalPlanned = useMemo(
    () => planItems.reduce((sum, item) => sum + toNumber(item.amount), 0),
    [planItems]
  );

  const upcomingPlans = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return winners.flatMap((winner) => {
      const plan = winner.paymentPlan ?? [];
      return plan
        .filter((item) => {
          // item.date is LocalDate ("YYYY-MM-DD") - safe parse
          const d = new Date(item.date);
          d.setHours(0, 0, 0, 0);
          return d >= today;
        })
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
        totalWinAmount: formatMoney(winner.totalWinAmount),
        amountPaid: formatMoney(winner.amountPaid),
        remainingAmount: formatMoney(winner.remainingAmount ?? 0),
        status: winner.status,
        createdAt: winner.createdAt ?? "-",
        createdByUsername: winner.createdByUsername ?? "-",
      })),
    [winners]
  );

  // handlers
  const onAddPlanItem = () => setPlanItems((prev) => [...prev, newPlanItem()]);

  const onRemovePlanItem = (id: string) =>
    setPlanItems((prev) => {
      const next = prev.filter((p) => p.id !== id);
      return next.length ? next : [newPlanItem()];
    });

  const onUpdatePlanItem = (id: string, patch: Partial<PlanItem>) =>
    setPlanItems((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    setMessage("");
    setError("");

    const paymentPlan = buildPaymentPlan(planItems);

    const totalWin = toNumber(totalWinAmount);
    const paid = toNumber(amountPaid);

    if (!playerName.trim()) {
      setError("Player name is required.");
      return;
    }

    if (totalWin <= 0) {
      setError("Total win amount must be greater than 0.");
      return;
    }

    const plannedTotal = paymentPlan.reduce((s, p) => s + p.amount, 0);
    if (plannedTotal > totalWin) {
      setError("Payment plan total cannot exceed total win amount.");
      return;
    }

    if (paid > totalWin) {
      setError("Amount paid cannot exceed total win amount.");
      return;
    }

    const payload: WinnerCreatePayload = {
      playerName: playerName.trim(),
      playerContact: playerContact.trim() || undefined,
      winningDate: winningDate || undefined, // if backend expects LocalDateTime, keep datetime-local format
      totalWinAmount: totalWin,
      amountPaid: paid,
      status,
      paymentPlan, // ✅ LocalDate items
    };
    console.log({payload})
    createWinnerMutation.mutate(payload);
  };

  return (
    <AuthGuard allowedRoles={["OWNER", "MANAGER"]}>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: "Dashboard", href: "/" }, { label: "Winners" }]} />

        <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-5 text-white sm:px-6 sm:py-6">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-200">Winners</p>
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
              Total planned: ${totalPlanned.toLocaleString("en-US")}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-slate-900">Create Winner + Payment Plan</h2>
            <p className="text-sm text-slate-500">Log a new winner and schedule their payments.</p>

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

            <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
              <div>
                <label className="text-sm font-semibold text-slate-700">Player Name</label>
                <input
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-base"
                  placeholder="Full name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">Status</label>
                <select
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-base"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option>PARTIALLY_PAID</option>
                  <option>PAID</option>
                  <option>UNPAID</option>
                  <option>ON_HOLD</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">Total Win Amount</label>
                <input
                  type="number"
                  min={0}
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-base"
                  placeholder="12500"
                  value={totalWinAmount}
                  onChange={(e) => setTotalWinAmount(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">Amount Paid</label>
                <input
                  type="number"
                  min={0}
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-base"
                  placeholder="4000"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">Player Contact</label>
                <input
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-base"
                  placeholder="+1-972-555-1234"
                  value={playerContact}
                  onChange={(e) => setPlayerContact(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">Winning Date</label>
                <input
                  type="datetime-local"
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-base"
                  value={winningDate}
                  onChange={(e) => setWinningDate(e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-700">Payment Plan</h3>
                  <button
                    type="button"
                    className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    onClick={onAddPlanItem}
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
                        onChange={(e) => onUpdatePlanItem(item.id, { date: e.target.value })}
                      />

                      <input
                        type="number"
                        min={0}
                        className="w-40 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                        placeholder="Amount"
                        value={item.amount}
                        onChange={(e) => onUpdatePlanItem(item.id, { amount: e.target.value })}
                      />

                      <button
                        type="button"
                        className="rounded-full border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                        onClick={() => onRemovePlanItem(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                {upcomingPlans.length > 0 && (
                  <div className="mt-4 rounded-xl border border-slate-100 bg-white p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-800">Upcoming scheduled payouts</p>
                      <p className="text-xs text-slate-500">{upcomingPlans.length} items</p>
                    </div>
                    <div className="mt-3 space-y-2 text-sm text-slate-600">
                      {upcomingPlans.slice(0, 5).map((p) => (
                        <div key={p.id} className="flex items-center justify-between">
                          <span className="font-medium text-slate-800">{p.playerName}</span>
                          <span className="text-slate-500">{p.date}</span>
                          <span className="font-semibold">{formatMoney(Number(p.amount) || 0)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Winners Snapshot</h2>
              <p className="text-sm text-slate-500">Current tracked winners and balances.</p>
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
                  <span className="font-semibold text-slate-800">{winner.remainingAmount}</span>
                  <span
                    className={`font-semibold ${
                      winner.status === "PAID" ? "text-emerald-600" : "text-amber-600"
                    }`}
                  >
                    {winner.status}
                  </span>
                  <span>
                    {winner.createdAt === "-" ? "-" : new Date(winner.createdAt).toLocaleString("en-US")}
                  </span>
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
                    <div className="text-sm font-semibold text-slate-800">{winner.totalWinAmount}</div>
                  </div>
                  <div>
                    Paid
                    <div className="text-sm font-semibold text-slate-800">{winner.amountPaid}</div>
                  </div>
                  <div>
                    Remaining
                    <div className="text-sm font-semibold text-slate-800">{winner.remainingAmount}</div>
                  </div>
                  <div>
                    Status
                    <div className="text-sm font-semibold text-slate-800">{winner.status}</div>
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
