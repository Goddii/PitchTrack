import { computeStandings, resultFor } from "./standings"

const RECENT_MATCHES = 10

const byDateAsc = (a, b) => new Date(a.match_date) - new Date(b.match_date)
const involves = (teamId) => (m) => m.home_team?.id === teamId || m.away_team?.id === teamId

function recentRecord(teamId, completed) {
    const results = completed.slice(-RECENT_MATCHES).map((m) => resultFor(teamId, m))
    const count = (r) => results.filter((x) => x.result === r).length
    const wins = count("W")

    return {
        played: results.length,
        wins,
        draws: count("D"),
        losses: count("L"),
        goalsFor: results.reduce((sum, x) => sum + x.scored, 0),
        goalsAgainst: results.reduce((sum, x) => sum + x.conceded, 0),
        winRate: results.length === 0 ? 0 : Math.round((wins / results.length) * 100),
    }
}

/**
 * Everything the team page needs from the fixtures list: the club's row in the league table,
 * its record over the last ten finished matches, and the next match still to be played.
 */
export function summarizeTeam(team, teams, matches) {
    const mine = matches.filter(involves(team.id)).sort(byDateAsc)
    const league = computeStandings(teams, matches).find((row) => row.team.id === team.id) ?? null

    return {
        league,
        lastTen: recentRecord(team.id, mine.filter((m) => m.status === "completed")),
        nextMatch: mine.find((m) => m.status !== "completed") ?? null,
    }
}
