import { AlertTriangle, RefreshCw } from "lucide-react"

export default function ErrorState({ error, onRetry, title = "Couldn't load this" }) {
    return (
        <div role="alert" className="flex flex-col items-center text-center py-16 px-6">
            <AlertTriangle size={32} className="text-flare mb-4" strokeWidth={1.5} aria-hidden="true" />
            <p className="font-display uppercase tracking-wide text-chalk/80 mb-1">{title}</p>
            <p className="font-body text-sm text-chalk/60 max-w-sm">
                {error?.message || "Check your connection and try again."}
            </p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-chalk/25 text-chalk/80 hover:text-chalk hover:border-chalk/50 font-body text-sm font-semibold transition-colors cursor-pointer"
                >
                    <RefreshCw size={14} aria-hidden="true" />
                    Try again
                </button>
            )}
        </div>
    )
}
