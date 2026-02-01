import Link from "next/link";
import { LayoutDashboard, Cpu, CalendarRange, FileText } from "lucide-react";

const menu = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Open Machine", href: "/machines/open", icon: Cpu },
  { name: "Day Close", href: "/day-close", icon: CalendarRange },
  { name: "Reports", href: "/reports", icon: FileText },
];

export default function Sidebar() {
  return (
    <aside className="hidden w-64 border-r border-slate-200 bg-white px-4 py-6 md:block">
      <nav className="space-y-1">
        {menu.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700"
            >
              <Icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
