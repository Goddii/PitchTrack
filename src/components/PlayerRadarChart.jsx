import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from "recharts"
import { computeOverallRating, ratingTier } from "../utils/playerRating"

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

export default function PlayerRadarChart({ attributes }) {
    if (!attributes || typeof attributes !== "object" || Object.keys(attributes).length === 0) {
        return (
            <div className="bg-pitch/10 border border-line rounded-lg p-6">
                <h3 className="font-display uppercase tracking-wide text-lg text-chalk mb-2">Player Strength</h3>
                <div className="flex items-center justify-center h-[200px] border border-dashed border-line/40 rounded-xl">
                    <p className="font-body text-sm text-chalk/40 text-center max-w-xs">
                        No attribute data available yet.
                    </p>
                </div>
                <p className="font-body text-[11px] text-chalk/35 text-center mt-4">
                    Attributes will appear here once they are assigned via the admin panel.
                </p>
            </div>
        )
    }

    const chartData = Object.entries(attributes).map(([key, value]) => ({
        attribute: ATTRIBUTE_LABELS[key] ?? key, value
    }))

    const overall = computeOverallRating(attributes)
    const tierClass = overall !== null ? ratingTier(overall) : ""

    return (
        <div className="bg-pitch/10 border border-line rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-display uppercase tracking-wide text-lg text-chalk">Player Strength</h3>
                <div className={`flex items-center justify-center w-14 h-14 rounded-full border-2 shrink-0 ${tierClass}`}>
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