import { apiFetch, readJsonOrThrow } from "@/services/apiClient";
import type { User, UserSearchResult } from "@/types/user";

function withFullName<T extends { firstName: string; lastName: string }>(
  user: T,
): T & { fullName: string } {
  return {
    ...user,
    fullName: `${user.firstName} ${user.lastName}`.trim(),
  };
}

export async function fetchUsers(includeDeactivated = false): Promise<User[]> {
  const query = includeDeactivated ? "?includeDeactivated=true" : "";
  const res = await apiFetch(`/api/users${query}`);
  const data = await readJsonOrThrow<User[]>(res, "Failed to load users");

  return data.map((user) => withFullName(user as User));
}

export async function searchUsers(query: string): Promise<UserSearchResult[]> {
  const params = new URLSearchParams({ query });
  const res = await apiFetch(`/api/users/search?${params}`);
  return readJsonOrThrow<UserSearchResult[]>(res, "Failed to search users");
}

export async function fetchUserById(id: number): Promise<User> {
  const res = await apiFetch(`/api/users/${id}`);
  const data = await readJsonOrThrow<User>(res, "Failed to load user");
  return withFullName(data);
}

export async function updateUser(
  id: number,
  updates: { firstName: string; lastName: string },
): Promise<User> {
  const res = await apiFetch(`/api/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });

  const data = await readJsonOrThrow<User>(res, "Failed to update user");
  return withFullName(data);
}

export async function deactivateUser(id: number): Promise<User> {
  const res = await apiFetch(`/api/users/${id}/deactivate`, {
    method: "PATCH",
  });

  const data = await readJsonOrThrow<User>(res, "Failed to deactivate user");
  return withFullName(data);
}

export async function reactivateUser(id: number): Promise<User> {
  const res = await apiFetch(`/api/users/${id}/reactivate`, {
    method: "PATCH",
  });

  const data = await readJsonOrThrow<User>(res, "Failed to reactivate user");
  return withFullName(data);
}

export async function fetchDeactivatedUsers(): Promise<User[]> {
  const users = await fetchUsers(true);
  return users.filter((user) => user.isDeactivated);
}
