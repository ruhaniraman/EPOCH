import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/brand/Logo";
import { RegisterFlow } from "@/components/register/RegisterFlow";

export const metadata: Metadata = { title: "Register — EPOCH 1.0" };

export default function RegisterPage() {
  return (
    <>
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 max-w-form items-center justify-between px-gutter">
          <Link href="/" aria-label="EPOCH home" className="py-2">
            <Logo size="sm" />
          </Link>
          <Link href="/" className="flex min-h-tap items-center text-label font-bold uppercase tracking-label text-muted hover:text-ink">
            <span aria-hidden>←&nbsp;</span>Back to site
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-form px-gutter pb-24 pt-8">
        <Suspense>
          <RegisterFlow />
        </Suspense>
      </main>
    </>
  );
}
