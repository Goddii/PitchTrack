const MATCH_MINUTES = 90

const clampRatio = (value, total) => (total > 0 ? Math.min(1, Math.max(0, value / total)) : 0)

/** What a team has played so far: matches started (completed or live) and goals it has scored. */
export function teamActivity(teamId, matches) {
    return matches.reduce(
        (activity, m) => {
            if (m.status === "scheduled") return activity
            const isHome = m.home_team?.id === teamId
            const isAway = m.away_team?.id === teamId
            if (!isHome && !isAway) return activity
            return {
                played: activity.played + 1,
                goalsFor: activity.goalsFor + ((isHome ? m.home_score : m.away_score) ?? 0),
            }
        },
        { played: 0, goalsFor: 0 }
    )
}

/**
 * The five hero gauges for a player. Each ring fills by the player's share of what their club
 * has played: matches, minutes available, or goals scored.
 */
export function statRings(stats, activity) {
    const { played, goalsFor } = activity
    return [
        { key: "appearances", label: "Appearances", display: String(stats.appearances), ratio: clampRatio(stats.appearances, played) },
        { key: "starts", label: "Starts", display: String(stats.starts), ratio: clampRatio(stats.starts, played) },
        { key: "minutes", label: "Minutes", display: String(stats.minutes), ratio: clampRatio(stats.minutes, played * MATCH_MINUTES) },
        { key: "goals", label: "Goals", display: String(stats.goals), ratio: clampRatio(stats.goals, goalsFor) },
        { key: "assists", label: "Assists", display: String(stats.assists), ratio: clampRatio(stats.assists, goalsFor) },
    ]
}
