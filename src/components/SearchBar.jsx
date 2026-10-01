import { Search } from "lucide-react"

export default function SearchBar({ value, onChange, placeholder = "Search....", ariaLabel="Search"}) {
    return (
        <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-chalk/60 pointer-events-none" />
            <input 
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                aria-label={ariaLabel}
                className="w-full bg-pitch/10 border border-line rounded-lg pl-10 pr-4 py-2.5 font-body text-sm text-chalk placeholder:text-chalk/60 focus:border-floodlight transition-colors"
            />
        </div>
    )
}