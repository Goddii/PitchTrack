import { describe, expect, it } from "vitest"
import { describeMatchRow, recentForm, squadLeaders } from "./matchLog"

const row = (overrides) => ({
    status: "completed",
    was_home: true,
    home_score: 2,
    away_score: 1,
    opponent: { id: 2, name: "Bravo FC" },
    ...overrides,
})

describe("describeMatchRow", () => {
    it("shows the player's own side first when they were at home", () => {
        expect(describeMatchRow(row({}))).toEqual({
            opponent: "Bravo FC",
            side: "H",
            scoreText: "2 - 1",
            result: "W",
            live: false,
        })
    })

    it("flips the score when the player was away", () => {
        const described = describeMatchRow(row({ was_home: false, home_score: 0, away_score: 3 }))
        expect(described.side).toBe("A")
        expect(described.scoreText).toBe("3 - 0")
        expect(described.result).toBe("W")
    })

    it("reads draws and defeats from the player's side", () => {
        expect(describeMatchRow(row({ home_score: 1, away_score: 1 })).result).toBe("D")
        expect(describeMatchRow(row({ was_home: false, home_score: 2, away_score: 1 })).result).toBe("L")
    })

    it("marks a live match with no result yet", () => {
        const described = describeMatchRow(row({ status: "live", home_score: 1, away_score: 0 }))
        expect(described.live).toBe(true)
        expect(described.result).toBeNull()
        expect(described.scoreText).toBe("1 - 0")
    })

    it("has no score text when scores are missing", () => {
        const described = describeMatchRow(row({ home_score: null, away_score: null }))
        expect(described.scoreText).toBeNull()
        expect(described.result).toBeNull()
    })

    it("copes with a missing opponent", () => {
        expect(describeMatchRow(row({ opponent: null })).opponent).toBe("TBD")
    })
})

describe("recentForm", () => {
    const completed = (result) => {
        const scores = { W: [2, 0], D: [1, 1], L: [0, 2] }[result]
        return row({ home_score: scores[0], away_score: scores[1] })
    }

    it("returns completed results oldest first from a newest-first log", () => {
        const log = [completed("W"), row({ status: "live" }), completed("L"), completed("D")]
        expect(recentForm(log)).toEqual(["D", "L", "W"])
    })

    it("keeps only the latest five", () => {
        const log = ["W", "W", "W", "W", "W", "L", "L"].map(completed)
        expect(recentForm(log)).toEqual(["W", "W", "W", "W", "W"])
    })

    it("is empty with no completed matches", () => {
        expect(recentForm([])).toEqual([])
    })
})

describe("squadLeaders", () => {
    const entry = (id, name, goals, minutes = 90) => ({ player: { id, name }, goals, assists: 0, minutes })

    it("ranks by the chosen stat, highest first", () => {
        const leaders = squadLeaders([entry(1, "A", 1), entry(2, "B", 3), entry(3, "C", 2)], "goals")
        expect(leaders.map((e) => e.player.id)).toEqual([2, 3, 1])
    })

    it("leaves out players on zero", () => {
        expect(squadLeaders([entry(1, "A", 0), entry(2, "B", 2)], "goals").map((e) => e.player.id)).toEqual([2])
    })

    it("limits to the top three by default", () => {
        const many = [1, 2, 3, 4, 5].map((n) => entry(n, `P${n}`, n))
        expect(squadLeaders(many, "goals")).toHaveLength(3)
    })

    it("breaks ties by fewer minutes, then name", () => {
        const tied = [entry(1, "Zed", 2, 180), entry(2, "Abe", 2, 90), entry(3, "Amy", 2, 90)]
        expect(squadLeaders(tied, "goals").map((e) => e.player.name)).toEqual(["Abe", "Amy", "Zed"])
    })

    it("does not change the list it is given", () => {
        const input = [entry(1, "A", 1), entry(2, "B", 3)]
        const snapshot = [...input]
        squadLeaders(input, "goals")
        expect(input).toEqual(snapshot)
    })
})
