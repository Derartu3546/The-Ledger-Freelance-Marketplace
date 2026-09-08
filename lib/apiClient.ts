export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    credentials: "include",
  });

  let data: {
    error?: string | {
      formErrors?: string[];
      fieldErrors?: Record<string, string[]>;
    };
  } = {};

  try {
    data = await res.json();
  } catch {
    // Non-JSON response — keep the default empty object.
  }

  if (!res.ok) {
    const error = data.error;

    const message =
      typeof error === "string"
        ? error
        : error?.formErrors?.[0] ||
          Object.values(error?.fieldErrors ?? {})[0]?.[0] ||
          `Request failed (${res.status}).`;

    throw new Error(message);
  }

  return data as T;
}