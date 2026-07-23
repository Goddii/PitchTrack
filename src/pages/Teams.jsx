import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { EqualApproximately, SearchX } from "lucide-react";
import Navbar from "../components/Navbar";
import TeamCard from "../components/TeamCard"
import TeamcardSkeleton from "../components/TeamcardSkeleton";
import SearchBar from "../components/SearchBar"
import FilterDropdown from "../components/FilterDropdown"
import EmptyState from "../components/EmptyState"
import { MOCK_TEAMS } from "../components/Mockdata";





export default function Teams(){
    const [searchParams, setSearchParams] = useSearchParams()

    const [teams, setTeams] = useState([])
    const [loading, setLoading] = useState(true)

    const [query, setQuery] = useState(searchParams.get("q") || "")
    const [city, setCity] = useState(searchParams.get("city") || "all")
    const [debouncedQuery, setDebouncedQuery] = useState(query)


    //todo replace with fetch/api/teams 
    // skeleton state is actually visible testable now

    useEffect(() => {
        const timer = setTimeout(() => {
            setTeams(MOCK_TEAMS)
            setLoading(false)
        }, 600)
        return () => clearTimeout(timer)
    }, [])

    //debounce typed input before it drives filtering/url updates
    useEffect(() => {
        const handle = setTimeout(() => setDebouncedQuery(query), 300)
        return () => clearTimeout(handle)
    }, [query])

    // keep filters deep-linkable/sharable

    useEffect(() => {
        const next = {}
        if (debouncedQuery) next.q = debouncedQuery
        if (city !== "all") next.city = city
        setSearchParams(next, {replace:true})

    }, [debouncedQuery, city])


    const cityOptions = useMemo(() =>{
        const cities = [...new Set(teams.map((t) => t.city))].sort()
        return [{value: "all", label:"All cities"}, ...cities.map((c) => ({ value:c, label: c}))]
    }, [teams])

    const filteredTeams = useMemo(() => {
        return teams.filter((t) => {
            const q = debouncedQuery.trim().toLowerCase()
            const matchesQuery = !q || t.name.toLowerCase().includes(q) || t.city.toLowerCase().includes(q)
            const matchesCity = city ==="all" || t.city === city
            return matchesQuery && matchesCity
        })
    }, [teams, debouncedQuery, city])

    const clearFilters = () => {
        setQuery("")
        setCity("all")
    }


    return (
        <div>
            <Navbar />

            <section className="max-w-7xl mx-auto px-6 md:px-10 py-16">
                <div className="mb-8">
                    <h1 className="font-display uppercase tracking-wide text-3xl text-chalk mb-2">
                        Teams
                    </h1>
                    <p className="font-body text-sm text-chalk/50">
                        {loading ? "loading clubs..." : `${filteredTeams.length} clubs${filteredTeams.length === 1 ? "" : "s"}`}
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mb-10">
                    <SearchBar value={query} onChange={setQuery} placeholder="Search by team or city..." ariaLabel="Search teams"/>
                    <FilterDropdown label="Filter by city" value={city} onChange={setCity} options={cityOptions}/>

                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <TeamcardSkeleton key={i} />
                        ))}
                    </div>
                ): filteredTeams.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        { filteredTeams.map((t) => (
                            
                            <TeamCard key={t.id} team={t} />
                        
                        ))}
                    </div>
                ): (
                    <EmptyState 
                    icon ={SearchX}
                    title="No teams match your search"
                    message="Try a different team name or clear the filters to see the full list"
                    action = {
                        <button 
                        onClick={clearFilters}
                        className="font-body text-sm font-semibold text-floodlight hover:text-chalk transition-colors curso-pointer"
                        >
                            Clear filters
                        </button>
                    }
                    />
                )}
                

            </section>

        </div>
    )
}