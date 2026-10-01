import { memo } from "react"
import { layoutLineup, shortName } from "../utils/lineup"

// How far the pitch leans back; each marker leans the opposite way so it stands upright.
const TILT_DEG = 14
const LIFT_PX = 14
const LINE_COLOUR ="rgba(244,241,233,0.3)"

const DISC_STYLE = {
    home: "bg-floodlight text-night",
    away: "bg-chalk text-night",
}

// A landscape pitch is the portrait drawing turned a quarter turn, so the bottom goal ends up on the left.
const TURN_TO_LANDSCAPE = "translate(100 0) rotate(90)"

/** The markings of a 70 x 100 portrait pitch, turned into a 100 x 70 landscape one when asked. */
function PitchMarkings({ orientation }) {
    const isLandscape = orientation === "landscape"

    return (
        <svg
            className="absolute inset-0 h-full w-full"
            viewBox={isLandscape ? "0 0 100 70" : "0 0 70 100"}
            preserveAspectRatio="none"
            aria-hidden="true"
        >
            <g transform={isLandscape ? TURN_TO_LANDSCAPE : undefined}>
                <g fill="none" stroke={LINE_COLOUR} strokeWidth="0.45">
                    <rect x="1" y="1" width="68" height="98" />
                    <line x1="1" y1="50" x2="69" y2="50" />
                    <circle cx="35" cy="50" r="9.15" />
                    <rect x="14.85" y="1" width="40.3" height="16.5" />
                    <rect x="25.85" y="1" width="18.3" height="5.5" />
                    <path d="M 27.7 17.5 A 9.15 9.15 0 0 0 42.3 17.5" />
                    <rect x="14.85" y="82.5" width="40.3" height="16.5" />
                    <rect x="25.85" y="93.5" width="18.3" height="5.5" />
                    <path d="M 27.7 82.5 A 9.15 9.15 0 0 1 42.3 82.5" />
                </g>
                <g fill={LINE_COLOUR}>
                    <circle cx="35" cy="50" r="0.6" />
                    <circle cx="35" cy="12" r="0.6" />
                    <circle cx="35" cy="88" r="0.6" />
                </g>
            </g>
        </svg>
    )
}

const turf = (orientation) =>
    `repeating-linear-gradient(${orientation === "landscape" ? "to right" : "to bottom"}, #1F4D3A 0 10%, #2D6B4F 10% 20%)`

function Marker({ slot, side }) {
    const { row, x, y } = slot

    return (
        <div
            className="absolute flex flex-col items-center"
            style={{
                left: `${x}%`,
                top: `${y}%`,
                // Lifted off the turf: otherwise the leaning pitch surface covers the name under each disc.
                transform: `translate(-50%, -50%) translateZ(${LIFT_PX}px) rotateX(${-TILT_DEG}deg)`,
            }}
        >
            <span
                className={`relative flex size-6 items-center justify-center rounded-full font-display text-xs font-bold tabular-nums shadow-[0_2px_8px_rgba(0,0,0,0.5)] ring-2 ring-night/60 sm:size-7 sm:text-sm ${DISC_STYLE[side]}`}
            >
                {row.player.jersey_number ?? ""}
                {row.goals > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-flare font-body text-[0.625rem] font-bold leading-none text-black">
                        {row.goals}
                    </span>
                )}
            </span>
            <span className="mt-0.5 max-w-[4.5rem] truncate font-body text-[0.65rem] font-semibold leading-tight text-chalk [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]">
                {shortName(row.player.name)}
            </span>
        </div>
    )
}

/**
 * Both teams' starting elevens on a tilted portrait pitch. The parent supplies the perspective.
 * Purely visual: the markers are hidden from assistive tech because the player list beside it
 * carries the same information.
 */
function LineupPitch({ homeShape, awayShape, orientation = "portrait", label, className = "" }) {
    const slots = [
        ...layoutLineup(homeShape, "home", orientation).map((slot) => ({ ...slot, side: "home" })),
        ...layoutLineup(awayShape, "away", orientation).map((slot) => ({ ...slot, side: "away" })),
    ]

    return (
        <div
            role="img"
            aria-label={label}
            className={`relative ${className}`}
            style={{
                transform: `rotateX(${TILT_DEG}deg)`,
                transformOrigin: "50% 100%",
                transformStyle: "preserve-3d",
            }}
        >
            <div
                className="absolute inset-0 overflow-hidden rounded-md shadow-[0_30px_60px_rgba(0,0,0,0.55)] ring-1 ring-chalk/15"
                style={{ background: turf(orientation) }}
            >
                <div
                    className="absolute inset-0"
                    style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(5,13,10,0.35) 100%)" }}
                />
                <PitchMarkings orientation={orientation} />
            </div>

            <div className="absolute inset-0" style={{ transformStyle: "preserve-3d" }} aria-hidden="true">
                {slots.map((slot) => (
                    <Marker key={slot.row.player.id} slot={slot} side={slot.side} />
                ))}
            </div>
        </div>
    )
}

export default memo(LineupPitch)
