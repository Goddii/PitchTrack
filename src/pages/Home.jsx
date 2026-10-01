import { useMemo } from "react";
import { Link } from "react-router-dom";
import HomeSpotlight from "../components/HomeSpotlight";
import Hero from "../components/Hero";
import HowItWorks from "../components/HowItWorks";
import CTASection from "../components/CTASection";
import { useAsync } from "../hooks/useAsync";
import { summarizeLeague, pickFeaturedMatch, pickFixtureStrip } from "../utils/leagueSummary";
import api from "../services/api";

export default function Home() {
    // One load feeds the hero, the stats ribbon and the spotlight, so every number on the page
    // comes from the same real data
    const { data, loading, error, refetch } = useAsync(
        (signal) =>
            Promise.all([
                api.teams.list({ signal }),
                api.players.list({}, { signal }),
                api.matches.list({}, { signal }),
            ]).then(([teams, players, matches]) => ({ teams, players, matches })),
        [],
        { teams: [], players: [], matches: [] }
    )

    const summary = useMemo(() => summarizeLeague(data), [data])
    const featuredMatch = useMemo(() => pickFeaturedMatch(data.matches), [data.matches])
    const fixtures = useMemo(() => pickFixtureStrip(data.matches), [data.matches])
    const unavailable = loading || Boolean(error)

    // "—" while loading or if the API is unreachable: never a made-up figure
    const show = (value) => (unavailable ? "—" : value.toLocaleString())

    const stats = [
        { label: "Clubs", value: show(summary.clubs) },
        { label: "Players", value: show(summary.players) },
        { label: "Matches played", value: show(summary.played) },
        { label: "Goals scored", value: show(summary.goals) },
    ]

    return (
        <div className="homepage-skill">
            <Hero summary={summary} featuredMatch={featuredMatch} unavailable={unavailable} loading={loading} />
            <main id="main" className="homepage-content">
                <section className="stats-ribbon" id="stats" aria-label="League at a glance">
                    <div className="stats-ribbon-inner">
                        {stats.map((s) => (
                            <div key={s.label} className="stats-ribbon-item">
                                <div className="stats-ribbon-number">{s.value}</div>
                                <div className="stats-ribbon-label">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </section>

                <HomeSpotlight matches={data.matches} players={data.players} loading={loading} />

                <HowItWorks
                    fixtures={fixtures}
                    teams={data.teams}
                    loading={loading}
                    error={error}
                    onRetry={refetch}
                />

                <CTASection summary={summary} unavailable={unavailable} />
            </main>

            <footer className="site-footer">
                <span>&copy; {new Date().getFullYear()} PitchTrack</span>
                <div className="site-footer-links">
                    <Link to="/teams">Teams</Link>
                    <Link to="/players">Players</Link>
                    <Link to="/matches">Matches</Link>
                    <Link to="/login">Sign in</Link>
                </div>
            </footer>
        </div>
    )
}
