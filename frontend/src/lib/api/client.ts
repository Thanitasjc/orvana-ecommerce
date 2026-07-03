const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export type ApiError = {
  message: string;
  errors?: Record<string, string[]>;
};

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const { token, headers, ...rest } = options;

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err: ApiError = {
      message: data.message ?? "เกิดข้อผิดพลาด",
      errors: data.errors,
    };
    throw err;
  }

  return data as T;
}

export async function apiUpload<T>(
  path: string,
  formData: FormData,
  token: string,
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err: ApiError = {
      message: data.message ?? "เกิดข้อผิดพลาด",
      errors: data.errors,
    };
    throw err;
  }

  return data as T;
}

export async function apiDownload(
  path: string,
  filename: string,
  token: string,
): Promise<void> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      Accept: "text/csv",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw {
      message: data.message ?? "ดาวน์โหลดไม่สำเร็จ",
      errors: data.errors,
    } satisfies ApiError;
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export { API_URL };
