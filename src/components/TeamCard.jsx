import { Link } from "react-router-dom"


export default function TeamCard({ team }) {
    return (
        <Link 
        to={`/teams/${team.id}`}
        className="group bg-pitch/40 border border-line rounded-lg p-5 flex flex-col items-center text-center hover:border-floodlight transition-colors"
        
        >
            <div className="w-16 h-16 rounded-full bg-pitch flex items-center justify-center mb-3 overflow-hidden">
                {team.logo_url ? (
                    <img src={team.logo_url} alt={`${team.name} logo`} className="w-full h-full object-cover" />
                ):(
                    <span className="font-display text-chalk/50 text-xl">
                        {team.name?.charAt(0) ?? "?"}
                    </span>    
                )} 
            </div>
            <span className="font-display uppercase tracking-wide text-chalk group-hover:text-floodlight transition-colors">
                {team.name}
            </span>
            <span className="font-body text-sm text-chalk/50 mt-1">{team.city}</span>    
        </Link>
    )
}