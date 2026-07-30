import { ShieldCheck, Users, Trophy, Calendar } from "lucide-react";
import StatCard from "./StatCard";

// to-do replace with real counts from  GET /api/stats once the backend exists

const STATS = [
    {label: "Registered clubs", value:128, icon: ShieldCheck},
    {label: "Tracked players", value: 3406, icon:Users },
    {label: "Matches logged", value: 942, icon: Trophy},
    {label: "Fixtures this week", value: 37, icon: Calendar }

]

export default function LeagueStats() {
    return (
        <section className="max-w-7xl mx-auto px-6 md:px-10 py-16">
            <h2 className="font-display uppercase tracking-wide text-2xl text-chalk b-8">
                League Statistics
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {STATS.map((s)=> (
                    <StatCard key={s.label} {...s} />
                ))}
            </div>

        </section>
    )
}