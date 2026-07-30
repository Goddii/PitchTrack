import { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Trophy, LayoutGrid, SearchX } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import PublicNavbar from "../components/PublicNavbar";
import TeamCard from "../components/TeamCard"
import TeamcardSkeleton from "../components/TeamcardSkeleton";
import StandingsTable from "../components/StandingsTable";
import SearchBar from "../components/SearchBar"
import FilterDropdown from "../components/FilterDropdown"
import EmptyState from "../components/EmptyState"
import api from "../services/api";


/* ─────────────────────────────────────────────
   Standings computation
   ───────────────────────────────────────────── */
function computeStandings(teams, matches) {
  const completed = matches.filter((m) => m.status === "completed")

  return teams
    .map((team) => {
      const teamMatches = completed.filter(
        (m) => m.home_team?.id === team.id || m.away_team?.id === team.id
      )

      let wins = 0
      let draws = 0
      let losses = 0
      let goalsFor = 0
      let goalsAgainst = 0

      teamMatches.forEach((m) => {
        const isHome = m.home_team?.id === team.id
        const teamScore = isHome ? m.home_score : m.away_score
        const oppScore = isHome ? m.away_score : m.home_score

        if (teamScore > oppScore) wins++
        else if (teamScore === oppScore) draws++
        else losses++

        goalsFor += teamScore ?? 0
        goalsAgainst += oppScore ?? 0
      })

      return {
        team,
        played: teamMatches.length,
        wins,
        draws,
        losses,
        goalsFor,
        goalsAgainst,
        gd: goalsFor - goalsAgainst,
        points: wins * 3 + draws,
      }
    })
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      if (b.gd !== a.gd) return b.gd - a.gd
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor
      return a.team.name.localeCompare(b.team.name)
    })
    .map((entry, index) => ({ ...entry, position: index + 1 }))
}


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
          : "text-chalk/50 hover:text-chalk hover:bg-chalk/[0.04]"
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

  /* ── Data state ── */
  const [teams, setTeams] = useState([])
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [standingsError, setStandingsError] = useState(null)

  /* ── Filter state ── */
  const [query, setQuery] = useState(searchParams.get("q") || "")
  const [city, setCity] = useState(searchParams.get("city") || "all")
  const [debouncedQuery, setDebouncedQuery] = useState(query)

  /* ── Fetch both teams and matches ── */
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setStandingsError(null)

    Promise.all([
      api.teams.list(),
      api.matches.list(),
    ])
      .then(([teamsData, matchesData]) => {
        if (!cancelled) {
          setTeams(teamsData)
          setMatches(matchesData)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setStandingsError(err.message || "Failed to fetch data")
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  /* ── Standings (derived) ── */
  const standings = useMemo(
    () => computeStandings(teams, matches),
    [teams, matches]
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
    const cities = [...new Set(teams.map((t) => t.city))].sort()
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
        t.city.toLowerCase().includes(q)
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

      <section className="max-w-7xl mx-auto px-6 md:px-10 py-16">

        {/* ── Page header ── */}
        <div className="mb-8">
          <h1 className="font-display uppercase tracking-wide text-3xl text-chalk mb-2">
            Teams
          </h1>
          <p className="font-body text-sm text-chalk/50">
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
            error={standingsError}
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

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <TeamcardSkeleton key={i} />
                ))}
              </div>
            ) : filteredTeams.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {filteredTeams.map((t) => (
                  <TeamCard key={t.id} team={t} />
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

      </section>
    </div>
  )
}
