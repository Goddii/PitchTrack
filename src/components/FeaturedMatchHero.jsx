import { memo, useState } from "react"
import { Link } from "react-router-dom"
import { MapPin, Clock, Play, ChevronRight, User, Sun, Users } from "lucide-react"
import MatchStatusBadge from "./MatchStatusBadge"
import TeamEmblem from "./TeamEmblem"
import football1 from "../assets/football1.png"

function FeaturedMatchHero({ match }) {
  const [imgError, setImgError] = useState(false)

  if (!match) return null

  const date = new Date(match.match_date)
  const formattedDate = date.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
  const formattedTime = date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  })

  const isLive = match.status === "live"
  const hasScore = (isLive || match.status === "completed") && match.home_score != null

  return (
    <section
      className="relative w-full overflow-hidden min-h-[70vh] md:min-h-[75vh] lg:min-h-[80vh] flex items-center"
      aria-label="Featured match"
    >
      {/* ── Background layers ── */}
      <div className="absolute inset-0 bg-black" aria-hidden="true">
        {/* Stadium image with blur */}
        {!imgError ? (
          <div className="absolute inset-0">
            <img
              src={football1}
              alt=""
              className="w-full h-full object-cover opacity-60 sm:opacity-70 scale-105 featured-hero-breathe"
              onError={() => setImgError(true)}
              loading="eager"
            />
            {/* Soft blur overlay */}
            <div className="absolute inset-0 backdrop-blur-[2px]" />
          </div>
        ) : null}

        {/* Gradient overlays — layered for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-black/70" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80" />

        {/* Central amber glow */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[900px] h-[700px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse, rgba(255,182,39,0.1) 0%, rgba(255,182,39,0.03) 40%, transparent 65%)",
          }}
          aria-hidden="true"
        />

        {/* Floating accent shapes */}
        <div className="hero-accent-shape hero-accent-shape-1" aria-hidden="true" />
        <div className="hero-accent-shape hero-accent-shape-2" aria-hidden="true" />
      </div>

      {/* ── Grain overlay ── */}
      <div className="absolute inset-0 opacity-[0.025] bg-noise pointer-events-none" aria-hidden="true" />

      {/* ── Content ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-10 py-24 md:py-36 lg:py-44">
        {/* Breadcrumb / Competition */}
        <div className="flex items-center gap-2 mb-8 md:mb-10">
          <div className="w-8 h-8 rounded-full bg-floodlight/20 flex items-center justify-center font-display text-[11px] font-bold text-floodlight ring-1 ring-floodlight/30">
            PT
          </div>
          <span className="font-body text-[11px] uppercase tracking-widest2 text-chalk/50">
            PitchTrack League
          </span>
          <ChevronRight size={12} className="text-chalk/30" aria-hidden="true" />
          <span className="font-body text-[11px] uppercase tracking-widest2 text-chalk/60">
            Featured Match
          </span>
        </div>

        {/* ── Teams + Score — centered cinematic layout ── */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-center gap-8 lg:gap-16 xl:gap-24">
          {/* Home team */}
          <div className="flex flex-col items-center lg:items-end gap-3 lg:min-w-[220px]">
            <TeamEmblem name={match.home_team?.name} size="lg" />
            <p className="font-display text-xl lg:text-3xl font-bold text-chalk uppercase tracking-wide text-center lg:text-right leading-tight">
              {match.home_team?.name ?? "TBD"}
            </p>
            <span className="font-body text-[10px] uppercase tracking-[0.25em] text-chalk/40">
              Home
            </span>
          </div>

          {/* Score / VS */}
          <div className="flex flex-col items-center gap-4 shrink-0">
            {hasScore ? (
              <div className="flex items-center gap-5 md:gap-6">
                <span className="font-display text-8xl md:text-9xl font-bold text-chalk tabular-nums leading-none tracking-tight drop-shadow-lg">
                  {match.home_score}
                </span>
                <span className="font-display text-5xl md:text-6xl text-chalk/15 font-bold">-</span>
                <span className="font-display text-8xl md:text-9xl font-bold text-chalk tabular-nums leading-none tracking-tight drop-shadow-lg">
                  {match.away_score}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <span className="font-display text-4xl md:text-5xl font-bold text-chalk/30 uppercase tracking-widest">
                  VS
                </span>
              </div>
            )}
            <MatchStatusBadge
              status={match.status}
              minute={match.minute}
              className={`text-xs px-4 py-1.5 ${isLive ? "live-badge-glow" : ""}`}
            />
          </div>

          {/* Away team */}
          <div className="flex flex-col items-center lg:items-start gap-3 lg:min-w-[220px]">
            <TeamEmblem name={match.away_team?.name} size="lg" />
            <p className="font-display text-xl lg:text-3xl font-bold text-chalk uppercase tracking-wide text-center lg:text-left leading-tight">
              {match.away_team?.name ?? "TBD"}
            </p>
            <span className="font-body text-[10px] uppercase tracking-[0.25em] text-chalk/40">
              Away
            </span>
          </div>
        </div>

        {/* ── Match Info ── */}
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mt-10 pt-6 border-t border-chalk/10 max-w-2xl mx-auto">
          {match.venue && (
            <div className="flex items-center gap-2 text-chalk/50">
              <MapPin size={13} aria-hidden="true" />
              <span className="font-body text-sm">{match.venue}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-chalk/50">
            <Clock size={13} aria-hidden="true" />
            <span className="font-body text-sm">
              {match.status === "scheduled"
                ? `${formattedDate} · ${formattedTime}`
                : formattedDate}
            </span>
          </div>
          <div className="flex items-center gap-2 text-chalk/40">
            <User size={12} aria-hidden="true" />
            <span className="font-body text-xs">Ref: James Mwangi</span>
          </div>
          <div className="flex items-center gap-2 text-chalk/40">
            <Sun size={12} aria-hidden="true" />
            <span className="font-body text-xs">22°C · Clear</span>
          </div>
          <div className="flex items-center gap-2 text-chalk/40">
            <Users size={12} aria-hidden="true" />
            <span className="font-body text-xs">12,430 attending</span>
          </div>
        </div>

        {/* ── CTA Buttons ── */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          <Link
            to={`/matches/${match.id}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-floodlight text-night font-body text-sm font-semibold uppercase tracking-widest2 hover:bg-chalk transition-all duration-200 hover:translate-y-[-2px] hover:shadow-[0_8px_24px_rgba(255,182,39,0.25)] active:translate-y-0"
          >
            <Play size={14} fill="currentColor" />
            Match Hub
          </Link>
          <button
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-chalk/20 text-chalk/70 hover:text-chalk hover:border-chalk/40 hover:bg-chalk/5 font-body text-sm font-semibold uppercase tracking-widest2 transition-all duration-200"
            aria-label="Watch stream (coming soon)"
            disabled
          >
            <Play size={14} />
            Watch Stream
          </button>
        </div>
      </div>
    </section>
  )
}

export default memo(FeaturedMatchHero)
