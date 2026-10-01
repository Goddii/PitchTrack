const RING_LENGTH = 100

// Display order and names for how a goal was scored
export const GOAL_TYPES = [
    { key: "right_foot_goals", label: "Right foot" },
    { key: "left_foot_goals", label: "Left foot" },
    { key: "headed_goals", label: "Headers" },
    { key: "penalty_goals", label: "Penalties" },
]

/**
 * A player's goals split by type. Slices are the types that have goals, each with its share of the
 * classified goals; `unclassified` counts goals recorded without a type.
 */
export function goalBreakdown(stats) {
    const typed = GOAL_TYPES.map(({ key, label }) => ({ key, label, value: stats[key] ?? 0 })).filter((t) => t.value > 0)
    const classified = typed.reduce((sum, t) => sum + t.value, 0)

    return {
        slices: typed.map((t) => ({ ...t, fraction: t.value / classified })),
        total: stats.goals,
        unclassified: Math.max(0, stats.goals - classified),
    }
}

/** Arc length and start for each slice around a ring that is 100 units round (see the r=15.9155 circle). */
export function donutArcs(slices) {
    let start = 0
    return slices.map(({ key, fraction }) => {
        const length = fraction * RING_LENGTH
        const arc = { key, length, start }
        start += length
        return arc
    })
}
