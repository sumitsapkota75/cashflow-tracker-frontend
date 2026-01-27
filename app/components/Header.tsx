"use client";

import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Role-based tabs
  const tabs = (() => {
    switch (user?.role) {
      case "OWNER":
        return [
          { name: "Dashboard", href: "/" },
          { name: "Machine Entry", href: "/machines/open" },
          { name: "Reports", href: "/machines/reports" },
          { name: "Day Close", href: "/machines/day-close" },
          { name: "Business Settings", href: "/business/settings" },
        ];
      case "MANAGER":
        return [
          { name: "Dashboard", href: "/" },
          { name: "Machine Entry", href: "/machines/open" },
          { name: "Reports", href: "/machines/reports" },
          { name: "Day Close", href: "/machines/day-close" },
        ];
      case "EMPLOYEE":
        return [
          { name: "Dashboard", href: "/" },
          { name: "Machine Entry", href: "/machines/open" },
          { name: "Reports", href: "/machines/reports" },
        ];
      default:
        return [{ name: "Dashboard", href: "/" }];
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
          <span className="text-amber-100 text-sm md:text-base">
            Hello, {user?.email}
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
    </header>
  );
}
