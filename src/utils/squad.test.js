import { describe, expect, test } from "vitest"
import { groupSquad, SQUAD_LINES } from "./squad"

const player = (id, position, jersey = null) => ({ id, position, jersey_number: jersey, name: `P${id}` })

describe("groupSquad", () => {
    test("returns lines in goalkeeper to forward order", () => {
        const lines = groupSquad([player(1, "Forward"), player(2, "Goalkeeper"), player(3, "Defender"), player(4, "Midfielder")])

        expect(lines.map((l) => l.label)).toEqual(["Goalkeepers", "Defenders", "Midfielders", "Forwards"])
        expect(SQUAD_LINES.map((l) => l.position)).toEqual(["Goalkeeper", "Defender", "Midfielder", "Forward"])
    })

    test("omits lines with no players", () => {
        const lines = groupSquad([player(1, "Goalkeeper"), player(2, "Forward")])

        expect(lines.map((l) => l.position)).toEqual(["Goalkeeper", "Forward"])
    })

    test("sorts each line by jersey number with unnumbered players last", () => {
        const lines = groupSquad([player(1, "Defender", 5), player(2, "Defender", null), player(3, "Defender", 2)])

        expect(lines[0].players.map((p) => p.id)).toEqual([3, 1, 2])
    })

    test("returns an empty list for an empty squad and does not mutate the input", () => {
        const input = [player(1, "Defender", 9), player(2, "Defender", 1)]
        const snapshot = input.map((p) => p.id)

        expect(groupSquad([])).toEqual([])
        groupSquad(input)
        expect(input.map((p) => p.id)).toEqual(snapshot)
    })

    test("ignores players with an unknown position", () => {
        expect(groupSquad([player(1, "Coach")])).toEqual([])
    })
})
