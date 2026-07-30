const STEPS = [
    { step: "01", title: "Create your league", body: "Set up your competition and invite club admins to onboard their own rosters." },
    { step: "02", title: "Track every fixture", body: "Schedule matches, log scores, and keep standings current without spreadsheets." },
    { step: "03", title: "Fans follow along", body: "Supporters register, follow clubs, and get a dashboard built around their teams." },
];

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
        </section>
      );
}