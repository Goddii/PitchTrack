// Left-to-right pitch in metres (105 x 68). A team attacks to the right.
const PITCH = { width: 105, height: 68 }
const ZONES = {
    Goalkeeper: [0, 17],
    Defender: [17, 42],
    Midfielder: [42, 66],
    Forward: [66, 105],
}

const LINE = "fill-none stroke-chalk/30"

/**
 * Half-time-style pitch with the player's role zone lit. It shows where the position plays, not
 * where this player has been: the app does not track player movement.
 */
export default function PositionPitch({ position }) {
    const zone = ZONES[position]
    const centreX = zone ? (zone[0] + zone[1]) / 2 : null

    return (
        <div className="rounded-lg border border-line bg-pitch/10 p-6">
            <h3 className="mb-1 font-display text-lg uppercase tracking-wide text-chalk">Playing position</h3>
            <p className="mb-4 font-body text-xs text-chalk/70">
                {zone ? `${position}: the lit zone is where this role plays` : "Position not set"}
            </p>

            <svg
                viewBox={`0 0 ${PITCH.width} ${PITCH.height}`}
                className="w-full rounded-md bg-pitch/25"
                role="img"
                aria-label={zone ? `Pitch with the ${position.toLowerCase()} zone highlighted` : "Pitch"}
            >
                {zone && <rect x={zone[0]} y="0" width={zone[1] - zone[0]} height={PITCH.height} className="fill-floodlight/20" />}

                <rect x="0.3" y="0.3" width={PITCH.width - 0.6} height={PITCH.height - 0.6} strokeWidth="0.6" className={LINE} />
                <line x1="52.5" y1="0" x2="52.5" y2={PITCH.height} strokeWidth="0.5" className={LINE} />
                <circle cx="52.5" cy="34" r="9.15" strokeWidth="0.5" className={LINE} />
                <circle cx="52.5" cy="34" r="0.6" className="fill-chalk/40" />

                <rect x="0.3" y="13.84" width="16.5" height="40.32" strokeWidth="0.5" className={LINE} />
                <rect x="0.3" y="24.84" width="5.5" height="18.32" strokeWidth="0.5" className={LINE} />
                <rect x="88.2" y="13.84" width="16.5" height="40.32" strokeWidth="0.5" className={LINE} />
                <rect x="99.2" y="24.84" width="5.5" height="18.32" strokeWidth="0.5" className={LINE} />
                <circle cx="11" cy="34" r="0.6" className="fill-chalk/40" />
                <circle cx="94" cy="34" r="0.6" className="fill-chalk/40" />

                {zone && <circle cx={centreX} cy="34" r="2.6" className="fill-floodlight" />}
            </svg>
        </div>
    )
}
