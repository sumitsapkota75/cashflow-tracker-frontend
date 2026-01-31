"use client";

import { useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AuthGuard } from "@/app/context/authGuard";
import Breadcrumbs from "@/app/components/Breadcrumbs";
import { payoutService } from "@/app/services/payoutService";
import Link from "next/link";

function formatValue(value: unknown) {
  if (value == null) return "-";
  if (typeof value === "number") return value.toLocaleString();
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.length ? value.join(", ") : "-";
  return JSON.stringify(value);
}

export default function PayoutDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const payoutId = Array.isArray(params.id) ? params.id[0] : params.id;
  const pageParam = Number(searchParams.get("page") ?? 0);
  const sizeParam = Number(searchParams.get("size") ?? 10);

  const { data: payoutPage, isLoading } = useQuery({
    queryKey: ["payouts", pageParam, sizeParam],
    queryFn: () => payoutService.getPayoutsPage(pageParam, sizeParam),
  });

  const payout = useMemo(() => {
    if (!payoutId) return null;
    return payoutPage?.items?.find((item) => item.id === payoutId) ?? null;
  }, [payoutId, payoutPage]);

  const detailEntries = useMemo(() => {
    if (!payout) return [];
    return Object.entries(payout);
  }, [payout]);

  return (
    <AuthGuard>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/" },
            { label: "Payouts", href: "/payouts" },
            { label: "Payout Details" },
          ]}
        />

        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Payout Detail
              </p>
              <h1 className="text-2xl font-semibold text-slate-900">
                {payout?.winnerName ?? payout?.reasonType ?? "Payout"}
              </h1>
              <p className="text-sm text-slate-500">
                Payout ID: <span className="font-semibold">{payoutId}</span>
              </p>
            </div>
            {payout?.payoutDate && (
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Date: {payout.payoutDate}
              </div>
            )}
          </div>

          {isLoading && (
            <div className="mt-6 text-sm text-slate-500">Loading payout...</div>
          )}

          {!isLoading && !payout && (
            <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">
              Payout not found. Return to the payout list and select a row.
            </div>
          )}

          {payout && (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {detailEntries.map(([key, value]) => {
                const normalizedKey = key.toLowerCase();
                const isPeriodId =
                  normalizedKey === "periodid" && typeof value === "string";
                const isWinnerId =
                  normalizedKey === "winnerid" && typeof value === "string";
                return (
                  <div
                    key={key}
                    className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm"
                  >
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      {key}
                    </p>
                    <p className="mt-2 text-base font-semibold text-slate-800">
                      {isPeriodId ? (
                        <Link
                          className="text-blue-700 hover:text-blue-900"
                          href={`/periods/${value}`}
                        >
                          {value}
                        </Link>
                      ) : isWinnerId ? (
                        <Link
                          className="text-blue-700 hover:text-blue-900"
                          href={`/winners/${value}`}
                        >
                          {value}
                        </Link>
                      ) : (
                        formatValue(value)
                      )}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </AuthGuard>
  );
}
