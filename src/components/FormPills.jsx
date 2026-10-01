const RESULT_STYLES = {
    W: "bg-emerald-400/15 text-emerald-300 border-emerald-400/40",
    D: "bg-chalk/10 text-chalk/80 border-chalk/25",
    L: "bg-flare/15 text-flare border-flare/40",
}

const RESULT_LABELS = { W: "win", D: "draw", L: "loss" }

/** Last results as W / D / L pills, oldest first. Renders a dash when nothing has been played. */
export default function FormPills({ form, className = "" }) {
    if (!form || form.length === 0) {
        return <span className={`font-body text-sm text-chalk/60 ${className}`} aria-label="No results yet">—</span>
    }

    const summary = form.map((r) => RESULT_LABELS[r]).join(", ")
    const description = form.length === 1 ? `Last result: ${summary}` : `Last ${form.length} results, oldest first: ${summary}`

    return (
        <ul className={`flex items-center gap-1 ${className}`} aria-label={description}>
            {form.map((result, i) => (
                <li
                    key={i}
                    aria-hidden="true"
                    className={`flex h-6 w-6 items-center justify-center rounded-md border font-display text-xs font-bold ${RESULT_STYLES[result]}`}
                >
                    {result}
                </li>
            ))}
        </ul>
    )
}
