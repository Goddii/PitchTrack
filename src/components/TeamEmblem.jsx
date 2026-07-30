import { memo } from "react"

const SIZE_MAP = {
  xs: "w-7 h-7 text-[11px]",
  sm: "w-8 h-8 text-[10px]",
  md: "w-14 h-14 text-sm",
  lg: "w-28 h-28 text-xl",
}

function TeamEmblem({ name, size = "md", className = "" }) {
  const sizeClass = SIZE_MAP[size] || SIZE_MAP.md

  return (
    <div
      className={`${sizeClass} rounded-full bg-gradient-to-br from-pitch via-pitch-light to-pitch flex items-center justify-center font-display font-bold text-chalk/85 shrink-0 ring-[3px] ring-chalk/10 shadow-[0_0_30px_rgba(45,107,79,0.2)] relative ${className}`}
      aria-hidden="true"
    >
      {/* Inner glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-chalk/[0.04] to-transparent pointer-events-none" />
      {name?.charAt(0) ?? "?"}
    </div>
  )
}

export default memo(TeamEmblem)
