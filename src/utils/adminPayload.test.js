import { describe, expect, it } from "vitest"
import { normalizePayload, toNullableInt } from "./adminPayload"

describe("toNullableInt", () => {
    it("turns blank values into null", () => {
        expect(toNullableInt("")).toBeNull()
        expect(toNullableInt(null)).toBeNull()
        expect(toNullableInt(undefined)).toBeNull()
    })

    it("turns non-numeric text into null", () => {
        expect(toNullableInt("abc")).toBeNull()
    })

    it("converts numeric strings and numbers to whole numbers", () => {
        expect(toNullableInt("1998")).toBe(1998)
        expect(toNullableInt(7)).toBe(7)
        expect(toNullableInt("3.9")).toBe(3)
        expect(toNullableInt("0")).toBe(0)
    })
})

describe("normalizePayload", () => {
    it("sends null instead of an empty string for a team's founded_year", () => {
        const payload = normalizePayload("teams", { name: "Riverside FC", founded_year: "" })
        expect(payload.founded_year).toBeNull()
    })

    it("coerces player integer fields, including the team id from the select", () => {
        const payload = normalizePayload("players", { team_id: "3", jersey_number: "9", age: "" })
        expect(payload).toMatchObject({ team_id: 3, jersey_number: 9, age: null })
    })

    it("keeps a 0-0 scoreline as numbers, not nulls", () => {
        const payload = normalizePayload("matches", { home_score: "0", away_score: "0", minute: "" })
        expect(payload).toMatchObject({ home_score: 0, away_score: 0, minute: null })
    })

    it("trims string values", () => {
        const payload = normalizePayload("teams", { name: "  Kestrel City ", city: " Dunmore" })
        expect(payload).toMatchObject({ name: "Kestrel City", city: "Dunmore" })
    })

    it("leaves non-string, non-integer values such as attributes untouched", () => {
        const attributes = { pace: 80 }
        expect(normalizePayload("players", { attributes }).attributes).toBe(attributes)
    })

    it("does not mutate its input", () => {
        const input = { founded_year: "1998", name: " x " }
        normalizePayload("teams", input)
        expect(input).toEqual({ founded_year: "1998", name: " x " })
    })

    it("ignores integer coercion for an unknown section", () => {
        expect(normalizePayload("nope", { age: "5" })).toEqual({ age: "5" })
    })
})
