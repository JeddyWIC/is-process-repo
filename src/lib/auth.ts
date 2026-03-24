import { cookies } from "next/headers";

const COOKIE_NAME = "is_process_auth";

export function getEditPassword(): string {
  return process.env.EDIT_PASSWORD || "changeme";
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value === "true";
}

export function verifyPassword(password: string): boolean {
  return password === getEditPassword();
}
