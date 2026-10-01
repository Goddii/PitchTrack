import { describe, expect, it } from "vitest"
import {
    EMPTY_DRAFT,
    draftFromRow,
    draftProblem,
    isBlankDraft,
    payloadFromDrafts,
    startersDraft,
    teamGoalTotal,
} from "./matchStatsForm"

const draft = (overrides) => ({ ...EMPTY_DRAFT, ...overrides })

describe("draftFromRow", () => {
    it("turns an API row into an editable draft", () => {
        const row = {
            player: { id: 4 }, started: true, minutes_played: 90, goals: 2, assists: 1, yellow_cards: 1, red_cards: 0,
            penalty_goals: 0, headed_goals: 1, right_foot_goals: 1, left_foot_goals: 0, match_id: 9,
        }
        expect(draftFromRow(row)).toEqual(draft({
            started: true, minutes_played: 90, goals: 2, assists: 1, yellow_cards: 1, headed_goals: 1, right_foot_goals: 1,
        }))
    })
})

describe("isBlankDraft", () => {
    it("is true for a player who has done nothing", () => {
        expect(isBlankDraft(EMPTY_DRAFT)).toBe(true)
    })

    it("is false once anything is set", () => {
        expect(isBlankDraft(draft({ started: true }))).toBe(false)
        expect(isBlankDraft(draft({ minutes_played: 12 }))).toBe(false)
        expect(isBlankDraft(draft({ red_cards: 1 }))).toBe(false)
    })
})

describe("payloadFromDrafts", () => {
    it("sends rows for players with something entered", () => {
        const payload = payloadFromDrafts({ 1: draft({ started: true, minutes_played: 90, goals: 1 }), 2: EMPTY_DRAFT }, new Set())
        expect(payload).toEqual([{ player_id: 1, ...draft({ started: true, minutes_played: 90, goals: 1 }) }])
    })

    it("keeps sending a player who already has a saved row, even if now blank", () => {
        const payload = payloadFromDrafts({ 2: EMPTY_DRAFT }, new Set([2]))
        expect(payload).toEqual([{ player_id: 2, ...EMPTY_DRAFT }])
    })

    it("uses numeric player ids", () => {
        const [row] = payloadFromDrafts({ "7": draft({ goals: 1 }) }, new Set())
        expect(row.player_id).toBe(7)
    })

    it("sends nothing when no one has anything", () => {
        expect(payloadFromDrafts({ 1: EMPTY_DRAFT }, new Set())).toEqual([])
    })
})

describe("draftProblem", () => {
    it("accepts a sensible draft", () => {
        expect(draftProblem(draft({ minutes_played: 90, goals: 2, right_foot_goals: 1 }))).toBeNull()
    })

    it("flags goal types that add up to more than the goals", () => {
        expect(draftProblem(draft({ goals: 1, right_foot_goals: 1, headed_goals: 1 }))).toMatch(/goal types/i)
    })

    it("flags minutes outside a match", () => {
        expect(draftProblem(draft({ minutes_played: 121 }))).toMatch(/minutes/i)
        expect(draftProblem(draft({ minutes_played: -1 }))).toMatch(/minutes/i)
    })

    it("flags a sent-off or booked player who did not play", () => {
        expect(draftProblem(draft({ minutes_played: 0, red_cards: 1 }))).toMatch(/did not play/i)
    })

    it("flags a starter with no minutes", () => {
        expect(draftProblem(draft({ started: true, minutes_played: 0 }))).toMatch(/started/i)
    })
})

describe("teamGoalTotal", () => {
    it("adds up the goals entered for a list of players", () => {
        const drafts = { 1: draft({ goals: 2 }), 2: draft({ goals: 1 }), 3: draft({ goals: 5 }) }
        expect(teamGoalTotal([{ id: 1 }, { id: 2 }], drafts)).toBe(3)
    })

    it("treats players with no draft as zero", () => {
        expect(teamGoalTotal([{ id: 9 }], {})).toBe(0)
    })
})

describe("startersDraft", () => {
    it("marks blank players as starters for the given minutes and leaves entered ones alone", () => {
        const drafts = { 1: EMPTY_DRAFT, 2: draft({ started: true, minutes_played: 60, goals: 1 }) }
        const result = startersDraft([{ id: 1 }, { id: 2 }], drafts, 90)
        expect(result[1]).toEqual(draft({ started: true, minutes_played: 90 }))
        expect(result[2]).toEqual(draft({ started: true, minutes_played: 60, goals: 1 }))
    })

    it("does not change the drafts it is given", () => {
        const drafts = { 1: EMPTY_DRAFT }
        startersDraft([{ id: 1 }], drafts, 90)
        expect(drafts[1]).toEqual(EMPTY_DRAFT)
    })
})
