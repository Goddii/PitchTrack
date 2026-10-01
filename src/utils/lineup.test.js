import { describe, expect, it } from "vitest"
import { buildLineup, layoutLineup, shortName } from "./lineup"

let nextId = 1
const row = (position, jersey, overrides = {}) => ({
    match_id: 1,
    started: true,
    minutes_played: 90,
    player: { id: nextId++, name: `${position} ${jersey}`, position, jersey_number: jersey, team_id: 1 },
    ...overrides,
})

/** A full 4-3-3 for one team. */
const fourThreeThree = () => [
    row("Goalkeeper", 1),
    ...[2, 3, 4, 5].map((n) => row("Defender", n)),
    ...[6, 8, 10].map((n) => row("Midfielder", n)),
    ...[7, 9, 11].map((n) => row("Forward", n)),
]

describe("buildLineup", () => {
    it("keeps only the starters of the requested team", () => {
        const rows = [
            ...fourThreeThree(),
            row("Forward", 20, { started: false, minutes_played: 15 }),
            { ...row("Forward", 9), player: { id: 999, name: "Rival", position: "Forward", jersey_number: 9, team_id: 2 } },
        ]

        const lineup = buildLineup(rows, 1)

        expect(lineup.starters).toHaveLength(11)
        expect(lineup.starters.every((r) => r.player.team_id === 1 && r.started)).toBe(true)
    })

    it("groups starters into lines ordered by jersey number", () => {
        const rows = [row("Defender", 5), row("Defender", 2), row("Goalkeeper", 1)]

        const lineup = buildLineup(rows, 1)

        expect(lineup.lines.Defender.map((r) => r.player.jersey_number)).toEqual([2, 5])
        expect(lineup.lines.Goalkeeper).toHaveLength(1)
        expect(lineup.lines.Midfielder).toEqual([])
    })

    it("derives the formation from the outfield lines", () => {
        expect(buildLineup(fourThreeThree(), 1).formation).toBe("4-3-3")
    })

    it("has no formation when nobody has been picked", () => {
        const lineup = buildLineup([], 1)

        expect(lineup.formation).toBeNull()
        expect(lineup.starters).toEqual([])
    })

    it("flags a lineup that does not have eleven starters", () => {
        expect(buildLineup(fourThreeThree(), 1).isComplete).toBe(true)
        expect(buildLineup(fourThreeThree().slice(0, 8), 1).isComplete).toBe(false)
    })

    it("accepts positions in any letter case", () => {
        const lineup = buildLineup([row("goalkeeper", 1), row("FORWARD", 9)], 1)

        expect(lineup.lines.Goalkeeper).toHaveLength(1)
        expect(lineup.lines.Forward).toHaveLength(1)
    })

    it("reports starters with an unknown position instead of dropping them", () => {
        const lineup = buildLineup([row("Goalkeeper", 1), row("Winger", 7)], 1)

        expect(lineup.unplaced.map((r) => r.player.position)).toEqual(["Winger"])
        expect(lineup.starters).toHaveLength(1)
    })

    it("does not mutate the rows it is given", () => {
        const rows = fourThreeThree()
        const snapshot = JSON.stringify(rows)

        buildLineup(rows, 1)

        expect(JSON.stringify(rows)).toBe(snapshot)
    })
})

describe("buildLineup with a stored formation", () => {
    const jerseysByLine = (lineup) => lineup.shape.map((line) => line.map((r) => r.player.jersey_number))

    it("uses the stored formation to split the outfield into lines", () => {
        const lineup = buildLineup(fourThreeThree(), 1, "4-2-3-1")

        expect(lineup.formation).toBe("4-2-3-1")
        expect(jerseysByLine(lineup)).toEqual([[1], [2, 3, 4, 5], [6, 8], [10, 7, 9], [11]])
    })

    it("falls back to the position lines when no formation is stored", () => {
        const lineup = buildLineup(fourThreeThree(), 1, null)

        expect(lineup.formation).toBe("4-3-3")
        expect(jerseysByLine(lineup)).toEqual([[1], [2, 3, 4, 5], [6, 8, 10], [7, 9, 11]])
    })

    it("ignores a stored formation that does not add up to the outfield starters", () => {
        const partial = fourThreeThree().slice(0, 8)

        const lineup = buildLineup(partial, 1, "4-3-3")

        expect(lineup.formation).toBe("4-3-0")
    })

    it("ignores stored text that is not a formation", () => {
        expect(buildLineup(fourThreeThree(), 1, "banana").formation).toBe("4-3-3")
        expect(buildLineup(fourThreeThree(), 1, "").formation).toBe("4-3-3")
    })

    it("always starts the shape with the goalkeeper line, even when there is none", () => {
        const lineup = buildLineup(fourThreeThree().slice(1), 1)

        expect(lineup.shape[0]).toEqual([])
        expect(lineup.shape).toHaveLength(4)
    })
})

