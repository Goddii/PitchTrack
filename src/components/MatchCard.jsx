function Crest( {name} ) {
    return (
        <span className="w-7 h-7 rounded-full bg-pitch flex items-center justify-center shrink-0 font-display text-[11px] text-chalk/60">
            {name ?.charAt(0) ?? "?"}
        </span>
    )
}




export default function MatchCard({ match }) {
    const date = new Date(match.match_date)
    const formattedDate = date.toLocaleDateString(undefined, {
        weekday: "short",
        day: "numeric",
        month: "short",
    })

    const formattedTime = date.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
    })

    const isCompleted = match.status === "completed"

    return (
        <div className="flex items-center justify-between px-5 py-4 border-b border-line last:border-b-0 font-body">
            <div className="flex items-center gap-3">
                <span className="text-chalk">{match.home_team?.name ?? "TBD"}</span>
                {isCompleted ? (
                    <span className="font-display font-semibold text-floodlight tabular-nums">
                        {match.home_score} - {match.away_score}
                    </span>    
                ) : (
                    <span className="text-chalk/40 text-sm uppercase tracking-widest2"> vs </span>
                )}
                <span className="text-chalk">{match.away_team?.name ?? "TBD"}</span>

            </div>
            <span className="text-chalk/50 text-sm">{isCompleted ? "Final": `${formattedDate} - ${formattedTime}`}
            </span>

        </div>
    )
}