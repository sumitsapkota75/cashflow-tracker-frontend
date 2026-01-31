"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { winnerService } from "@/app/services/winnerService";

export default function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const { data: winners = [] } = useQuery({
    queryKey: ["winners"],
    queryFn: winnerService.getWinners,
  });

  const upcomingPlans = useMemo(() => {
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

  // Role-based tabs
  const tabs = (() => {
    switch (user?.role) {
      case "OWNER":
        return [
          { name: "Dashboard", href: "/" },
          { name: "Period", href: "/period" },
          { name: "Machine Entry", href: "/machines/open" },
          { name: "Reports", href: "/machines/reports" },
          { name: "Winners", href: "/winners" },
          { name: "Payouts", href: "/payouts" },
          { name: "Business Settings", href: "/business/settings" },
        ];
      case "MANAGER":
        return [
          { name: "Dashboard", href: "/" },
          { name: "Period", href: "/period" },
          { name: "Machine Entry", href: "/machines/open" },
          { name: "Reports", href: "/machines/reports" },
          { name: "Winners", href: "/winners" },
          { name: "Payouts", href: "/payouts" },
          { name: "Business Settings", href: "/business/settings" },
        ];
      case "EMPLOYEE":
        return [
          { name: "Dashboard", href: "/" },
          { name: "Period", href: "/period" },
          { name: "Machine Entry", href: "/machines/open" },
          { name: "Reports", href: "/machines/reports" },
          { name: "Payouts", href: "/payouts" },
        ];
      default:
        return [
          { name: "Dashboard", href: "/" },
          { name: "Period", href: "/period" },
          { name: "Payouts", href: "/payouts" },
        ];
    }
  })();

  return (
    <header className="bg-slate-900 shadow-lg sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo / Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">₿</span>
          </div>
          <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-emerald-400 to-cyan-400">
            {user?.businessName || "Machine Tracker"}
          </h1>
        </div>

        {/* User info + logout */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsNotificationsOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 text-slate-200 transition hover:border-slate-500 hover:text-white"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
            </button>
            {upcomingPlans.length > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {upcomingPlans.length}
              </span>
            )}
          </div>
          <span className="text-amber-100 text-sm md:text-base">
            Hello, {user?.username}
          </span>
          <button
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="px-4 py-2 bg-slate-800 text-slate-200 rounded-lg hover:bg-slate-700 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Scrollable tabs */}
      <nav className="flex overflow-x-auto space-x-2 px-4 md:px-6 pb-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex-shrink-0 px-5 py-2 text-sm md:text-base font-semibold border-b-4 transition-all duration-300 ${
                isActive
                  ? "text-emerald-400 border-emerald-500 rounded-t-lg bg-emerald-500/10"
                  : "text-slate-400 border-transparent hover:border-slate-600 hover:text-slate-200"
              }`}
            >
              {tab.name}
            </Link>
          );
        })}
      </nav>

      {isNotificationsOpen && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/60"
            onClick={() => setIsNotificationsOpen(false)}
            aria-label="Close notifications"
          />
          <div className="absolute right-4 top-20 w-[92vw] max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Notifications
                </p>
                <h3 className="text-sm font-semibold text-slate-900">
                  Upcoming Payout Plans
                </h3>
              </div>
              <button
                type="button"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                onClick={() => {
                  setIsNotificationsOpen(false);
                  router.push("/notifications");
                }}
              >
                View all
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-3">
              {upcomingPlans.length === 0 ? (
                <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                  No upcoming payment plans.
                </div>
              ) : (
                <div className="space-y-2">
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
                        onClick={() => {
                          setIsNotificationsOpen(false);
                          router.push(`/winners/${plan.winnerId}`);
                        }}
                        className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                          isUrgent
                            ? "border-rose-200 bg-rose-50 hover:border-rose-300"
                            : "border-slate-200 bg-white hover:border-slate-300"
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
                            ${plan.amount.toLocaleString("en-US")}
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
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
