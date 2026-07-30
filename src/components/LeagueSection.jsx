import { memo, useState, useRef, useEffect, useCallback } from "react"
import { ChevronDown, Trophy } from "lucide-react"
import football2 from "../assets/football2.png"

function LeagueSection({
  title,
  subtitle,
  matchCount,
  icon: Icon,
  children,
  defaultOpen = true,
  gameweek,
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [imgError, setImgError] = useState(false)
  const contentRef = useRef(null)
  const [contentHeight, setContentHeight] = useState(0)

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight)
    }
  }, [children])

  const toggle = useCallback(() => setIsOpen((prev) => !prev), [])

  return (
    <section className="group/section relative" aria-label={`${title} matches`}>
      {/* Decorative background — football2.png as subtle side graphic */}
      {!imgError && (
        <div className="absolute top-0 right-0 w-48 h-full pointer-events-none overflow-hidden opacity-[0.03]">
          <img
            src={football2}
            alt=""
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
            loading="lazy"
            aria-hidden="true"
          />
        </div>
      )}

      {/* ── Section Header ── */}
      <button
        onClick={toggle}
        className="relative flex items-center justify-between w-full py-3.5 px-1 rounded-lg hover:bg-chalk/[0.02] transition-colors cursor-pointer"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          {/* Left accent bar */}
          <div className="w-1 h-10 rounded-full bg-gradient-to-b from-floodlight to-floodlight/30 shrink-0" aria-hidden="true" />

          {/* Icon */}
          <div className="w-9 h-9 rounded-lg bg-floodlight/10 flex items-center justify-center shrink-0">
            {Icon ? (
              <Icon size={16} className="text-floodlight" />
            ) : (
              <Trophy size={16} className="text-floodlight" />
            )}
          </div>

          <div className="text-left">
            <div className="flex items-center gap-2.5">
              <h2 className="font-display text-base md:text-lg font-semibold uppercase tracking-wide text-chalk">
                {title}
              </h2>
              {gameweek && (
                <span className="font-body text-[9px] font-semibold uppercase tracking-widest2 text-chalk/30 bg-chalk/5 px-2 py-0.5 rounded-full">
                  GW {gameweek}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="font-body text-[11px] text-chalk/40 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Match count badge */}
          <span className="font-body text-[11px] font-semibold uppercase tracking-widest2 text-chalk/40 bg-chalk/5 px-2.5 py-1 rounded-full">
            {matchCount} {matchCount === 1 ? "match" : "matches"}
          </span>
          {/* Chevron */}
          <ChevronDown
            size={16}
            className={`text-chalk/30 transition-all duration-300 ease-out ${
              isOpen ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          />
        </div>
      </button>

      {/* ── Collapsible Content ── */}
      <div
        className="overflow-hidden transition-all duration-300 ease-out"
        style={{
          maxHeight: isOpen ? contentHeight : 0,
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? "translateY(0)" : "translateY(-4px)",
        }}
      >
        <div ref={contentRef} className="pb-4">
          {children}
        </div>
      </div>

      {/* Gradient divider */}
      <div className="h-px bg-gradient-to-r from-floodlight/20 via-glass-border to-transparent" />
    </section>
  )
}

export default memo(LeagueSection)
