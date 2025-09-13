export type AuthUser = {
  id: string;
  name: string;
  role: string;
};

const STORAGE_KEY = "auth:user";

export function getUser(): AuthUser | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function login(username: string, password: string) {
  // Replace with real API call
  const user: AuthUser = { id: "1", name: username, role: "owner" };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  return user;
}

export async function logout() {
  localStorage.removeItem(STORAGE_KEY);
}

export async function refresh() {
  // no-op placeholder for demo
  return getUser();
}

