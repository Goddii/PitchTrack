import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function Navbar({ transparent = false, user = null }) { 
    const [mobileOpen, setMobileOpen] = useState(false);

    const navLinks = [
        { label: "Teams", to: "/teams" },
        { label: "Players", to: "/players"}, 
        { label: "Matches", to: "/matches" }
    ];

    return (
        <nav className={`w-full z-30 ${
            transparent
                ? "absolute top-0 left-0 bg-gradient-to-b from-night/80 to-transparent"
                : "relative bg-night border-b border-line"
        }`}>
            <div className="max-w-7xl  px-6 md:px-10 py-5 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2"> 
                  <span className="font-display font-bold text-xl md:text-2xl tracking-wide text-chalk uppercase">
                      Pitch<span className="text-floodlight">Track</span>
                  </span>
                </Link>

                <div className="hidden md:flex items-center gap-8 font-body text-sm uppercase tracking-widest2 text-chalk/80">
                    {navLinks.map((link) => (
                        <Link key={link.to} to={link.to} className="hover:text-floodlight transition-colors">
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
                                Log In
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
                                Log in
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