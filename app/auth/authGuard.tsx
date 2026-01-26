"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { UserRole } from "@/app/lib/auth";

export function AuthGuard({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }

    if (
      !loading &&
      user &&
      allowedRoles &&
      !allowedRoles.includes(user.role)
    ) {
      router.replace("/"); // unauthorized → dashboard
    }
  }, [user, loading, allowedRoles, router]);

  if (loading || !user) return null;

  return <>{children}</>;
}
