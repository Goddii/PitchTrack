import { Link } from "react-router-dom"
import FormPills from "./FormPills"

export default function TeamCard({ team, entry }) {
    return (
        <Link
            to={`/teams/${team.id}`}
            className="spotlight-card group relative flex flex-col items-center overflow-hidden rounded-xl border border-line bg-pitch/40 p-5 text-center hover:border-floodlight/50"
        >
            <span
                className="pointer-events-none absolute -bottom-6 -right-1 select-none font-display text-[8rem] font-bold leading-none text-chalk/[0.05]"
                aria-hidden="true"
            >
                {entry ? entry.position : ""}
            </span>

            <div className="relative mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-pitch">
                {team.logo_url ? (
                    <img src={team.logo_url} alt={`${team.name} logo`} className="h-full w-full object-cover" />
                ):(
                    <span className="font-display text-xl text-chalk/85">
                        {team.name?.charAt(0) ?? "?"}
                    </span>
                )}
            </div>
            <span className="relative font-display uppercase tracking-wide text-chalk transition-colors group-hover:text-floodlight">
                {team.name}
            </span>
            <span className="relative mt-1 font-body text-sm text-chalk/70">{team.city}</span>

            {entry && (
                <div className="relative mt-4 flex w-full flex-col items-center gap-2 border-t border-line pt-4">
                    <span className="font-body text-xs tabular-nums text-chalk/70">
                        P{entry.played} · {entry.wins}W {entry.draws}D {entry.losses}L ·{" "}
                        <span className="font-semibold text-floodlight">{entry.points} pts</span>
                    </span>
                    <FormPills form={entry.form} />
                </div>
            )}
        </Link>
    )
}
