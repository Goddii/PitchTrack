import { useEffect, useRef, useState } from "react";


function useCountUp(target, duration = 1400) {
    const [value, setValue] = useState(0)
    const ref = useRef(null)
    const started = useRef(false)


    useEffect(() => {
        const el = ref.current
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !started.current) {
                    started.current = true
                    const start = performance.now()
                    const tick = (now) => {
                        const progress = Math.min((now - start) / duration, 1)
                        const eased = 1 - Math.pow(1-progress, 3)
                        setValue(Math.round(eased * target))
                        if (progress < 1) requestAnimationFrame(tick)
                    }
                    requestAnimationFrame(tick)

                }
            },
            {threshold: 0.4}
        )
        observer.observe(el)
        return () => observer.disconnect()
    },[target, duration])

    return [ref, value]
}

export default function StatCard({label, value, icon: Icon}){
    const [ref, count] = useCountUp(value)

    return (
        <div 
        ref={ref}
        className="bg-pitch/10 border border-line rounded-lg p-6 flex flex-col gap-3 hover:border-floodlight/40 transition-colors"
        >
            {Icon && <Icon size={20} className="text-floodlight" strokeWidth={1.75}/>}
            <div className="font-display tabular-nums text-4xl md:text-5xl font-semibold text-chalk">
                {count.toLocaleString()}
                <span className="text-floodlight"> + </span>

            </div>
            <div className="font-body text-sm text-chalk/50"> {label} </div>
        </div>
    )
}
