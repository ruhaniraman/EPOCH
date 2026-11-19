/** 5 squares per theme: gold = open, grey = taken. Text alternative included. */
export function SlotSquares({
  taken,
  capacity,
  size = "md",
  className = "",
}: {
  taken: number;
  capacity: number;
  size?: "sm" | "md";
  className?: string;
}) {
  const open = Math.max(0, capacity - taken);
  const sq = size === "sm" ? "size-2.5" : "size-3.5";
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="sr-only">
        {open} of {capacity} slots open
      </span>
      {Array.from({ length: capacity }, (_, i) => (
        <span key={i} aria-hidden className={`${sq} ${i < taken ? "bg-taken" : "bg-gold"}`} />
      ))}
    </span>
  );
}
