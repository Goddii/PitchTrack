import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import {
    Shield, LayoutDashboard, Users, Trophy,
    Calendar, LogOut, Menu, X, ChevronLeft,
    ChevronRight, Bell, User,
} from "lucide-react"
import { useAuth } from "../context/AuthContext"

const SIDEBAR_ITEMS = [
    { label: "Overview",    to: "/admin",              icon: LayoutDashboard, tab: "" },
    { label: "Teams",       to: "/admin?tab=teams",     icon: Trophy,          tab: "teams" },
    { label: "Players",     to: "/admin?tab=players",   icon: Users,           tab: "players" },
    { label: "Matches",     to: "/admin?tab=matches",   icon: Calendar,        tab: "matches" },
]

export default function AdminSidebar({ children }) {
    const { user, logout } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [profileOpen, setProfileOpen] = useState(false)

    const isActive = (item) => {
        if (item.to === "/admin" && !item.tab) return !location.search.includes("tab=")
        if (item.tab) return location.search === `?tab=${item.tab}`
        return false
    }

    const handleLogout = () => {
        logout()
        navigate("/login")
    }

    const SidebarContent = ({ collapsed }) => (
        <>
            {/* Logo */}
            <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} px-4 h-16 border-b border-glass-border shrink-0`}>
                <Link to="/admin" className="flex items-center gap-2 min-w-0">
                    <Shield size={20} className="text-floodlight shrink-0" />
                    {!collapsed && (
                        <span className="font-display font-bold text-base tracking-wide text-chalk uppercase truncate">
                            Pitch<span className="text-floodlight">Track</span>
                        </span>
                    )}
                </Link>
                {!collapsed && (
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="p-1.5 rounded-lg text-chalk/30 hover:text-chalk hover:bg-chalk/5 transition-colors hidden lg:block"
                        aria-label="Collapse sidebar"
                    >
                        <ChevronLeft size={16} />
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Admin navigation">
                {SIDEBAR_ITEMS.map((item) => (
                    <Link
                        key={item.to}
                        to={item.to}
                        className={`flex items-center ${collapsed ? "justify-center" : "gap-3"} px-3 py-2.5 rounded-lg font-body text-sm font-medium transition-all duration-200 ${
                            isActive(item)
                                ? "bg-floodlight/10 text-floodlight"
                                : "text-chalk/50 hover:text-chalk hover:bg-chalk/5"
                        }`}
                        title={collapsed ? item.label : undefined}
                    >
                        <item.icon size={18} className="shrink-0" />
                        {!collapsed && <span>{item.label}</span>}
                    </Link>
                ))}
            </nav>

            {/* User info */}
            <div className={`border-t border-glass-border p-3 ${collapsed ? "text-center" : ""}`}>
                {collapsed ? (
                    <button
                        onClick={handleLogout}
                        className="p-2 rounded-lg text-chalk/40 hover:text-flare hover:bg-flare/5 transition-colors"
                        aria-label="Sign out"
                    >
                        <LogOut size={18} />
                    </button>
                ) : (
                    <div className="flex items-center gap-3 px-2 py-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-floodlight to-floodlight/60 flex items-center justify-center font-display text-xs font-bold text-night shrink-0">
                            {user?.name?.charAt(0)?.toUpperCase() || "A"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-body text-sm text-chalk/80 truncate">{user?.name || "Admin"}</p>
                            <p className="font-body text-[10px] uppercase tracking-widest2 text-floodlight/70">Admin</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-1.5 rounded-lg text-chalk/30 hover:text-flare transition-colors"
                            aria-label="Sign out"
                        >
                            <LogOut size={15} />
                        </button>
                    </div>
                )}
            </div>
        </>
    )

    return (
        <div className="min-h-screen bg-night flex">
            {/* Desktop sidebar */}
            <aside
                className={`hidden lg:flex flex-col border-r border-glass-border bg-black/20 transition-all duration-300 ${
                    sidebarOpen ? "w-60" : "w-16"
                }`}
            >
                <SidebarContent collapsed={!sidebarOpen} />

                {/* Expand button when collapsed */}
                {!sidebarOpen && (
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="absolute left-4 bottom-20 p-1.5 rounded-lg text-chalk/30 hover:text-chalk hover:bg-chalk/5 transition-colors hidden lg:flex"
                        aria-label="Expand sidebar"
                    >
                        <ChevronRight size={16} />
                    </button>
                )}
            </aside>

            {/* Mobile sidebar overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setMobileOpen(false)}
                    />
                    <aside className="relative w-72 h-full bg-night border-r border-glass-border flex flex-col z-50">
                        <div className="flex items-center justify-between px-4 h-16 border-b border-glass-border">
                            <span className="font-display font-bold text-base tracking-wide text-chalk uppercase">
                                Pitch<span className="text-floodlight">Track</span>
                            </span>
                            <button
                                onClick={() => setMobileOpen(false)}
                                className="p-1.5 rounded-lg text-chalk/40 hover:text-chalk transition-colors"
                                aria-label="Close sidebar"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <SidebarContent collapsed={false} />
                    </aside>
                </div>
            )}

            {/* Main content area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top bar */}
                <header className="h-14 border-b border-glass-border bg-night/80 backdrop-blur-lg flex items-center justify-between px-4 md:px-6 shrink-0">
                    <div className="flex items-center gap-3">
                        <button
                            className="lg:hidden p-2 rounded-lg text-chalk/50 hover:text-chalk hover:bg-chalk/5 transition-colors"
                            onClick={() => setMobileOpen(true)}
                            aria-label="Open sidebar"
                        >
                            <Menu size={18} />
                        </button>
                        <span className="font-display text-sm uppercase tracking-widest2 text-chalk/40 hidden sm:block">
                            Admin Panel
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            className="p-2 rounded-lg text-chalk/40 hover:text-chalk hover:bg-chalk/5 transition-colors relative"
                            aria-label="Notifications"
                        >
                            <Bell size={17} />
                        </button>

                        {/* Quick view profile */}
                        <div className="relative">
                            <button
                                onClick={() => setProfileOpen((prev) => !prev)}
                                className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-lg hover:bg-chalk/5 transition-colors"
                            >
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-floodlight to-floodlight/60 flex items-center justify-center font-display text-xs font-bold text-night">
                                    {user?.name?.charAt(0)?.toUpperCase() || "A"}
                                </div>
                                <span className="hidden sm:block font-body text-sm text-chalk/70 max-w-[100px] truncate">
                                    {user?.name || "Admin"}
                                </span>
                            </button>

                            {profileOpen && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-night border border-glass-border rounded-xl shadow-xl shadow-black/30 py-2 backdrop-blur-xl z-50">
                                    <Link
                                        to="/dashboard"
                                        onClick={() => setProfileOpen(false)}
                                        className="flex items-center gap-3 px-4 py-2.5 font-body text-sm text-chalk/70 hover:text-chalk hover:bg-chalk/5 transition-colors"
                                    >
                                        <User size={15} />
                                        User Dashboard
                                    </Link>
                                    <div className="border-t border-glass-border pt-1">
                                        <button
                                            onClick={() => {
                                                setProfileOpen(false)
                                                handleLogout()
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
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}
