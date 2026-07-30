import { memo } from "react"

function PlayerName({ name, className = "" }) {
  return (
    <span
      className={`font-display uppercase tracking-wide text-chalk text-sm leading-tight truncate max-w-full ${className}`}
    >
      {name ?? "—"}
    </span>
  )
}

export default memo(PlayerName)
