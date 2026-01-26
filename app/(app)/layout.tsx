"use client"
import Header from "./components/Header";
import { AuthProvider, useAuth } from "../context/AuthContext";
import "../globals.css";
import Loader from "./components/Loader";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();
  if (loading) return <Loader/>
  return (
    <AuthProvider>
      <body className="bg-slate-50">
        <Header />
        <div className="flex">
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </body>
      </AuthProvider>
  );
}

