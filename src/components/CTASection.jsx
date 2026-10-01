import { Link } from "react-router-dom";

export default function CTASection({ summary, unavailable }) {
  const hasProof = !unavailable && summary.clubs > 0

  return (
    <section className="cta-section">
      <div className="cta-section-inner">
        <h2 className="cta-section-heading">
          Ready to run your league properly?
        </h2>
        <p className="cta-section-body">
          {hasProof
            ? `${summary.clubs.toLocaleString()} clubs, ${summary.players.toLocaleString()} players and ${summary.goals.toLocaleString()} goals tracked so far. Free to join.`
            : "Free to join. Set up your club or start following your favorites in minutes."}
        </p>
        <div className="cta-section-actions">
          <Link to="/register" className="cta-section-button">
            Run a league
          </Link>
          <Link to="/teams" className="cta-section-button cta-section-button-outline">
            Follow your club
          </Link>
        </div>
      </div>
    </section>
  );
}