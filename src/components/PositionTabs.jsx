/** Row of text tabs for choosing a position; the active one is underlined in amber. */
export default function PositionTabs({ options, value, onChange, label = "Filter by position" }) {
    return (
        <div role="group" aria-label={label} className="flex flex-wrap gap-x-1 gap-y-1">
            {options.map((option) => {
                const active = option.value === value
                return (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => onChange(option.value)}
                        aria-pressed={active}
                        className={`min-h-11 cursor-pointer border-b-2 px-3 font-body text-sm font-semibold transition-colors duration-200 ${
                            active
                                ? "border-floodlight text-chalk"
                                : "border-transparent text-chalk/70 hover:text-chalk"
                        }`}
                    >
                        {option.label}
                    </button>
                )
            })}
        </div>
    )
}
