import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

const control =
  "mt-2 block min-h-tap w-full border bg-surface px-3 text-base text-ink placeholder:text-muted/70 focus:border-gold focus:outline-none focus-visible:outline-none";

function Wrap({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="text-label font-bold uppercase tracking-label text-muted">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

// Inputs are 16px (text-base) so iOS Safari doesn't zoom in on focus.
export function TextField({
  id,
  label,
  hint,
  error,
  ...rest
}: { id: string; label: string; hint?: string; error?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Wrap id={id} label={label} hint={hint} error={error}>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={`${control} ${error ? "border-danger" : "border-line-strong"}`}
        {...rest}
      />
    </Wrap>
  );
}

export function SelectField({
  id,
  label,
  error,
  children,
  ...rest
}: { id: string; label: string; error?: string; children: ReactNode } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <Wrap id={id} label={label} error={error}>
      <div className="relative">
        <select
          id={id}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`${control} appearance-none pr-10 ${error ? "border-danger" : "border-line-strong"}`}
          {...rest}
        >
          {children}
        </select>
        <span aria-hidden className="pointer-events-none absolute bottom-0 right-3 flex h-tap items-center text-gold">
          ▾
        </span>
      </div>
    </Wrap>
  );
}
