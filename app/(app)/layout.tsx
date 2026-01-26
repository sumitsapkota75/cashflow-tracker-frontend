"use client"
import Header from "./components/Header";
import { AuthProvider } from "../context/AuthContext";
import "../globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50">
        <Header />
        <div className="flex">
          <AuthProvider><main className="flex-1 p-4 md:p-6">{children}</main></AuthProvider>
        </div>
      </body>
    </html>
  );
}

