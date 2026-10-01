import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import TeamEmblem from "./TeamEmblem"
import { BOARD_TABS, groupByDay, kickoffTime, matchesForTab, tabCounts } from "../utils/matchBoard"

const SCROLL_FRACTION = 0.8
const EDGE_TOLERANCE_PX = 1

const EMPTY_COPY = {
    live: "No matches are live right now.",
    upcoming: "No upcoming matches are scheduled.",
    completed: "No matches have finished yet.",
}

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches

/** Whether a horizontally scrolling element is at either end, kept current as it scrolls or resizes. */
function useScrollEdges(ref, contentKey) {
    const [edges, setEdges] = useState({ atStart: true, atEnd: true })

    const update = useCallback(() => {
        const el = ref.current
        if (!el) return
        const atStart = el.scrollLeft <= EDGE_TOLERANCE_PX
        const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - EDGE_TOLERANCE_PX
        setEdges((prev) => (prev.atStart === atStart && prev.atEnd === atEnd ? prev : { atStart, atEnd }))
    }, [ref])

    useEffect(() => {
        const el = ref.current
        if (!el || typeof ResizeObserver === "undefined") return undefined
        const observer = new ResizeObserver(update)
        observer.observe(el)
        if (el.firstElementChild) observer.observe(el.firstElementChild)
        return () => observer.disconnect()
    }, [ref, update, contentKey])

    return [edges, update]
}

function centreText(match) {
    const hasScore = match.home_score != null && match.away_score != null

    if (match.status === "live" && hasScore) {
        return { main: `${match.home_score} - ${match.away_score}`, sub: match.minute != null ? `${match.minute}'` : "Live", isLive: true }
    }
    if (match.status === "completed" && hasScore) {
        return { main: `${match.home_score} - ${match.away_score}`, sub: "FT", isLive: false }
    }
    return { main: kickoffTime(match.match_date) || "vs", sub: null, isLive: match.status === "live" }
}

function FixtureRow({ match, isSelected, onSelect }) {
    const home = match.home_team?.name ?? "TBD"
    const away = match.away_team?.name ?? "TBD"
    const { main, sub, isLive } = centreText(match)

    return (
        <li>
            <button
                type="button"
                onClick={() => onSelect(match.id)}
                aria-pressed={isSelected}
                aria-label={`${home} versus ${away}, ${main}${sub ? ` ${sub}` : ""}`}
                className={`grid w-full cursor-pointer grid-cols-[minmax(0,1fr)_auto_4.5rem_auto_minmax(0,1fr)] items-center gap-2 rounded-md border px-2 py-1.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-floodlight/60 ${
                    isSelected ? "border-floodlight/60 bg-floodlight/10" : "border-transparent hover:bg-chalk/5"
                }`}
            >
                <span className="truncate text-right font-body text-xs font-semibold text-chalk" title={home}>
                    {home}
                </span>
                <TeamEmblem name={home} size="xs" />
                <span className="flex flex-col items-center leading-tight">
                    <span className={`font-display text-sm tabular-nums ${isLive ? "text-flare" : "text-chalk"}`}>{main}</span>
                    {sub && <span className="font-body text-[0.65rem] uppercase tracking-widest2 text-chalk/60">{sub}</span>}
                </span>
                <TeamEmblem name={away} size="xs" />
                <span className="truncate font-body text-xs font-semibold text-chalk" title={away}>
                    {away}
                </span>
            </button>
        </li>
    )
}

function DayColumn({ group, selectedId, onSelect }) {
    return (
        <li className="w-[min(26rem,86vw)] shrink-0 snap-start">
            <section className="flex max-h-44 flex-col rounded-lg border border-glass-border bg-glass-bg p-1.5">
                <h3 className="px-2 pb-1 font-body text-[0.7rem] font-semibold uppercase tracking-widest2 text-chalk/60">
                    {group.label}
                </h3>
                <ul className="min-h-0 space-y-0.5 overflow-y-auto">
                    {group.matches.map((match) => (
                        <FixtureRow key={match.id} match={match} isSelected={match.id === selectedId} onSelect={onSelect} />
                    ))}
                </ul>
            </section>
        </li>
    )
}

