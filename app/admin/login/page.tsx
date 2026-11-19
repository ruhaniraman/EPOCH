import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { Frame } from "@/components/ui/Frame";
import { adminConfigured, isAdmin } from "@/lib/admin-auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Admin login — EPOCH 1.0", robots: { index: false, follow: false } };
// Must read ADMIN_PASSWORD and the cookie per request, not once at build time.
export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <main className="mx-auto flex min-h-dvh max-w-form flex-col justify-center px-gutter py-16">
      <Logo size="sm" />
      <Frame className="mt-10 bg-surface p-6 sm:p-8">
        <p className="text-label font-bold uppercase tracking-label text-gold">[AD] Organisers only</p>
        <h1 className="mt-3 font-display text-title">Admin login</h1>
        {adminConfigured() ? (
          <LoginForm />
        ) : (
          <p className="mt-6 text-sm leading-relaxed text-muted">
            Admin access isn&apos;t set up yet. Add an <code className="text-ink">ADMIN_PASSWORD</code> environment variable
            (at least 8 characters) and restart the server.
          </p>
        )}
      </Frame>
    </main>
  );
}
