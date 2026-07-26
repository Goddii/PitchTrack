import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const AUTO_ADVANCE_MS = 5000

export default function LiveMatchCarousel({ matches, loading }) {
    const [index, setIndex] = useState(0)
    const [paused, setPaused] = useState(false)
    const [prefersReducedMotion] = useState( () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )

    const goTo = useCallback((i) => setIndex((i + matches.length) % matches.length), [matches.length])

    // auto advance paused on hover and skipped entirely for reduced motion
    //manual prev/next/dots still work either way
    useEffect(() => {
        if (paused || prefersReducedMotion || matches.length <= 1) return
        const timer = setInterval(() => goTo(index + 1), AUTO_ADVANCE_MS)
        return () => clearInterval(timer)
    }, [index, paused, prefersReducedMotion, goTo, matches.length])

    if (loading) {
        return (
            <div className="bg-pitch/10 border border-line rounded-lg p-6 animate-pulse lg:sticky lg:top-6"aria-hidden="true">
                <div className="h-3 w-20 bg-line/30 rounded mb-8"/>
                <div className="h-20 bg-line/20 rounded mb-8"/>
                <div className="h-3 w-32 bg-line/20 rounded mx-auto"/>

            </div>
        )
    }

    if (!matches.length) {

        return (
            <div 
            className="bg-gradient-to-b from-night to-pitch/20 border border-line rounded-lg p-6 lg:sticky lg:top-6"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            >
                <div className="flex items-center justify-between mb-7">
                    <span className="flex items-center gap-1.5 font-body text-xs font-semibold uppercase tracking-widest2 text-floodlight">
                        <span className="w-1.5 h-1.5 rounded-full bg-floodlight animate-pulse"/>
                        Live now
                    </span>
                    <span className="font-body text-xs text-chalk/40"> {index + 1}/{matches.length}</span>

                </div>
                <div aria-live="polite" className="flex items-center justify-between gap-3 mb-6">
                    <div className="flex-1 flex flex-col items-center gap-2 text-center min-w-0">
                        <span className="w-14 h-14 rounded-full bg-pitch flex items-center justify-center font-display text-chalk/60 text-lg shrink-0">
                            {matches.home_team.name.charAt(0)}
                        </span>
                        <span className="font-display uppercase tracking-wide text-sm text-chalk truncate max-w-full">
                            {matches.home_team.name}
                        </span>

                    </div>
                    <div className="flex flex-col items-center shrink-0 px-1">
                        <span className="font-display text-4xl font-bold tabular-nums text-chalk">
                            {matches.home_score} - {matches.away_score}

                        </span>
                        <span className="font-body text-xs text-floodlight font-semibold mt-1"> {matches.minute} </span>

                    </div>
                    <div className="flex-1 flex flex-col items-center gap-2 text-center min-w-0">
                        <span className="w-14 h-14 rounded-full bg-pitch flex items-center justify-center font-display text-chalk/60 text-lg shrink-0">
                            {matches.away_team.name.charAt(0)}
                        </span>
                        <span className="font-display uppercase tracking-wide text-sm text-chalk truncate max-w-full">
                            {matches.away_team.name}
                        </span>

                    </div>

                </div>

                <p className="font-body text-xs text-chalk/40 text-center mb-6"> {matches.venue}</p>

                <div className="flex items-center justify-between">
                    <button 
                        onClick={ () => goTo(index - 1)}
                        aria-label = "Previous live match"
                        className="p-2 rounded-full border border-line text-chalk/60 hover:border-floodlight transition-colors cursor-pointer"
                    >
                        <ChevronLeft size={16}/>

                    </button>
                    <div className="flex gap-1.5">
                        {matches.map((_, i) => (
                            <button 
                                key={i}
                                onClick={() => goTo(i)}
                                aria-label = {`Show live match ${i + 1}`}
                                aria-current = {i == index}
                                className={`w-1.5 h-1.5 rounded-full transition-colors cursor-pointer ${i === index ? "bg-floodlight" : "bg-line"}`}
                            />
                        ))}

                    </div>
                    <button 
                        onClick={() => goTo(index + 1)}
                        aria-label = "Next live match"
                        className="p-2 rounded-full border border-line text-chalk/60 hover:border-floodlight hover:text-floodlight transition-colors cursor-pointer"
                    
                    >
                        <ChevronRight size={16}/>

                    </button>

                </div>

            </div>
        )

    }

}