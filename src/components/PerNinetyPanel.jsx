function Figure({ label, value }) {
    return (
        <div>
            <dt className="font-body text-xs uppercase tracking-widest2 text-chalk/70">{label}</dt>
            <dd className="font-display text-4xl font-bold tabular-nums text-chalk">{value}</dd>
        </div>
    )
}

const twoDecimals = (value) => (value === null ? "—" : value.toFixed(2))

/** Scoring and workload rates from the player's season totals; dashes until stats arrive or the player has played. */
export default function PerNinetyPanel({ numbers, minutes }) {
    return (
        <div className="rounded-lg border border-line bg-pitch/10 p-6">
            <h3 className="mb-1 font-display text-lg uppercase tracking-wide text-chalk">Per 90 minutes</h3>
            <p className="mb-6 font-body text-xs text-chalk/70">
                {minutes > 0 ? `Based on ${minutes} minutes played this season` : "No minutes played yet"}
            </p>

            <dl className="grid grid-cols-2 gap-x-6 gap-y-8">
                <Figure label="Goals" value={twoDecimals(numbers?.goals ?? null)} />
                <Figure label="Assists" value={twoDecimals(numbers?.assists ?? null)} />
                <Figure label="Minutes per game" value={numbers?.minutesPerAppearance ?? "—"} />
            </dl>
        </div>
    )
}
