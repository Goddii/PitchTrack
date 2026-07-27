import { ShieldCheck, Radio, Users, Trophy} from "lucide-react"

const STEPS = [
    { step: "01", title: "Create your league", body: "Set up your competition and invite club admins to onboard their own rosters." },
    { step: "02", title: "Track every fixture", body: "Schedule matches, log scores, and keep standings current without spreadsheets." },
    { step: "03", title: "Fans follow along", body: "Supporters register, follow clubs, and get a dashboard built around their teams." },
];

const FEATURES = [
    {
        icon: ShieldCheck,
        title: "Built for admins",
        body: "Manage teams, players, and fixtures from one dashboard.",
      },
      {
        icon: Radio,
        title: "Always current",
        body: "Scores update the moment a match is marked complete.",
      },
      {
        icon: Users,
        title: "Fan accounts",
        body: "Supporters follow clubs and get a feed built around them.",
      },
      {
        icon: Trophy,
        title: "Season history",
        body: "Past results stay searchable, not buried in a folder.",
      },
]

export default function HowItWorks() {
    return (
        <section className="section-padded" id="how-it-works">
          <h2 className="section-heading">How It Works</h2>
          <p className="section-sub">
            Spreadsheets don&apos;t scale past one season. Rosters change, fixtures
            move, and scores need to be right the moment the final whistle blows.
          </p>
    
          <div className="how-it-works-grid">
            {STEPS.map((s) => (
              <div key={s.step} className="how-it-works-step">
                <div className="how-it-works-step-number">{s.step}</div>
                <div className="how-it-works-step-title">{s.title}</div>
                <p className="how-it-works-step-body">{s.body}</p>
              </div>
            ))}
          </div>
    
          {/* Feature pills  */}
          <div className="feature-pills">
            {FEATURES.map((f) => (
              <div key={f.title} className="feature-pill">
                <div className="feature-pill-icon">
                  <f.icon size={18} strokeWidth={1.75} />
                </div>
                <div className="feature-pill-title">{f.title}</div>
                <div className="feature-pill-body">{f.body}</div>
              </div>
            ))}
          </div>
        </section>
      );
}