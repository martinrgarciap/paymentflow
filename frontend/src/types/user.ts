export interface UserSummary {
  id: number;
  fullName: string;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  balance: number;
  isAdmin: boolean;
  isDeactivated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserSearchResult {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}
