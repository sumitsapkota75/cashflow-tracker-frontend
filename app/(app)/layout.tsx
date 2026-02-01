"use client";

import { useAuth } from "../context/AuthContext";
import "../globals.css";
import Header from "../components/Header";

// app/(app)/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();
  if (loading) return <LayoutSkeleton />;
  return (
    <div className="min-h-screen bg-[#f6f8fc]">
      <Header />
      <main className="mx-auto w-full max-w-7xl px-4 pb-10 pt-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

function LayoutSkeleton() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <main className="flex-1 px-4 py-6 sm:px-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-40 rounded bg-slate-200" />
          <div className="h-4 w-2/3 rounded bg-slate-200" />
          <div className="h-4 w-1/2 rounded bg-slate-200" />
          <div className="h-32 w-full rounded bg-slate-200" />
        </div>
      </main>
    </div>
  );
}
