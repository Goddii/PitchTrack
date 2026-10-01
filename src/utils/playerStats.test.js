import { describe, expect, it } from "vitest"
import { statRings, teamActivity } from "./playerStats"

const match = (status, homeId, awayId, homeScore, awayScore) => ({
    status,
    home_team: { id: homeId },
    away_team: { id: awayId },
    home_score: homeScore,
    away_score: awayScore,
})

describe("teamActivity", () => {
    it("is empty when the team has played nothing", () => {
        expect(teamActivity(1, [])).toEqual({ played: 0, goalsFor: 0 })
    })

    it("counts completed and live matches but not scheduled ones", () => {
        const matches = [match("completed", 1, 2, 2, 0), match("live", 3, 1, 0, 1), match("scheduled", 1, 2, null, null)]
        expect(teamActivity(1, matches).played).toBe(2)
    })

    it("sums the team's own goals whether it played home or away", () => {
        const matches = [match("completed", 1, 2, 3, 1), match("completed", 2, 1, 0, 2)]
        expect(teamActivity(1, matches).goalsFor).toBe(5)
    })

    it("ignores matches the team did not play in", () => {
        expect(teamActivity(1, [match("completed", 2, 3, 4, 4)])).toEqual({ played: 0, goalsFor: 0 })
    })
})

describe("statRings", () => {
    const stats = { appearances: 3, starts: 2, minutes: 225, goals: 2, assists: 1, yellow_cards: 0, red_cards: 0 }
    const activity = { played: 4, goalsFor: 8 }

    it("returns the five rings in order with display values", () => {
        const rings = statRings(stats, activity)
        expect(rings.map((r) => r.key)).toEqual(["appearances", "starts", "minutes", "goals", "assists"])
        expect(rings.map((r) => r.display)).toEqual(["3", "2", "225", "2", "1"])
        expect(rings.map((r) => r.label)).toEqual(["Appearances", "Starts", "Minutes", "Goals", "Assists"])
    })

    it("fills each ring by its share of what the team played", () => {
        const byKey = Object.fromEntries(statRings(stats, activity).map((r) => [r.key, r.ratio]))
        expect(byKey.appearances).toBeCloseTo(3 / 4)
        expect(byKey.starts).toBeCloseTo(2 / 4)
        expect(byKey.minutes).toBeCloseTo(225 / 360)
        expect(byKey.goals).toBeCloseTo(2 / 8)
        expect(byKey.assists).toBeCloseTo(1 / 8)
    })

    it("leaves rings empty when the team has no matches or goals yet", () => {
        const rings = statRings(stats, { played: 0, goalsFor: 0 })
        expect(rings.every((r) => r.ratio === 0)).toBe(true)
    })

    it("never fills a ring past full", () => {
        const rings = statRings({ ...stats, goals: 20 }, { played: 4, goalsFor: 8 })
        expect(rings.find((r) => r.key === "goals").ratio).toBe(1)
    })
})
