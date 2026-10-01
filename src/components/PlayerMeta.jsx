import { memo } from "react"

function PlayerMeta({ position, jerseyNumber, className = "" }) {
  return (
    <span
      className={`font-body text-xs text-chalk/60 truncate max-w-full ${className}`}
    >
      {position ?? "—"}{jerseyNumber ? ` · #${jerseyNumber}` : ""}
    </span>
  )
}

export default memo(PlayerMeta)
