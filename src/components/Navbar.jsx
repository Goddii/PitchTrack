import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function Navbar({ transparent = false, user = null }) { 
    const [mobileOpen, setMobileOpen] = useState(false);

    const navLinks = [
        { label: "Matches", to: "/matches" },
        { label: "Teams", to: "/teams" },
        { label: "Players", to: "/players"}
    ];

    return (
        <nav className={`w-full z-30 ${
            transparent
                ? "hero-nav absolute top-0 left-0"
                : "bg-night border-b border-line"
        }`}>
            <div className="max-w-7xl mx-auto px-6 md:px-10 min-h-20 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2"> 
                  <span className="font-display font-bold text-xl md:text-2xl tracking-wide text-chalk uppercase">
                      Pitch<span className="text-floodlight">Track</span>
                  </span>
                </Link>

                <div className="hidden md:flex items-center gap-8 font-body text-sm uppercase tracking-widest2 text-chalk/80">
                    {navLinks.map((link) => (
                        <Link 
                            key={link.to} 
                            to={link.to} 
                            className="relative hover:text-floodlight transition-colors after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-[2px] after:bg-floodlight after:scale-x-0 after:origin-bottom-right hover:after:scale-x-100 hover:after:origin-bottom-left transition-transform duration-300"
                        >
                            {link.label} 
                        </Link>
                    ))}

                    {user ? (
                        <Link to="/dashboard" className="px-4 py-2 rounded border border-chalk/30 hover:border-floodlight hover:text-floodlight transition-colors">
                            Dashboard
                        </Link>    
                    ) : (
                        <>
                            <Link to="/login" className="hover:text-floodlight transition-colors">
                                Sign In
                            </Link>
                            <Link to="/register" className="px-4 py-2 rounded bg-floodlight text-night font-semibold hover:bg-chalk transition-colors">
                                Register
                            </Link>
                        </>   
                    )}
                </div>  
                
                <button
                    className="md:hidden text-chalk"
                    onClick={() => setMobileOpen((prev) => !prev)}
                    aria-label="Toggle navigation menu"
                >
                    {mobileOpen ? <X size={26}/> : <Menu size={26} />}
                </button>
            </div>

            {mobileOpen && (
                <div className="md:hidden bg-night border-t border-line px-6 py-4 flex flex-col gap-4 font-body uppercase tracking-wide"> {/* Fixed: completed 'tracking' class */}
                    {navLinks.map((link) => (
                        <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}>
                            {link.label}
                        </Link>
                    ))}
                    {user ? (
                        <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
                            Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link to="/login" onClick={() => setMobileOpen(false)}>
                                Sign In
                            </Link>
                            <Link to="/register" onClick={() => setMobileOpen(false)}>
                                Register
                            </Link>
                        </>            
                    )}
                </div>
            )}
        </nav>
    );
}
