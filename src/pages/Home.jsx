import { ShieldCheck, Users, Trophy, Calendar } from "react";
import Hero from "../components/Hero";
import HowItWorks from "../components/HowItWorks";
import CTASection from "../components/CTASection";


const STATS = [
    { label: "Registered clubs", value: 128, icon: ShieldCheck },
    { label: "Tracked players", value: 3406, icon: Users},
    { label: "Matches logged", value: 942, icon: Trophy},
    { label: "Fixtures this week", value: 37, icon: Calendar},
]




export default function Home() {
    const [teams, setTeams] = useState([])
    const [matches, setMatches] = useState([])

    return (
        <div className="homepage-skill">
            <Hero />
            <main className="homepage-content">
                <section className="stats-ribbon" id="stats">
                    <div className="stats-ribbon-inner">
                        {STATS.map((s) => (
                            <div key={s.label} className="stats-ribbon-item">
                                <div className="stats-ribbon-number">
                                    {s.value.toLocaleString()}
                                </div>
                                <div className="stats-ribbon-label"> {s.label} </div>

                            </div>
                        ))}

                    </div>

                </section>

                <HowItWorks />

                <CTASection />

            </main>

            { /* FOOTER*/}
            <footer className="site-footer">
                <span>&copy; 2026 PitchTrack</span>
                <div className="site-footer-links">
                    <a href="/about">About</a>
                    <a href="/contact">Contact</a>

                </div>

            </footer>
        </div>    
    )    

}