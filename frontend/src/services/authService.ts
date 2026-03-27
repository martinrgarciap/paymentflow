import { apiFetch, readJsonOrThrow, setAuthToken } from "@/services/apiClient";

export interface AuthUser {
  id: number;
  firstName?: string;
  lastName?: string;
  fullName: string;
  email: string;
  balance: number;
  isAdmin: boolean;
  isDeactivated: boolean;
}

interface LoginResponse extends AuthUser {
  token: string;
  message?: string;
}

const DEMO_ADMIN_EMAIL = "admin@paymentflow.dev";
const DEMO_ADMIN_PASSWORD = "password123";

export async function loginDemoAdmin(): Promise<AuthUser> {
  const res = await apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: DEMO_ADMIN_EMAIL,
      password: DEMO_ADMIN_PASSWORD,
    }),
  });

  const data = await readJsonOrThrow<LoginResponse>(
    res,
    "Failed to sign in demo admin",
  );

  setAuthToken(data.token);

  return {
    id: data.id,
    firstName: data.firstName,
    lastName: data.lastName,
    fullName: data.fullName,
    email: data.email,
    balance: data.balance,
    isAdmin: data.isAdmin,
    isDeactivated: data.isDeactivated,
  };
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  const res = await apiFetch("/api/auth/me");
  return readJsonOrThrow<AuthUser>(res, "Failed to load current user");
}

export async function signupUser(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}): Promise<void> {
  const res = await apiFetch("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(data),
  });

  await readJsonOrThrow(res, "Failed to create user");
}
