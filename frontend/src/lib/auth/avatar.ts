import { apiUpload } from "@/lib/api/client";

export const DEFAULT_AVATAR = "/assets/img/users/user-10.jpg";
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

export type MemberProfile = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  points: number;
  tier: string;
  total_spent: number;
};

export function resolveAvatarUrl(avatar?: string | null) {
  return avatar ?? DEFAULT_AVATAR;
}

export function validateAvatarFile(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
  }

  if (file.size > MAX_AVATAR_BYTES) {
    throw new Error("รูปภาพต้องไม่เกิน 2 MB");
  }
}

export async function uploadMemberAvatar(file: File, token: string) {
  validateAvatarFile(file);

  const formData = new FormData();
  formData.append("avatar", file);

  return apiUpload<{ data: MemberProfile }>("/member/avatar", formData, token);
}
