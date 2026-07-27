import { Link } from "react-router-dom";

export default function CTASection() {
  return (
    <section className="cta-section">
      <div className="cta-section-inner">
        <h2 className="cta-section-heading">
          Ready to run your league properly?
        </h2>
        <p className="cta-section-body">
          Free to join. Set up your club or start following your favorites in
          minutes.
        </p>
        <Link to="/register" className="cta-section-button">
          Create Your Account
        </Link>
      </div>
    </section>
  );
}