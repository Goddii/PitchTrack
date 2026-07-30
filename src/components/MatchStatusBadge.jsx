import { memo } from "react"

const STATUS_CONFIG = {
  live: {
    label: "LIVE",
    className:
      "bg-flare/15 text-flare border border-flare/30",
    dot: "bg-flare animate-pulse",
  },
  completed: {
    label: "FT",
    className: "bg-chalk/10 text-chalk/70 border border-chalk/15",
    dot: null,
  },
  scheduled: {
    label: "UPCOMING",
    className:
      "bg-cyan-500/10 text-cyan-400 border border-cyan-400/20",
    dot: "bg-cyan-400",
  },
}

function MatchStatusBadge({ status, minute, className = "" }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.scheduled

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-body text-[10px] font-semibold uppercase tracking-widest2 ${config.className} ${className}`}
      aria-label={
        status === "live"
          ? `Live, ${minute} minutes elapsed`
          : status === "completed"
            ? "Full time"
            : "Upcoming"
      }
    >
      {config.dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${config.dot} ${
            status === "live" ? "animate-pulse" : ""
          }`}
          aria-hidden="true"
        />
      )}
      {config.label}
      {status === "live" && minute != null && (
        <span className="font-body text-[10px] font-normal opacity-80">
          {minute}&prime;
        </span>
      )}
    </span>
  )
}

export default memo(MatchStatusBadge)
