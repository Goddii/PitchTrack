import { Link } from "react-router-dom"
import { ArrowLeft, Star } from "lucide-react"
import { TEAM_TABS } from "../utils/teamTabs"

function Crest({ team, className }) {
    if (team.logo_url) return <img src={team.logo_url} alt="" className={className} />
    return (
        <span className={`flex items-center justify-center bg-pitch font-display text-chalk/60 ${className}`}>
            {team.name.charAt(0)}
        </span>
    )
}

function ordinal(n) {
    const rem100 = n % 100
    const suffix = rem100 >= 11 && rem100 <= 13 ? "th" : { 1: "st", 2: "nd", 3: "rd" }[n % 10] ?? "th"
    return `${n}${suffix}`
}

/** Banner with crest, league standing, follow button and the page tabs. */
export default function TeamHero({ team, league, tab, onTabChange, isFollowable, followed, isToggling, onToggleFollow }) {
    const stats = league
        ? [
              ["League", league.played > 0 ? ordinal(league.position) : "—"],
              ["Points", league.points],
              ["Played", league.played],
              ["Goal diff", league.gd > 0 ? `+${league.gd}` : league.gd],
          ]
        : []

    return (
        <section aria-label={`${team.name} overview`} className="relative overflow-hidden rounded-xl border border-glass-border bg-gradient-to-br from-night via-night to-pitch/30">
            {team.logo_url && (
                <img
                    src={team.logo_url}
                    alt=""
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-10 top-1/2 h-[140%] max-w-none -translate-y-1/2 select-none object-contain opacity-[0.12] blur-[1px]"
                />
            )}

            <div className="relative px-5 pb-0 pt-4 md:px-7">
                <Link
                    to="/teams"
                    className="inline-flex min-h-11 items-center gap-1.5 font-body text-sm text-chalk/60 transition-colors hover:text-floodlight"
                >
                    <ArrowLeft size={15} aria-hidden="true" /> Back to Teams
                </Link>

                <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-4">
                    <Crest team={team} className="size-20 shrink-0 rounded-full border border-line object-cover text-3xl md:size-24" />
                    <div className="min-w-0 flex-1">
                        <h1 className="font-display text-3xl uppercase tracking-wide text-chalk md:text-5xl">{team.name}</h1>
                        {team.nickname && <p className="mt-1 font-body text-sm text-chalk/60">{team.nickname}</p>}
                    </div>
                    {isFollowable && (
                        <button
                            type="button"
                            onClick={onToggleFollow}
                            disabled={isToggling}
                            aria-pressed={followed}
                            className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded border px-4 font-body text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                                followed
                                    ? "border-floodlight bg-pitch/20 text-floodlight"
                                    : "border-floodlight bg-floodlight text-night hover:bg-chalk"
                            }`}
                        >
                            <Star size={16} fill={followed ? "currentColor" : "none"} aria-hidden="true" />
                            {followed ? "Following" : "Follow team"}
                        </button>
                    )}
                </div>

                {stats.length > 0 && (
                    <dl className="mt-5 grid grid-cols-4 gap-x-4 border-t border-glass-border pt-4 sm:max-w-xl">
                        {stats.map(([label, value]) => (
                            <div key={label}>
                                <dt className="font-body text-[0.6875rem] uppercase tracking-widest2 text-chalk/60">{label}</dt>
                                <dd className="font-display text-2xl font-bold tabular-nums text-chalk">{value}</dd>
                            </div>
                        ))}
                    </dl>
                )}

                <div role="tablist" aria-label="Team sections" className="mt-4 -mb-px flex gap-1 overflow-x-auto">
                    {TEAM_TABS.map(({ value, label }) => {
                        const isActive = value === tab
                        return (
                            <button
                                key={value}
                                type="button"
                                role="tab"
                                id={`team-tab-${value}`}
                                aria-selected={isActive}
                                aria-controls="team-panel"
                                onClick={() => onTabChange(value)}
                                className={`min-h-11 shrink-0 cursor-pointer border-b-2 px-4 font-body text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-floodlight/60 ${
                                    isActive ? "border-floodlight text-chalk" : "border-transparent text-chalk/60 hover:text-chalk"
                                }`}
                            >
                                {label}
                            </button>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
