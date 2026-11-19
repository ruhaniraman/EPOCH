// Technical-drawing illustrations in the style of the video's font-specimen
// cards: dashed guides with small labels, crosshair markers, measurement bars,
// one bold gold shape and one bold white shape.

const guide = { stroke: "var(--color-line-strong)", strokeWidth: 1, strokeDasharray: "3 4", fill: "none" };
const solidGuide = { stroke: "var(--color-line-strong)", strokeWidth: 1, fill: "none" };
const lbl = { fill: "var(--color-muted)", fontSize: 9, fontFamily: "var(--font-mono)", fontWeight: 700, letterSpacing: "0.08em" };
const val = { ...lbl, fill: "var(--color-ink)" };

function Cross({ x, y }: { x: number; y: number }) {
  return <path d={`M${x - 5} ${y}h10M${x} ${y - 5}v10`} stroke="var(--color-gold)" strokeWidth={1.2} />;
}

function Measure({ x1, x2, y, text }: { x1: number; x2: number; y: number; text: string }) {
  return (
    <g>
      <path d={`M${x1} ${y}H${x2}M${x1} ${y - 4}v8M${x2} ${y - 4}v8`} {...solidGuide} />
      <text x={(x1 + x2) / 2} y={y + 14} textAnchor="middle" {...lbl}>
        {text}
      </text>
    </g>
  );
}

function Frame({ footer, children }: { footer: string; children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 400 240" className="h-auto w-full" aria-hidden>
      {children}
      <text x={392} y={232} textAnchor="end" {...lbl}>
        {footer}
      </text>
    </svg>
  );
}

export function CleanIllustration({ footer }: { footer: string }) {
  const cell = (x: number, y: number, kind: "ok" | "nan" | "dup") =>
    kind === "ok" ? (
      <rect key={`${x}-${y}`} x={x + 3} y={y + 3} width={30} height={20} fill="var(--color-ink)" />
    ) : kind === "nan" ? (
      <g key={`${x}-${y}`}>
        <rect x={x + 3} y={y + 3} width={30} height={20} fill="none" stroke="var(--color-gold)" strokeWidth={1.5} />
        <text x={x + 18} y={y + 17} textAnchor="middle" {...lbl} fill="var(--color-gold)" fontSize={8}>
          NaN
        </text>
      </g>
    ) : (
      <rect key={`${x}-${y}`} x={x + 3} y={y + 3} width={30} height={20} fill="var(--color-taken)" />
    );
  const messy: ("ok" | "nan" | "dup")[][] = [
    ["ok", "nan", "ok"],
    ["ok", "ok", "ok"],
    ["dup", "dup", "dup"],
    ["nan", "ok", "nan"],
  ];
  return (
    <Frame footer={footer}>
      <path d="M0 40H400M0 156H400" {...guide} />
      <path d="M50 20V200M350 20V200" {...guide} />
      <text x={4} y={34} {...lbl}>HEAD <tspan {...val}>0</tspan></text>
      <text x={4} y={150} {...lbl}>ROWS <tspan {...val}>1,204</tspan></text>
      {messy.map((row, r) => row.map((k, c) => cell(56 + c * 36, 44 + r * 28, k)))}
      {[0, 1, 2, 3].map((r) => [0, 1, 2].map((c) => cell(236 + c * 36, 44 + r * 28, "ok")))}
      <path d="M180 100h34m-8-6 8 6-8 6" stroke="var(--color-gold)" strokeWidth={2} fill="none" />
      <Cross x={50} y={40} />
      <Cross x={350} y={40} />
      <Cross x={50} y={156} />
      <Cross x={350} y={156} />
      <Measure x1={56} x2={164} y={180} text="18% NULL" />
      <Measure x1={236} x2={344} y={180} text="0% NULL" />
    </Frame>
  );
}

export function TrainIllustration({ footer }: { footer: string }) {
  const pts = Array.from({ length: 33 }, (_, i) => {
    const x = 50 + i * 9.4;
    const y = 50 + 120 * (1 - Math.exp(-i / 6));
    return [x, y] as const;
  });
  const valPts = pts.map(([x, y], i) => [x, y - 6 - (i > 18 ? (i - 18) * 0.9 : 0)] as const);
  const path = (p: readonly (readonly [number, number])[]) => p.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join("");
  return (
    <Frame footer={footer}>
      <path d="M50 20V190H370" {...solidGuide} />
      <path d="M50 50H370M50 172H370" {...guide} />
      <path d="M144 20V190M238 20V190M332 20V190" {...guide} />
      <text x={4} y={54} {...lbl}>LOSS</text>
      <text x={4} y={176} {...lbl}>BEST <tspan fill="var(--color-ink)">0.08</tspan></text>
      {[["0", 50], ["10", 144], ["20", 238], ["30", 332]].map(([t, x]) => (
        <text key={t} x={Number(x)} y={204} textAnchor="middle" {...lbl}>
          {t}
        </text>
      ))}
      <text x={370} y={216} textAnchor="end" {...lbl}>EPOCH →</text>
      <path d={path(valPts)} stroke="var(--color-ink)" strokeWidth={2} strokeDasharray="5 4" fill="none" />
      <path d={path(pts)} stroke="var(--color-gold)" strokeWidth={5} fill="none" strokeLinecap="square" />
      <Cross x={50} y={50} />
      <Cross x={144} y={pts[10][1]} />
      <Cross x={238} y={pts[20][1]} />
      <Cross x={332} y={pts[30][1]} />
    </Frame>
  );
}

export function PitchIllustration({ footer }: { footer: string }) {
  return (
    <Frame footer={footer}>
      <path d="M0 30H400M0 170H400" {...guide} />
      <path d="M70 10V200M330 10V200" {...guide} />
      <text x={4} y={24} {...lbl}>SLIDE <tspan fill="var(--color-ink)">1/5</tspan></text>
      <rect x={70} y={30} width={260} height={140} fill="none" stroke="var(--color-ink)" strokeWidth={2} />
      <text x={86} y={112} fill="var(--color-gold)" fontFamily="var(--font-display)" fontSize={72}>
        03:00
      </text>
      <rect x={258} y={120} width={14} height={34} fill="var(--color-ink)" />
      <rect x={278} y={100} width={14} height={54} fill="var(--color-ink)" />
      <rect x={298} y={74} width={14} height={80} fill="var(--color-gold)" />
      <Cross x={70} y={30} />
      <Cross x={330} y={30} />
      <Cross x={70} y={170} />
      <Cross x={330} y={170} />
      <Measure x1={70} x2={330} y={190} text="180 s" />
    </Frame>
  );
}
