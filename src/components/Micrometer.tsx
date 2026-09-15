export const THIMBLE_DIVISIONS = 50;
export const PITCH = 0.5;

/** Génère une valeur au hasard entre 0 et 25 mm, au 1/100 de mm. */
export function randomMeasurement(): number {
  return Math.floor(Math.random() * 2501) / 100;
}

export function wholeMm(value: number): number {
  return Math.floor(value);
}

export function halfMmVisible(value: number): boolean {
  return value - Math.floor(value) >= 0.5;
}

export function thimbleReading(value: number): number {
  const frac = value - Math.floor(value);
  return Math.round((frac % PITCH) / 0.01) % THIMBLE_DIVISIONS;
}

export function formatMm(value: number): string {
  return value.toFixed(2).replace(".", ",");
}

type MicrometerProps = {
  value: number;
  showAide?: boolean;
};

// ── SVG geometry (0–25 mm) ────────────────────────────────────────
const W = 1200;
const H = 280;
const CY = 140;
const MM_PX = 10;
const ANVIL_W = 30;
const SLEEVE_LEFT = 70;
const SCALE_LEFT = SLEEVE_LEFT;
const SCALE_RIGHT = SCALE_LEFT + 25 * MM_PX;
const SLEEVE_RIGHT = SCALE_RIGHT + 30;
const THIMBLE_W = 260;
const RATCHET_W = 24;
const THIMBLE_LINE_W = 16;
const THIMBLE_STEP = 6;
const THIMBLE_NUM_ABOVE = 5;
const THIMBLE_NUM_BELOW = 6;

// ── Couleurs physiques (identiques clair/sombre) ─────────────────
const RAL7035 = "#B3B3B3"; // gris RAL 7035 — corps & tambour
const RAL7035_LIGHT = "#C8C8C8";
const RAL7035_DARK = "#999999";
const BLACK = "#000000";
const ANVIL_COLOR = "#3A3A3A";
const SPINDLE_COLOR = "#7A7A7A";
const AIDE_HIGHLIGHT = "#D4A017";

/**
 * Micromètre 0–25 mm — schéma conforme au diagramme :
 *
 * Douille (fixe) :
 *   - Graduations mm au-dessus de la ligne de foi (traits verticaux noirs)
 *   - Graduations ½ mm en dessous de la ligne de foi
 *   - Traits majeurs (0, 5, 10, …) numérotés en noir
 *   - Ligne de foi horizontale noire
 *
 * Tambour (mobile) :
 *   - Graduations horizontales noires à différentes hauteurs (Y)
 *   - La graduation alignée est exactement sur la ligne de foi (y = CY)
 *   - Les graduations au-dessus ont des numéros croissants
 *   - Les graduations en dessous ont des numéros décroissants
 */
