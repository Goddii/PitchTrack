import { POSITIONS, normalisePosition } from "./lineup"

export const POSITION_FILTERS = [
    { value: "all", label: "All" },
    { value: "Goalkeeper", label: "GK" },
    { value: "Defender", label: "DF" },
    { value: "Midfielder", label: "MF" },
    { value: "Forward", label: "FW" },
]

const GROUP_LABELS = {
    Goalkeeper: "Goalkeepers",
    Defender: "Defenders",
    Midfielder: "Midfielders",
    Forward: "Forwards",
}

// Starters first, then by shirt number.
const rosterOrder = (a, b) =>
    Number(b.started) - Number(a.started) || (a.player.jersey_number ?? 0) - (b.player.jersey_number ?? 0)

function matchesQuery(row, query) {
    if (!query) return true
    return row.player.name.toLowerCase().includes(query) || String(row.player.jersey_number ?? "") === query
}

/** One team's players for the side panel, grouped by position, narrowed by position and search text. */
export function rosterGroups(rows, { teamId, position = "all", query = "" }) {
    const needle = query.trim().toLowerCase()
    const team = rows.filter((row) => row.player.team_id === teamId && matchesQuery(row, needle))

    return POSITIONS.filter((p) => position === "all" || p === position)
        .map((p) => ({
            position: p,
            label: GROUP_LABELS[p],
            rows: team.filter((row) => normalisePosition(row.player.position) === p).sort(rosterOrder),
        }))
        .filter((group) => group.rows.length > 0)
}
