import { CornerTicks } from "@/components/ui/Frame";
import { SlotSquares } from "@/components/ui/SlotSquares";
import type { Theme, ThemeId } from "@/lib/types";
import { isFull } from "@/lib/useThemes";

/** Radio group of theme cards. Full themes are greyed out and can't be picked. */
export function ThemePicker({
  themes,
  value,
  onChange,
  legend,
  hideFull = false,
}: {
  themes: Theme[];
  value: ThemeId | null;
  onChange: (id: ThemeId) => void;
  legend: string;
  hideFull?: boolean;
}) {
  const list = hideFull ? themes.filter((t) => !isFull(t)) : themes;
  return (
    <fieldset>
      <legend className="sr-only">{legend}</legend>
      <div className="grid gap-4">
        {list.map((t) => {
          const full = isFull(t);
          const selected = value === t.id;
          const open = t.capacity - t.taken;
          return (
            <label
              key={t.id}
              className={`relative flex min-h-24 items-center justify-between gap-4 border p-4 transition-colors has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-3 has-[input:focus-visible]:outline-gold ${
                full
                  ? "cursor-not-allowed border-line opacity-55"
                  : selected
                    ? "cursor-pointer border-gold bg-gold-dim"
                    : "cursor-pointer border-line hover:border-line-strong hover:bg-surface"
              }`}
            >
              {selected && <CornerTicks />}
              <input
                type="radio"
                name="theme"
                value={t.id}
                checked={selected}
                disabled={full}
                onChange={() => onChange(t.id)}
                className="sr-only"
              />
              <span className="min-w-0">
                <span className="text-label font-bold uppercase tracking-label text-muted">{t.code}</span>
                <span className={`block font-display text-3xl leading-none sm:text-4xl ${full ? "text-muted line-through" : ""}`}>
                  {t.name}
                </span>
                <span className="mt-1 block text-sm text-muted">{t.blurb}</span>
              </span>
              <span className="flex shrink-0 flex-col items-end gap-2">
                <SlotSquares taken={t.taken} capacity={t.capacity} size="sm" />
                <span aria-hidden className={`text-label font-bold uppercase tracking-label ${full ? "text-muted" : "text-gold"}`}>
                  {full ? "Full" : `${open} / ${t.capacity} left`}
                </span>
                {full && <span className="sr-only">Full, not available</span>}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export function ThemePickerSkeleton() {
  return (
    <div className="grid gap-4" aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="h-24 animate-pulse border border-line bg-surface" />
      ))}
    </div>
  );
}
