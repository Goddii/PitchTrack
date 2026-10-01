/** The fixtures-strip tabs, with the match status each one shows. */
export const BOARD_TABS = [
    { value: "live", label: "Live", status: "live" },
    { value: "upcoming", label: "Upcoming", status: "scheduled" },
    { value: "completed", label: "Finished", status: "completed" },
]

const statusOf = (tab) => BOARD_TABS.find((t) => t.value === tab)?.status
const kickoff = (match) => new Date(match.match_date).getTime()

export function tabCounts(matches) {
    return Object.fromEntries(
        BOARD_TABS.map(({ value, status }) => [value, matches.filter((m) => m.status === status).length])
    )
}

/** Matches for one tab in reading order: live and upcoming soonest first, finished most recent first. */
export function matchesForTab(matches, tab) {
    const status = statusOf(tab)
    const inTab = matches.filter((m) => m.status === status)
    const direction = tab === "completed" ? -1 : 1
    return [...inTab].sort((a, b) => direction * (kickoff(a) - kickoff(b)))
}

/** Kickoff time of day in the viewer's local time, or "" when the match has no date. */
export function kickoffTime(dateStr) {
    if (!dateStr) return ""
    return new Date(dateStr).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
}

/** Kickoff date as weekday, day and month, or "" when the match has no date. */
export function kickoffDate(dateStr) {
    if (!dateStr) return ""
    return new Date(dateStr).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })
}

const startOfDay =(date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())
const DAY_MS = 24 * 60 * 60 * 1000

function dayKey(date) {
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${date.getFullYear()}-${month}-${day}`
}

function dayLabel(date, now) {
    // Round: a daylight-saving change makes a calendar day 23 or 25 hours long.
    const offset = Math.round((startOfDay(date) - startOfDay(now)) / DAY_MS)
    if (offset === 0) return "Today"
    if (offset === 1) return "Tomorrow"
    if (offset === -1) return "Yesterday"
    return date.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })
}

/** Consecutive matches on the same local day, in the order given, each day with a friendly label. */
export function groupByDay(matches, now = new Date()) {
    return matches.reduce((groups, match) => {
        const date = new Date(match.match_date)
        const key = dayKey(date)
        const last = groups[groups.length - 1]

        if (last?.dateKey === key) {
            return [...groups.slice(0, -1), { ...last, matches: [...last.matches, match] }]
        }
        return [...groups, { dateKey: key, label: dayLabel(date, now), matches: [match] }]
    }, [])
}

/** The first tab that has anything in it: live, then upcoming, then finished. */
export function defaultTab(matches) {
    const counts = tabCounts(matches)
    return BOARD_TABS.find((tab) => counts[tab.value] > 0)?.value ?? BOARD_TABS[0].value
}

/** The match to show on the stage before anyone picks one. */
export function pickDefaultMatchId(matches) {
    return matchesForTab(matches, defaultTab(matches))[0]?.id ?? null
}
