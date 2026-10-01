/**
 * Featured match: a live one first, then the next scheduled fixture,
 * then the most recent result, then whatever is first in the list.
 */
export function pickFeaturedMatch(matches) {
    if (!matches || matches.length === 0) return null

    const live = matches.find((m) => m.status === "live")
    if (live) return live

    const upcoming = matches
        .filter((m) => m.status === "scheduled")
        .sort((a, b) => new Date(a.match_date) - new Date(b.match_date))
    if (upcoming.length > 0) return upcoming[0]

    const completed = matches
        .filter((m) => m.status === "completed")
        .sort((a, b) => new Date(b.match_date) - new Date(a.match_date))
    if (completed.length > 0) return completed[0]

    return matches[0]
}

const FIXTURE_STRIP_LIMIT = 5
const MIN_RECENT_RESULTS = 2

const byDateAsc = (a, b) => new Date(a.match_date) - new Date(b.match_date)

/**
 * The fixtures shown on the landing page strip: every live match, the latest results and the
 * next scheduled games, in date order. Results backfill any slots the schedule cannot fill.
 */
export function pickFixtureStrip(matches, limit = FIXTURE_STRIP_LIMIT) {
    if (!matches || matches.length === 0) return []

    const live = matches.filter((m) => m.status === "live").slice(0, limit)
    const slots = limit - live.length
    const upcoming = matches.filter((m) => m.status === "scheduled").sort(byDateAsc)
    const results = matches.filter((m) => m.status === "completed").sort((a, b) => byDateAsc(b, a))

    const wantedResults = Math.max(Math.min(MIN_RECENT_RESULTS, slots), slots - upcoming.length)
    const resultCount = Math.min(results.length, wantedResults)
    const upcomingCount = Math.min(upcoming.length, slots - resultCount)

    return [...live, ...results.slice(0, resultCount), ...upcoming.slice(0, upcomingCount)].sort(byDateAsc)
}

/**
 * Headline numbers for the landing page, derived from what the API actually returns
 * so the page never advertises more than the league really has.
 */
export function summarizeLeague({ teams = [], players = [], matches = [] } = {}) {
    const goals = matches
        .filter((m) => m.status === "completed" || m.status === "live")
        .reduce((sum, m) => sum + (m.home_score ?? 0) + (m.away_score ?? 0), 0)

    return {
        clubs: teams.length,
        players: players.length,
        played: matches.filter((m) => m.status === "completed").length,
        live: matches.filter((m) => m.status === "live").length,
        ahead: matches.filter((m) => m.status === "scheduled").length,
        goals,
    }
}
