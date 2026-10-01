export const POSITIONS = ["Goalkeeper", "Defender", "Midfielder", "Forward"]

const STARTERS_PER_SIDE = 11

// Vertical span of the home half of a portrait pitch, in percent from the top: the goalkeeper line
// and the most advanced line. The goal line is at 100 and the halfway line at 50, so every line in
// between stays inside its own half.
const FIRST_LINE_Y = 92
const LAST_LINE_Y = 55

const FORMATION_SHAPE = /^[1-9](-[1-9]){2,3}$/

/** The canonical position name for free text from the API, or null if it is not one we place. */
export function normalisePosition(position) {
    const wanted = String(position ?? "").trim().toLowerCase()
    return POSITIONS.find((p) => p.toLowerCase() === wanted) ?? null
}

/** The label under a player's marker on the pitch: the last word of their name. */
export function shortName(name) {
    return String(name ?? "").trim().split(/\s+/).pop()
}

const byJersey =(a, b) => (a.player.jersey_number ?? 0) - (b.player.jersey_number ?? 0)

/** Split the outfield starters into the lines of a stored formation, or null if it does not fit them. */
function splitByFormation(formation, outfield) {
    if (!FORMATION_SHAPE.test(formation ?? "")) return null

    const sizes = formation.split("-").map(Number)
    if (sizes.reduce((sum, size) => sum + size, 0) !== outfield.length) return null

    return sizes.map((size, index) => {
        const offset = sizes.slice(0, index).reduce((sum, previous) => sum + previous, 0)
        return outfield.slice(offset, offset + size)
    })
}

/**
 * One team's starting XI from a match's player-stat rows:
 * - `lines`: starters grouped by position, for lists.
 * - `shape`: the goalkeeper line then the outfield lines, for drawing on the pitch. It follows the
 *   stored formation when that fits the starters, otherwise the three position lines.
 * - `formation`: the shape's outfield lines as text (for example "4-3-3"), or null with no outfield.
 * - `unplaced`: starters whose position we cannot place.
 */
export function buildLineup(rows, teamId, storedFormation = null) {
    const starters = rows.filter((row) => row.started && row.player.team_id === teamId)

    const lines = Object.fromEntries(
        POSITIONS.map((position) => [
            position,
            starters.filter((row) => normalisePosition(row.player.position) === position).sort(byJersey),
        ])
    )
    const unplaced = starters.filter((row) => normalisePosition(row.player.position) === null)
    const placed = POSITIONS.flatMap((position) => lines[position])

    const outfield = [...lines.Defender, ...lines.Midfielder, ...lines.Forward]
    const outfieldLines =
        splitByFormation(storedFormation, outfield) ?? [lines.Defender, lines.Midfielder, lines.Forward]

    return {
        lines,
        shape: [lines.Goalkeeper, ...outfieldLines],
        starters: placed,
        unplaced,
        formation: outfield.length > 0 ? outfieldLines.map((line) => line.length).join("-") : null,
        isComplete: placed.length + unplaced.length === STARTERS_PER_SIDE,
    }
}

const lineY = (index, lineCount) =>
    lineCount < 2 ? FIRST_LINE_Y : FIRST_LINE_Y - (index * (FIRST_LINE_Y - LAST_LINE_Y)) / (lineCount - 1)

/**
 * Pitch coordinates (percent of width and height, origin top-left) for each starter in a lineup
 * `shape`. On a portrait pitch the home side defends the bottom goal; on a landscape pitch it defends
 * the left goal. The away side is the same layout turned half a turn.
 */
export function layoutLineup(shape, side, orientation = "portrait") {
    const isAway = side === "away"

    return shape.flatMap((line, lineIndex) =>
        line.map((row, index) => {
            const across = ((index + 1) / (line.length + 1)) * 100
            const along = lineY(lineIndex, shape.length)
            const portrait = { x: isAway ? 100 - across : across, y: isAway ? 100 - along : along }

            // A landscape pitch is the portrait one turned a quarter turn, so the goal at the bottom moves left.
            return orientation === "landscape"
                ? { row, x: 100 - portrait.y, y: portrait.x }
                : { row, ...portrait }
        })
    )
}
