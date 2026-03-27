const API_BASE = import.meta.env.VITE_API_BASE_URL;

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken() {
  return authToken;
}

export async function apiFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(options.headers ?? {});

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (authToken) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }

  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });
}

export async function readJsonOrThrow<T>(
  res: Response,
  fallback: string,
): Promise<T> {
  if (!res.ok) {
    let message = fallback;

    try {
      const errorData = await res.json();
      message = errorData.message || errorData.error || fallback;
    } catch {
      // ignore parse failure
    }

    throw new Error(message);
  }

  return res.json();
}
