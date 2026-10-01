const MAX_ATTRIBUTE = 100

const ATTRIBUTE_LABELS = {
    pace: "Pace",
    shooting: "Shooting",
    passing: "Passing",
    dribbling: "Dribbling",
    defending: "Defending",
    physical: "Physical",
    diving: "Diving",
    handling: "Handling",
    kicking: "Kicking",
    reflexes: "Reflexes",
    speed: "Speed",
    positioning: "Positioning",
}

/** Friendly label for an attribute key; unknown keys are shown as stored. */
export function attributeLabel(key) {
    return ATTRIBUTE_LABELS[key] ?? key
}

/**
 * Gauge data for a player's attributes, in stored order. Outfield players and goalkeepers have
 * different attributes, so this works from whatever keys exist rather than a fixed list.
 */
export function attributeGauges(attributes, max = Infinity) {
    if (!attributes || typeof attributes !== "object") return []

    return Object.entries(attributes)
        .slice(0, max)
        .map(([key, value]) => ({
            key,
            label: attributeLabel(key),
            value: typeof value === "number" ? Math.min(MAX_ATTRIBUTE, Math.max(0, value)) : 0,
        }))
}
