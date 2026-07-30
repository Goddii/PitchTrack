import { memo, useMemo } from "react"
import {
  Target,
  Swords,
  CornerDownRight,
  AlertTriangle,
  Radio,
  BarChart3,
} from "lucide-react"

/* ─────────────────────────────────────────
   Generate synthetic stats from match data
   ───────────────────────────────────────── */
function generateMatchStats(match) {
  const seed = match.id * 7 + (match.home_score || 0) * 13 + (match.away_score || 0) * 31
  const pseudo = (n) => ((seed * (n + 1) * 17) % 100)

  return {
    home: {
      possession: 40 + (pseudo(1) % 30),
      shots: 2 + (pseudo(2) % 12),
      shotsOnTarget: 1 + (pseudo(3) % 7),
      corners: 1 + (pseudo(4) % 8),
      fouls: 3 + (pseudo(5) % 10),
      yellowCards: pseudo(6) % 4,
      redCards: pseudo(7) % 2,
    },
    away: {
      possession: 40 + (pseudo(8) % 30),
      shots: 2 + (pseudo(9) % 12),
      shotsOnTarget: 1 + (pseudo(10) % 7),
      corners: 1 + (pseudo(11) % 8),
      fouls: 3 + (pseudo(12) % 10),
      yellowCards: pseudo(13) % 4,
      redCards: pseudo(14) % 2,
    },
  }
}

/* ─────────────────────────────────────────
   Stat bar with animated fill
   ───────────────────────────────────────── */
function StatBar({ label, home, away, icon: Icon, format = "number", index = 0 }) {
  const total = home + away
  const homePercent = total > 0 ? (home / total) * 100 : 50

  return (
    <div
      className="space-y-1.5"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-chalk/60">
          {Icon && <Icon size={11} strokeWidth={1.5} aria-hidden="true" />}
          <span className="font-body text-[11px] uppercase tracking-widest2">{label}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-display text-xs font-bold text-chalk tabular-nums">
            {format === "percentage" ? `${home}%` : home}
          </span>
          <span className="font-display text-[10px] text-chalk/30">/</span>
          <span className="font-display text-xs font-bold text-chalk tabular-nums">
            {format === "percentage" ? `${away}%` : away}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 rounded-full bg-chalk/8 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-floodlight to-floodlight/70 animate-stat-fill"
            style={{ width: `${homePercent}%` }}
            role="meter"
            aria-valuenow={home}
            aria-valuemin={0}
            aria-valuemax={total || 1}
            aria-label={`${label}: ${home} - ${away}`}
          />
        </div>
      </div>
    </div>
  )
}

/* 
   Main component
  */
function ExpandedMatchPanel({ match }) {
  const stats = useMemo(() => generateMatchStats(match), [match])

  if (!match) return null

  return (
    <div
      className="px-5 py-6 bg-gradient-to-b from-black/40 to-black/20 border-t border-glass-border space-y-6"
      role="region"
      aria-label="Match statistics"
    >
      {/* ── Stat bars ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-3.5">
          <StatBar label="Possession" home={stats.home.possession} away={stats.away.possession} icon={Radio} format="percentage" index={0} />
          <StatBar label="Shots" home={stats.home.shots} away={stats.away.shots} icon={Target} index={1} />
          <StatBar label="Shots on Target" home={stats.home.shotsOnTarget} away={stats.away.shotsOnTarget} icon={Swords} index={2} />
        </div>
        <div className="space-y-3.5">
          <StatBar label="Corners" home={stats.home.corners} away={stats.away.corners} icon={CornerDownRight} index={3} />
          <StatBar label="Fouls" home={stats.home.fouls} away={stats.away.fouls} icon={AlertTriangle} index={4} />
          <StatBar label="Cards" home={stats.home.yellowCards + stats.home.redCards * 2} away={stats.away.yellowCards + stats.away.redCards * 2} icon={BarChart3} index={5} />
        </div>
      </div>

      {/* ── Momentum strip ── */}
      <div className="pt-3 border-t border-glass-border">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-body text-[10px] uppercase tracking-widest2 text-chalk/40">Momentum</span>
        </div>
        <div className="flex h-2 rounded-full overflow-hidden bg-chalk/5">
          <div
            className="h-full bg-gradient-to-r from-flare to-floodlight transition-all duration-700"
            style={{ width: `${stats.home.shots > stats.away.shots ? 60 : 40}%` }}
          />
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-pitch-light transition-all duration-700"
            style={{ width: `${stats.home.shots > stats.away.shots ? 40 : 60}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="font-body text-[9px] text-chalk/30 tabular-nums">{match.home_team?.name?.split(" ")[0]}</span>
          <span className="font-body text-[9px] text-chalk/30 tabular-nums">{match.away_team?.name?.split(" ")[0]}</span>
        </div>
      </div>

      {/* ── Card details ── */}
      <div className="flex flex-wrap items-center gap-4 pt-2">
        <div className="flex items-center gap-2">
          <span className="font-body text-[10px] text-chalk/45 uppercase tracking-widest2">
            {match.home_team?.name?.split(" ")[0]}
          </span>
          {Array.from({ length: stats.home.yellowCards }).map((_, i) => (
            <span key={`h-y-${i}`} className="w-3 h-4 rounded-sm bg-yellow-400/80" aria-label="Yellow card" />
          ))}
          {Array.from({ length: stats.home.redCards }).map((_, i) => (
            <span key={`h-r-${i}`} className="w-3 h-4 rounded-sm bg-red-500/80" aria-label="Red card" />
          ))}
        </div>
        <span className="text-chalk/15 text-[10px]">|</span>
        <div className="flex items-center gap-2">
          <span className="font-body text-[10px] text-chalk/45 uppercase tracking-widest2">
            {match.away_team?.name?.split(" ")[0]}
          </span>
          {Array.from({ length: stats.away.yellowCards }).map((_, i) => (
            <span key={`a-y-${i}`} className="w-3 h-4 rounded-sm bg-yellow-400/80" aria-label="Yellow card" />
          ))}
          {Array.from({ length: stats.away.redCards }).map((_, i) => (
            <span key={`a-r-${i}`} className="w-3 h-4 rounded-sm bg-red-500/80" aria-label="Red card" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default memo(ExpandedMatchPanel)
