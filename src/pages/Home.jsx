import { useState } from "react";
import Hero from "../components/Hero";
import TeamCard from "../components/TeamCard"
import MatchCard from "../components/MatchCard"


export default function Home() {
    const [teams, setTeams] = useState([])
    const [matches, setMatches] = useState([])

    return (
        <div>
            <Hero />
            <section className="max-w-7xl mx-auto px-6 md:px-10 py-16">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="font-display uppercase tracking-wide text-2xl text-chalk">
                        Featured Teams
                    </h2>
                </div>

                {teams.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {teams.map((team) => (
                            <TeamCard key={team.id} team={team} />
                        ))}
                    </div>
                ): (
                    <p className="font-body text-chalk/50">No teams to show yet</p>
                )}

            </section>
            <section className="max-w-7xl mx-auto px-6 md:px-10 pb-20">
                <h2 className="font-display upppercase tracking-wide text-2xl text-chalk mb-8">
                    Upcoming Matches
                </h2>

                {matches.length > 0 ? (
                    <div className="bg-pitch/30 border border-line rounded-lg overflow-hidden">
                        {matches.map((match) => (
                            <MatchCard key={match.id} match={match} />
                        ))}
                    </div>
                ) : (
                    <p className="font-body text-chalk/50">No fixtures scheduled yet</p>
                )}

            </section>
            <footer className="border-t border-line px-6 md:px-10 py-8 flex flex-col md:flex-col md:flex-row items-center justify-between gap-4 font-body text-sm text/chalk/50">
            <span>@ 2026 PitchTrack</span>
            <div className="flex gap-6">
                <a href="/about" className="hover:text-floodlight transition-colors">About</a>
                <a href="/contact" className="hover:text-floodlight transition-colors">Contact</a>
            </div>
            </footer>    
        </div>
    )
}