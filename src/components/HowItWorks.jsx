const STEPS = [
    { step: "01", title: "Create your league", body: "Set up your competition and invite club admins to onboard their own rosters." },
    { step: "02", title: "Track every fixture", body: "Schedule matches, log scores, and keep standings current without spreadsheets." },
    { step: "03", title: "Fans follow along", body: "Supporters register, follow clubs, and get a dashboard built around their teams." },
];

export default function HowItWorks() {
    return (
        <section className="max-w-7xl mx-auto px-6 md:px-10 py-16">
            <h2 className="font-display uppercase tracking-wide text-2xl text-chalk mb-10">
                How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {STEPS.map((s, i) => (
                    <div key={s.step} className="relative">
                        <div className="font-display text-5xl font-bold text-line mb-3">{s.step}</div>
                        <div className="font-display uppercase tracking-wide text-lg text-chalk mb-2">
                            {s.title}
                        </div>
                        <p className="font-body text-sm text-chalk/50 leading-relaxed">{s.body}</p>
                        {i < STEPS.length - 1 && (
                            <div className="hidden md:block absolute top-5 -right-5 w-10 h-px bg-line" />
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}