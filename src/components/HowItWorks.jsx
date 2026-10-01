import FixtureStrip from "./FixtureStrip"

const STEPS = [
    { step: "01", title: "Create your league", body: "Set up your competition and invite club admins to onboard their own rosters." },
    { step: "02", title: "Track every fixture", body: "Schedule matches and log scores. Results go live the moment a match is marked complete." },
    { step: "03", title: "Fans follow along", body: "Supporters register, follow clubs, and get a dashboard built around their teams." },
]

export default function HowItWorks({ fixtures, teams, loading, error, onRetry }) {
    const [lead, ...rest] = STEPS

    return (
        <section className="section-padded" id="how-it-works" aria-labelledby="how-it-works-heading">
            <h2 id="how-it-works-heading" className="section-heading">How It Works</h2>
            <p className="section-sub">
                Spreadsheets don&apos;t scale past one season. Rosters change, fixtures
                move, and scores need to be right the moment the final whistle blows.
            </p>

            <div className="how-it-works-grid">
                <div className="how-it-works-step how-it-works-step-lead">
                    <div className="how-it-works-step-number" aria-hidden="true">{lead.step}</div>
                    <h3 className="how-it-works-step-title">{lead.title}</h3>
                    <p className="how-it-works-step-body">{lead.body}</p>
                </div>
                <div className="how-it-works-side">
                    {rest.map((s) => (
                        <div key={s.step} className="how-it-works-step">
                            <div className="how-it-works-step-number" aria-hidden="true">{s.step}</div>
                            <h3 className="how-it-works-step-title">{s.title}</h3>
                            <p className="how-it-works-step-body">{s.body}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="how-it-works-payoff">
                <h3 className="how-it-works-payoff-title">What fans see</h3>
                <FixtureStrip
                    fixtures={fixtures}
                    teams={teams}
                    loading={loading}
                    error={error}
                    onRetry={onRetry}
                />
            </div>
        </section>
    )
}
