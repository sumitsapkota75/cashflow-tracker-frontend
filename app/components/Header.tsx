"use client"; // Required for hooks like usePathname

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { name: "Dashboard", href: "/" },
  { name: "Machine Entry", href: "/machines/open" },
  { name: "Reports", href: "/machines/reports" },
];

export default function Header() {
  const pathname = usePathname(); // Gets the current URL path

  return (
    <header className="bg-slate-900 shadow-2xl sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 py-5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-linear-to-br from-emerald-400 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">₿</span>
          </div>
          <h1 className="text-xl font-bold bg-linear-to-b from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Fuel Depo Corner Mart
          </h1>
        </div>
      </div>

      <nav className="flex overflow-x-auto space-x-4 px-4 md:px-6">
        {tabs.map((tab) => {
          // Check if current path matches the tab link
          const isActive = pathname === tab.href;

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`px-6 py-3 text-sm md:text-base font-semibold transition-all duration-300 shrink-0 border-b-4 ${
                isActive
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500 rounded-t-lg"
                  : "text-slate-400 hover:text-slate-200 border-transparent hover:border-slate-600"
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