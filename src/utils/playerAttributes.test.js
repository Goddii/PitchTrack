import { describe, expect, it } from "vitest"
import { attributeGauges, attributeLabel } from "./playerAttributes"

describe("attributeLabel", () => {
    it("uses the friendly name for known attributes", () => {
        expect(attributeLabel("shooting")).toBe("Shooting")
        expect(attributeLabel("reflexes")).toBe("Reflexes")
    })

    it("falls back to the raw key for unknown attributes", () => {
        expect(attributeLabel("vision")).toBe("vision")
    })
})

describe("attributeGauges", () => {
    it("returns an empty list when attributes are missing or empty", () => {
        expect(attributeGauges(null)).toEqual([])
        expect(attributeGauges(undefined)).toEqual([])
        expect(attributeGauges({})).toEqual([])
        expect(attributeGauges("nope")).toEqual([])
    })

    it("keeps the order the attributes were stored in", () => {
        const gauges = attributeGauges({ pace: 70, shooting: 60, passing: 80 })
        expect(gauges.map((g) => g.key)).toEqual(["pace", "shooting", "passing"])
        expect(gauges[0]).toEqual({ key: "pace", label: "Pace", value: 70 })
    })

    it("clamps values into 0-100 and treats non-numbers as zero", () => {
        const gauges = attributeGauges({ pace: 140, shooting: -5, passing: "x" })
        expect(gauges.map((g) => g.value)).toEqual([100, 0, 0])
    })

    it("limits the number of gauges when a max is given", () => {
        const gauges = attributeGauges({ a: 1, b: 2, c: 3, d: 4 }, 2)
        expect(gauges.map((g) => g.key)).toEqual(["a", "b"])
    })
})
