import { describe, expect, it } from "vitest"
import { per90, squadAttributeStats } from "./playerComparison"

const mate = (attributes) => ({ attributes })

describe("squadAttributeStats", () => {
    const squad = [mate({ pace: 60 }), mate({ pace: 70 }), mate({ pace: 80 }), mate({ pace: 90 })]

    it("returns an empty list when the player has no attributes", () => {
        expect(squadAttributeStats(null, squad)).toEqual([])
        expect(squadAttributeStats({}, squad)).toEqual([])
    })

    it("adds the squad average and best for each attribute", () => {
        const [pace] = squadAttributeStats({ pace: 70 }, squad)
        expect(pace).toEqual({ key: "pace", label: "Pace", value: 70, average: 75, best: 90 })
    })

    it("only compares against players who have that attribute", () => {
        const mixed = [mate({ pace: 60 }), mate({ pace: 80 }), mate({ pace: 70 }), mate({ diving: 90 }), mate(null)]
        const [pace] = squadAttributeStats({ pace: 70 }, mixed)
        expect(pace.average).toBe(70)
        expect(pace.best).toBe(80)
    })

    it("hides the comparison when too few players are rated", () => {
        const [pace] = squadAttributeStats({ pace: 70 }, [mate({ pace: 70 }), mate({ pace: 80 })])
        expect(pace.average).toBeNull()
        expect(pace.best).toBeNull()
    })

    it("keeps the stored attribute order", () => {
        const stats = squadAttributeStats({ pace: 70, shooting: 60 }, squad)
        expect(stats.map((s) => s.key)).toEqual(["pace", "shooting"])
    })
})

describe("per90", () => {
    it("scales goals and assists to 90 minutes", () => {
        const result = per90({ appearances: 2, minutes: 180, goals: 3, assists: 1 })
        expect(result.goals).toBeCloseTo(1.5)
        expect(result.assists).toBeCloseTo(0.5)
    })

    it("averages minutes over appearances", () => {
        expect(per90({ appearances: 3, minutes: 200, goals: 0, assists: 0 }).minutesPerAppearance).toBe(67)
    })

    it("gives nulls when the player has not played", () => {
        expect(per90({ appearances: 0, minutes: 0, goals: 0, assists: 0 })).toEqual({
            goals: null,
            assists: null,
            minutesPerAppearance: null,
        })
    })
})
