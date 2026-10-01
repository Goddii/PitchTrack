import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { SearchX } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import PublicNavbar from "../components/PublicNavbar";
import PlayerRow from "../components/PlayerRow";
import TopPlayers from "../components/TopPlayers";
import SearchBar from "../components/SearchBar"
import FilterDropdown from "../components/FilterDropdown"
import PositionTabs from "../components/PositionTabs"
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState"
import { useAsync } from "../hooks/useAsync"
import { rankByRating } from "../utils/playerRating"
import api from "../services/api"

const PAGE_SIZE = 30
const SKELETON_ROWS = 8

const POSITIONS = [
    { value: "all", label: "All"},
    { value: "Goalkeeper", label: "Goalkeepers"},
    { value: "Defender", label: "Defenders"},
    { value: "Midfielder", label: "Midfielders"},
    { value: "Forward", label: "Forwards"},
]

const SORTS = [
    { value: "rating", label: "Top rated" },
    { value: "name", label: "Name A–Z" },
    { value: "number", label: "Shirt number" },
]

const SORTERS = {
    rating: () => 0, // rankByRating already orders by rating
    name: (a, b) => a.player.name.localeCompare(b.player.name),
    number: (a, b) => (a.player.jersey_number ?? Infinity) - (b.player.jersey_number ?? Infinity),
}

function RowsSkeleton() {
    return (
        <div className="animate-pulse overflow-hidden rounded-xl border border-line" aria-hidden="true">
            {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 border-b border-line px-4 py-3 last:border-b-0">
                    <div className="h-6 w-8 rounded bg-line/30" />
                    <div className="h-4 flex-1 rounded bg-line/20" />
                    <div className="h-9 w-12 rounded-lg bg-line/20" />
                </div>
            ))}
        </div>
    )
}

export default function Players() {
    const { user } = useAuth()
    const [searchParams, setSearchParams] = useSearchParams()

    const { data: players, loading, error, refetch } = useAsync(
        (signal) => api.players.list({}, { signal }),
        [],
        []
    )

    const [query, setQuery] = useState(searchParams.get("q") || "")
    const [position, setPosition] = useState(searchParams.get("position") || "all")
    const [team, setTeam] = useState(searchParams.get("team") || "all")
    const [sort, setSort] = useState(searchParams.get("sort") || "rating")
    const [debouncedQuery, setDebouncedQuery] = useState(query)
    const [limit, setLimit] = useState(PAGE_SIZE)

    useEffect(() => {
        const handle = setTimeout(() => setDebouncedQuery(query), 300)
        return () => clearTimeout(handle)
    }, [query])

    useEffect(() =>{
        const next = {}
        if (debouncedQuery) next.q = debouncedQuery
        if (position !== "all") next.position = position
        if (team !== "all") next.team = team
        if (sort !== "rating") next.sort = sort
        setSearchParams(next, { replace: true })
    }, [debouncedQuery, position, team, sort, setSearchParams])

    // Changing any filter starts the list from the top again
    const withReset = (setter) => (value) => {
        setter(value)
        setLimit(PAGE_SIZE)
    }

    const ranked = useMemo(() => rankByRating(players), [players])

    const teamOptions = useMemo(() => {
        const names = [...new Set(players.map((p) => p.team?.name).filter(Boolean))].sort()
        return [{ value: "all", label: "All clubs" }, ...names.map((n) => ({ value: n, label: n }))]
    }, [players])

    const visible = useMemo(() => {
        const q = debouncedQuery.trim().toLowerCase()
        return ranked
            .filter(({ player: p }) => {
                const matchesQuery = !q || p.name.toLowerCase().includes(q) || p.team?.name?.toLowerCase().includes(q)
                const matchesPosition = position === "all" || p.position === position
                const matchesTeam = team === "all" || p.team?.name === team
                return matchesQuery && matchesPosition && matchesTeam
            })
            .sort(SORTERS[sort] ?? SORTERS.rating)
    }, [ranked, debouncedQuery, position, team, sort])

    const hasFilters = Boolean(debouncedQuery) || position !== "all" || team !== "all"
    const showFeature = !loading && !error && !hasFilters && sort === "rating"
    const shown = visible.slice(0, limit)

    const clearFilters = () => {
        setQuery("")
        setPosition("all")
        setTeam("all")
        setLimit(PAGE_SIZE)
    }

    return (
        <div>
            <PublicNavbar user={user} />
            <main id="main" className="max-w-7xl mx-auto px-6 md:px-10 py-16">
                <div className="mb-8">
                    <h1 className="font-display uppercase tracking-wide text-3xl text-chalk mb-2"> Players </h1>
                    <p className="font-body text-sm text-chalk/70">
                        {loading ? "Loading players..." : `${visible.length} player${visible.length === 1 ? "" : "s"}`}
                    </p>
                </div>

                {showFeature && <TopPlayers ranked={ranked} />}

                <div className="mb-4">
                    <PositionTabs options={POSITIONS} value={position} onChange={withReset(setPosition)} />
                </div>
                <div className="flex flex-col lg:flex-row gap-3 mb-6">
                    <SearchBar value={query} onChange={withReset(setQuery)} placeholder="Search by player or team..." ariaLabel="Search players"/>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <FilterDropdown label="Filter by club" value={team} onChange={withReset(setTeam)} options={teamOptions} />
                        <FilterDropdown label="Sort players" value={sort} onChange={withReset(setSort)} options={SORTS} />
                    </div>
                </div>

                {error ? (
                    <ErrorState error={error} onRetry={refetch} title="Couldn't load players" />
                ) : loading ? (
                    <RowsSkeleton />
                ) : visible.length > 0 ? (
                    <>
                        <div className="overflow-hidden rounded-xl border border-line bg-pitch/10">
                            {shown.map(({ player, rating }) => (
                                <PlayerRow key={player.id} player={player} rating={rating} />
                            ))}
                        </div>
                        {visible.length > shown.length && (
                            <div className="mt-6 text-center">
                                <button
                                    onClick={() => setLimit((n) => n + PAGE_SIZE)}
                                    className="min-h-11 cursor-pointer rounded-lg border border-chalk/25 px-6 py-2.5 font-body text-sm font-semibold text-chalk/80 transition-colors hover:border-chalk/50 hover:text-chalk"
                                >
                                    Show {Math.min(PAGE_SIZE, visible.length - shown.length)} more
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <EmptyState
                        icon={SearchX}
                        title="No player match your search"
                        message="Try a different name, or clear the filters to see the full list"
                        action = {
                            <button
                            onClick={clearFilters}
                            className="font-body text-sm font-semibold text-floodlight hover:text-chalk transition-colors cursor-pointer"
                            >
                                clear filters
                            </button>
                        }

                    />
                )}
            </main>
        </div>
    )
}
