export type UserRole = "OWNER" | "MANAGER" | "EMPLOYEE";

export interface AuthUser {
  userId: string;
  email: string;
  role: UserRole;
  businessName?: string;
  businessId?: string;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
}
