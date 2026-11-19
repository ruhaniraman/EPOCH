const STEPS = ["Pick theme", "Team details", "Review & lock"];

export function StepIndicator({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div>
      <p className="text-label font-bold uppercase tracking-label">
        <span className="text-gold">Step 0{step}</span>
        <span className="text-muted"> / 03 · {STEPS[step - 1]}</span>
      </p>
      <ol aria-label="Registration progress" className="mt-3 grid grid-cols-3 gap-1.5">
        {STEPS.map((s, i) => (
          <li key={s} aria-current={i + 1 === step ? "step" : undefined} className={`h-1 ${i < step ? "bg-gold" : "bg-line-strong"}`}>
            <span className="sr-only">
              {s} {i + 1 < step ? "(done)" : i + 1 === step ? "(current)" : ""}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
