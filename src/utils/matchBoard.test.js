import { describe, expect, it } from "vitest"
import { defaultTab, groupByDay, kickoffDate, kickoffTime, matchesForTab, pickDefaultMatchId, tabCounts } from "./matchBoard"

const NOW = new Date(2026, 9, 1, 12, 0) // Thu 1 Oct 2026, local noon

const match = (id, status, daysFromNow = 0, hour = 15) => ({
    id,
    status,
    match_date: new Date(2026, 9, 1 + daysFromNow, hour).toISOString(),
})

describe("tabCounts", () => {
    it("counts matches per tab, mapping scheduled to upcoming", () => {
        const matches = [match(1, "live"), match(2, "scheduled"), match(3, "scheduled"), match(4, "completed")]

        expect(tabCounts(matches)).toEqual({ live: 1, upcoming: 2, completed: 1 })
    })
})

describe("matchesForTab", () => {
    const matches = [
        match(1, "scheduled", 3),
        match(2, "scheduled", 1),
        match(3, "completed", -2),
        match(4, "completed", -1),
        match(5, "live", 0),
    ]

    it("lists upcoming matches soonest first", () => {
        expect(matchesForTab(matches, "upcoming").map((m) => m.id)).toEqual([2, 1])
    })

    it("lists finished matches most recent first", () => {
        expect(matchesForTab(matches, "completed").map((m) => m.id)).toEqual([4, 3])
    })

    it("lists live matches", () => {
        expect(matchesForTab(matches, "live").map((m) => m.id)).toEqual([5])
    })

    it("does not reorder the input", () => {
        const ids = matches.map((m) => m.id)

        matchesForTab(matches, "upcoming")

        expect(matches.map((m) => m.id)).toEqual(ids)
    })
})

describe("groupByDay", () => {
    it("groups consecutive matches on the same local day", () => {
        const groups = groupByDay([match(1, "scheduled", 1, 10), match(2, "scheduled", 1, 18), match(3, "scheduled", 2)], NOW)

        expect(groups.map((g) => g.matches.map((m) => m.id))).toEqual([[1, 2], [3]])
    })

    it("labels today, tomorrow and yesterday", () => {
        const groups = groupByDay([match(1, "completed", -1), match(2, "live", 0), match(3, "scheduled", 1)], NOW)

        expect(groups.map((g) => g.label)).toEqual(["Yesterday", "Today", "Tomorrow"])
    })

    it("labels other days with the weekday and date", () => {
        const [group] = groupByDay([match(1, "scheduled", 4)], NOW)

        expect(group.label).toMatch(/Mon/)
        expect(group.label).toMatch(/5/)
    })

    it("returns no groups for no matches", () => {
        expect(groupByDay([], NOW)).toEqual([])
    })
})

describe("defaultTab", () => {
    it("prefers live, then upcoming, then finished", () => {
        expect(defaultTab([match(1, "live"), match(2, "scheduled")])).toBe("live")
        expect(defaultTab([match(2, "scheduled"), match(3, "completed")])).toBe("upcoming")
        expect(defaultTab([match(3, "completed")])).toBe("completed")
    })

    it("falls back to live when there are no matches", () => {
        expect(defaultTab([])).toBe("live")
    })
})

describe("pickDefaultMatchId", () => {
    it("picks the first match of the default tab", () => {
        const matches = [match(1, "scheduled", 2), match(2, "scheduled", 1), match(3, "completed", -1)]

        expect(pickDefaultMatchId(matches)).toBe(2)
    })

    it("picks the earliest live match", () => {
        expect(pickDefaultMatchId([match(1, "live", 0, 18), match(2, "live", 0, 14)])).toBe(2)
    })

    it("returns null when there are no matches", () => {
        expect(pickDefaultMatchId([])).toBeNull()
    })
})

describe("kickoff formatting", () => {
    const iso = new Date(2026, 9, 5, 15, 30).toISOString()

    it("formats the kickoff time in the viewer's local time", () => {
        expect(kickoffTime(iso)).toMatch(/15[:.]30|3[:.]30/)
    })

    it("formats the kickoff date with weekday, day and month", () => {
        const text = kickoffDate(iso)

        expect(text).toMatch(/Mon/)
        expect(text).toMatch(/5/)
    })

    it("returns an empty string when there is no date", () => {
        expect(kickoffTime(null)).toBe("")
        expect(kickoffDate(undefined)).toBe("")
    })
})
