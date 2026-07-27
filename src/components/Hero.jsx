import { useEffect, useRef } from "react";
import { ArrowRight, Trophy, Users, ShieldCheck } from "lucide-react"; 
import { Link } from "react-router-dom";   
import Navbar from "./Navbar"; 
import heroPlayer from "../assets/soccer.png"  

/*  stat card for the hero overlay */
function HeroStatCard( {label, value, delay} ){
    return (
        <div 
            className="hero-card"
            style={ {animationDelay: `${delay}`}}
            >
                <div className="hero-card-label">{label}</div>
                <div className="hero-card-value">
                    <strong> {value.toLocaleString()}</strong>
                </div>
        </div>
    )
}

/*  fixture card for the hero overlay*/
function HeroFixtureCard() {
    return (
        <div className="hero-card" style={{ animationDelay: "0.6s"}}>
            <div className="hero-card-label">Next Fixture</div>
            <div className="hero-card-value" style={{ fontSize: "1.1rem" }}> FC Red vs FC Blue </div>
            <div className="hero-card-detail">
                Saturday 20:00 &mdash; Riverside Stadium
            </div>
        </div>
    )
}

/* hero section */
export default function Hero() {
    const heroRef = useRef(null)
    const playerRef = useRef(null)
    const parallaxRef = useRef({ x:0, y:0})

    /* Entrance animation + mouse parallax on desktop */
    useEffect(() => {
      const player = playerRef.current;
      const hero = heroRef.current;
      if (!player || !hero) return;
  
      const media = window.matchMedia("(prefers-reduced-motion: reduce)");
      const reducedMotion = media.matches;
  
      /* Set initial entrance transform (only if not reduced motion) */
      if (!reducedMotion) {
        player.style.transform = "translateY(40px) scale(0.97)";
  
        /* Trigger entrance after a tiny delay to let the browser apply the initial transform */
        const entranceTimer = setTimeout(() => {
          player.style.transition =
            "transform 0.9s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1)";
          player.style.opacity = "1";
          player.style.transform = "translateY(0) scale(1)";
        }, 50);
  
        /* Mouse parallax: update transform directly via ref to avoid React re-renders */
        const handleMove = (e) => {
          const rect = hero.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width - 0.5) * 12;
          const y = ((e.clientY - rect.top) / rect.height - 0.5) * 6;
          parallaxRef.current = { x, y };
  
          /* Only apply parallax after entrance animation completes (~950ms) */
          if (performance.now() - entranceStart > 1000) {
            player.style.transform = `translate(${x}px, ${y}px)`;
          }
        };
  
        const entranceStart = performance.now();
        hero.addEventListener("mousemove", handleMove, { passive: true });
  
        return () => {
          clearTimeout(entranceTimer);
          hero.removeEventListener("mousemove", handleMove);
        };
      } else {
        /* Reduced motion: just show the player */
        player.style.opacity = "1";
        player.style.transform = "none";
      }
    }, []);

    //  stats data for floating cards
    const heroStats = [
        { label: "Registered Clubs", value: 128 },
        { label: "Tracked Players", value:3406 },
        { label: "Matches Logged", value: 942 }
    ]

    return (
        <section id="home" ref={heroRef} className="hero">
          {/* ── Background layers ── */}
          <div className="hero-bg" aria-hidden="true">
            <div className="hero-bg-gradient" />
            <div className="hero-bg-glow" />
            <div className="hero-bg-ambient" />
          </div>
          <div className="hero-bg-grain" aria-hidden="true" />
    
          {/* ── Navigation ── */}
          <Navbar transparent />
    
          {/* ── Content grid ── */}
          <div className="hero-content">
            {/* Typography */}
            <div className="hero-typography">
              <h1 className="hero-wordmark">
                <span>PITCH</span>
                <span>
                  TRACK<span className="word-accent">.</span>
                </span>
              </h1>
              <p className="hero-tagline">
                Your league. Your team. Your moment. Track every match, every player,
                every legacy &mdash; all in one place.
              </p>
              <div className="hero-cta-group">
                <Link to="/register" className="hero-cta-primary">
                  Get Started <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <Link to="/teams" className="hero-cta-secondary">
                  Browse Teams
                </Link>
              </div>
            </div>
    
            {/* Player */}
            <div className="hero-player-zone">
              <div className="hero-player-shadow" aria-hidden="true" />
              <img
                ref={playerRef}
                src={heroPlayer}
                alt=""
                aria-hidden="true"
                className="hero-player-img"
                draggable={false}
              />
            </div>
    
            {/* Floating cards */}
            <div className="hero-cards">
              <HeroFixtureCard />
              {heroStats.map((stat, i) => (
                <HeroStatCard
                  key={stat.label}
                  label={stat.label}
                  value={stat.value}
                  delay={0.75 + i * 0.15}
                />
              ))}
            </div>
          </div>
        </section>
    )    
}