import { Link } from "react-router-dom"
import ErrorState from "./ErrorState"
import { useAsync } from "../hooks/useAsync"
import { groupSquad } from "../utils/squad"
import api from "../services/api"

const NO_ROWS = []
const COLUMNS = [
    ["appearances", "Apps"],
    ["minutes", "Min"],
    ["goals", "G"],
    ["assists", "A"],
    ["yellow_cards", "YC"],
    ["red_cards", "RC"],
]

/** Squad tab: every player with season totals pulled from the team stats endpoint. */
export default function SquadTable({ teamId, players }) {
    const { data: stats, error, refetch } = useAsync((signal) => api.teams.playerStats(teamId, { signal }), [teamId], NO_ROWS)
    const byPlayer = new Map(stats.map((row) => [row.player.id, row]))
    const lines = groupSquad(players)

    if (error) return <ErrorState error={error} onRetry={refetch} title="Couldn't load squad stats" />

    return (
        <div className="overflow-x-auto rounded-xl border border-glass-border">
            <table className="w-full min-w-[30rem] border-collapse text-left font-body text-sm">
                <caption className="sr-only">Squad with season totals</caption>
                <thead>
                    <tr className="border-b border-glass-border text-xs uppercase tracking-widest2 text-chalk/60">
                        <th scope="col" className="px-3 py-2.5 font-normal">Player</th>
                        {COLUMNS.map(([key, label]) => (
                            <th key={key} scope="col" className="px-2 py-2.5 text-right font-normal">{label}</th>
                        ))}
                    </tr>
                </thead>
                {lines.map((line) => (
                    <tbody key={line.position}>
                        <tr>
                            <th colSpan={COLUMNS.length + 1} scope="colgroup" className="bg-pitch/20 px-3 py-1.5 font-display text-xs font-normal uppercase tracking-widest2 text-floodlight">
                                {line.label}
                            </th>
                        </tr>
                        {line.players.map((player) => {
                            const row = byPlayer.get(player.id)
                            return (
                                <tr key={player.id} className="border-b border-glass-border last:border-b-0 hover:bg-chalk/[0.03]">
                                    <th scope="row" className="px-3 py-2 font-normal">
                                        <Link to={`/players/${player.id}`} className="text-chalk hover:text-floodlight">
                                            <span className="mr-2 inline-block w-5 text-right tabular-nums text-chalk/50">{player.jersey_number ?? ""}</span>
                                            {player.name}
                                        </Link>
                                    </th>
                                    {COLUMNS.map(([key]) => (
                                        <td key={key} className="px-2 py-2 text-right tabular-nums text-chalk/80">{row?.[key] ?? 0}</td>
                                    ))}
                                </tr>
                            )
                        })}
                    </tbody>
                ))}
            </table>
        </div>
    )
}