describe("layoutLineup", () => {
    const lines = () => buildLineup(fourThreeThree(), 1).shape

    it("places every starter once", () => {
        const slots = layoutLineup(lines(), "home")

        expect(slots).toHaveLength(11)
        expect(new Set(slots.map((s) => s.row.player.id)).size).toBe(11)
    })

    it("puts the home keeper at the bottom and attackers nearest the halfway line", () => {
        const slots = layoutLineup(lines(), "home")
        const yOf = (position) => slots.find((s) => s.row.player.position === position).y

        expect(yOf("Goalkeeper")).toBeGreaterThan(yOf("Defender"))
        expect(yOf("Defender")).toBeGreaterThan(yOf("Midfielder"))
        expect(yOf("Midfielder")).toBeGreaterThan(yOf("Forward"))
        expect(yOf("Forward")).toBeGreaterThan(50)
    })

    it("mirrors the away side into the top half", () => {
        const home = layoutLineup(lines(), "home")
        const away = layoutLineup(lines(), "away")

        away.forEach((slot, i) => {
            expect(slot.y).toBeCloseTo(100 - home[i].y)
            expect(slot.x).toBeCloseTo(100 - home[i].x)
        })
        expect(away.every((s) => s.y < 50)).toBe(true)
    })

    it("spreads a line evenly across the width, inside the touchlines", () => {
        const defenders = layoutLineup(lines(), "home").filter((s) => s.row.player.position === "Defender")
        const xs = defenders.map((s) => s.x)

        expect(xs).toEqual([...xs].sort((a, b) => a - b))
        expect(xs[0]).toBeGreaterThan(0)
        expect(xs[3]).toBeLessThan(100)
        expect(xs[1] - xs[0]).toBeCloseTo(xs[2] - xs[1])
    })

    it("centres a lone player", () => {
        const slots = layoutLineup(buildLineup([row("Goalkeeper", 1)], 1).shape, "home")

        expect(slots[0].x).toBe(50)
    })

    it("gives every line of a four-line formation its own row, all in the home half", () => {
        const shape = buildLineup(fourThreeThree(), 1, "4-2-3-1").shape
        const rowYs = [...new Set(layoutLineup(shape, "home").map((s) => s.y))]

        expect(rowYs).toHaveLength(5)
        expect([...rowYs].sort((a, b) => b - a)).toEqual(rowYs)
        expect(Math.min(...rowYs)).toBeGreaterThan(50)
    })
})

describe("shortName", () => {
    it("uses the last word of a full name", () => {
        expect(shortName("Ade Kamau")).toBe("Kamau")
        expect(shortName("  Juan  Carlos de la Cruz ")).toBe("Cruz")
    })

    it("keeps a single name as it is", () => {
        expect(shortName("Pele")).toBe("Pele")
    })

    it("falls back to an empty label for a missing name", () => {
        expect(shortName(undefined)).toBe("")
        expect(shortName("   ")).toBe("")
    })
})

describe("layoutLineup on a landscape pitch", () => {
    const shape = () => buildLineup(fourThreeThree(), 1).shape
    const slotFor = (slots, position) => slots.find((s) => s.row.player.position === position)

    it("puts the home goalkeeper on the left with attackers nearest the halfway line", () => {
        const slots = layoutLineup(shape(), "home", "landscape")
        const xOf = (position) => slotFor(slots, position).x

        expect(xOf("Goalkeeper")).toBeLessThan(xOf("Defender"))
        expect(xOf("Defender")).toBeLessThan(xOf("Midfielder"))
        expect(xOf("Midfielder")).toBeLessThan(xOf("Forward"))
        expect(xOf("Forward")).toBeLessThan(50)
    })

    it("puts the away side in the right half, mirrored", () => {
        const home = layoutLineup(shape(), "home", "landscape")
        const away = layoutLineup(shape(), "away", "landscape")

        away.forEach((slot, i) => {
            expect(slot.x).toBeCloseTo(100 - home[i].x)
            expect(slot.y).toBeCloseTo(100 - home[i].y)
        })
        expect(away.every((s) => s.x > 50)).toBe(true)
    })

    it("spreads a line evenly from top to bottom", () => {
        const defenders = layoutLineup(shape(), "home", "landscape").filter((s) => s.row.player.position === "Defender")
        const ys = defenders.map((s) => s.y)

        expect(ys[0]).toBeGreaterThan(0)
        expect(ys[3]).toBeLessThan(100)
        expect(ys[1] - ys[0]).toBeCloseTo(ys[2] - ys[1])
    })

    it("keeps portrait as the default", () => {
        const lineup = shape()

        expect(layoutLineup(lineup, "home")).toEqual(layoutLineup(lineup, "home", "portrait"))
    })
})
