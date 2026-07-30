import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Menu, X, ChevronDown } from "lucide-react"

const NAV_LINKS = [
    { label: "Matches", to: "/matches" },
    { label: "Teams", to: "/teams" },
    { label: "Players", to: "/players" },
]

export default function PublicNavbar({ transparent = false, user = null }) {
    const [mobileOpen, setMobileOpen] = useState(false)
    const location = useLocation()

    const isActive = (path) => location.pathname.startsWith(path)

    return (
        <nav
            className={`w-full z-30 transition-all duration-300 ${
                transparent
                    ? "absolute top-0 left-0 bg-transparent"
                    : "sticky top-0 bg-night/90 backdrop-blur-lg border-b border-glass-border"
            }`}
            role="navigation"
            aria-label="Main navigation"
        >
            <div className="max-w-7xl mx-auto px-6 md:px-10 h-16 md:h-20 flex items-center justify-between">
                {/* Logo */}
                <Link
                    to={user ? "/dashboard" : "/"}
                    className="flex items-center gap-2 group"
                    aria-label="PitchTrack home"
                >
                    <span className="font-display font-bold text-xl md:text-2xl tracking-wide text-chalk uppercase">
                        Pitch<span className="text-floodlight group-hover:text-chalk transition-colors duration-200">Track</span>
                    </span>
                </Link>

                {/* Desktop nav */}
                <div className="hidden md:flex items-center gap-1">
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={`relative px-4 py-2 rounded-lg font-body text-sm font-medium tracking-wide transition-all duration-200 ${
                                isActive(link.to)
                                    ? "text-floodlight bg-floodlight/10"
                                    : "text-chalk/70 hover:text-chalk hover:bg-chalk/5"
                            }`}
                        >
                            {link.label}
                            {isActive(link.to) && (
                                <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-floodlight rounded-full" />
                            )}
                        </Link>
                    ))}
                </div>

                {/* Desktop auth buttons */}
                <div className="hidden md:flex items-center gap-3">
                    {user ? (
                        <div className="flex items-center gap-3">
                            <Link
                                to="/dashboard"
                                className="px-4 py-2 rounded-lg bg-floodlight text-night font-body text-sm font-semibold hover:bg-chalk transition-all duration-200"
                            >
                                Dashboard
                            </Link>
                            <div className="flex items-center gap-2 pl-3 border-l border-glass-border">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-floodlight to-floodlight/60 flex items-center justify-center font-display text-sm font-bold text-night">
                                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="px-4 py-2 rounded-lg font-body text-sm font-medium text-chalk/70 hover:text-chalk hover:bg-chalk/5 transition-all duration-200"
                            >
                                Sign In
                            </Link>
                            <Link
                                to="/register"
                                className="px-5 py-2 rounded-lg bg-floodlight text-night font-body text-sm font-semibold hover:bg-chalk transition-all duration-200"
                            >
                                Register
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile toggle */}
                <button
                    className="md:hidden p-2 rounded-lg text-chalk/70 hover:text-chalk hover:bg-chalk/5 transition-colors"
                    onClick={() => setMobileOpen((prev) => !prev)}
                    aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
                    aria-expanded={mobileOpen}
                >
                    {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {/* Mobile menu */}
            <div
                className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
                    mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
            >
                <div className="bg-night/95 backdrop-blur-lg border-t border-glass-border px-6 py-4 flex flex-col gap-2">
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.to}
                            to={link.to}
                            onClick={() => setMobileOpen(false)}
                            className={`px-4 py-2.5 rounded-lg font-body text-sm font-medium transition-colors ${
                                isActive(link.to)
                                    ? "text-floodlight bg-floodlight/10"
                                    : "text-chalk/70 hover:text-chalk hover:bg-chalk/5"
                            }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <div className="border-t border-glass-border pt-3 mt-2 flex flex-col gap-2">
                        {user ? (
                            <>
                                <div className="flex items-center gap-3 px-4 py-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-floodlight to-floodlight/60 flex items-center justify-center font-display text-sm font-bold text-night">
                                        {user.name?.charAt(0)?.toUpperCase() || "U"}
                                    </div>
                                    <span className="font-body text-sm text-chalk">{user.name}</span>
                                </div>
                                <Link
                                    to="/dashboard"
                                    onClick={() => setMobileOpen(false)}
                                    className="px-4 py-2.5 rounded-lg bg-floodlight/10 text-floodlight font-body text-sm font-semibold text-center"
                                >
                                    Dashboard
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    onClick={() => setMobileOpen(false)}
                                    className="px-4 py-2.5 rounded-lg text-chalk/70 hover:text-chalk hover:bg-chalk/5 font-body text-sm font-medium transition-colors text-center"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/register"
                                    onClick={() => setMobileOpen(false)}
                                    className="px-4 py-2.5 rounded-lg bg-floodlight text-night font-body text-sm font-semibold text-center"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}
