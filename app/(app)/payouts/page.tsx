"use client";

import { useMemo, useState } from "react";
import { AuthGuard } from "@/app/context/authGuard";
import Breadcrumbs from "@/app/components/Breadcrumbs";
import { formatNumberInput, parseNumberInput } from "@/app/lib/numberInput";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { payoutService, PayoutCreatePayload } from "@/app/services/payoutService";
import { winnerService } from "@/app/services/winnerService";
import Link from "next/link";

type PayoutRow = {
  id: string;
  winner: string;
  winnerId?: string;
  amount: string;
  status: string;
  reason: string;
  payoutDate: string;
  remarks: string;
  createdByUser: string;
};

const reasons = ["WINNER_PAYOUT", "MAINTENANCE", "CUSTOMER_ISSUE", "OTHER"];

export default function PayoutsPage() {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const [winnerId, setWinnerId] = useState("");
  const [winnerName, setWinnerName] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("IN_PROGRESS");
  const [reasonType, setReasonType] = useState("WINNER_PAYOUT");
  const [payoutDate, setPayoutDate] = useState("");
  const [remarks, setRemarks] = useState("");

  const { data: winners = [] } = useQuery({
    queryKey: ["winners"],
    queryFn: winnerService.getWinners,
  });

  const { data: payoutPage } = useQuery({
    queryKey: ["payouts", page, pageSize],
    queryFn: () => payoutService.getPayoutsPage(page, pageSize),
    placeholderData: keepPreviousData,
  });

  const rows = useMemo<PayoutRow[]>(() => {
    const items = payoutPage?.items ?? [];
    return items.map((row) => ({
      id: row.id,
      winner: row.winnerName ?? "Other",
      winnerId: row.winnerId,
      amount: `$${row.amount.toLocaleString()}`,
      status: row.status,
      reason: row.reasonType ?? "—",
      payoutDate: row.payoutDate,
      remarks: row.remarks ?? "",
      createdByUser: row.createdByUser ?? "—",
    }));
  }, [payoutPage]);

  const createPayoutMutation = useMutation({
    mutationFn: payoutService.createPayout,
    onSuccess: () => {
      setMessage("Payout saved.");
      setError("");
      setWinnerId("");
      setWinnerName("");
      setAmount("");
      setStatus("IN_PROGRESS");
      setReasonType("WINNER_PAYOUT");
      setPayoutDate("");
      setRemarks("");
      queryClient.invalidateQueries({ queryKey: ["payouts"] });
    },
    onError: () => {
      setError("Unable to save payout. Try again.");
      setMessage("");
    },
  });

  return (
    <AuthGuard>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/" },
            { label: "Payouts" },
          ]}
        />
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
          {error && (
            <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
              {error}
            </div>
          )}
          <form
            className="mt-6 grid gap-4 md:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault();
              setMessage("");
              setError("");
              if (!amount || parseNumberInput(amount) <= 0) {
                setError("Enter a valid payout amount.");
                return;
              }
              if (!payoutDate) {
                setError("Select a payout date.");
                return;
              }
              const selectedWinner = winners.find((w) => w.id === winnerId);
              const payload: PayoutCreatePayload = {
                winnerID: winnerId || undefined,
                winnerName: winnerId ? selectedWinner?.playerName : winnerName,
                amount: parseNumberInput(amount),
                payoutDate,
                status,
                remarks,
                reasonType,
              };
              createPayoutMutation.mutate(payload);
            }}
          >
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Winner / Reason
              </label>
              <select
                className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-base"
                value={winnerId}
                onChange={(event) => {
                  const value = event.target.value;
                  setWinnerId(value);
                  if (value) {
                    setWinnerName("");
                  }
                }}
              >
                <option value="">Other / No Winner</option>
                {winners.map((winner) => (
                  <option key={winner.id} value={winner.id}>
                    {winner.playerName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Winner Name (if other)
              </label>
              <input
                type="text"
                className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-base"
                value={winnerName}
                onChange={(event) => setWinnerName(event.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Payout Amount
              </label>
              <input
                type="text"
                inputMode="decimal"
                className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-base"
                placeholder="0"
                value={amount}
                onChange={(event) =>
                  setAmount(formatNumberInput(event.target.value))
                }
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
                <option>IN_PROGRESS</option>
                <option>PARTIALLY_PAID</option>
                <option>PAID</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Reason Type
              </label>
              <select
                className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-base"
                value={reasonType}
                onChange={(event) => setReasonType(event.target.value)}
              >
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
                value={payoutDate}
                onChange={(event) => setPayoutDate(event.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">
                Remarks
              </label>
              <textarea
                className="mt-2 min-h-[100px] w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-base"
                value={remarks}
                onChange={(event) => setRemarks(event.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                disabled={createPayoutMutation.isPending}
              >
                {createPayoutMutation.isPending ? "Saving..." : "Save Payout"}
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
            <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <span>Winner / Reason</span>
              <span>Amount</span>
              <span>Status</span>
              <span>Reason</span>
              <span>Date</span>
              <span>Remarks</span>
              <span>Added By</span>
            </div>
            <div className="divide-y divide-slate-100">
              {rows.map((row) => (
                <Link
                  key={row.id}
                  href={`/payouts/${row.id}?page=${page}&size=${pageSize}`}
                  className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-2 px-4 py-3 text-sm text-slate-600 transition hover:bg-slate-50"
                >
                  <span className="font-semibold text-slate-800">
                    {row.winner}
                  </span>
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
                  <span>{row.remarks || "-"}</span>
                  <span>{row.createdByUser}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-4 space-y-3 md:hidden">
            {rows.map((row) => (
              <Link
                key={row.id}
                href={`/payouts/${row.id}?page=${page}&size=${pageSize}`}
                className="block rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm transition hover:bg-white"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-slate-800">{row.winner}</p>
                    <p className="text-xs text-slate-500">{row.payoutDate}</p>
                    <p className="text-xs text-slate-500">{row.createdByUser}</p>
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
                    Remarks
                    <div className="text-sm font-semibold text-slate-800">
                      {row.remarks || "-"}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <div>
              Page {(payoutPage?.page ?? 0) + 1} of {payoutPage?.totalPages ?? 1}
            </div>
            <div className="flex items-center gap-2">
              <button
                className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                disabled={(payoutPage?.page ?? 0) === 0}
                type="button"
              >
                Prev
              </button>
              <button
                className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                onClick={() =>
                  setPage((prev) =>
                    Math.min(
                      prev + 1,
                      Math.max((payoutPage?.totalPages ?? 1) - 1, 0)
                    )
                  )
                }
                disabled={
                  (payoutPage?.totalPages ?? 1) <= 1 ||
                  (payoutPage?.page ?? 0) >=
                    (payoutPage?.totalPages ?? 1) - 1
                }
                type="button"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </div>
    </AuthGuard>
  );
}
