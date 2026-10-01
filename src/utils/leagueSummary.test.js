import { describe, expect, it } from "vitest"
import { pickFeaturedMatch, pickFixtureStrip, summarizeLeague } from "./leagueSummary"

const match = (id, status, date, extra = {}) => ({
    id,
    status,
    match_date: date,
    home_score: null,
    away_score: null,
    ...extra,
})

describe("pickFeaturedMatch", () => {
    it("returns null for no matches", () => {
        expect(pickFeaturedMatch([])).toBeNull()
        expect(pickFeaturedMatch(undefined)).toBeNull()
    })

    it("prefers a live match over everything else", () => {
        const matches = [
            match(1, "scheduled", "2026-08-01T15:00:00"),
            match(2, "live", "2026-08-02T15:00:00"),
            match(3, "completed", "2026-07-01T15:00:00"),
        ]
        expect(pickFeaturedMatch(matches).id).toBe(2)
    })

    it("falls back to the soonest scheduled match", () => {
        const matches = [
            match(1, "scheduled", "2026-08-09T15:00:00"),
            match(2, "scheduled", "2026-08-01T15:00:00"),
            match(3, "completed", "2026-07-01T15:00:00"),
        ]
        expect(pickFeaturedMatch(matches).id).toBe(2)
    })

    it("falls back to the latest result when nothing is live or scheduled", () => {
        const matches = [
            match(1, "completed", "2026-07-01T15:00:00"),
            match(2, "completed", "2026-07-20T15:00:00"),
        ]
        expect(pickFeaturedMatch(matches).id).toBe(2)
    })
})

describe("summarizeLeague", () => {
    it("returns zeros for an empty league", () => {
        expect(summarizeLeague()).toEqual({ clubs: 0, players: 0, played: 0, live: 0, ahead: 0, goals: 0 })
    })

    it("counts clubs, players and matches by status", () => {
        const summary = summarizeLeague({
            teams: [{ id: 1 }, { id: 2 }],
            players: [{ id: 1 }, { id: 2 }, { id: 3 }],
            matches: [
                match(1, "completed", "2026-07-01T15:00:00", { home_score: 2, away_score: 1 }),
                match(2, "live", "2026-07-02T15:00:00", { home_score: 1, away_score: 0 }),
                match(3, "scheduled", "2026-08-01T15:00:00"),
            ],
        })
        expect(summary).toMatchObject({ clubs: 2, players: 3, played: 1, live: 1, ahead: 1 })
    })

    it("sums goals from finished and live matches only, treating missing scores as zero", () => {
        const summary = summarizeLeague({
            matches: [
                match(1, "completed", "2026-07-01T15:00:00", { home_score: 3, away_score: 2 }),
                match(2, "live", "2026-07-02T15:00:00", { home_score: 1, away_score: null }),
                match(3, "scheduled", "2026-08-01T15:00:00", { home_score: 9, away_score: 9 }),
            ],
        })
        expect(summary.goals).toBe(6)
    })
})

describe("pickFixtureStrip", () => {
    const ids = (list) => list.map((m) => m.id)

    it("returns an empty list for no matches", () => {
        expect(pickFixtureStrip([])).toEqual([])
        expect(pickFixtureStrip(undefined)).toEqual([])
    })

    it("mixes the latest results with the next fixtures in date order", () => {
        const matches = [
            match(1, "completed", "2026-07-01T15:00:00"),
            match(2, "completed", "2026-07-08T15:00:00"),
            match(3, "completed", "2026-07-15T15:00:00"),
            match(4, "scheduled", "2026-08-01T15:00:00"),
            match(5, "scheduled", "2026-08-08T15:00:00"),
            match(6, "scheduled", "2026-08-15T15:00:00"),
            match(7, "scheduled", "2026-08-22T15:00:00"),
        ]
        expect(ids(pickFixtureStrip(matches, 5))).toEqual([2, 3, 4, 5, 6])
    })

    it("always includes live matches", () => {
        const matches = [
            match(1, "completed", "2026-07-01T15:00:00"),
            match(2, "live", "2026-07-20T15:00:00"),
            match(3, "scheduled", "2026-08-01T15:00:00"),
        ]
        expect(ids(pickFixtureStrip(matches, 2))).toContain(2)
    })

    it("backfills with more results when few fixtures are scheduled", () => {
        const matches = [
            match(1, "completed", "2026-07-01T15:00:00"),
            match(2, "completed", "2026-07-08T15:00:00"),
            match(3, "completed", "2026-07-15T15:00:00"),
            match(4, "completed", "2026-07-22T15:00:00"),
            match(5, "scheduled", "2026-08-01T15:00:00"),
        ]
        expect(ids(pickFixtureStrip(matches, 4))).toEqual([2, 3, 4, 5])
    })

    it("does not mutate the input list", () => {
        const matches = [
            match(2, "scheduled", "2026-08-08T15:00:00"),
            match(1, "scheduled", "2026-08-01T15:00:00"),
        ]
        const snapshot = [...matches]
        pickFixtureStrip(matches)
        expect(matches).toEqual(snapshot)
    })
})