export default function Micrometer({ value, showAide = false }: MicrometerProps) {
  const edgeX = SCALE_LEFT + value * MM_PX;
  const thimble = thimbleReading(value);
  const spindleFaceX = ANVIL_W + 4 + value * MM_PX;

  // ── Sleeve ticks ──────────────────────────────────────────────
  const upperTicks: { x: number; mm: number; major: boolean }[] = [];
  for (let i = 0; i <= 25; i++) {
    upperTicks.push({ x: SCALE_LEFT + i * MM_PX, mm: i, major: i % 5 === 0 });
  }
  const lowerTicks: number[] = [];
  for (let i = 0; i < 25; i++) {
    lowerTicks.push(SCALE_LEFT + (i + 0.5) * MM_PX);
  }

  // ── Thimble graduations (horizontal lines) ────────────────────
  const thimbleGrads: {
    idx: number;
    y: number;
    major: boolean;
    isAligned: boolean;
  }[] = [];

  for (let offset = -THIMBLE_NUM_BELOW; offset <= THIMBLE_NUM_ABOVE; offset++) {
    const idx = ((thimble + offset) % 50 + 50) % 50;
    thimbleGrads.push({
      idx,
      y: CY - offset * THIMBLE_STEP,
      major: idx % 5 === 0,
      isAligned: offset === 0,
    });
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full select-none"
      role="img"
      aria-label="Micromètre à lire (exercice)"
    >
      <defs>
        <linearGradient id="steel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={RAL7035_LIGHT} />
          <stop offset="50%" stopColor={RAL7035} />
          <stop offset="100%" stopColor={RAL7035_DARK} />
        </linearGradient>
        <linearGradient id="steelThimble" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={RAL7035_LIGHT} />
          <stop offset="50%" stopColor={RAL7035} />
          <stop offset="100%" stopColor={RAL7035_DARK} />
        </linearGradient>
      </defs>

      {/* ── Touche fixe (enclume) ────────────────────────────── */}
      <rect x="0" y={CY - 40} width={ANVIL_W} height="80" fill={ANVIL_COLOR} rx="1" />

      {/* ── Bras reliant l'enclume au corps ──────────────────── */}
      <rect
        x={ANVIL_W - 2}
        y={CY - 8}
        width={SLEEVE_LEFT - ANVIL_W + 4}
        height="16"
        fill="url(#steel)"
        stroke={RAL7035_DARK}
        strokeWidth="1"
      />

      {/* ── Corps (douille) — gris RAL 7035 ──────────────────── */}
      <rect
        x={SLEEVE_LEFT - 12}
        y={CY - 28}
        width={SLEEVE_RIGHT - SLEEVE_LEFT + 12}
        height="56"
        fill="url(#steel)"
        stroke={RAL7035_DARK}
        strokeWidth="1.5"
        rx="2"
      />

      {/* ── Broche mobile ────────────────────────────────────── */}
      <rect
        x={spindleFaceX}
        y={CY - 8}
        width={SLEEVE_LEFT - spindleFaceX}
        height="16"
        fill={SPINDLE_COLOR}
        stroke={RAL7035_DARK}
        strokeWidth="1"
      />
      <rect x={spindleFaceX} y={CY - 12} width="3" height="24" fill="#5A5A5A" />

      {/* ── Ligne de foi (index line) — NOIRE ────────────────── */}
      <line
        x1={SLEEVE_LEFT - 8}
        y1={CY}
        x2={Math.min(edgeX, SCALE_RIGHT) + 2}
        y2={CY}
        stroke={BLACK}
        strokeWidth="1.5"
      />

      {/* ── Graduations douille — NOIRES ─────────────────────── */}
      <g>
        {upperTicks.map((t, i) => {
          if (t.x > edgeX + 0.01) return null;
          return (
            <g key={`u${i}`}>
              <line
                x1={t.x}
                y1={CY - 24}
                x2={t.x}
                y2={t.major ? CY - 10 : CY - 16}
                stroke={BLACK}
                strokeWidth={t.major ? 1.5 : 1}
              />
              {t.major && (
                <text
                  x={t.x}
                  y={CY - 4}
                  textAnchor="middle"
                  fontSize="11"
                  fill={BLACK}
                  fontWeight="600"
                >
                  {t.mm}
                </text>
              )}
            </g>
          );
        })}
        {lowerTicks.map((x, i) => {
          if (x > edgeX + 0.01) return null;
          return (
            <line
              key={`l${i}`}
              x1={x}
              y1={CY + 10}
              x2={x}
              y2={CY + 24}
              stroke={BLACK}
              strokeWidth={1}
            />
          );
        })}
      </g>

      {/* ── Tambour — gris RAL 7035, graduations NOIRES ──────── */}
      <g>
        {/* Corps du tambour */}
        <rect
          x={edgeX}
          y={CY - 40}
          width={THIMBLE_W}
          height="80"
          fill="url(#steelThimble)"
          stroke={RAL7035_DARK}
          strokeWidth="1.5"
        />

        {/* Graduations du tambour : traits HORIZONTAUX noirs */}
        {thimbleGrads.map(({ idx, y, major, isAligned }, j) => (
          <g key={j}>
            {/* Surbrillance aide */}
            {isAligned && showAide && (
              <rect
                x={edgeX + 1}
                y={y - 5}
                width={THIMBLE_LINE_W + 4}
                height="10"
                fill={AIDE_HIGHLIGHT}
                opacity="0.25"
                rx="2"
              />
            )}

            {/* Trait horizontal de graduation — NOIR */}
            <line
              x1={edgeX + 2}
              y1={y}
              x2={edgeX + 2 + (major ? THIMBLE_LINE_W + 2 : THIMBLE_LINE_W)}
              y2={y}
              stroke={isAligned && showAide ? "#8B6914" : BLACK}
              strokeWidth={major ? 1.5 : 1}
            />

            {/* Numéro à droite du trait — NOIR */}
            {major && (
              <text
                x={edgeX + THIMBLE_LINE_W + 10}
                y={y + 3.5}
                fontSize="10"
                fill={isAligned && showAide ? "#8B6914" : BLACK}
                fontWeight={isAligned ? "700" : "400"}
              >
                {idx}
              </text>
            )}
          </g>
        ))}

        {/* ── Molette de finition ──────────────────────────── */}
        <rect
          x={edgeX + THIMBLE_W}
          y={CY - 40}
          width={RATCHET_W}
          height="80"
          fill={ANVIL_COLOR}
          rx="1"
        />
      </g>
    </svg>
  );
}
