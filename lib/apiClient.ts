export async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
    credentials: "include",
  });

  let data: any = {};
  try {
    data = await res.json();
  } catch {
    // Non-JSON response (e.g. an unhandled server crash) — fall through
    // with an empty object so we still surface a readable error below.
  }

  if (!res.ok) {
    const message =
      typeof data.error === "string"
        ? data.error
        : data.error?.formErrors?.[0] ||
          Object.values(data.error?.fieldErrors ?? {})?.[0]?.[0] ||
          `Request failed (${res.status}).`;
    throw new Error(message);
  }
  return data;
}
