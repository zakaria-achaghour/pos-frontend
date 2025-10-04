interface User {
  id: number;
  name: string;
  email: string;
  role: 'superadmin' | 'owner' | 'manager' | 'cashier' | 'waiter' | 'kitchen';
  restaurant_id?: number;
}

export const getToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

export const setToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

export const getUser = (): User | null => {
  const userStr = localStorage.getItem('auth_user');
  return userStr ? JSON.parse(userStr) : null;
};

export const setUser = (user: User): void => {
  localStorage.setItem('auth_user', JSON.stringify(user));
};

export const logout = (): void => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

export const hasRole = (role: string): boolean => {
  const user = getUser();
  return user?.role === role;
};

export const canAccess = (roles: string[]): boolean => {
  const user = getUser();
  return user ? roles.includes(user.role) : false;
};