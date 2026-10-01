import { describe, expect, it } from "vitest"
import { rosterGroups } from "./roster"

let nextId = 1
const row = (position, jersey, name, overrides = {}) => ({
    started: true,
    player: { id: nextId++, name, position, jersey_number: jersey, team_id: 1 },
    ...overrides,
})

const ROWS = [
    row("Forward", 9, "Ade Kamau"),
    row("Goalkeeper", 1, "Otis Mwangi"),
    row("Defender", 4, "Brian Otieno"),
    row("Defender", 2, "Dan Njoroge", { started: false }),
    row("Midfielder", 8, "Kevin Wafula"),
    { ...row("Forward", 11, "Rival Striker"), player: { id: 500, name: "Rival Striker", position: "Forward", jersey_number: 11, team_id: 2 } },
]

describe("rosterGroups", () => {
    it("groups one team's players by position in pitch order", () => {
        const groups = rosterGroups(ROWS, { teamId: 1 })

        expect(groups.map((g) => g.label)).toEqual(["Goalkeepers", "Defenders", "Midfielders", "Forwards"])
    })

    it("excludes the other team", () => {
        const names = rosterGroups(ROWS, { teamId: 1 }).flatMap((g) => g.rows.map((r) => r.player.name))

        expect(names).not.toContain("Rival Striker")
    })

    it("lists starters before substitutes, then by jersey number", () => {
        const defenders = rosterGroups(ROWS, { teamId: 1 }).find((g) => g.position === "Defender")

        expect(defenders.rows.map((r) => r.player.name)).toEqual(["Brian Otieno", "Dan Njoroge"])
    })

    it("filters to a single position", () => {
        const groups = rosterGroups(ROWS, { teamId: 1, position: "Defender" })

        expect(groups).toHaveLength(1)
        expect(groups[0].rows).toHaveLength(2)
    })

    it("searches names without regard to case", () => {
        const groups = rosterGroups(ROWS, { teamId: 1, query: "  KEV " })

        expect(groups).toHaveLength(1)
        expect(groups[0].rows[0].player.name).toBe("Kevin Wafula")
    })

    it("searches by jersey number", () => {
        const groups = rosterGroups(ROWS, { teamId: 1, query: "9" })

        expect(groups[0].rows[0].player.name).toBe("Ade Kamau")
    })

    it("omits empty groups and returns nothing when nobody matches", () => {
        expect(rosterGroups(ROWS, { teamId: 1, query: "zzz" })).toEqual([])
        expect(rosterGroups([], { teamId: 1 })).toEqual([])
    })
})
