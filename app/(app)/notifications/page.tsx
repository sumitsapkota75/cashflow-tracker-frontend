"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AuthGuard } from "@/app/context/authGuard";
import { winnerService } from "@/app/services/winnerService";
import Breadcrumbs from "@/app/components/Breadcrumbs";

type UpcomingPlan = {
  winnerId: string;
  id: string;
  playerName: string;
  date: string;
  amount: number;
  status: string;
};

const formatMoney = (value: number) => `$${value.toLocaleString("en-US")}`;

export default function NotificationsPage() {
  const router = useRouter();
  const { data: winners = [] } = useQuery({
    queryKey: ["winners"],
    queryFn: winnerService.getWinners,
  });

  const upcomingPlans = useMemo<UpcomingPlan[]>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return winners.flatMap((winner) => {
      const plan = winner.paymentPlan ?? [];
      return plan
        .filter((item) => {
          const d = new Date(item.date);
          d.setHours(0, 0, 0, 0);
          return d >= today;
        })
        .map((item) => ({
          id: `${winner.id}-${item.date}-${item.amount}`,
          winnerId: winner.id,
          playerName: winner.playerName,
          date: item.date,
          amount: Number(item.amount) || 0,
          status: item.status ?? "SCHEDULED",
        }));
    });
  }, [winners]);

  return (
    <AuthGuard allowedRoles={["OWNER", "MANAGER"]}>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/" },
            { label: "Notifications" },
          ]}
        />

        <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-white to-blue-50/60 p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-blue-600">
                Notifications
              </p>
              <h1 className="text-2xl font-semibold text-slate-900">
                Upcoming Winner Payouts
              </h1>
              <p className="text-sm text-slate-500">
                Payment plans scheduled for the coming days.
              </p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {upcomingPlans.length} items
            </span>
          </div>

          {upcomingPlans.length === 0 ? (
            <div className="mt-4 text-sm text-slate-500">
              No upcoming payment plans found.
            </div>
          ) : (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {upcomingPlans.map((plan) => {
                const date = new Date(plan.date);
                const today = new Date();
                date.setHours(0, 0, 0, 0);
                today.setHours(0, 0, 0, 0);
                const diffMs = date.getTime() - today.getTime();
                const daysLeft = Math.max(0, Math.ceil(diffMs / 86400000));
                const isUrgent = daysLeft <= 3;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => router.push(`/winners/${plan.winnerId}`)}
                    className={`rounded-xl border px-4 py-3 ${
                      isUrgent
                        ? "border-rose-200 bg-rose-50"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className={`text-sm font-semibold ${
                            isUrgent ? "text-rose-900" : "text-slate-900"
                          }`}
                        >
                          {plan.playerName}
                        </p>
                        <p
                          className={`text-xs ${
                            isUrgent ? "text-rose-700" : "text-slate-500"
                          }`}
                        >
                          {plan.date}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          isUrgent
                            ? "bg-rose-100 text-rose-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {formatMoney(plan.amount)}
                      </span>
                    </div>
                    <div
                      className={`mt-2 flex items-center justify-between text-xs ${
                        isUrgent ? "text-rose-700" : "text-slate-500"
                      }`}
                    >
                      <span>Status: {plan.status}</span>
                      <span>{daysLeft} days left</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </AuthGuard>
  );
}
