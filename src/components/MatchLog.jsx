import { Link } from "react-router-dom"
import ErrorState from "./ErrorState"
import FormPills from "./FormPills"
import { useAsync } from "../hooks/useAsync"
import { describeMatchRow, recentForm } from "../utils/matchLog"
import api from "../services/api"

const SKELETON_ROWS = 4
const COLUMNS = "md:grid-cols-[4.5rem_minmax(0,1.6fr)_6rem_3.5rem_2.5rem_2.5rem_4.5rem]"

const RESULT_TEXT = { W: "text-emerald-300", D: "text-chalk/80", L: "text-flare" }

const formatDate = (iso) => new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" })

function Cards({ yellow, red }) {
    if (!yellow && !red) return <span className="text-chalk/50">—</span>

    return (
        <span className="flex items-center gap-2">
            {yellow > 0 && (
                <span className="flex items-center gap-1" aria-label={`${yellow} yellow`}>
                    <span className="h-3.5 w-2.5 rounded-sm bg-yellow-400" aria-hidden="true" />
                    {yellow}
                </span>
            )}
            {red > 0 && (
                <span className="flex items-center gap-1" aria-label={`${red} red`}>
                    <span className="h-3.5 w-2.5 rounded-sm bg-red-500" aria-hidden="true" />
                    {red}
                </span>
            )}
        </span>
    )
}

function MatchRow({ row }) {
    const match = describeMatchRow(row)
    const { stats } = row

    return (
        <li className="border-b border-line last:border-b-0">
            <Link
                to={`/matches/${row.match_id}`}
                className={`grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 px-4 py-3 font-body text-sm hover:bg-pitch/20 ${COLUMNS}`}
            >
                <span className="hidden tabular-nums text-chalk/70 md:block">{formatDate(row.match_date)}</span>

                <span className="min-w-0">
                    <span className="block truncate font-semibold text-chalk">
                        {match.opponent} <span className="font-normal text-chalk/70">({match.side})</span>
                    </span>
                    <span className="text-xs tabular-nums text-chalk/70 md:hidden">
                        {formatDate(row.match_date)} · {stats.minutes_played}&prime; · {stats.goals}G {stats.assists}A
                    </span>
                </span>

                <span className="justify-self-end tabular-nums md:justify-self-start">
                    {match.live ? (
                        <span className="font-display font-bold text-flare">LIVE {match.scoreText}</span>
                    ) : (
                        <span className={`font-display font-bold ${RESULT_TEXT[match.result] ?? "text-chalk"}`}>
                            {match.result ? `${match.result} ` : ""}
                            {match.scoreText ?? "—"}
                        </span>
                    )}
                </span>

                <span className="hidden tabular-nums text-chalk/80 md:block">{stats.minutes_played}&prime;</span>
                <span className="hidden tabular-nums text-chalk md:block">{stats.goals}</span>
                <span className="hidden tabular-nums text-chalk md:block">{stats.assists}</span>
                <span className="hidden tabular-nums text-chalk md:block">
                    <Cards yellow={stats.yellow_cards} red={stats.red_cards} />
                </span>
            </Link>
        </li>
    )
}

function LogSkeleton() {
    return (
        <ul className="m-0 animate-pulse list-none p-0" aria-hidden="true">
            {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                <li key={i} className="flex items-center gap-4 border-b border-line px-4 py-4 last:border-b-0">
                    <div className="h-4 flex-1 rounded bg-line/30" />
                    <div className="h-4 w-16 rounded bg-line/20" />
                </li>
            ))}
        </ul>
    )
}

/** A player's matches, newest first, with their own numbers for each one. */
export default function MatchLog({ playerId }) {
    const { data: log, loading, error, refetch } = useAsync(
        (signal) => api.players.matches(playerId, { signal }),
        [playerId],
        []
    )

    if (error) return <ErrorState error={error} onRetry={refetch} title="Couldn't load the match log" />

    const form = recentForm(log)

    return (
        <div className="rounded-lg border border-line bg-pitch/10">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-4">
                <h3 className="font-display text-lg uppercase tracking-wide text-chalk">Match log</h3>
                {form.length > 0 && (
                    <div className="flex items-center gap-3">
                        <span className="font-body text-xs uppercase tracking-widest2 text-chalk/70">Form</span>
                        <FormPills form={form} />
                    </div>
                )}
            </div>

            {loading ? (
                <LogSkeleton />
            ) : log.length === 0 ? (
                <p className="px-4 py-10 text-center font-body text-sm text-chalk/70">No matches played yet.</p>
            ) : (
                <>
                    <div
                        className={`hidden items-center gap-x-4 border-b border-line px-4 py-2 font-body text-xs uppercase tracking-widest2 text-chalk/70 md:grid ${COLUMNS}`}
                        aria-hidden="true"
                    >
                        <span>Date</span>
                        <span>Opponent</span>
                        <span>Result</span>
                        <span>Min</span>
                        <span>G</span>
                        <span>A</span>
                        <span>Cards</span>
                    </div>
                    <ul className="m-0 list-none p-0">
                        {log.map((row) => (
                            <MatchRow key={row.match_id} row={row} />
                        ))}
                    </ul>
                </>
            )}
        </div>
    )
}
