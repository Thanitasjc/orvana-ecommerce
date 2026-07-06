import { apiFetch } from "@/lib/api/client";
import { defaultHeaderCms, type HeaderCmsState } from "@/lib/cms/headerCms";

export async function fetchHeaderCms(): Promise<HeaderCmsState> {
  try {
    const res = await apiFetch<{ data: HeaderCmsState }>("/cms/header", {
      cache: "no-store",
    });
    return normalizeHeaderCms(res.data);
  } catch {
    return defaultHeaderCms;
  }
}

export async function fetchAdminHeaderCms(token: string): Promise<HeaderCmsState> {
  const res = await apiFetch<{ data: HeaderCmsState }>("/admin/cms/header", { token });
  return normalizeHeaderCms(res.data);
}

export async function saveAdminHeaderCms(state: HeaderCmsState, token: string) {
  const res = await apiFetch<{ data: HeaderCmsState }>("/admin/cms/header", {
    method: "PATCH",
    token,
    body: JSON.stringify(state),
  });
  return normalizeHeaderCms(res.data);
}

function normalizeHeaderCms(data: HeaderCmsState | undefined): HeaderCmsState {
  if (!data) return defaultHeaderCms;

  return {
    logoUrl: data.logoUrl || defaultHeaderCms.logoUrl,
    logoAlt: data.logoAlt || defaultHeaderCms.logoAlt,
    menuItems: data.menuItems?.length ? data.menuItems : defaultHeaderCms.menuItems,
  };
}
