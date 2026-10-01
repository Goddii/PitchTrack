import { describe, expect, it } from "vitest"
import { donutArcs, goalBreakdown } from "./goalBreakdown"

const stats = (overrides) => ({
    goals: 0,
    penalty_goals: 0,
    headed_goals: 0,
    right_foot_goals: 0,
    left_foot_goals: 0,
    ...overrides,
})

describe("goalBreakdown", () => {
    it("has no slices when the player has not scored", () => {
        expect(goalBreakdown(stats({}))).toEqual({ slices: [], total: 0, unclassified: 0 })
    })

    it("lists the types that have goals, right foot first, with their share", () => {
        const { slices, total, unclassified } = goalBreakdown(
            stats({ goals: 5, headed_goals: 1, left_foot_goals: 1, right_foot_goals: 3 })
        )
        expect(slices.map((s) => s.key)).toEqual(["right_foot_goals", "left_foot_goals", "headed_goals"])
        expect(slices.map((s) => s.label)).toEqual(["Right foot", "Left foot", "Headers"])
        expect(slices.map((s) => s.value)).toEqual([3, 1, 1])
        expect(slices[0].fraction).toBeCloseTo(0.6)
        expect(total).toBe(5)
        expect(unclassified).toBe(0)
    })

    it("leaves out types with no goals", () => {
        const { slices } = goalBreakdown(stats({ goals: 2, penalty_goals: 2 }))
        expect(slices.map((s) => s.key)).toEqual(["penalty_goals"])
    })

    it("reports goals that have no type yet", () => {
        const result = goalBreakdown(stats({ goals: 4, right_foot_goals: 1 }))
        expect(result.unclassified).toBe(3)
        expect(result.slices[0].fraction).toBe(1)
    })

    it("has no slices when none of the goals are classified", () => {
        const result = goalBreakdown(stats({ goals: 3 }))
        expect(result.slices).toEqual([])
        expect(result.unclassified).toBe(3)
    })
})

describe("donutArcs", () => {
    it("turns shares into arc lengths and starting points around a 100-unit ring", () => {
        const arcs = donutArcs([
            { key: "a", fraction: 0.5 },
            { key: "b", fraction: 0.25 },
            { key: "c", fraction: 0.25 },
        ])
        expect(arcs.map((a) => a.key)).toEqual(["a", "b", "c"])
        expect(arcs.map((a) => a.length)).toEqual([50, 25, 25])
        expect(arcs.map((a) => a.start)).toEqual([0, 50, 75])
    })

    it("is empty with no slices", () => {
        expect(donutArcs([])).toEqual([])
    })
})
