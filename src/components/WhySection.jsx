import { ShieldCheck, Radio, Users, Trophy } from "lucide-react";
 
const FEATURES = [
    { icon: ShieldCheck, title: "Built for admins", body: "Manage teams, players, and fixtures from one dashboard." },
    { icon: Radio, title: "Always current", body: "Scores update the moment a match is marked complete." },
    { icon: Users, title: "Fan accounts", body: "Supporters follow clubs and get a feed built around them." },
    { icon: Trophy, title: "Season history", body: "Past results stay searchable, not buried in a folder." },
];
 
export default function WhySection() {
    return (
        <section className="bg-night border-y border-line py-16">
            <div className="max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                    <h2 className="font-display uppercase tracking-wide text-2xl text-chalk mb-4">
                        Why PitchTrack
                    </h2>
                    <p className="font-body text-chalk/60 leading-relaxed max-w-md">
                        Spreadsheets don't scale past one season. Rosters change, fixtures move,
                        and scores need to be right the moment the final whistle blows.
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {FEATURES.map((f) => (
                        <div key={f.title} className="bg-pitch/10 border border-line rounded-lg p-5">
                            <f.icon size={20} className="text-floodlight" strokeWidth={1.75} />
                            <div className="font-display uppercase tracking-wide text-chalk mt-3 mb-1">
                                {f.title}
                            </div>
                            <div className="font-body text-sm text-chalk/50 leading-relaxed">{f.body}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}