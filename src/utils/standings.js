const FORM_LENGTH = 5
const WIN_POINTS = 3
const DRAW_POINTS = 1

const byDateAsc = (a, b) => new Date(a.match_date) - new Date(b.match_date)

function resultFor(teamId, match) {
    const isHome = match.home_team?.id === teamId
    const scored = (isHome ? match.home_score : match.away_score) ?? 0
    const conceded = (isHome ? match.away_score : match.home_score) ?? 0
    const result = scored > conceded ? "W" : scored === conceded ? "D" : "L"
    return { result, scored, conceded }
}

function entryFor(team, completedMatches) {
    const results = completedMatches
        .filter((m) => m.home_team?.id === team.id || m.away_team?.id === team.id)
        .sort(byDateAsc)
        .map((m) => resultFor(team.id, m))

    const count = (r) => results.filter((x) => x.result === r).length
    const goalsFor = results.reduce((sum, x) => sum + x.scored, 0)
    const goalsAgainst = results.reduce((sum, x) => sum + x.conceded, 0)
    const wins = count("W")
    const draws = count("D")

    return {
        team,
        played: results.length,
        wins,
        draws,
        losses: count("L"),
        goalsFor,
        goalsAgainst,
        gd: goalsFor - goalsAgainst,
        points: wins * WIN_POINTS + draws * DRAW_POINTS,
        form: results.slice(-FORM_LENGTH).map((x) => x.result),
    }
}

/**
 * League table from completed matches: points, then goal difference, then goals scored,
 * then name. `form` holds each club's last five results, oldest first.
 */
export function computeStandings(teams, matches) {
    const completed = matches.filter((m) => m.status === "completed")

    return teams
        .map((team) => entryFor(team, completed))
        .sort(
            (a, b) =>
                b.points - a.points ||
                b.gd - a.gd ||
                b.goalsFor - a.goalsFor ||
                a.team.name.localeCompare(b.team.name)
        )
        .map((entry, index) => ({ ...entry, position: index + 1 }))
}
