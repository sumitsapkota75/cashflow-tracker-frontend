"use client";

export default function Loader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-900/50 z-50">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent border-solid rounded-full animate-spin"></div>
    </div>
  );
}