function ArrowButton({ direction, disabled, onClick }) {
    const Icon = direction === "left" ? ChevronLeft : ChevronRight

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-label={direction === "left" ? "Scroll fixtures back" : "Scroll fixtures forward"}
            className="hidden w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-glass-border text-chalk/70 transition-colors hover:border-chalk/30 hover:text-chalk focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-floodlight/60 disabled:cursor-default disabled:opacity-30 disabled:hover:border-glass-border disabled:hover:text-chalk/70 sm:flex"
        >
            <Icon size={18} aria-hidden="true" />
        </button>
    )
}

function Tabs({ tab, counts, onTabChange }) {
    const handleKeyDown = (event) => {
        const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0
        if (step === 0) return
        event.preventDefault()
        const index = BOARD_TABS.findIndex((t) => t.value === tab)
        const next = BOARD_TABS[(index + step + BOARD_TABS.length) % BOARD_TABS.length]
        onTabChange(next.value)
        document.getElementById(`fixtures-tab-${next.value}`)?.focus()
    }

    return (
        <div role="tablist" aria-label="Fixture status" className="flex gap-1" onKeyDown={handleKeyDown}>
            {BOARD_TABS.map(({ value, label }) => {
                const isActive = tab === value
                return (
                    <button
                        key={value}
                        id={`fixtures-tab-${value}`}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        aria-controls="fixtures-panel"
                        tabIndex={isActive ? 0 : -1}
                        onClick={() => onTabChange(value)}
                        className={`inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-md px-2.5 font-body sm:gap-2 sm:px-4 text-xs font-semibold uppercase tracking-widest2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-floodlight/60 ${
                            isActive ? "bg-floodlight text-night" : "text-chalk/60 hover:bg-chalk/5 hover:text-chalk"
                        }`}
                    >
                        {value === "live" && counts.live > 0 && (
                            <span className="size-1.5 animate-pulse rounded-full bg-flare" aria-hidden="true" />
                        )}
                        {label}
                        <span className="tabular-nums opacity-70">{counts[value]}</span>
                    </button>
                )
            })}
        </div>
    )
}

/** The bottom strip of the Matches page: status tabs over a horizontal row of day columns. */
export default function FixtureCarousel({ matches, tab, onTabChange, selectedId, onSelect }) {
    const scrollerRef = useRef(null)
    const counts = useMemo(() => tabCounts(matches), [matches])
    const groups = useMemo(() => groupByDay(matchesForTab(matches, tab)), [matches, tab])
    const [edges, updateEdges] = useScrollEdges(scrollerRef, `${tab}:${groups.length}`)

    const scrollByPage = (direction) => {
        const el = scrollerRef.current
        if (!el) return
        el.scrollBy({ left: direction * el.clientWidth * SCROLL_FRACTION, behavior: prefersReducedMotion() ? "auto" : "smooth" })
    }

    return (
        <section aria-label="Fixtures" className="rounded-xl border border-glass-border bg-night/80 p-2">
            <Tabs tab={tab} counts={counts} onTabChange={onTabChange} />

            <div
                id="fixtures-panel"
                role="tabpanel"
                aria-labelledby={`fixtures-tab-${tab}`}
                className="mt-2 flex items-stretch gap-2"
            >
                <ArrowButton direction="left" disabled={edges.atStart} onClick={() => scrollByPage(-1)} />

                {groups.length === 0 ? (
                    <p className="flex min-h-24 flex-1 items-center justify-center font-body text-sm text-chalk/60">
                        {EMPTY_COPY[tab]}
                    </p>
                ) : (
                    <div
                        key={tab}
                        ref={scrollerRef}
                        onScroll={updateEdges}
                        tabIndex={0}
                        role="region"
                        aria-label="Scrollable fixtures"
                        className="min-w-0 flex-1 snap-x snap-mandatory overflow-x-auto rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-floodlight/60 [scrollbar-width:thin]"
                    >
                        <ul className="flex gap-3">
                            {groups.map((group) => (
                                <DayColumn key={group.dateKey} group={group} selectedId={selectedId} onSelect={onSelect} />
                            ))}
                        </ul>
                    </div>
                )}

                <ArrowButton direction="right" disabled={edges.atEnd} onClick={() => scrollByPage(1)} />
            </div>
        </section>
    )
}
