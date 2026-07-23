import { ChevronDown } from "lucide-react";


export default function FilterDropdown({ label, value, onChange, options}) {
    return (
        <div className="relative">
            <label className="sr-only">
                {label}
            </label>
            <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            aria-label={label}
            className="appearance-none bg-pitch/10 border border-line rounded-lg pl-4 pr-10 py-2.5 font-body text-sm text-chalk focus:outline-none focus:border-floodlight transition-colors cursor-pointer"
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-night text-chalk">
                        {opt.label}
                    </option>
                ))}
            </select>

            <ChevronDown size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-chalk/40 pointer-events-none"/>

        </div>
    )
}