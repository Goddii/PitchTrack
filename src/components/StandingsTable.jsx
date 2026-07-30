import TeamEmblem from "./TeamEmblem"

/* ─────────────────────────────────────────────
   Loading skeleton
   ───────────────────────────────────────────── */
function StandingsSkeleton() {
  return (
    <div
      className="bg-glass-bg border border-glass-border rounded-xl overflow-hidden animate-pulse"
      aria-label="Loading standings"
    >
      {/* Header */}
      <div className="hidden md:flex items-center gap-4 px-6 py-4 border-b border-glass-border">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-3 bg-line/20 rounded" style={{ width: i === 0 ? 28 : i === 1 ? 48 : 32 }} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-6 py-4 border-b border-glass-border last:border-b-0"
        >
          <div className="h-5 w-6 bg-line/15 rounded" />
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-full bg-line/20 shrink-0" />
            <div className="h-4 bg-line/20 rounded flex-1 max-w-[140px]" />
          </div>
          <div className="hidden md:flex items-center gap-4 ml-auto">
            {Array.from({ length: 7 }).map((_, j) => (
              <div key={j} className="h-4 w-7 bg-line/15 rounded" />
            ))}
          </div>
          <div className="h-5 w-8 bg-line/20 rounded" />
        </div>
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Zone divider
   ───────────────────────────────────────────── */
function ZoneDivider({ label, accent = "floodlight" }) {
  const lineColor = accent === "flare" ? "bg-flare/30" : "bg-floodlight/30"
  const textColor = accent === "flare" ? "text-flare" : "text-floodlight"

  return (
    <tr aria-hidden="true">
      <td colSpan={10} className="px-6 py-0">
        <div className="flex items-center gap-3 py-2">
          <div className={`flex-1 h-px ${lineColor}`} />
          <span
            className={`font-body text-[10px] font-semibold uppercase tracking-widest2 ${textColor}`}
          >
            {label}
          </span>
          <div className={`flex-1 h-px ${lineColor}`} />
        </div>
      </td>
    </tr>
  )
}

/* ─────────────────────────────────────────────
   Standings table
   ───────────────────────────────────────────── */
export default function StandingsTable({ standings, loading, error }) {
  /* ── Loading state ── */
  if (loading) return <StandingsSkeleton />

  /* ── Error state ── */
  if (error) {
    return (
      <div className="bg-glass-bg border border-glass-border rounded-xl p-10 text-center">
        <p className="font-display uppercase tracking-wide text-chalk/70 mb-2">
          Could not load standings
        </p>
        <p className="font-body text-sm text-chalk/45 max-w-sm mx-auto">
          We weren&rsquo;t able to fetch the match data needed to build the table. Please try again later.
        </p>
      </div>
    )
  }

  /* ── Empty state ── */
  if (!standings || standings.length === 0) {
    return (
      <div className="bg-glass-bg border border-glass-border rounded-xl p-10 text-center">
        <p className="font-display uppercase tracking-wide text-chalk/70 mb-2">
          No standings data
        </p>
        <p className="font-body text-sm text-chalk/45 max-w-sm mx-auto">
          No completed matches have been played yet. Standings will appear here once match results are recorded.
        </p>
      </div>
    )
  }

  const totalTeams = standings.length

  return (
    <div className="overflow-x-auto -mx-6 md:mx-0">
      <div className="min-w-[600px] md:min-w-0 px-6 md:px-0">
        <table className="w-full bg-glass-bg border border-glass-border rounded-xl overflow-hidden" role="table">
          {/* ── Table head ── */}
          <thead className="sr-only md:not-sr-only">
            <tr className="border-b border-glass-border">
              <th scope="col" className="px-6 py-4 text-left">
                <span className="font-body text-[10px] font-semibold uppercase tracking-widest2 text-chalk/40">#</span>
              </th>
              <th scope="col" className="px-4 py-4 text-left">
                <span className="font-body text-[10px] font-semibold uppercase tracking-widest2 text-chalk/40">Club</span>
              </th>
              <th scope="col" className="px-4 py-4 text-center">
                <span className="font-body text-[10px] font-semibold uppercase tracking-widest2 text-chalk/40">P</span>
              </th>
              <th scope="col" className="hidden md:table-cell px-4 py-4 text-center">
                <span className="font-body text-[10px] font-semibold uppercase tracking-widest2 text-chalk/40">W</span>
              </th>
              <th scope="col" className="hidden md:table-cell px-4 py-4 text-center">
                <span className="font-body text-[10px] font-semibold uppercase tracking-widest2 text-chalk/40">D</span>
              </th>
              <th scope="col" className="hidden md:table-cell px-4 py-4 text-center">
                <span className="font-body text-[10px] font-semibold uppercase tracking-widest2 text-chalk/40">L</span>
              </th>
              <th scope="col" className="hidden md:table-cell px-4 py-4 text-center">
                <span className="font-body text-[10px] font-semibold uppercase tracking-widest2 text-chalk/40">GF</span>
              </th>
              <th scope="col" className="hidden md:table-cell px-4 py-4 text-center">
                <span className="font-body text-[10px] font-semibold uppercase tracking-widest2 text-chalk/40">GA</span>
              </th>
              <th scope="col" className="px-4 py-4 text-center">
                <span className="font-body text-[10px] font-semibold uppercase tracking-widest2 text-chalk/40">GD</span>
              </th>
              <th scope="col" className="px-4 py-4 text-center">
                <span className="font-body text-[10px] font-semibold uppercase tracking-widest2 text-chalk/40">Pts</span>
              </th>
            </tr>
          </thead>

          {/* ── Table body ── */}
          <tbody>
            {standings.flatMap((entry, index) => {
              const showContinentalDivider = totalTeams > 4 && index === 3
              const showRelegationDivider = totalTeams > 6 && index > 3 && index === totalTeams - 4

              const rows = []

              if (showContinentalDivider) {
                rows.push(
                  <ZoneDivider
                    key={`divider-continental-${index}`}
                    label="Continental / Promotion Zone"
                    accent="floodlight"
                  />
                )
              }
              if (showRelegationDivider) {
                rows.push(
                  <ZoneDivider
                    key={`divider-relegation-${index}`}
                    label="Relegation Zone"
                    accent="flare"
                  />
                )
              }

              rows.push(
                <tr key={entry.team.id}>
                  {/* Position */}
                  <td className="px-6 py-4 align-middle">
                    <span className="font-display text-sm font-semibold text-chalk/50 tabular-nums">
                      {entry.position}
                    </span>
                  </td>

                  {/* Club */}
                  <td className="px-4 py-4 align-middle">
                    <div className="flex items-center gap-3 min-w-0">
                      <TeamEmblem name={entry.team.name} size="sm" />
                      <span className="font-body text-sm font-semibold text-chalk truncate">
                        {entry.team.name}
                      </span>
                    </div>
                  </td>

                  {/* Played */}
                  <td className="px-4 py-4 align-middle text-center">
                    <span className="font-display text-sm font-semibold text-chalk/80 tabular-nums">
                      {entry.played}
                    </span>
                  </td>

                  {/* W / D / L */}
                  <td className="hidden md:table-cell px-4 py-4 align-middle text-center">
                    <span className="font-body text-sm text-chalk/60 tabular-nums">{entry.wins}</span>
                  </td>
                  <td className="hidden md:table-cell px-4 py-4 align-middle text-center">
                    <span className="font-body text-sm text-chalk/60 tabular-nums">{entry.draws}</span>
                  </td>
                  <td className="hidden md:table-cell px-4 py-4 align-middle text-center">
                    <span className="font-body text-sm text-chalk/60 tabular-nums">{entry.losses}</span>
                  </td>

                  {/* GF / GA */}
                  <td className="hidden md:table-cell px-4 py-4 align-middle text-center">
                    <span className="font-body text-sm text-chalk/60 tabular-nums">{entry.goalsFor}</span>
                  </td>
                  <td className="hidden md:table-cell px-4 py-4 align-middle text-center">
                    <span className="font-body text-sm text-chalk/60 tabular-nums">{entry.goalsAgainst}</span>
                  </td>

                  {/* Goal Difference */}
                  <td className="px-4 py-4 align-middle text-center">
                    <span
                      className={`font-display text-sm font-bold tabular-nums ${
                        entry.gd > 0
                          ? "text-pitch-light"
                          : entry.gd < 0
                            ? "text-flare"
                            : "text-chalk/50"
                      }`}
                    >
                      {entry.gd > 0 ? "+" : ""}
                      {entry.gd}
                    </span>
                  </td>

                  {/* Points — muted tone when 0 */}
                  <td className="px-4 py-4 align-middle text-center">
                    <span
                      className={`font-display text-base font-bold tabular-nums ${
                        entry.points > 0 ? "text-floodlight" : "text-chalk/50"
                      }`}
                    >
                      {entry.points}
                    </span>
                  </td>
                </tr>
              )

              return rows
            })}
          </tbody>
        </table>
        {/* Mobile hint */}
        <p className="md:hidden font-body text-[10px] text-chalk/30 mt-3 text-center">
          Scroll horizontally for full stats &middot; W D L GF GA
        </p>
      </div>
    </div>
  )
}
