import { memo } from "react"

/* ─────────────────────────────────────────────
   FormationPitch
   Renders a football pitch surface with:
   - Alternating turf stripes (mowed grass effect)
   - Pitch line markings (touchline, halfway, center
     circle, penalty areas, corner arcs)
   - Subtle edge vignette for depth
   Pure visual — no player awareness.
   ───────────────────────────────────────────── */

const PITCH_MARK_STROKE = "rgba(244,241,233,0.12)"  /* chalk / 12% */

function FormationPitch({ children, className = "" }) {
  return (
    <div
      className={
        "relative rounded-xl border border-line overflow-hidden " + className
      }
    >
      {/* ── Turf base with alternating mow stripes ── */}
      <div
        className="absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "repeating-linear-gradient(" +
            "  90deg," +
            "  #1F4D3A 0px," +
            "  #1F4D3A 48px," +
            "  #2D6B4F 48px," +
            "  #2D6B4F 96px" +
            ")",
        }}
      />

      {/* ── Edge vignette for depth ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(" +
            "  ellipse at 50% 50%," +
            "  transparent 60%," +
            "  rgba(5,13,10,0.25) 100%" +
            ")",
        }}
        aria-hidden="true"
      />

      {/* ── Pitch markings SVG ── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 800 500"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        {/* Touchline (outer border) */}
        <rect
          x={24}
          y={24}
          width={752}
          height={452}
          rx={6}
          ry={6}
          fill="none"
          stroke={PITCH_MARK_STROKE}
          strokeWidth="1.5"
        />

        {/* Halfway line */}
        <line
          x1={400}
          y1={24}
          x2={400}
          y2={476}
          stroke={PITCH_MARK_STROKE}
          strokeWidth="1.5"
        />

        {/* Center circle */}
        <circle
          cx={400}
          cy={250}
          r={46}
          fill="none"
          stroke={PITCH_MARK_STROKE}
          strokeWidth="1.5"
        />
        {/* Center spot */}
        <circle cx={400} cy={250} r={2} fill={PITCH_MARK_STROKE} />

        {/* ── Top penalty area ── */}
        <rect
          x={24}
          y={36}
          width={752}
          height={105}
          rx={2}
          fill="none"
          stroke={PITCH_MARK_STROKE}
          strokeWidth="1.2"
        />

        {/* Top goal area (6-yard box) */}
        <rect
          x={24}
          y={70}
          width={752}
          height={50}
          rx={1}
          fill="none"
          stroke={PITCH_MARK_STROKE}
          strokeWidth="1"
        />

        {/* Top penalty spot */}
        <circle cx={400} cy={88} r={2} fill={PITCH_MARK_STROKE} />

        {/* Top penalty arc */}
        <path
          d="M 358 88 A 44 44 0 0 0 442 88"
          fill="none"
          stroke={PITCH_MARK_STROKE}
          strokeWidth="1.2"
        />

        {/* ── Bottom penalty area ── */}
        <rect
          x={24}
          y={359}
          width={752}
          height={105}
          rx={2}
          fill="none"
          stroke={PITCH_MARK_STROKE}
          strokeWidth="1.2"
        />

        {/* Bottom goal area (6-yard box) */}
        <rect
          x={24}
          y={380}
          width={752}
          height={50}
          rx={1}
          fill="none"
          stroke={PITCH_MARK_STROKE}
          strokeWidth="1"
        />

        {/* Bottom penalty spot */}
        <circle cx={400} cy={412} r={2} fill={PITCH_MARK_STROKE} />

        {/* Bottom penalty arc */}
        <path
          d="M 358 412 A 44 44 0 0 1 442 412"
          fill="none"
          stroke={PITCH_MARK_STROKE}
          strokeWidth="1.2"
        />

        {/* ── Corner arcs (quarter-circles at each corner) ── */}
        <path
          d="M 24 36 A 12 12 0 0 0 36 24"
          fill="none"
          stroke={PITCH_MARK_STROKE}
          strokeWidth="1"
        />
        <path
          d="M 776 36 A 12 12 0 0 1 764 24"
          fill="none"
          stroke={PITCH_MARK_STROKE}
          strokeWidth="1"
        />
        <path
          d="M 24 464 A 12 12 0 0 1 36 476"
          fill="none"
          stroke={PITCH_MARK_STROKE}
          strokeWidth="1"
        />
        <path
          d="M 776 464 A 12 12 0 0 0 764 476"
          fill="none"
          stroke={PITCH_MARK_STROKE}
          strokeWidth="1"
        />
      </svg>

      {/* ── Player markers overlay ── */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export default memo(FormationPitch)
