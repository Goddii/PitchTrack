import { link } from "react-router-dom"


export default function PlayerCard( {player} ) {
    return (

        <Link 
        to={`/players/${player.id}`}
        className="group bg-pitch/40 border border-line rounded-lg p-5 flex flex-col items-center text-center hover:border-floodlight transition-colors" 
        >
            <div className="w-16 h-16 rounded-full bg-pitch flex items-center justify-center mb-3 overflow-hidden relative">
                {player.photo_url ? (
                    <img src={player.photo_url} alt={player.name} className="w-full h-full object-cover"/>
                ) : (
                    <span className="font-display text-chalk/50 text-xl">
                        {player.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                    </span>
                )}
            </div>
            <span className="font-display uppercase  tracking-wide text-chalk group-hover:text-floodlight transition-colors">
                {player.name}
            </span>
            <span className="font-body text-sm text-chalk/50 mt-1">
                {player.position} · #{player.jersey_number}
            </span>
            <span className="font-body text-xs text-chalk/35 mt-0.5"> {player.team.name} </span>
        </Link>
    )
}