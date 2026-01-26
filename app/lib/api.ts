export async function apiFetch(
  url: string,
  options: RequestInit = {}
) {
  const token = localStorage.getItem("auth_token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    // token expired / invalid
    localStorage.removeItem("auth_token");
    window.location.href = "/login";
  }

  return res;
}
