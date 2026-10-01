import { describe, expect, it } from "vitest"
import { computeOverallRating, ratingTier, rankByRating } from "./playerRating"

describe("computeOverallRating", () => {
    it("returns null when attributes are missing or empty", () => {
        expect(computeOverallRating(null)).toBeNull()
        expect(computeOverallRating(undefined)).toBeNull()
        expect(computeOverallRating({})).toBeNull()
        expect(computeOverallRating("nope")).toBeNull()
    })

    it("averages the attribute values and scales to a 0-10 rating", () => {
        expect(computeOverallRating({ pace: 80, shooting: 60 })).toBe(7)
    })

    it("works for the goalkeeper attribute set too", () => {
        expect(computeOverallRating({ diving: 90, handling: 70, reflexes: 80 })).toBe(8)
    })
})

describe("ratingTier", () => {
    it("uses emerald from 7.5 up", () => {
        expect(ratingTier(7.5)).toContain("emerald")
        expect(ratingTier(9)).toContain("emerald")
    })

    it("uses amber from 6 up to just under 7.5", () => {
        expect(ratingTier(6)).toContain("amber")
        expect(ratingTier(7.4)).toContain("amber")
    })

    it("uses red below 6", () => {
        expect(ratingTier(5.9)).toContain("red")
    })
})

describe("rankByRating", () => {
    const player = (id, name, attributes) => ({ id, name, attributes })

    it("orders players by overall rating, highest first", () => {
        const ranked = rankByRating([
            player(1, "Low", { a: 50, b: 50 }),
            player(2, "High", { a: 90, b: 90 }),
            player(3, "Mid", { a: 70, b: 70 }),
        ])
        expect(ranked.map((r) => r.player.id)).toEqual([2, 3, 1])
        expect(ranked[0].rating).toBe(9)
    })

    it("puts players without attributes last", () => {
        const ranked = rankByRating([player(1, "None", null), player(2, "Some", { a: 40 })])
        expect(ranked.map((r) => r.player.id)).toEqual([2, 1])
        expect(ranked[1].rating).toBeNull()
    })

    it("breaks ties by name and does not mutate the input", () => {
        const input = [player(1, "Zed", { a: 60 }), player(2, "Abe", { a: 60 })]
        const snapshot = [...input]
        expect(rankByRating(input).map((r) => r.player.name)).toEqual(["Abe", "Zed"])
        expect(input).toEqual(snapshot)
    })
})
