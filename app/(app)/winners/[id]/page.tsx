"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AuthGuard } from "@/app/context/authGuard";
import { winnerService } from "@/app/services/winnerService";
import Breadcrumbs from "@/app/components/Breadcrumbs";

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
  const params = useParams();
  const winnerId = Array.isArray(params.id) ? params.id[0] : params.id;

  const { data: winner, isLoading } = useQuery({
    queryKey: ["winner", winnerId],
    queryFn: () => winnerService.getWinnerById(winnerId),
    enabled: Boolean(winnerId),
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
                },
                {
                  label: "Amount Paid",
                  value: formatCurrency(winner?.amountPaid),
                },
                {
                  label: "Remaining Amount",
                  value: formatCurrency(winner?.remainingAmount ?? null),
                },
                {
                  label: "Winning Date",
                  value: formatDateTime(winner?.winningDate ?? null),
                },
                {
                  label: "Player Contact",
                  value: winner?.playerContact ?? "-",
                },
                {
                  label: "Business ID",
                  value: winner?.businessId ?? "-",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm"
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
