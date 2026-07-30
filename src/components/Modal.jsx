import { useEffect } from "react"

export default function Modal({ open, onClose, title, children }) {
    // Close on Escape key
    useEffect(() => {
        if (!open) return
        const handler = (e) => {
            if (e.key === "Escape") onClose()
        }
        window.addEventListener("keydown", handler)
        return () => window.removeEventListener("keydown", handler)
    }, [open, onClose])

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-night/80 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />
            {/* Dialog */}
            <div
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className="relative bg-pitch/30 border border-line rounded-xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display uppercase tracking-wide text-lg text-chalk">{title}</h2>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="font-body text-chalk/40 hover:text-chalk transition-colors cursor-pointer"
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 5l10 10M15 5L5 15" />
                        </svg>
                    </button>
                </div>
                {children}
            </div>
        </div>
    )
}
