import { Link } from "react-router-dom"
import SilhouettePlaceholder from "./SilhouettePlaceholder"
import { groupSquad } from "../utils/squad"

function SquadPlayerCard({ player, isCaptain }) {
    return (
        <li>
            <Link
                to={`/players/${player.id}`}
                className="group flex h-full flex-col overflow-hidden rounded-lg border border-glass-border bg-night/40 transition-colors hover:border-floodlight/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-floodlight/60"
            >
                <span className="relative block aspect-square overflow-hidden bg-pitch/20">
                    {player.photo_url ? (
                        <img src={player.photo_url} alt="" className="size-full object-cover object-top" loading="lazy" />
                    ) : (
                        <SilhouettePlaceholder className="size-full object-cover object-top" />
                    )}
                    {player.jersey_number != null && (
                        <span className="absolute left-2 top-1.5 font-display text-2xl font-bold tabular-nums text-floodlight drop-shadow">
                            {player.jersey_number}
                        </span>
                    )}
                    {isCaptain && (
                        <span
                            title="Captain"
                            className="absolute right-2 top-2 flex size-5 items-center justify-center rounded bg-floodlight font-display text-xs font-bold text-night"
                        >
                            C<span className="sr-only">aptain</span>
                        </span>
                    )}
                </span>
                <span className="flex flex-col gap-0.5 px-2.5 py-2">
                    <span className="truncate font-body text-sm font-semibold text-chalk group-hover:text-floodlight">{player.name}</span>
                    <span className="truncate font-body text-xs text-chalk/60">
                        {[player.nationality, player.age ? `${player.age} yrs` : null].filter(Boolean).join(" · ") || player.position}
                    </span>
                </span>
            </Link>
        </li>
    )
}

/** Squad cards grouped by position line, goalkeepers first. */
export default function SquadGrid({ players, captainId }) {
    const lines = groupSquad(players)

    return (
        <div className="flex flex-col gap-6">
            {lines.map((line) => (
                <section key={line.position} aria-labelledby={`squad-${line.position}`}>
                    <h3 id={`squad-${line.position}`} className="mb-2.5 font-display text-xs uppercase tracking-widest2 text-floodlight">
                        {line.label}
                    </h3>
                    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                        {line.players.map((player) => (
                            <SquadPlayerCard key={player.id} player={player} isCaptain={player.id === captainId} />
                        ))}
                    </ul>
                </section>
            ))}
        </div>
    )
}
