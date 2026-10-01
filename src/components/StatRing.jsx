const RADIUS = 34
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/** Circular gauge: `ratio` (0-1) fills the arc, `display` is the number in the middle. */
export default function StatRing({ label, display, ratio, emphasis = false }) {
    const filled = Math.min(1, Math.max(0, ratio)) * CIRCUMFERENCE

    return (
        <div className="flex flex-col items-center gap-2 text-center">
            <div className={`relative ${emphasis ? "h-24 w-24" : "h-[4.5rem] w-[4.5rem]"}`}>
                <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90" aria-hidden="true">
                    <circle cx="40" cy="40" r={RADIUS} fill="none" strokeWidth="5" className="stroke-chalk/15" />
                    <circle
                        cx="40"
                        cy="40"
                        r={RADIUS}
                        fill="none"
                        strokeWidth="5"
                        strokeLinecap="round"
                        className={`stat-ring-arc ${emphasis ? "stroke-floodlight" : "stroke-chalk"}`}
                        style={{ "--ring-dash": `${filled}px` }}
                    />
                </svg>
                <span
                    className={`absolute inset-0 flex items-center justify-center font-display font-bold tabular-nums ${
                        emphasis ? "text-3xl text-floodlight" : "text-xl text-chalk"
                    }`}
                >
                    {display}
                </span>
            </div>
            <span className="max-w-[5.5rem] font-body text-xs uppercase leading-tight tracking-widest2 text-chalk/70">
                {label}
            </span>
        </div>
    )
}
