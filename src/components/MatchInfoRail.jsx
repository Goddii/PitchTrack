import { Link } from "react-router-dom"
import { ArrowRight, RefreshCw } from "lucide-react"
import MatchStatusBadge from "./MatchStatusBadge"
import { kickoffDate, kickoffTime } from "../utils/matchBoard"

function InfoRow({ label, value }) {
    return (
        <div className="flex items-baseline justify-between gap-3 border-b border-glass-border py-2.5 last:border-b-0">
            <dt className="font-body text-xs uppercase tracking-widest2 text-chalk/60">{label}</dt>
            <dd className="min-w-0 truncate text-right font-body text-sm text-chalk" title={String(value)}>
                {value}
            </dd>
        </div>
    )
}

function Panel({ title, action, children }) {
    return (
        <section className="rounded-xl border border-glass-border bg-glass-bg p-4">
            <div className="mb-1 flex items-center justify-between gap-2">
                <h2 className="font-display text-sm uppercase tracking-wide text-chalk">{title}</h2>
                {action}
            </div>
            {children}
        </section>
    )
}

/** The left panel of the Matches page: the selected match's details, the league counts and a way in to the match hub. */
export default function MatchInfoRail({ match, counts, total, onRefresh }) {
    const isScheduled = match.status === "scheduled"

    return (
        <aside aria-label="Match details" className="flex min-h-0 flex-col gap-3 lg:overflow-y-auto">
            <Panel
                title="Match"
                action={
                    <button
                        type="button"
                        onClick={onRefresh}
                        aria-label="Refresh matches"
                        className="flex size-9 cursor-pointer items-center justify-center rounded-lg text-chalk/60 transition-colors hover:text-chalk focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-floodlight/60"
                    >
                        <RefreshCw size={15} aria-hidden="true" />
                    </button>
                }
            >
                <div className="py-2">
                    <MatchStatusBadge status={match.status} minute={match.minute} />
                </div>
                <dl>
                    <InfoRow label="Date" value={kickoffDate(match.match_date) || "TBC"} />
                    {isScheduled && <InfoRow label="Kickoff" value={kickoffTime(match.match_date) || "TBC"} />}
                    <InfoRow label="Venue" value={match.venue || "TBC"} />
                </dl>
                <Link
                    to={`/matches/${match.id}`}
                    className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-floodlight px-4 font-body text-sm font-semibold uppercase tracking-widest2 text-night transition-colors hover:bg-chalk focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chalk focus-visible:ring-offset-2 focus-visible:ring-offset-night"
                >
                    Match hub
                    <ArrowRight size={14} aria-hidden="true" />
                </Link>
            </Panel>

            <Panel title="League">
                <dl>
                    <InfoRow label="Matches" value={total} />
                    <InfoRow label="Live" value={counts.live} />
                    <InfoRow label="Upcoming" value={counts.upcoming} />
                    <InfoRow label="Finished" value={counts.completed} />
                </dl>
            </Panel>
        </aside>
    )
}
