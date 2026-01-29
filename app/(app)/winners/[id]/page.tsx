"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthGuard } from "@/app/context/authGuard";
import { winnerService } from "@/app/services/winnerService";
import Breadcrumbs from "@/app/components/Breadcrumbs";
import { payoutService } from "@/app/services/payoutService";

function formatCurrency(value?: number | null) {
  if (value == null) return "-";
  return `$${value.toLocaleString()}`;
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  return date.toLocaleString();
}

export default function WinnerDetailPage() {
  const queryClient = useQueryClient();
  const params = useParams();
  const winnerId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [payoutDate, setPayoutDate] = useState("");
  const [status, setStatus] = useState("IN_PROGRESS");
  const [reasonType, setReasonType] = useState("WINNER_PAYOUT");
  const [remarks, setRemarks] = useState("");
  const [formError, setFormError] = useState("");

  const { data: winner, isLoading } = useQuery({
    queryKey: ["winner", winnerId],
    queryFn: () => winnerService.getWinnerById(winnerId as string),
    enabled: Boolean(winnerId),
  });

  const { data: winnerPayouts = [] } = useQuery({
    queryKey: ["payouts", "winner", winnerId],
    queryFn: () => payoutService.getPayoutsByWinner(winnerId as string),
    enabled: Boolean(winnerId),
  });

  const createPayoutMutation = useMutation({
    mutationFn: payoutService.createPayout,
    onSuccess: () => {
      setIsModalOpen(false);
      setAmount("");
      setPayoutDate("");
      setStatus("IN_PROGRESS");
      setReasonType("WINNER_PAYOUT");
      setRemarks("");
      setFormError("");
      queryClient.invalidateQueries({ queryKey: ["payouts"] });
      queryClient.invalidateQueries({ queryKey: ["payouts", "winner", winnerId] });
      queryClient.invalidateQueries({ queryKey: ["winner", winnerId] });
    },
    onError: () => {
      setFormError("Unable to create payout. Try again.");
    },
  });
  return (
    <AuthGuard allowedRoles={["OWNER", "MANAGER"]}>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/" },
            { label: "Winners", href: "/winners" },
            { label: "Winner Details" },
          ]}
        />
        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Winner Detail
              </p>
              <h1 className="text-2xl font-semibold text-slate-900">
                {winner?.playerName ?? "Loading..."}
              </h1>
              <p className="text-sm text-slate-500">
                Status:{" "}
                <span className="font-semibold text-slate-700">
                  {winner?.status ?? "-"}
                </span>
              </p>
              <p className="text-sm text-slate-500">
                Winning Date:{" "}
                <span className="font-semibold text-slate-700">
                  {formatDateTime(winner?.winningDate)}
                </span>
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <div>Created: {formatDateTime(winner?.createdAt)}</div>
              <div>Added By: {winner?.createdByUsername ?? "-"}</div>
            </div>
          </div>

          {isLoading ? (
            <div className="mt-6 text-sm text-slate-500">Loading winner...</div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: "Total Win Amount",
                  value: formatCurrency(winner?.totalWinAmount),
                  style: "border-amber-200 bg-amber-50",
                },
                {
                  label: "Amount Paid",
                  value: formatCurrency(winner?.amountPaid),
                  style: "border-emerald-200 bg-emerald-50",
                },
                {
                  label: "Remaining Amount",
                  value: formatCurrency(winner?.remainingAmount ?? null),
                  style: "border-rose-200 bg-rose-50",
                },
                {
                  label: "Player Contact",
                  value: winner?.playerContact ?? "-",
                  style: "border-slate-200 bg-slate-50",
                },
                // formatDateTime(winner?.winningDate ?? null)
              ].map((item) => (
                <div
                  key={item.label}
                  className={`rounded-xl border px-4 py-3 text-sm ${item.style}`}
                >
                  <p className="text-xs uppercase tracking-wide text-slate-500">
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Payout History
              </h2>
              <p className="text-sm text-slate-500">
                All payouts recorded for this winner.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">
                {winnerPayouts.length} payouts
              </span>
              <button
                className="rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-600"
                type="button"
                onClick={() => setIsModalOpen(true)}
              >
                Add Payout
              </button>
            </div>
          </div>

          {winnerPayouts.length === 0 ? (
            <div className="mt-4 text-sm text-slate-500">
              No payouts recorded yet.
            </div>
          ) : (
            <>
              <div className="mt-4 hidden overflow-hidden rounded-xl border border-slate-100 md:block">
                <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr] gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <span>Date</span>
                  <span>Amount</span>
                  <span>Status</span>
                  <span>Reason</span>
                  <span>Remarks</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {winnerPayouts.map((payout) => (
                    <div
                      key={payout.id}
                      className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr] gap-2 px-4 py-3 text-sm text-slate-600"
                    >
                      <span>{formatDateTime(payout.payoutDate)}</span>
                      <span>{formatCurrency(payout.amount)}</span>
                      <span className="font-semibold text-slate-700">
                        {payout.status}
                      </span>
                      <span>{payout.reasonType ?? "—"}</span>
                      <span>{payout.remarks ?? "—"}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 space-y-3 md:hidden">
                {winnerPayouts.map((payout) => (
                  <div
                    key={payout.id}
                    className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-slate-800">
                          {formatDateTime(payout.payoutDate)}
                        </p>
                        <p className="text-xs text-slate-500">
                          {payout.reasonType ?? "—"}
                        </p>
                      </div>
                      <span className="rounded-full bg-white px-2 py-1 text-xs text-slate-600">
                        {formatCurrency(payout.amount)}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-slate-500">
                      Status: {payout.status}
                    </div>
                    <div className="mt-2 text-xs text-slate-500">
                      Remarks: {payout.remarks ?? "—"}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">
                  Create Payout
                </h3>
                <button
                  type="button"
                  className="text-slate-400 hover:text-slate-600"
                  onClick={() => setIsModalOpen(false)}
                >
                  ✕
                </button>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Add a payout for {winner?.playerName ?? "winner"}.
              </p>

              {formError && (
                <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {formError}
                </div>
              )}

              <form
                className="mt-4 space-y-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  setFormError("");
                  if (!amount || Number(amount) <= 0) {
                    setFormError("Enter a valid payout amount.");
                    return;
                  }
                  if (!payoutDate) {
                    setFormError("Select a payout date.");
                    return;
                  }
                  createPayoutMutation.mutate({
                    winnerID: winnerId,
                    winnerName: winner?.playerName,
                    amount: Number(amount),
                    payoutDate,
                    status,
                    remarks,
                    reasonType,
                  });
                }}
              >
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Amount
                  </label>
                  <input
                    type="number"
                    min={0}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Payout Date
                  </label>
                  <input
                    type="date"
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
                    value={payoutDate}
                    onChange={(event) => setPayoutDate(event.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Status
                  </label>
                  <select
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
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
                    Reason
                  </label>
                  <select
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
                    value={reasonType}
                    onChange={(event) => setReasonType(event.target.value)}
                  >
                    <option>WINNER_PAYOUT</option>
                    <option>OTHER</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Remarks
                  </label>
                  <textarea
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
                    value={remarks}
                    onChange={(event) => setRemarks(event.target.value)}
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                    disabled={createPayoutMutation.isPending}
                  >
                    {createPayoutMutation.isPending ? "Saving..." : "Save Payout"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Payment Plans
              </h2>
              <p className="text-sm text-slate-500">
                Scheduled payments for this winner.
              </p>
            </div>
            <span className="text-xs text-slate-400">
              {(winner?.paymentPlan ?? []).length} plans
            </span>
          </div>

          {!winner?.paymentPlan || winner.paymentPlan.length === 0 ? (
            <div className="mt-4 text-sm text-slate-500">
              No payment plans found.
            </div>
          ) : (
            <>
              <div className="mt-4 hidden overflow-hidden rounded-xl border border-slate-100 md:block">
                <div className="grid grid-cols-[1fr_1fr_1fr] gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <span>Date</span>
                  <span>Amount</span>
                  <span>Status</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {winner.paymentPlan.map((plan) => (
                    <div
                      key={`${plan.date}-${plan.amount}`}
                      className="grid grid-cols-[1fr_1fr_1fr] gap-2 px-4 py-3 text-sm text-slate-600"
                    >
                      <span>{plan.date}</span>
                      <span>{formatCurrency(plan.amount)}</span>
                      <span className="font-semibold text-slate-700">
                        {plan.status ?? "SCHEDULED"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 space-y-3 md:hidden">
                {winner.paymentPlan.map((plan) => (
                  <div
                    key={`${plan.date}-${plan.amount}`}
                    className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-800">
                          {plan.date}
                        </p>
                        <p className="text-xs text-slate-500">
                          {plan.status ?? "SCHEDULED"}
                        </p>
                      </div>
                      <span className="rounded-full bg-white px-2 py-1 text-xs text-slate-600">
                        {formatCurrency(plan.amount)}
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
