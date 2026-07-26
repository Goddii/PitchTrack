import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SearchX } from "lucide-react"
import Navbar from "../components/Navbar";
import MatchCard from "../components/MatchCard";
import MatchCardSkeleton from "../components/MatchCardSkeleton";
import LiveMatchCarousel from "../components/LiveMatchCarousel";
import SearchBar from "../components/SearchBar";
import EmptyState from "../components/EmptyState";
import { MOCK_MATCHES } from "../data/mockData"
import { getBandSizeOfAxis } from "recharts/types/util/ChartUtils";


const TABS = [
    { value: "live", label:"live"},
    { value: "upcoming", label: "Upcoming"},
    { value: "completed", label: "Completed"}
]

function formatDateHeading(dateStr) {
    return new Date(dateStr). toLocaleDateString(undefined, {weekday: "long", day: "numeric", month: "long" })
}

export default function Matches() {
    const [searchParams, setSearchParams] = useSearchParams()

    const [matches, setMatches] = useState([])
    const [loading, setLoading] = useState(true)

    const [tab, setTab] = useState(searchParams.get("status") || "live")
    const [query, setQuery] = useState(searchParams.get("q") || "")
    const [debouncedQuery, setDebouncedQuery] = useState(query)


    //todo replace with fetch(/api/matches)
    useEffect(() => {
        const next = {}
        if (tab !== "live") next.status = tab
        if (debouncedQuery) next.q = debouncedQuery
        setSearchParams(next, { replace: true})

    }, [tab, debouncedQuery])

    const liveMatches = useMemo(() => matches.filter((m) => m.status === "live"), [matches])

    const filteredMatches = useMemo(() => {
        const q = debouncedQuery.trim().toLowerCase()
        const statusKey = tab === "upcoming" ? "scheduled" : tab
        return matches
            .filter((m) => m.status === statusKey)
            .filter((m) => !q || m.home_team.name.toLowerCase().includes(q) || m.away_team.name.toLowerCase().includes(q))
    }, [matches, tab, debouncedQuery])

    const groupedByDate = useMemo(() => {
        const direction = tab === "completed" ? -1 : 1
        const sorted = [...filteredMatches].sort(
            (a,b) => (new Date(a.match_date) - new Date(b.match_date)) * direction
        )
        const groups = {}
        sorted.forEach((m) => {
            const key = new Date(m.match_date).toDateString()
            if (!groups[key]) groups[key] = []
            groups[key].push(m)
        })
        return Object.values(groups)
    }, [filteredMatches, tab])

    return(
        <div>
            <Navbar />
            <section className="max-w-7xl mx-auto px-6 md:px-10 py-16">
                <h1 className="font-display uppercase tracking-wide text-3xl text-chalk mb-8">Matches</h1> 
                <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8 items-start">
                    {/* left live match slideshow */}
                    <LiveMatchCarousel matches={liveMatches} loading={{loading}}/>

                    {/* right tabs search date-grouped list */}
                    <div>
                        <div className="flex flex-col sm:flex-row gap-3 mb-6">
                            <div className="flex gap-1 bg-pitch/10 border border-line rounded-lg p-1 w-fit">
                                {TABS.map((t) => (
                                    <button
                                        key={t.value}
                                        onClick={ () => setTab(t.value)}
                                        className={`px-4 py-2 rounded font-body text-sm font-sembold transition-colors cursor-pointer whitespace-nowrap ${
                                            tab === t.value ? "bg-floodlight text-night" : "text-chalk/60 hover:text-chalk"
                                        }`}
                                    >
                                        {t.label}
                                        {t.value === "live" && liveMatches.length > 0 ? `(${liveMatches.length})`: ""}
                                    </button>
                                ))}

                            </div>
                            <SearchBar value={query} onChange={setQuery} placeholder="Search by team" ariaLabel="Search matches"/>

                        </div>
                        {loading ? (
                            <div className="bg-pitch/30 border border-line rounded-lg overflow-hidden">
                                {Array.from({length: 5}).map((_, i) => (
                                    <MatchCardSkeleton  key={i}/>
                                ))}

                            </div>
                        ) : groupedByDate.length > 0 ? (
                            <div className="space-y-8">
                                {groupedByDate.map((dayMatches) => (
                                    <div key={dayMatches[0].id}>
                                        <h2 className="font-body text-xs uppercase tracking-widest2 text-chalk/40 mb-3">
                                            {formatDateHeading(dayMatches[0].match_date)}
                                        </h2>
                                        <div className="bg-pitch/30 border border-line rounded-lg overflow-hidden">
                                            {dayMatches.map((m) => (
                                                <MatchCard key={m.id} match={m}/>
                                            ))}

                                        </div>

                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState 
                                icon={SearchX}
                                title={tab ==="live" ? "Nothing live right now" : "No matches here"}
                                message={
                                    tab === "live"
                                    ? "Check back once kickoff rolls around"
                                    : "Try a different search or switch tabs"
                                }
                                action = {
                                    query ? (
                                        <button 
                                            onClick={() => setQuery(" ")}
                                            className="font-body text-sm font-semibold text-floodlight hover:text-chalk transition-colors cursor-pointer"
                                        >
                                            Clear search
                                        </button>
                                    ) : undefined
                                }
                            />
                        )}

                    </div>

                </div>

            </section>
        </div>
    )
}