/** Each attribute as a bar out of 100, with ticks for the squad average and the squad best. */
export default function AttributeBars({ rows }) {
    if (rows.length === 0) return null

    const hasComparison = rows.some((row) => row.average !== null)

    return (
        <div className="rounded-lg border border-line bg-pitch/10 p-6">
            <h3 className="mb-1 font-display text-lg uppercase tracking-wide text-chalk">Against the squad</h3>
            <p className="mb-5 font-body text-xs text-chalk/70">
                Each attribute out of 100{hasComparison && ", with the squad average and the squad best marked"}
            </p>

            <ul className="m-0 list-none space-y-5 p-0">
                {rows.map((row) => (
                    <li key={row.key}>
                        <div className="mb-1.5 flex items-baseline justify-between">
                            <span className="font-body text-sm text-chalk">{row.label}</span>
                            <span className="font-display text-lg font-bold tabular-nums text-chalk">{Math.round(row.value)}</span>
                        </div>

                        <div
                            className="relative h-2 rounded-full bg-chalk/10"
                            role="img"
                            aria-label={
                                row.average !== null
                                    ? `${row.label} ${Math.round(row.value)}, squad average ${row.average}, squad best ${row.best}`
                                    : `${row.label} ${Math.round(row.value)}`
                            }
                        >
                            <div className="attr-bar-fill h-full rounded-full bg-floodlight" style={{ width: `${row.value}%` }} />
                            {row.average !== null && (
                                <span
                                    className="absolute top-1/2 h-4 w-0.5 -translate-y-1/2 bg-chalk/60"
                                    style={{ left: `${row.average}%` }}
                                    aria-hidden="true"
                                />
                            )}
                            {row.best !== null && (
                                <span
                                    className="absolute top-1/2 h-5 w-1 -translate-y-1/2 rounded-sm bg-chalk"
                                    style={{ left: `calc(${row.best}% - 2px)` }}
                                    aria-hidden="true"
                                />
                            )}
                        </div>

                        {row.average !== null && (
                            <div className="mt-1.5 flex justify-between font-body text-xs tabular-nums text-chalk/70">
                                <span>Squad average {row.average}</span>
                                <span>Squad best {row.best}</span>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    )
}
