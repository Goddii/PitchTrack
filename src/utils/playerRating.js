/**
 * Compute a simple overall rating from a player's attributes object.
 * Returns the average of all values, rounded, divided by 10; null if missing/empty.
 */
export function computeOverallRating(attributes) {
    if (!attributes || typeof attributes !== "object" || Object.keys(attributes).length === 0) {
        return null
    }
    const values = Object.values(attributes)
    return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length) / 10
}

/**
 * Return a Tailwind className string for the rating tier visual.
 * Emerald for high (>= 7.5), amber for medium (>= 6), red for low.
 */
export function ratingTier(score) {
    if (score >= 7.5) return "text-emerald-400 border-emerald-400/40 bg-emerald-400/10"
    if (score >= 6) return "text-amber-400 border-amber-400/40 bg-amber-400/10"
    return "text-red-400 border-red-400/40 bg-red-400/10"
}
