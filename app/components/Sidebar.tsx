import Link from "next/link";

const menu = [
  { name: "Dashboard", href: "/" },
  { name: "Open Machine", href: "/machines/open" },
  { name: "Day Close", href: "/day-close" },
  { name: "Reports", href: "/reports" }
];

export default function Sidebar() {
  return (
    <aside className="hidden md:block w-64 bg-white border-r min-h-screen">
      <nav className="p-4 space-y-2">
        {menu.map(item => (
          <Link
            key={item.name}
            href={item.href}
            className="block px-4 py-3 rounded-lg text-lg font-medium hover:bg-blue-50"
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
