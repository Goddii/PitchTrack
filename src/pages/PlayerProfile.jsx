import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, UserX} from "lucide-react"
import { useAuth } from "../context/AuthContext"
import PublicNavbar from "../components/PublicNavbar"
import PlayerRadarChart from "../components/PlayerRadarChart"
import EmptyState from "../components/EmptyState"
import api from "../services/api"


const WALKIN_STYLES = `
@keyframes pt-walk-in{
    0% {opacity: 0; transform: translateX(-10%) scale(0.94); filter: blur(8px);}
    60% {filter: blur(0px);}
    100% {opacity: 1; transform: translateX(0) scale(1); filter: blur(0px);}
}

@keyframes pt-sweep {
    0% {transform: translateX(-130%) skewX(-12deg); opacity: 0;}
    35% {opacity: 0.55}
    100% {transform: translateX(230%) skewX(-12deg); opacity: 0;}
}

@keyframes pt-rise-in {
    0% {opacity: 0; transform: translateY(12px)}
    100% {opacity: 1; transform: translateY(0)}

}

.player-walkin-card { animation: pt-walk-in 0.85s cubic-bezier(0.22, 1, 0.36, 1) both; }
.player-walkin-sweep { animation: pt-sweep 1.05s ease-out 0.25s both; }
.player-walkin-meta > * { animation: pt-rise-in 0.5s ease-out both;}
.player-walkin-meta > *:nth-child(1) { animation-delay: 0.5s }
.player-walkin-meta > *:nth-child(2) { animation-delay: 0.6s }
.player-walkin-meta > *:nth-child(3) { animation-delay: 0.7s }
@media (prefers-reduced-motion: reduce ) {
    .player-walkin-card, .player-walkin-sweep, .player-walkin-meta > * { animation: none !important }
}
`;

export default function PlayerProfile() {
    const { user } = useAuth()
    const { id } = useParams();
    const [player, setPlayer ] = useState(null)
    const [loading, setLoading] = useState(true)


    useEffect(() => {
        let cancelled = false
        setLoading(true)
        api.players
            .get(id)
            .then((data) => {
                if (!cancelled) setPlayer(data)
            })
            .catch(() => {
                if (!cancelled) setPlayer(null)
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })
        return () => { cancelled = true }
    }, [id])

    if (loading) {
        return (
            <div>
                <PublicNavbar user={user} />
                <div className="max-w-7xl mx-auto px-6 md:px-10 py-24 animate-pulse">
                    <div className="h-8 w-56 bg-line/30 rounded mb-4"/>
                    <div className="h-4 w-36 bg-line/20 rounded"/>

                </div>
            </div>
        )
    }

    if (!player) {
        return (
            <div>
                <PublicNavbar user={user} />
                <EmptyState 
                icon={UserX}
                title="Player not found"
                message="This profile may have been removed, or the link is out of date"
                action={ 
                    <Link to="/players" className="font-body text-sm font-semibold text-floodlight hover:text-chalk transition-colors">
                          ← Back to Players
                    </Link>
                }
                
                />
            </div>
        )
    }

    const initials = player.name.split(" ").map((w) => w[0]).slice(0, 2).join("")

    return (
        <div key={player.id}>
            <style>{WALKIN_STYLES}</style>
            <PublicNavbar user={user} />

            <section className="bg-gradient to-b from-night to-pitch/20 border-b border-line">
                <div className="max-w-7xl mx-auto px-6 md:px-10 py-14">
                    <Link
                    to="/players"
                    className="inline-flex items-center gap-1.5 font-body text-sm text-chalk/50 hover:text-floodlight transition-colors mb-8"
                    >
                        <ArrowLeft size={15} /> Back to Players
                    </Link>
                    <div className="flex flex-col sm:flex-row items-center sm:items-end gap-8">
                        {/* walk in photo/placeholder*/}
                        <div className="player-walkin-card relative w-44 h-56 shrink-0 rounded-2xl overflow-hidden border border-line bg-gradient-to-b from-pitch/60 to-night">
                            {player.photo_url ? (
                                <img src={player.photo_url} alt={player.name} className="w-full h-full object-cover" />
                            ) : (
                                <>
                                    <span className="absolute -bottom-4 -right-2 font-display font-bold text-[7rem] leading-none text-chalk/10 select-none">
                                        {player.jersey_number}
                                    </span>
                                    <div className="relative h-full flex items-center justify-center">
                                        <span className="font-display text-5xl text-chalk/60"> {initials} </span>

                                    </div>
                                
                                </>
                            ) }
                            <div className="player-walkin-sweep absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-chalk/25 to-transparent"/>
                            <div className="absolute bottom-0 inset-x-0 h-1 bg-floodlight"/>
                        </div>
                        <div className="player-walkin-meta flex-1 text-center sm:text-left">
                            <h1 className="font-display uppercase tracking-wide text-4xl md:text-5xl text-chalk mb-4">
                                {player.name}
                            </h1>

                            <div className="flex flex-wrap justify-center sm:justify-start gap-x-8 gap-y-3">
                                {[

                                    { label: "Position", value: player.position },
                                    { label: "Jersey", value: `#${player.jersey_number}`},
                                    { label: "Age", value: player.age },
                                    { label: "Nationality", value: player.nationality},
                                ].map((stat) => (
                                    <div key={stat.label}>
                                        <div className="font-body text-[11px] uppercase tracking-widest2 text-chalk/40 mb-0.5">
                                            {stat.label}
                                        </div>
                                        <div className="font-display text-lg text-chalk"> {stat.value}</div>

                                    </div>
                                ))}

                            </div>

                            <Link 
                            to = {`/teams/${player.team.id}`}
                            className="inline-block mt-5 font-body text-sm text-floodlight hover:text-chalk transition-colors"
                            >
                                {player.team.name}
                            </Link>

                        </div>
                    </div>
                </div>

            </section>

            <section className="max-w-7xl mx-auto px-6 md:px-10 py-16 grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                <PlayerRadarChart attributes={player.attributes} />

                <div>
                    <h2 className="font-display uppercase tracking-wide text-2xl text-chalk mb-4">Biography</h2>
                    <p className="font-body text-chalk/60 leading-relaxed">{player.bio}</p>
                </div>

            </section>

        </div>
    )
}