"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ADMIN_COOKIE, ADMIN_SESSION_SECONDS, adminConfigured, isAdmin, passwordMatches, sessionToken } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function login(_prev: string | null, formData: FormData): Promise<string | null> {
  if (!adminConfigured()) return "Admin login isn't set up. Set ADMIN_PASSWORD (8+ characters) and restart.";
  const attempt = String(formData.get("password") ?? "");
  if (!passwordMatches(attempt)) {
    await new Promise((r) => setTimeout(r, 800)); // slow down guessing
    return "Wrong password.";
  }
  (await cookies()).set(ADMIN_COOKIE, sessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: ADMIN_SESSION_SECONDS,
  });
  redirect("/admin");
}

export async function logout() {
  (await cookies()).delete({ name: ADMIN_COOKIE, path: "/admin" });
  redirect("/admin/login");
}

export async function deleteRegistration(id: string) {
  if (!(await isAdmin())) throw new Error("Unauthorized");
  // Members are removed with it (onDelete: Cascade), which frees their USNs and the theme slot.
  await prisma.registration.delete({ where: { id } });
  revalidatePath("/admin");
}
