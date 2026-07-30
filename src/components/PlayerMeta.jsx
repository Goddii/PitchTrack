import { memo } from "react"

function PlayerMeta({ position, jerseyNumber, className = "" }) {
  return (
    <span
      className={`font-body text-[11px] text-chalk/45 truncate max-w-full ${className}`}
    >
      {position ?? "—"}{jerseyNumber ? ` · #${jerseyNumber}` : ""}
    </span>
  )
}

export default memo(PlayerMeta)
