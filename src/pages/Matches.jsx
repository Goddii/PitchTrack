import { useSearchParams } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import PublicNavbar from "../components/PublicNavbar"
import MatchStage from "../components/MatchStage"
import FixtureCarousel from "../components/FixtureCarousel"
import MatchInfoRail from "../components/MatchInfoRail"
import PlayerRail from "../components/PlayerRail"
import EmptyMatches from "../components/EmptyMatches"
import ErrorState from "../components/ErrorState"
import { useAsync } from "../hooks/useAsync"
import api from "../services/api"
import { BOARD_TABS, defaultTab, matchesForTab, pickDefaultMatchId, tabCounts } from "../utils/matchBoard"

const NO_ROWS = []
const NO_MATCHES = []

function BoardSkeleton() {
    return (
        <div className="grid animate-pulse grid-cols-1 gap-3 lg:h-[calc(100dvh-7.25rem)] lg:grid-cols-[14rem_minmax(0,1fr)_16rem] xl:grid-cols-[18rem_minmax(0,1fr)_20rem] lg:grid-rows-[minmax(0,1fr)_auto]" aria-hidden="true">
            <div className="hidden rounded-xl bg-glass-bg lg:block" />
            <div className="min-h-[28rem] rounded-xl bg-glass-bg" />
            <div className="hidden rounded-xl bg-glass-bg lg:block" />
            <div className="h-40 rounded-xl bg-glass-bg lg:col-span-3" />
        </div>
    )
}

/**
 * The Matches page: pick a fixture in the strip and the stage, match details and player list
 * follow. The status tab and the selected match live in the URL so a view can be shared.
 */
export default function Matches() {
    const { user } = useAuth()
    const [searchParams, setSearchParams] = useSearchParams()

    const { data: matches, error, hasLoaded, refetch } = useAsync(
        (signal) => api.matches.list({}, { signal }),
        [],
        NO_MATCHES
    )

    const requestedTab = searchParams.get("status")
    const tab = BOARD_TABS.some((t) => t.value === requestedTab) ? requestedTab : defaultTab(matches)

    const requestedId = Number(searchParams.get("match"))
    const selected =
        matches.find((m) => m.id === requestedId) ?? matches.find((m) => m.id === pickDefaultMatchId(matches)) ?? null
    const selectedId = selected?.id ?? null

    const {
        data: statRows,
        loading: isStatsLoading,
        error: statsError,
        refetch: refetchStats,
    } = useAsync(
        (signal) => (selectedId == null ? Promise.resolve(NO_ROWS) : api.matches.playerStats(selectedId, { signal })),
        [selectedId],
        NO_ROWS
    )
    // useAsync keeps the previous match's rows while the next load runs or fails, so never show those.
    const rows = isStatsLoading || statsError ? NO_ROWS : statRows

    const updateParams = (changes) => {
        const next = new URLSearchParams(searchParams)
        Object.entries(changes).forEach(([key, value]) => {
            if (value == null) next.delete(key)
            else next.set(key, String(value))
        })
        setSearchParams(next, { replace: true })
    }

    const handleTabChange = (value) => {
        const firstInTab = matchesForTab(matches, value)[0]
        updateParams({ status: value, match: firstInTab?.id ?? selectedId })
    }

    const handleSelect = (id) => updateParams({ status: tab, match: id })

    return (
        <div className="min-h-screen bg-night">
            <PublicNavbar user={user} />

            <main id="main" className="mx-auto max-w-[1600px] p-3 md:p-4">
                <h1 className="sr-only">Matches</h1>

                {error ? (
                    <ErrorState error={error} onRetry={refetch} title="Couldn't load matches" />
                ) : !hasLoaded ? (
                    <BoardSkeleton />
                ) : !selected ? (
                    <EmptyMatches title="No matches yet" message="Fixtures will appear here once they are scheduled." showCTA />
                ) : (
                    <div className="grid grid-cols-1 gap-3 lg:h-[calc(100dvh-7.25rem)] lg:min-h-[40rem] lg:grid-cols-[14rem_minmax(0,1fr)_16rem] xl:grid-cols-[18rem_minmax(0,1fr)_20rem] lg:grid-rows-[minmax(0,1fr)_auto]">
                        <div className="order-1 grid min-h-0 lg:col-start-2 lg:row-start-1">
                            <MatchStage
                                match={selected}
                                rows={rows}
                                isLoading={isStatsLoading}
                                error={statsError}
                                onRetry={refetchStats}
                            />
                        </div>

                        <div className="order-2 lg:col-span-3 lg:row-start-2">
                            <FixtureCarousel
                                matches={matches}
                                tab={tab}
                                onTabChange={handleTabChange}
                                selectedId={selectedId}
                                onSelect={handleSelect}
                            />
                        </div>

                        <div className="order-3 grid min-h-0 lg:col-start-1 lg:row-start-1">
                            <MatchInfoRail match={selected} counts={tabCounts(matches)} total={matches.length} onRefresh={refetch} />
                        </div>

                        <div className="order-4 grid min-h-0 lg:col-start-3 lg:row-start-1">
                            <PlayerRail key={selected.id} match={selected} rows={rows} isLoading={isStatsLoading} />
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
