const INT_FIELDS = {
    teams: ["founded_year"],
    players: ["team_id", "jersey_number", "age"],
    matches: ["home_team_id", "away_team_id", "home_score", "away_score", "minute"],
}

/** "" / null / undefined / non-numeric -> null; numeric strings -> whole numbers. */
export function toNullableInt(value) {
    if (value === "" || value == null) return null
    const n = Number(value)
    return Number.isFinite(n) ? Math.trunc(n) : null
}

/**
 * Prepare admin form data for the API: integer columns get real numbers (or null
 * when blank, so the backend never receives "" for an Integer column) and
 * string values are trimmed. Returns a new object; the input is not mutated.
 */
export function normalizePayload(section, formData) {
    const intFields = INT_FIELDS[section] ?? []
    return Object.fromEntries(
        Object.entries(formData).map(([key, value]) => {
            if (intFields.includes(key)) return [key, toNullableInt(value)]
            if (typeof value === "string") return [key, value.trim()]
            return [key, value]
        })
    )
}
