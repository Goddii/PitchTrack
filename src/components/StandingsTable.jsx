import { Link } from "react-router-dom"
import TeamEmblem from "./TeamEmblem"
import FormPills from "./FormPills"

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
      <div className="hidden md:flex items-center gap-4 px-3 md:px-6 py-4 border-b border-glass-border">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-3 bg-line/20 rounded" style={{ width: i === 0 ? 28 : i === 1 ? 48 : 32 }} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-3 md:px-6 py-4 border-b border-glass-border last:border-b-0"
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
        <p className="font-body text-sm text-chalk/60 max-w-sm mx-auto">
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
        <p className="font-body text-sm text-chalk/60 max-w-sm mx-auto">
          No completed matches have been played yet. Standings will appear here once match results are recorded.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <div>
        <table className="w-full bg-glass-bg border border-glass-border rounded-xl overflow-hidden" role="table">
          {/* ── Table head ── */}
          <thead>
            <tr className="border-b border-glass-border">
              <th scope="col" className="px-3 md:px-6 py-4 text-left">
                <span className="font-body text-xs font-semibold uppercase tracking-widest2 text-chalk/60">#</span>
              </th>
              <th scope="col" className="px-2 md:px-4 py-4 text-left">
                <span className="font-body text-xs font-semibold uppercase tracking-widest2 text-chalk/60">Club</span>
              </th>
              <th scope="col" className="px-2 md:px-4 py-4 text-center">
                <span className="font-body text-xs font-semibold uppercase tracking-widest2 text-chalk/60">P</span>
              </th>
              <th scope="col" className="hidden md:table-cell px-2 md:px-4 py-4 text-center">
                <span className="font-body text-xs font-semibold uppercase tracking-widest2 text-chalk/60">W</span>
              </th>
              <th scope="col" className="hidden md:table-cell px-2 md:px-4 py-4 text-center">
                <span className="font-body text-xs font-semibold uppercase tracking-widest2 text-chalk/60">D</span>
              </th>
              <th scope="col" className="hidden md:table-cell px-2 md:px-4 py-4 text-center">
                <span className="font-body text-xs font-semibold uppercase tracking-widest2 text-chalk/60">L</span>
              </th>
              <th scope="col" className="hidden md:table-cell px-2 md:px-4 py-4 text-center">
                <span className="font-body text-xs font-semibold uppercase tracking-widest2 text-chalk/60">GF</span>
              </th>
              <th scope="col" className="hidden md:table-cell px-2 md:px-4 py-4 text-center">
                <span className="font-body text-xs font-semibold uppercase tracking-widest2 text-chalk/60">GA</span>
              </th>
              <th scope="col" className="px-2 md:px-4 py-4 text-center">
                <span className="font-body text-xs font-semibold uppercase tracking-widest2 text-chalk/60">GD</span>
              </th>
              <th scope="col" className="px-2 md:px-4 py-4 text-center">
                <span className="font-body text-xs font-semibold uppercase tracking-widest2 text-chalk/60">Pts</span>
              </th>
              <th scope="col" className="hidden md:table-cell px-2 md:px-6 py-4 text-left">
                <span className="font-body text-xs font-semibold uppercase tracking-widest2 text-chalk/60">Form</span>
              </th>
            </tr>
          </thead>

          {/* ── Table body ── */}
          <tbody>
            {standings.map((entry) => (
                <tr
                  key={entry.team.id}
                  className={entry.position === 1 && entry.played > 0 ? "bg-floodlight/[0.07]" : ""}
                >
                  {/* Position */}
                  <td className="px-3 md:px-6 py-4 align-middle">
                    <span className="font-display text-sm font-semibold text-chalk/60 tabular-nums">
                      {entry.position}
                    </span>
                  </td>

                  {/* Club */}
                  <td className="px-2 md:px-4 py-4 align-middle max-w-[9rem] md:max-w-none">
                    <Link
                      to={`/teams/${entry.team.id}`}
                      className="group flex min-h-11 items-center gap-3 min-w-0"
                    >
                      <TeamEmblem name={entry.team.name} size="sm" />
                      <span className="font-body text-sm font-semibold text-chalk truncate transition-colors group-hover:text-floodlight">
                        {entry.team.name}
                      </span>
                    </Link>
                  </td>

                  {/* Played */}
                  <td className="px-2 md:px-4 py-4 align-middle text-center">
                    <span className="font-display text-sm font-semibold text-chalk/80 tabular-nums">
                      {entry.played}
                    </span>
                  </td>

                  {/* W / D / L */}
                  <td className="hidden md:table-cell px-2 md:px-4 py-4 align-middle text-center">
                    <span className="font-body text-sm text-chalk/60 tabular-nums">{entry.wins}</span>
                  </td>
                  <td className="hidden md:table-cell px-2 md:px-4 py-4 align-middle text-center">
                    <span className="font-body text-sm text-chalk/60 tabular-nums">{entry.draws}</span>
                  </td>
                  <td className="hidden md:table-cell px-2 md:px-4 py-4 align-middle text-center">
                    <span className="font-body text-sm text-chalk/60 tabular-nums">{entry.losses}</span>
                  </td>

                  {/* GF / GA */}
                  <td className="hidden md:table-cell px-2 md:px-4 py-4 align-middle text-center">
                    <span className="font-body text-sm text-chalk/60 tabular-nums">{entry.goalsFor}</span>
                  </td>
                  <td className="hidden md:table-cell px-2 md:px-4 py-4 align-middle text-center">
                    <span className="font-body text-sm text-chalk/60 tabular-nums">{entry.goalsAgainst}</span>
                  </td>

                  {/* Goal Difference */}
                  <td className="px-2 md:px-4 py-4 align-middle text-center">
                    <span
                      className={`font-display text-sm font-bold tabular-nums ${
                        entry.gd > 0
                          ? "text-emerald-400"
                          : entry.gd < 0
                            ? "text-flare"
                            : "text-chalk/60"
                      }`}
                    >
                      {entry.gd > 0 ? "+" : ""}
                      {entry.gd}
                    </span>
                  </td>

                  {/* Points — muted tone when 0 */}
                  <td className="px-2 md:px-4 py-4 align-middle text-center">
                    <span
                      className={`font-display text-base font-bold tabular-nums ${
                        entry.points > 0 ? "text-floodlight" : "text-chalk/60"
                      }`}
                    >
                      {entry.points}
                    </span>
                  </td>

                  {/* Form: last five results */}
                  <td className="hidden md:table-cell px-2 md:px-6 py-4 align-middle">
                    <FormPills form={entry.form} />
                  </td>
                </tr>
            ))}
          </tbody>
        </table>
        {/* Column legend */}
        <p className="font-body text-xs text-chalk/60 mt-3 text-center">
          P played<span className="hidden md:inline"> &middot; W won &middot; D drawn &middot; L lost &middot; GF goals for &middot; GA goals against</span> &middot; GD goal difference &middot; Pts points
        </p>
      </div>
    </div>
  )
}
