import { useMemo, useState } from "react"
import PlayerRadarChart from "./PlayerRadarChart"
import AttributeBars from "./AttributeBars"
import PositionPitch from "./PositionPitch"
import PerNinetyPanel from "./PerNinetyPanel"
import GoalBreakdown from "./GoalBreakdown"
import PositionTabs from "./PositionTabs"
import MatchLog from "./MatchLog"
import SquadLeaders from "./SquadLeaders"
import { per90, squadAttributeStats } from "../utils/playerComparison"

const TABS = [
    { value: "overview", label: "Overview" },
    { value: "matches", label: "Match log" },
    { value: "leaders", label: "Squad leaders" },
]

/** The analysis block under the hero: strengths and role, the player's match log, and the club's leaders. */
export default function PlayerOverview({ player, squad, seasonStats }) {
    const [tab, setTab] = useState("overview")
    const rows = useMemo(() => squadAttributeStats(player.attributes, squad), [player.attributes, squad])
    const numbers = useMemo(() => (seasonStats ? per90(seasonStats) : null), [seasonStats])

    return (
        <section className="mx-auto max-w-7xl px-6 py-14 md:px-10" aria-label="Player analysis">
            <div className="mb-6">
                <PositionTabs options={TABS} value={tab} onChange={setTab} label="Player sections" />
            </div>

            {tab === "overview" && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <PlayerRadarChart attributes={player.attributes} />
                    <AttributeBars rows={rows} />
                    <PositionPitch position={player.position} />
                    <PerNinetyPanel numbers={numbers} minutes={seasonStats?.minutes ?? 0} />
                    <GoalBreakdown stats={seasonStats} className="lg:col-span-2" />
                </div>
            )}

            {tab === "matches" && <MatchLog playerId={player.id} />}

            {tab === "leaders" && <SquadLeaders teamId={player.team.id} currentPlayerId={player.id} />}
        </section>
    )
}
