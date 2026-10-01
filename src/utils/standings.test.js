import { describe, expect, it } from "vitest"
import { computeStandings } from "./standings"

const team = (id, name) => ({ id, name })
const done = (id, home, away, homeScore, awayScore, date) => ({
    id,
    status: "completed",
    match_date: date,
    home_team: home,
    away_team: away,
    home_score: homeScore,
    away_score: awayScore,
})

const A = team(1, "Alpha FC")
const B = team(2, "Bravo FC")
const C = team(3, "Charlie FC")

describe("computeStandings", () => {
    it("returns every team with zeros when nothing has been played", () => {
        const table = computeStandings([A, B], [])
        expect(table.map((e) => e.team.id)).toEqual([1, 2])
        expect(table[0]).toMatchObject({ played: 0, points: 0, gd: 0, form: [] })
    })

    it("awards 3 points for a win and 1 for a draw", () => {
        const table = computeStandings([A, B, C], [
            done(1, A, B, 2, 0, "2026-07-01T15:00:00"),
            done(2, B, C, 1, 1, "2026-07-08T15:00:00"),
        ])
        const byId = Object.fromEntries(table.map((e) => [e.team.id, e]))
        expect(byId[1]).toMatchObject({ wins: 1, points: 3, gd: 2 })
        expect(byId[2]).toMatchObject({ losses: 1, draws: 1, points: 1 })
        expect(byId[3]).toMatchObject({ draws: 1, points: 1 })
    })

    it("ranks by points, then goal difference, then goals scored, then name", () => {
        const table = computeStandings([B, A], [
            done(1, A, B, 1, 1, "2026-07-01T15:00:00"),
        ])
        expect(table.map((e) => e.team.name)).toEqual(["Alpha FC", "Bravo FC"])
        expect(table.map((e) => e.position)).toEqual([1, 2])
    })

    it("ignores matches that are not completed", () => {
        const live = { ...done(1, A, B, 3, 0, "2026-07-01T15:00:00"), status: "live" }
        expect(computeStandings([A, B], [live])[0].played).toBe(0)
    })

    it("builds form from the last five results, oldest first", () => {
        const matches = [
            done(1, A, B, 1, 0, "2026-07-01T15:00:00"), // W
            done(2, A, B, 0, 0, "2026-07-02T15:00:00"), // D
            done(3, A, B, 0, 1, "2026-07-03T15:00:00"), // L
            done(4, A, B, 2, 0, "2026-07-04T15:00:00"), // W
            done(5, A, B, 3, 0, "2026-07-05T15:00:00"), // W
            done(6, A, B, 0, 2, "2026-07-06T15:00:00"), // L
        ]
        const entry = computeStandings([A, B], matches).find((e) => e.team.id === 1)
        expect(entry.form).toEqual(["D", "L", "W", "W", "L"])
    })

    it("reads form from the away side too", () => {
        const entry = computeStandings([A, B], [done(1, A, B, 0, 2, "2026-07-01T15:00:00")])
            .find((e) => e.team.id === 2)
        expect(entry.form).toEqual(["W"])
    })

    it("does not mutate its inputs", () => {
        const teams = [B, A]
        const matches = [done(1, A, B, 1, 0, "2026-07-01T15:00:00")]
        const snapshot = JSON.stringify({ teams, matches })
        computeStandings(teams, matches)
        expect(JSON.stringify({ teams, matches })).toBe(snapshot)
    })
})
