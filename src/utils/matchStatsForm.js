const MAX_MINUTES = 120

export const GOAL_TYPE_FIELDS = ["penalty_goals", "headed_goals", "right_foot_goals", "left_foot_goals"]
export const COUNT_FIELDS = ["goals", "assists", "yellow_cards", "red_cards", ...GOAL_TYPE_FIELDS]

/** What one player's row looks like before anything is entered. */
export const EMPTY_DRAFT = Object.freeze({
    started: false,
    minutes_played: 0,
    goals: 0,
    assists: 0,
    yellow_cards: 0,
    red_cards: 0,
    penalty_goals: 0,
    headed_goals: 0,
    right_foot_goals: 0,
    left_foot_goals: 0,
})

const FIELDS = Object.keys(EMPTY_DRAFT)

/** A saved API row as an editable draft. */
export function draftFromRow(row) {
    return Object.fromEntries(FIELDS.map((field) => [field, row[field]]))
}

export function isBlankDraft(draft) {
    return FIELDS.every((field) => draft[field] === EMPTY_DRAFT[field])
}

/**
 * The rows to save: everyone with something entered, plus anyone who already has a saved row
 * (so clearing a player's numbers updates their row rather than leaving it behind).
 */
export function payloadFromDrafts(drafts, savedPlayerIds) {
    return Object.entries(drafts)
        .filter(([id, draft]) => !isBlankDraft(draft) || savedPlayerIds.has(Number(id)))
        .map(([id, draft]) => ({ player_id: Number(id), ...draft }))
}

/** The first thing wrong with one player's numbers, or null. The server checks again on save. */
export function draftProblem(draft) {
    if (draft.minutes_played < 0 || draft.minutes_played > MAX_MINUTES) {
        return `Minutes must be between 0 and ${MAX_MINUTES}`
    }

    const typed = GOAL_TYPE_FIELDS.reduce((sum, field) => sum + draft[field], 0)
    if (typed > draft.goals) return "The goal types add up to more than the goals scored"

    if (draft.started && draft.minutes_played === 0) return "Marked as started but has no minutes played"

    const didSomething = draft.goals + draft.assists + draft.yellow_cards + draft.red_cards > 0
    if (didSomething && draft.minutes_played === 0) {
        return "Goals, assists and cards need minutes played: this player did not play"
    }
    return null
}

/** Goals entered so far for a list of players. */
export function teamGoalTotal(players, drafts) {
    return players.reduce((sum, player) => sum + (drafts[player.id]?.goals ?? 0), 0)
}

/** Mark everyone with nothing entered as a starter for `minutes`; players with numbers are left alone. */
export function startersDraft(players, drafts, minutes) {
    const next = { ...drafts }
    for (const player of players) {
        if (isBlankDraft(drafts[player.id] ?? EMPTY_DRAFT)) {
            next[player.id] = { ...EMPTY_DRAFT, started: true, minutes_played: minutes }
        }
    }
    return next
}
