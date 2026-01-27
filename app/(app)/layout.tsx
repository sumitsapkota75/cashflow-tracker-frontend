"use client";

import { useAuth } from "../context/AuthContext";
import "../globals.css";
import Header from "../components/Header";

// app/(app)/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();
  if (loading) return <LayoutSkeleton />;
  return (
    <div className="flex flex-col">
      <div>
      <Header />
      </div>
      <div className="flex-1 p-4 md:p-6">{children}</div>
    </div>
  );
}

function LayoutSkeleton() {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-64 border-r border-gray-200 bg-gray-50 md:block" />
      <main className="flex-1 p-4 md:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-40 rounded bg-gray-200" />
          <div className="h-4 w-2/3 rounded bg-gray-200" />
          <div className="h-4 w-1/2 rounded bg-gray-200" />
          <div className="h-32 w-full rounded bg-gray-200" />
        </div>
      </main>
    </div>
  );
}
