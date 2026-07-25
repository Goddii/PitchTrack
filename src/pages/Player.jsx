import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { SearchX } from "lucide-react";
import Navbar from "../components/Navbar";
import PlayerCard from "../components/PlayerCard";
import PlayerCardSkeleton from "../components/PlayerCardSkeleton"
import SearchBar from "../components/SearchBar"
import FilterDropdown from "../components/FilterDropdown"
import EmptyState from "../components/EmptyState";
import { MOCK_PLAYERS } from "../data/mockData"


const POSITIONS = [
    { value: "all", label: "All positions"},
    { value: "Forward", label: "Forward"},
    { value: "Midfielder", label: "Midfielder"},
    { value: "Defender", label: "Defender"},
    { value: "Goalkeeper", label: "Goalkeeper"},
]

export default function Players() {
    const [searchParams, setSearchParams] = useSearchParams()

    const [players, setPlayers] = useState([])
    const [loading, setLoading ] = useState(true)

    const [query, setQuery] = useState(searchParams.get("q") || "")
    const [position, setPosition] = useState(searchParams.get("position") || "all")
    const [debouncedQuery, setDebouncedQuery] = useState(query)


    //todo replace with fetch api/players
    useEffect(() => {
        const timer = setTimeout(() => {
            setPlayers(MOCK_PLAYERS)
            .setLoading(false)
        }, 600)
        return () => clearTimeout(timer)
    })

    useEffect(() => {
        const handle = setTimeout(() => setDebouncedQuery(query), 300)
        return () => clearTimeout(handle)
    }, [query])

    useEffect(() =>{
        const next = {}
        if (debouncedQuery) next.q = debouncedQuery
        if (position !== "all") next.position = position
        setSearchParams(next, { replace: true})

        //eslint-disable-next line react-hooks/exhaustive deps

    }, [debouncedQuery, position])

    const filteredPlayers = useMemo(() => {
        return players.filter((p) => {
            const q = debouncedQuery.trim().toLowerCase()
            const matchesQuery = !q || p.name.toLowerCase().includes(q) || p.team.name.toLowerCase().includes(q)
            const matchesPosition = position === "all" || p.position === position
            return matchesQuery && matchesPosition

        })
    }, [players, debouncedQuery, position])

    const clearFilters = () => {
        setQuery("")
        setPosition("all")
    }

    return (
        <div>
            <Navbar />
            <section className="max-w-7xl mx-auto px-6 md:px-10 py-16">
                <div className="mb-8">
                    <h1 className="font-display uppercase tracking-wide text-3xl text-chalk mb-2"> Players </h1>
                    <p className="font-body text-sm text-chalk/50">
                        {loading ? "Loading players..." : `${filteredPlayers.length} player${filteredPlayers.length === 1 ? "" : "s"}`}
                    </p>

                </div>
                <div className="flex flex-col sm:flex-row gap-3 mb-10">
                    <SearchBar value={query} onChange={setQuery} placeholder="Search by player or team..." ariaLabel="Search players"/>
                    <FilterDropdown label="Filter by position" value={position} onChange={setPosition} options={POSITIONS} />
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {filteredPlayers.map((p) => (
                            <PlayerCard key={p.id} player={p} />
                        ))}
                    </div>
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
            </section>
        </div>
    )
}