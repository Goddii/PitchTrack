import { useEffect, useRef, useState } from "react"

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3)
}

function animatedValue(end, duration = 1200) {
    const [value, setValue] = useState(0)
    const frameRef = useRef(null)
    const prefersReduced = useRef(
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )

    useEffect(() => {
        if (prefersReduced.current) {
            setValue(end)
            return
        }
        if (end === 0) {
            setValue(0)
            return
        }
        const start = performance.now()
        const tick = (now) => {
            const elapsed = now - start
            const progress = Math.min(elapsed / duration, 1)
            setValue(Math.round(easeOutCubic(progress) * end))
            if (progress < 1) {
                frameRef.current = requestAnimationFrame(tick)
            }
        }
        frameRef.current = requestAnimationFrame(tick)
        return () => {
            if (frameRef.current) cancelAnimationFrame(frameRef.current)
        }
    }, [end, duration])

    return value
}

export default function DashboardStatCard({ label, value, icon: Icon, accent = false }) {
    const count = animatedValue(value)

    return (
        <div
            className={`relative overflow-hidden rounded-xl p-5 border transition-all duration-300 hover:translate-y-[-2px] ${
                accent
                    ? "bg-gradient-to-br from-floodlight/10 to-floodlight/5 border-floodlight/20 hover:border-floodlight/40 hover:shadow-[0_8px_32px_rgba(255,182,39,0.1)]"
                    : "bg-glass-bg border-glass-border hover:border-chalk/20 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
            }`}
        >
            {/* Background shine */}
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br from-chalk/3 to-transparent pointer-events-none" />

            <div className="relative z-10 flex items-start justify-between">
                <div>
                    <div className="font-display text-3xl font-bold text-chalk tabular-nums tracking-tight">
                        {count}
                    </div>
                    <div className="font-body text-xs text-chalk-muted uppercase tracking-widest2 mt-1.5">
                        {label}
                    </div>
                </div>
                {Icon && (
                    <div className={`p-2.5 rounded-lg ${
                        accent
                            ? "bg-floodlight/15 text-floodlight"
                            : "bg-chalk/5 text-chalk/40"
                    }`}>
                        <Icon size={18} strokeWidth={1.5} />
                    </div>
                )}
            </div>

            {/* Bottom shimmer line */}
            <div className={`absolute bottom-0 left-4 right-4 h-px ${
                accent
                    ? "bg-gradient-to-r from-transparent via-floodlight/30 to-transparent"
                    : "bg-gradient-to-r from-transparent via-chalk/10 to-transparent"
            }`} />
        </div>
    )
}
