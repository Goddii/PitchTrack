const FORM_LENGTH = 5
const LEADERS_SHOWN = 3

/** One match-log row as the player's own side saw it: opponent, H/A, score (theirs first) and result. */
export function describeMatchRow(row) {
    const ours = row.was_home ? row.home_score : row.away_score
    const theirs = row.was_home ? row.away_score : row.home_score
    const hasScore = ours != null && theirs != null

    let result = null
    if (row.status === "completed" && hasScore) {
        result = ours > theirs ? "W" : ours === theirs ? "D" : "L"
    }

    return {
        opponent: row.opponent?.name ?? "TBD",
        side: row.was_home ? "H" : "A",
        scoreText: hasScore ? `${ours} - ${theirs}` : null,
        result,
        live: row.status === "live",
    }
}

/** The last five completed results, oldest first, from a log that is ordered newest first. */
export function recentForm(log) {
    return log
        .map((row) => describeMatchRow(row).result)
        .filter(Boolean)
        .slice(0, FORM_LENGTH)
        .reverse()
}

/** The top players for one stat. Zero is not a lead; ties go to fewer minutes played, then name. */
export function squadLeaders(totals, field, limit = LEADERS_SHOWN) {
    return totals
        .filter((entry) => entry[field] > 0)
        .sort(
            (a, b) =>
                b[field] - a[field] ||
                a.minutes - b.minutes ||
                a.player.name.localeCompare(b.player.name)
        )
        .slice(0, limit)
}
