import { Link } from "react-router-dom";
 
export default function CTASection() {
    return (
        <section className="max-w-7xl mx-auto px-6 md:px-10 pb-20">
            <div className="bg-floodlight rounded-lg px-8 py-14 md:py-20 text-center">
                <h2 className="font-display uppercase tracking-wide text-3xl md:text-4xl text-night mb-4">
                    Ready to run your league properly?
                </h2>
                <p className="font-body text-night/70 mb-8 max-w-xl mx-auto">
                    Free to join. Set up your club or start following your favorites in minutes.
                </p>
                <Link
                    to="/register"
                    className="inline-block bg-night text-chalk font-body font-semibold px-7 py-3.5 rounded hover:bg-night/80 transition-colors"
                >
                    Create your account
                </Link>
            </div>
        </section>
    );
}