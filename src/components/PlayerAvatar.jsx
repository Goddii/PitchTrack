import { memo } from "react"

function PlayerAvatar({ name, photoUrl, status, size = "md" }) {
  const SIZE_MAP = {
    sm: "w-10 h-10 text-sm",
    md: "w-14 h-14 text-lg",
    lg: "w-20 h-20 text-2xl",
  }

  const sizeClass = SIZE_MAP[size] || SIZE_MAP.md

  const initials = name
    ?.split(" ")
    .map((w) => w?.[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("") ?? "?"

  return (
    <div className={`relative shrink-0 ${sizeClass}`}>
      {/* Avatar circle */}
      <div
        className={`w-full h-full rounded-full bg-gradient-to-br from-pitch via-pitch-light to-pitch flex items-center justify-center overflow-hidden ring-[3px] ring-chalk/10 shadow-[0_0_20px_rgba(31,77,58,0.25)]`}
      >
        {/* Inner highlight overlay */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-chalk/[0.05] to-transparent pointer-events-none" />

        {photoUrl ? (
          <img
            src={photoUrl}
            alt={name ?? ""}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="font-display font-bold text-chalk/70 tracking-wide select-none">
            {initials}
          </span>
        )}
      </div>

      {/* Status indicator */}
      {status && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-night ${
            status === "available"
              ? "bg-emerald-500"
              : status === "injured"
                ? "bg-flare"
                : "bg-chalk/30"
          }`}
          aria-label={status}
        />
      )}
    </div>
  )
}

export default memo(PlayerAvatar)
