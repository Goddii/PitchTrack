import { memo, useState } from "react"
import { Link } from "react-router-dom"
import { SearchX, RefreshCw, ArrowRight } from "lucide-react"
import football2 from "../assets/football2.png"

function EmptyMatches({
  title = "No matches found",
  message = "There are no matches matching your filters right now.",
  icon: Icon = SearchX,
  showCTA = true,
  onReset,
}) {
  const [imgError, setImgError] = useState(false)

  return (
    <div className="relative flex flex-col items-center text-center py-16 md:py-24 px-6 overflow-hidden rounded-2xl">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-pitch/5 to-night" aria-hidden="true" />
      {!imgError && (
        <img
          src={football2}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-[0.06] pointer-events-none"
          onError={() => setImgError(true)}
          loading="lazy"
          aria-hidden="true"
        />
      )}

      {/* Ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, rgba(255,182,39,0.04) 0%, transparent 60%)",
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-floodlight/10 flex items-center justify-center mx-auto mb-6">
          <Icon size={28} className="text-floodlight/60" strokeWidth={1.5} />
        </div>

        <h3 className="font-display text-xl font-semibold uppercase tracking-wide text-chalk/80 mb-2">
          {title}
        </h3>
        <p className="font-body text-sm text-chalk/45 max-w-md mx-auto mb-8 leading-relaxed">
          {message}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {onReset && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-floodlight text-night font-body text-sm font-semibold uppercase tracking-widest2 hover:bg-chalk transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-floodlight/50 focus-visible:ring-offset-2 focus-visible:ring-offset-night"
            >
              <RefreshCw size={14} />
              Reset Filters
            </button>
          )}
          {showCTA && (
            <Link
              to="/teams"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-chalk/20 text-chalk/60 hover:text-chalk hover:border-chalk/40 font-body text-sm font-semibold uppercase tracking-widest2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-floodlight/50 focus-visible:ring-offset-2 focus-visible:ring-offset-night"
            >
              Browse Teams
              <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default memo(EmptyMatches)
