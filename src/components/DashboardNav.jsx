import { useState, useRef, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import {
    Menu, X, Bell, LogOut,
    User, Settings, ChevronDown,
} from "lucide-react"
import { useAuth } from "../context/AuthContext"

const QUICK_LINKS = [
    { label: "Teams", to: "/teams" },
    { label: "Players", to: "/players" },
    { label: "Matches", to: "/matches" },
]

export default function DashboardNav() {
    const { user, logout } = useAuth()
    const location = useLocation()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [profileOpen, setProfileOpen] = useState(false)
    const dropdownRef = useRef(null)

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setProfileOpen(false)
            }
        }
        if (profileOpen) {
            window.addEventListener("mousedown", handler)
            return () => window.removeEventListener("mousedown", handler)
        }
    }, [profileOpen])

    // Close mobile menu on route change
    useEffect(() => {
        setMobileOpen(false)
    }, [location.pathname])

    return (
        <header className="sticky top-0 z-30 bg-night/90 backdrop-blur-lg border-b border-glass-border">
            <div className="max-w-7xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
                {/* Left: Logo + mobile toggle */}
                <div className="flex items-center gap-4">
                    <button
                        className="md:hidden p-2 rounded-lg text-chalk/60 hover:text-chalk hover:bg-chalk/5 transition-colors"
                        onClick={() => setMobileOpen((prev) => !prev)}
                        aria-label={mobileOpen ? "Close menu" : "Open menu"}
                        aria-expanded={mobileOpen}
                    >
                        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                    <Link to="/dashboard" className="flex items-center gap-2">
                        <span className="font-display font-bold text-lg tracking-wide text-chalk uppercase">
                            Pitch<span className="text-floodlight">Track</span>
                        </span>
                    </Link>
                </div>

                {/* Center: Quick links (desktop) */}
                <nav className="hidden md:flex items-center gap-1" aria-label="Quick navigation">
                    {QUICK_LINKS.map((link) => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={`px-3 py-1.5 rounded-lg font-body text-xs font-medium uppercase tracking-widest2 transition-all duration-200 ${
                                location.pathname.startsWith(link.to)
                                    ? "text-floodlight bg-floodlight/10"
                                    : "text-chalk/50 hover:text-chalk hover:bg-chalk/5"
                            }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Right: Notifications + Profile */}
                <div className="flex items-center gap-2">
                    {/* Notification bell */}
                    <button
                        className="p-2 rounded-lg text-chalk/40 hover:text-chalk hover:bg-chalk/5 transition-colors relative"
                        aria-label="Notifications"
                    >
                        <Bell size={18} />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-floodlight" />
                    </button>

                    {/* Profile dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setProfileOpen((prev) => !prev)}
                            className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-lg hover:bg-chalk/5 transition-colors"
                            aria-label="Profile menu"
                            aria-expanded={profileOpen}
                        >
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-floodlight to-floodlight/60 flex items-center justify-center font-display text-xs font-bold text-night">
                                {user?.name?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                            <span className="hidden sm:block font-body text-sm text-chalk/80 max-w-[120px] truncate">
                                {user?.name || "User"}
                            </span>
                            <ChevronDown
                                size={14}
                                className={`text-chalk/40 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`}
                            />
                        </button>

                        {/* Dropdown */}
                        {profileOpen && (
                            <div className="absolute right-0 top-full mt-2 w-56 bg-night border border-glass-border rounded-xl shadow-xl shadow-black/30 py-2 backdrop-blur-xl z-50">
                                <div className="px-4 py-3 border-b border-glass-border">
                                    <p className="font-body text-sm font-semibold text-chalk">{user?.name}</p>
                                    <p className="font-body text-xs text-chalk/40 mt-0.5">{user?.email}</p>
                                </div>
                                <div className="py-1">
                                    <Link
                                        to="/dashboard"
                                        onClick={() => setProfileOpen(false)}
                                        className="flex items-center gap-3 px-4 py-2.5 font-body text-sm text-chalk/70 hover:text-chalk hover:bg-chalk/5 transition-colors"
                                    >
                                        <User size={15} />
                                        Dashboard
                                    </Link>
                                    {user?.role === "admin" && (
                                        <Link
                                            to="/admin"
                                            onClick={() => setProfileOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2.5 font-body text-sm text-chalk/70 hover:text-chalk hover:bg-chalk/5 transition-colors"
                                        >
                                            <Settings size={15} />
                                            Admin Panel
                                        </Link>
                                    )}
                                </div>
                                <div className="border-t border-glass-border pt-1">
                                    <button
                                        onClick={() => {
                                            setProfileOpen(false)
                                            logout()
                                        }}
                                        className="flex items-center gap-3 w-full px-4 py-2.5 font-body text-sm text-flare/70 hover:text-flare hover:bg-flare/5 transition-colors"
                                    >
                                        <LogOut size={15} />
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="md:hidden bg-night/95 backdrop-blur-lg border-t border-glass-border px-6 py-4">
                    <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
                        {QUICK_LINKS.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                onClick={() => setMobileOpen(false)}
                                className={`px-4 py-2.5 rounded-lg font-body text-sm font-medium transition-colors ${
                                    location.pathname.startsWith(link.to)
                                        ? "text-floodlight bg-floodlight/10"
                                        : "text-chalk/70 hover:text-chalk hover:bg-chalk/5"
                                }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            )}
        </header>
    )
}
