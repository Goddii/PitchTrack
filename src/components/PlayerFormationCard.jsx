import { memo } from "react"
import { Link } from "react-router-dom"

/* ─────────────────────────────────────────────
   PlayerLineupMarker
   A lightweight football lineup marker — no card, no borders, no container.
   Only: portrait (with spotlight), trapezoid nameplate, tiny club badge.
   ───────────────────────────────────────────── */

function PlayerFormationCard({ player, teamName, className = "" }) {
  const playerId = player?.id
  const playerName = player?.name ?? "-"
  const photoUrl = player?.photo_url
  const team = teamName ?? player?.team?.name

  /* ── initials fallback ── */
  const initials =
    playerName
      .split(" ")
      .map((w) => w?.[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("") ?? "?"

  return (
    <Link
      to={"/players/" + playerId}
      className={
        "group relative flex flex-col items-center no-underline " +
        "focus-visible:outline-none focus-visible:ring-2 " +
        "focus-visible:ring-floodlight/60 focus-visible:ring-offset-4 " +
        "focus-visible:ring-offset-night " +
        "hover:-translate-y-1 transition-transform duration-200 " +
        className
      }
    >
      {/* ── Portrait + spotlight ── */}
      <div className="relative w-[68px] h-[68px] shrink-0">
        {/* Gold spotlight behind the portrait — always visible, subtle */}
        <div
          className="absolute inset-0 rounded-full opacity-30"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(255,182,39,0.18) 0%, transparent 70%)",
          }}
          aria-hidden="true"
        />

        {/* Portrait circle — the whole wrapper scales on hover, not just the img */}
        <div className="relative w-full h-full rounded-full bg-gradient-to-br from-pitch via-pitch-light to-pitch flex items-center justify-center overflow-hidden group-hover:scale-[1.03] transition-transform duration-200">
          {/* Subtle highlight */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-chalk/[0.06] to-transparent pointer-events-none" />

          {photoUrl ? (
            <img
              src={photoUrl}
              alt={playerName}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <span className="font-display font-bold text-chalk/75 tracking-wide text-xl select-none">
              {initials}
            </span>
          )}
        </div>
      </div>

      {/* ── Trapezoid nameplate (overlaps portrait bottom) ── */}
      <div
        className="-mt-3 relative z-10 [clip-path:polygon(10%_0%,90%_0%,100%_100%,0%_100%)]"
      >
        <div className="bg-black/85 px-3 py-1">
          <span className="block font-display uppercase tracking-wide text-chalk text-[11px] leading-tight text-center">
            {playerName}
          </span>
        </div>
      </div>

      {/* ── Tiny club badge ── */}
      {team && (
        <div className="mt-1 flex items-center justify-center">
          <div
            className="w-[16px] h-[16px] rounded-full bg-gradient-to-br from-pitch via-pitch-light to-pitch flex items-center justify-center font-display font-bold text-chalk/80 text-[6px] leading-none ring-[1.5px] ring-chalk/10"
            aria-hidden="true"
          >
            {team.charAt(0)}
          </div>
        </div>
      )}
    </Link>
  )
}

export default memo(PlayerFormationCard)
