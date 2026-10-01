import { attributeGauges } from "./playerAttributes"

const MIN_COMPARISON_SAMPLE = 3
const MATCH_MINUTES = 90

/**
 * Each of a player's attributes next to the squad's average and best for that same attribute.
 * Goalkeepers and outfield players carry different attributes, so only players who have the
 * attribute are compared. With fewer than three of them the comparison is left out.
 */
export function squadAttributeStats(attributes, squad) {
    return attributeGauges(attributes).map((gauge) => {
        const values = squad.map((p) => p.attributes?.[gauge.key]).filter((v) => typeof v === "number")
        if (values.length < MIN_COMPARISON_SAMPLE) return { ...gauge, average: null, best: null }

        const average = Math.round(values.reduce((sum, v) => sum + v, 0) / values.length)
        return { ...gauge, average, best: Math.max(...values) }
    })
}

/** Goals and assists per 90 minutes, and minutes per appearance; null until the player has played. */
export function per90({ appearances, minutes, goals, assists }) {
    if (minutes <= 0) return { goals: null, assists: null, minutesPerAppearance: null }

    return {
        goals: (goals * MATCH_MINUTES) / minutes,
        assists: (assists * MATCH_MINUTES) / minutes,
        minutesPerAppearance: appearances > 0 ? Math.round(minutes / appearances) : null,
    }
}
