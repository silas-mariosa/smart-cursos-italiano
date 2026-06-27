export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
};

export type AdminStats = {
  totalUsers: number;
  totalAdmins: number;
};

export type UsersListResponse = {
  users: AuthUser[];
  total: number;
};
