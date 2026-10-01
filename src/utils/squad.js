export const SQUAD_LINES = [
    { position: "Goalkeeper", label: "Goalkeepers" },
    { position: "Defender", label: "Defenders" },
    { position: "Midfielder", label: "Midfielders" },
    { position: "Forward", label: "Forwards" },
]

const byJersey = (a, b) => (a.jersey_number ?? Infinity) - (b.jersey_number ?? Infinity)

/** Squad split into goalkeeper → forward lines, each sorted by shirt number. Empty lines are dropped. */
export function groupSquad(players) {
    return SQUAD_LINES.map(({ position, label }) => ({
        position,
        label,
        players: players.filter((p) => p.position === position).sort(byJersey),
    })).filter((line) => line.players.length > 0)
}
