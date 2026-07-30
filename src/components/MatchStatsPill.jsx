import { memo } from "react"

function MatchStatsPill({ icon: Icon, label, value, accent = false }) {
  return (
    <div
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-body text-[10px] ${
        accent
          ? "bg-floodlight/10 text-floodlight"
          : "bg-chalk/5 text-chalk/50"
      }`}
    >
      {Icon && <Icon size={11} strokeWidth={2} className="shrink-0" aria-hidden="true" />}
      <span className="font-semibold tabular-nums">{value}</span>
      {label && <span className="opacity-70 hidden sm:inline">{label}</span>}
    </div>
  )
}

export default memo(MatchStatsPill)
