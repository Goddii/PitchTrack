import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";


const ATTRIBUTE_LABELS = {
    pace: "Pace",
    shooting: "Shooting",
    passing: "Passing",
    dribbling: "Dribbling",
    defending: "Defending",
    physical: "Physical",
    diving: "Diving",
    handling: "Handling",
    kicking: "Kicking",
    reflexes: "Reflexes",
    speed: "Speed",
    positioning: "Positioning",
}

// no color sat here on purpose
const chartConfig = { value: { label : "Rating "}}

function ratingTier(score) {
    if (score >= 7.5) return { className: "text-emerald-400 border-emerald-400/40 bg-emerald-400/10"}
    if (score >= 6) return { className: "text-amber-400 border-amber-400/40 bg-amber-400/10"}
    return {className: "text-red-400 border-red-400/40 bg-red-400/10"}
}

export default function PlayerRadarChart({ attributes }) {
    const chartData = Object.entries(attributes).map(([key, value]) => ({
        attribute: ATTRIBUTE_LABELS[key] ?? key, value
    }))

    const values = Object.values(attributes)
    const overall = Math.round(values.reduce((sum, v) => sum + v, 0) / values.length) /10
    const tier = ratingTier(overall)

    return (
        <div className="bg-pitch/10 border border-line rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-display uppercase tracking-wide text-lg text-chalk">Player Strength</h3>
                <div className={`flex items-center justify-center w-14 h-14 rounded-full border-2 shrink-0 ${tier.className}`}>
                    <span className="font-display text-lg font-bold"> {overall.toFixed(1)} </span>
                </div>
            </div>

            <div className="mx-auto aspect-square max-h-[300px] w-full text-chalk/50">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={chartData} outerRadius="72%">
                        <Tooltip
                            contentStyle={{ background: "var(--color-night)", border: "1px solid var(--color-line, #333)" }}
                            labelStyle={{ color: "inherit" }}
                        />
                        <PolarGrid className="stroke-line/40" />
                        <PolarAngleAxis dataKey="attribute" tick={{ fill: "currentColor", fontSize: 12 }} />
                        <Radar dataKey="value" className="fill-floodlight stroke-floodlight" fillOpacity={0.35} strokeWidth={2} />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            <p className="font-body text-[11px] text-chalk/35 text-center mt-1">
                Overall is a simple average of the attributes above - a placeholder until real match data drives this
            </p>

        </div>
    )
}