import { useEffect, useMemo, useState, useCallback } from "react";
import { useAsync } from "../hooks/useAsync";
import ErrorState from "../components/ErrorState";
import { useSearchParams } from "react-router-dom";
import { Trophy, LayoutGrid, SearchX } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import PublicNavbar from "../components/PublicNavbar";
import TeamCard from "../components/TeamCard"
import TeamcardSkeleton from "../components/TeamcardSkeleton";
import StandingsTable from "../components/StandingsTable";
import { computeStandings } from "../utils/standings";
import SearchBar from "../components/SearchBar"
import FilterDropdown from "../components/FilterDropdown"
import EmptyState from "../components/EmptyState"
import api from "../services/api";


/* ─────────────────────────────────────────────
   Tab button
   ───────────────────────────────────────────── */
function TabButton({ active, icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 px-5 py-2.5 rounded-lg font-body text-sm font-semibold transition-all duration-200 ${
        active
          ? "bg-floodlight text-night shadow-[0_4px_16px_rgba(255,182,39,0.25)]"
          : "text-chalk/60 hover:text-chalk hover:bg-chalk/[0.04]"
      }`}
      aria-pressed={active}
    >
      <Icon size={16} strokeWidth={1.5} />
      {label}
    </button>
  )
}


/* ─────────────────────────────────────────────
   Main component
   ───────────────────────────────────────────── */
export default function Teams() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const [activeTab, setActiveTab] = useState("standings")

  /* ── Data (teams + matches load together; standings derive from both) ── */
  const { data, loading, error, refetch } = useAsync(
    (signal) =>
      Promise.all([api.teams.list({ signal }), api.matches.list({}, { signal })]).then(
        ([teams, matches]) => ({ teams, matches })
      ),
    [],
    { teams: [], matches: [] }
  )
  const { teams, matches } = data

  /* ── Filter state ── */
  const [query, setQuery] = useState(searchParams.get("q") || "")
  const [city, setCity] = useState(searchParams.get("city") || "all")
  const [debouncedQuery, setDebouncedQuery] = useState(query)

  /* ── Standings (derived) ── */
  const standings = useMemo(
    () => computeStandings(teams, matches),
    [teams, matches]
  )

  const entryByTeamId = useMemo(
    () => new Map(standings.map((entry) => [entry.team.id, entry])),
    [standings]
  )

  /* ── Team search debounce ── */
  useEffect(() => {
    const handle = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(handle)
  }, [query])

  /* ── Deep-linkable filters ── */
  useEffect(() => {
    const next = {}
    if (debouncedQuery) next.q = debouncedQuery
    if (city !== "all") next.city = city
    setSearchParams(next, { replace: true })
  }, [debouncedQuery, city, setSearchParams])

  /* ── City dropdown options ── */
  const cityOptions = useMemo(() => {
    const cities = [...new Set(teams.map((t) => t.city).filter(Boolean))].sort()
    return [
      { value: "all", label: "All cities" },
      ...cities.map((c) => ({ value: c, label: c })),
    ]
  }, [teams])

  /* ── Filtered teams ── */
  const filteredTeams = useMemo(() => {
    return teams.filter((t) => {
      const q = debouncedQuery.trim().toLowerCase()
      const matchesQuery =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.city?.toLowerCase().includes(q)
      const matchesCity = city === "all" || t.city === city
      return matchesQuery && matchesCity
    })
  }, [teams, debouncedQuery, city])

  const clearFilters = useCallback(() => {
    setQuery("")
    setCity("all")
  }, [])

  const switchTab = useCallback((tab) => setActiveTab(tab), [])

  /* ── Header stats ── */
  const totalPlayed = useMemo(
    () => matches.filter((m) => m.status === "completed").length,
    [matches]
  )

  return (
    <div>
      <PublicNavbar user={user} />

      <main id="main" className="max-w-7xl mx-auto px-6 md:px-10 py-16">

        {/* ── Page header ── */}
        <div className="mb-8">
          <h1 className="font-display uppercase tracking-wide text-3xl text-chalk mb-2">
            Teams
          </h1>
          <p className="font-body text-sm text-chalk/60">
            {loading
              ? "Loading..."
              : `${teams.length} clubs · ${totalPlayed} matches played`}
          </p>
        </div>

        {/* ── Tab bar ── */}
        <div className="flex items-center gap-2 mb-10">
          <TabButton
            active={activeTab === "standings"}
            icon={Trophy}
            label="Standings"
            onClick={() => switchTab("standings")}
          />
          <TabButton
            active={activeTab === "teams"}
            icon={LayoutGrid}
            label="Teams"
            onClick={() => switchTab("teams")}
          />
        </div>

        {/* ── Standings view ── */}
        {activeTab === "standings" && (
          <StandingsTable
            standings={standings}
            loading={loading}
            error={error}
          />
        )}

        {/* ── Teams view ── */}
        {activeTab === "teams" && (
          <>
            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <SearchBar
                value={query}
                onChange={setQuery}
                placeholder="Search by team or city..."
                ariaLabel="Search teams"
              />
              <FilterDropdown
                label="Filter by city"
                value={city}
                onChange={setCity}
                options={cityOptions}
              />
            </div>

            {error ? (
              <ErrorState error={error} onRetry={refetch} title="Couldn't load teams" />
            ) : loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <TeamcardSkeleton key={i} />
                ))}
              </div>
            ) : filteredTeams.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {filteredTeams.map((t) => (
                  <TeamCard key={t.id} team={t} entry={entryByTeamId.get(t.id)} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={SearchX}
                title="No teams match your search"
                message="Try a different team name or clear the filters to see the full list"
                action={
                  <button
                    onClick={clearFilters}
                    className="font-body text-sm font-semibold text-floodlight hover:text-chalk transition-colors cursor-pointer"
                  >
                    Clear filters
                  </button>
                }
              />
            )}
          </>
        )}

      </main>
    </div>
  )
}
