import { Search } from "lucide-react"

export default function SearchBar({ value, onChange, placeholder = "Search....", ariaLabel="Search"}) {
    return (
        <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-chalk/40 pointer-events-none" />
            <input 
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={ariaLabel}
                className="w-full b-pitch/10 border border-line rounded-lg pl-10 pr-4 py-2.5 font-body text-sm text-chalk placeholder:text-chalk/40 focus:outline-none focus:border floodlight transition-colors"
            />
        </div>
    )
}