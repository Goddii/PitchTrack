import { useEffect, useMemo, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { ChevronLeft, ChevronRight } from "lucide-react"
import PositionTabs from "./PositionTabs"
import SilhouettePlaceholder from "./SilhouettePlaceholder"

const SCROLL_STEP = 280

const POSITION_TABS = [
    { value: "all", label: "All" },
    { value: "Goalkeeper", label: "Goalkeepers" },
    { value: "Defender", label: "Defenders" },
    { value: "Midfielder", label: "Midfielders" },
    { value: "Forward", label: "Forwards" },
]

function SquadChip({ player, isCurrent }) {
    return (
        <li className="snap-start" data-current={isCurrent || undefined}>
            <Link
                to={`/players/${player.id}`}
                aria-current={isCurrent ? "page" : undefined}
                className={`spotlight-card group relative flex h-28 w-28 flex-col items-center justify-end overflow-hidden rounded-lg border bg-night/60 pb-2 ${
                    isCurrent ? "border-floodlight" : "border-line hover:border-chalk/40"
                }`}
            >
                <span
                    className="pointer-events-none absolute -top-2 right-1 select-none font-display text-5xl font-bold leading-none text-chalk/10"
                    aria-hidden="true"
                >
                    {player.jersey_number}
                </span>
                {player.photo_url ? (
                    <img
                        src={player.photo_url}
                        alt=""
                        className="absolute inset-x-0 top-0 h-20 w-full object-cover object-top"
                        loading="lazy"
                    />
                ) : (
                    <SilhouettePlaceholder className="absolute inset-x-0 top-0 h-20 w-full object-cover object-top" />
                )}
                <span className="relative z-10 max-w-full truncate bg-night/80 px-2 font-display text-xs uppercase tracking-wide text-chalk">
                    {player.name.split(" ").slice(-1)[0]}
                </span>
                {isCurrent && <span className="absolute inset-x-0 bottom-0 h-1 bg-floodlight" aria-hidden="true" />}
            </Link>
        </li>
    )
}

/** Teammates in a scrollable row with position tabs; the current player is highlighted. */
export default function SquadRail({ squad, currentId }) {
    const [tab, setTab] = useState("all")
    const scrollerRef = useRef(null)

    const visible = useMemo(
        () => squad.filter((p) => tab === "all" || p.position === tab || String(p.id) === String(currentId)),
        [squad, tab, currentId]
    )

    // Bring the current player into view without scrolling the page
    useEffect(() => {
        const scroller = scrollerRef.current
        const current = scroller?.querySelector("[data-current]")
        if (scroller && current) {
            scroller.scrollLeft = current.offsetLeft - scroller.clientWidth / 2 + current.clientWidth / 2
        }
    }, [currentId])

    if (squad.length <= 1) return null

    const scrollBy = (direction) => scrollerRef.current?.scrollBy({ left: direction * SCROLL_STEP, behavior: "smooth" })

    return (
        <div className="border-t border-line bg-night/40">
            <div className="mx-auto max-w-7xl px-6 py-3 md:px-10">
                <PositionTabs options={POSITION_TABS} value={tab} onChange={setTab} label="Filter squad by position" />

                <div className="relative mt-2 flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => scrollBy(-1)}
                        aria-label="Scroll squad left"
                        className="hidden h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-line text-chalk/70 transition-colors hover:border-chalk/40 hover:text-chalk sm:flex"
                    >
                        <ChevronLeft size={18} aria-hidden="true" />
                    </button>
                    <ul
                        ref={scrollerRef}
                        aria-label="Squad"
                        className="themed-scroll m-0 flex min-w-0 flex-1 snap-x list-none gap-3 overflow-x-auto p-1 pb-2"
                    >
                        {visible.map((p) => (
                            <SquadChip key={p.id} player={p} isCurrent={String(p.id) === String(currentId)} />
                        ))}
                    </ul>
                    <button
                        type="button"
                        onClick={() => scrollBy(1)}
                        aria-label="Scroll squad right"
                        className="hidden h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-line text-chalk/70 transition-colors hover:border-chalk/40 hover:text-chalk sm:flex"
                    >
                        <ChevronRight size={18} aria-hidden="true" />
                    </button>
                </div>
            </div>
        </div>
    )
}
