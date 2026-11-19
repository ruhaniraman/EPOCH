"use client";

import { useTransition } from "react";
import { deleteRegistration } from "./actions";

export function DeleteButton({ id, teamName }: { id: string; teamName: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm(`Delete ${id} "${teamName}"?\n\nThis frees their slot and USNs. It can't be undone.`)) return;
        start(() => deleteRegistration(id));
      }}
      className="min-h-tap px-2 text-label font-bold uppercase tracking-label text-muted hover:text-danger disabled:opacity-50"
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
