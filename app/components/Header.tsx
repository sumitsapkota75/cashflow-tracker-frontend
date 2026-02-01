"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  CalendarRange,
  ChevronDown,
  CreditCard,
  HardDrive,
  LayoutDashboard,
  LogOut,
  UserCircle2,
  Settings,
  Trophy,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { winnerService } from "@/app/services/winnerService";
import { cn } from "@/app/lib/cn";

export default function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

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

  const navItems = (() => {
    switch (user?.role) {
      case "OWNER":
      case "MANAGER":
        return [
          { name: "Dashboard", href: "/", icon: LayoutDashboard },
          { name: "Period", href: "/period", icon: CalendarRange },
          { name: "Machine Entry", href: "/machines/open", icon: HardDrive },
          { name: "Winners", href: "/winners", icon: Trophy },
          { name: "Payouts", href: "/payouts", icon: CreditCard },
          { name: "Business Settings", href: "/business/settings", icon: Settings },
        ];
      case "EMPLOYEE":
        return [
          { name: "Dashboard", href: "/", icon: LayoutDashboard },
          { name: "Period", href: "/period", icon: CalendarRange },
          { name: "Machine Entry", href: "/machines/open", icon: HardDrive },
          { name: "Payouts", href: "/payouts", icon: CreditCard },
        ];
      default:
        return [
          { name: "Dashboard", href: "/", icon: LayoutDashboard },
          { name: "Period", href: "/period", icon: CalendarRange },
          { name: "Payouts", href: "/payouts", icon: CreditCard },
        ];
    }
  })();

  const userInitials = (user?.username || "U")
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/20">
            <span className="text-base font-semibold">MT</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {user?.businessName || "Machine Tracker"}
            </p>
            <p className="text-xs text-slate-500">Enterprise cash console</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsNotificationsOpen(true)}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {upcomingPlans.length > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex min-w-[20px] items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {upcomingPlans.length}
              </span>
            )}
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsUserMenuOpen((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300"
              aria-expanded={isUserMenuOpen}
              aria-haspopup="menu"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">
                {userInitials}
              </span>
              <span className="hidden text-sm font-semibold text-slate-700 sm:block">
                {user?.username || "User"}
              </span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                <div className="px-4 py-3">
                  <p className="text-xs text-slate-400">Signed in as</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {user?.username || "User"}
                  </p>
                  <p className="text-xs text-slate-500">{user?.role || ""}</p>
                </div>
                <div className="border-t border-slate-100">
                  <Link
                    href="/account"
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <UserCircle2 className="h-4 w-4" />
                    My Account
                  </Link>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                      router.push("/login");
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 bg-white">
        <nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-2 text-sm sm:px-6 lg:px-8">
          {navItems.map((tab) => {
            const isActive =
              tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-2 font-semibold transition",
                  isActive
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {isNotificationsOpen && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40"
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
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
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
                        className={cn(
                          "w-full rounded-xl border px-4 py-3 text-left transition",
                          isUrgent
                            ? "border-rose-200 bg-rose-50 hover:border-rose-300"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p
                              className={cn(
                                "text-sm font-semibold",
                                isUrgent ? "text-rose-900" : "text-slate-900"
                              )}
                            >
                              {plan.playerName}
                            </p>
                            <p
                              className={cn(
                                "text-xs",
                                isUrgent ? "text-rose-700" : "text-slate-500"
                              )}
                            >
                              {plan.date}
                            </p>
                          </div>
                          <span
                            className={cn(
                              "rounded-full px-2 py-1 text-xs font-semibold",
                              isUrgent
                                ? "bg-rose-100 text-rose-700"
                                : "bg-slate-100 text-slate-700"
                            )}
                          >
                            ${plan.amount.toLocaleString("en-US")}
                          </span>
                        </div>
                        <div
                          className={cn(
                            "mt-2 flex items-center justify-between text-xs",
                            isUrgent ? "text-rose-700" : "text-slate-500"
                          )}
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
