import { memo, useRef, useEffect } from "react"
import { Search, X, CalendarDays } from "lucide-react"

const STATUS_PILLS = [
  { value: "all", label: "All" },
  { value: "live", label: "Live " },
  { value: "upcoming", label: "Upcoming" },
  { value: "completed", label: "Finished" },
]

const DATE_NAV = [
  { value: "all", label: "All Dates" },
  { value: "today", label: "Today" },
  { value: "tomorrow", label: "Tomorrow" },
  { value: "custom", label: "Calendar", icon: CalendarDays },
]

const SORT_OPTIONS = [
  { value: "date", label: "Date" },
  { value: "kickoff", label: "Kickoff" },
  { value: "league", label: "Competition" },
]

function MatchFilters({
  tab,
  onTabChange,
  query,
  onQueryChange,
  liveCount = 0,
  sortBy,
  onSortChange,
  dateFilter,
  onDateFilterChange,
}) {
  const searchRef = useRef(null)

  // Keyboard shortcut: Cmd+K or Ctrl+K to focus search
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  return (
    <div
      className="sticky top-16 md:top-20 z-20 bg-night/80 backdrop-blur-xl border-b border-glass-border"
      role="toolbar"
      aria-label="Match filters"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-3 md:py-4 space-y-3">
        {/* ── Date Navigation ── */}
        <div
          className="flex gap-1.5 overflow-x-auto scrollbar-none -mx-1 px-1"
          role="tablist"
          aria-label="Date filter"
        >
          {DATE_NAV.map((item) => (
            <button
              key={item.value}
              onClick={() => onDateFilterChange(item.value)}
              role="tab"
              aria-selected={dateFilter === item.value}
              className={`relative shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full font-body text-[11px] font-semibold uppercase tracking-widest2 transition-all duration-200 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-floodlight/50 focus-visible:ring-offset-2 focus-visible:ring-offset-night ${
                dateFilter === item.value
                  ? "bg-cyan-500/15 text-cyan-400 border border-cyan-400/20"
                  : "bg-chalk/[0.03] text-chalk/40 hover:text-chalk/70 hover:bg-chalk/5 border border-transparent"
              }`}
            >
              {item.icon && <item.icon size={12} aria-hidden="true" />}
              {item.label}
            </button>
          ))}
        </div>

        {/* ── Status Pills + Search (desktop side-by-side, mobile stacked) ── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Status pills — horizontally scrollable on mobile */}
          <div
            className="flex gap-1.5 overflow-x-auto scrollbar-none -mx-1 px-1 pb-1 sm:pb-0"
            role="tablist"
            aria-label="Match status filter"
          >
            {STATUS_PILLS.map((pill) => (
              <button
                key={pill.value}
                onClick={() => onTabChange(pill.value)}
                role="tab"
                aria-selected={tab === pill.value}
                className={`relative shrink-0 px-3.5 py-2 rounded-full font-body text-xs font-semibold uppercase tracking-widest2 transition-all duration-200 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-floodlight/50 focus-visible:ring-offset-2 focus-visible:ring-offset-night ${
                  tab === pill.value
                    ? "bg-floodlight text-night shadow-[0_0_20px_rgba(255,182,39,0.2)]"
                    : "bg-chalk/5 text-chalk/50 hover:text-chalk hover:bg-chalk/10"
                }`}
              >
                {pill.label}
                {pill.value === "live" && liveCount > 0 && (
                  <span className="ml-1.5 font-body">({liveCount})</span>
                )}
              </button>
            ))}
          </div>

          {/* Search + Sort (right side) */}
          <div className="flex items-center gap-2 sm:ml-auto">
            {/* Search */}
            <div className="relative flex-1 sm:min-w-[200px]">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-chalk/30 pointer-events-none"
                aria-hidden="true"
              />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder="Search teams…"
                aria-label="Search matches by team"
                className="w-full bg-chalk/5 border border-glass-border rounded-full pl-9 pr-8 py-2 font-body text-sm text-chalk placeholder:text-chalk/25 focus:outline-none focus:border-floodlight/50 focus:bg-chalk/[0.07] transition-all duration-200"
              />
              {query && (
                <button
                  onClick={() => onQueryChange("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-chalk/30 hover:text-chalk transition-colors cursor-pointer"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Sort dropdown */}
            <div className="relative hidden sm:block">
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                aria-label="Sort matches"
                className="appearance-none bg-chalk/5 border border-glass-border rounded-full pl-3.5 pr-8 py-2 font-body text-xs text-chalk/60 focus:outline-none focus:border-floodlight/50 transition-colors cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-night text-chalk">
                    {opt.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-chalk/30">
                <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor">
                  <path d="M0 0l5 6 5-6z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(MatchFilters)
