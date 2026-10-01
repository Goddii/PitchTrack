import { describe, expect, test } from "vitest"
import { summarizeTeam } from "./teamSummary"

const A = { id: 1, name: "Alpha" }
const B = { id: 2, name: "Bravo" }
const C = { id: 3, name: "Charlie" }
const TEAMS = [A, B, C]

let nextId = 1
const match = (home, away, hs, as, status = "completed", date = "2026-01-01") => ({
    id: nextId++,
    home_team: home,
    away_team: away,
    home_score: hs,
    away_score: as,
    status,
    match_date: date,
})

describe("summarizeTeam", () => {
    test("reads league position, points, played and goal difference from the table", () => {
        const matches = [match(A, B, 2, 0, "completed", "2026-01-01"), match(C, A, 1, 1, "completed", "2026-01-08")]

        const { league } = summarizeTeam(A, TEAMS, matches)

        expect(league).toMatchObject({ position: 1, points: 4, played: 2, gd: 2 })
    })

    test("limits recent results to the last ten, newest last, with win rate", () => {
        const matches = Array.from({ length: 12 }, (_, i) =>
            match(A, B, i < 2 ? 0 : 1, 0, "completed", `2026-02-${String(i + 1).padStart(2, "0")}`)
        )

        const { lastTen } = summarizeTeam(A, TEAMS, matches)

        expect(lastTen).toMatchObject({ wins: 10, draws: 0, losses: 0, goalsFor: 10, goalsAgainst: 0, winRate: 100 })
    })

    test("win rate is zero when nothing has been played", () => {
        expect(summarizeTeam(A, TEAMS, []).lastTen).toMatchObject({ played: 0, winRate: 0 })
    })

    test("picks the earliest non-completed match as next match", () => {
        const later = match(A, B, null, null, "scheduled", "2026-09-10")
        const sooner = match(C, A, null, null, "scheduled", "2026-09-01")

        expect(summarizeTeam(A, TEAMS, [later, sooner]).nextMatch).toBe(sooner)
    })

    test("next match is null when the team has nothing to play", () => {
        expect(summarizeTeam(A, TEAMS, [match(A, B, 1, 0)]).nextMatch).toBeNull()
    })
})
