import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, AlertCircle } from "lucide-react";
import PublicNavbar from "../components/PublicNavbar";
import { useAuth } from "../context/AuthContext"

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setSubmitting(true);
        try {
            await register(name.trim(), email.trim().toLowerCase(), password);
            navigate("/dashboard", { replace: true });
        } catch (err) {
            setError(err.message || "Something went wrong creating your account");
        } finally {
            setSubmitting(false);
        }
    };
    return (
        <div>
            <PublicNavbar />

            <section className="max-w-md mx-auto px-6 py-20">
                <h1 className="font-display uppercase tracking-wide text-3xl text-chalk mb-2">
                    Create Account
                </h1>
                <p className="font-body text-sm text-chalk/50 mb-10">
                    Register to follow teams and access your dashboard.
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    {error && (
                        <div className="flex items-start gap-2 bg-flare/10 border border-flare/30 rounded-lg px-4 py-3 text-sm text-flare font-body">
                            <AlertCircle size={16} className="mt-0.5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <label className="flex flex-col gap-2">
                        <span className="font-body text-xs uppercase tracking-widest2 text-chalk/50">Name</span>
                        <div className="relative">
                            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-chalk/40 pointer-events-none" />
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Godwin Otieno"
                                autoComplete="name"
                                className="w-full bg-pitch/10 border border-line rounded-lg pl-10 pr-4 py-2.5 font-body text-sm text-chalk placeholder:text-chalk/40 focus:outline-none focus:border-floodlight transition-colors"
                            />
                        </div>
                    </label>

                    <label className="flex flex-col gap-2">
                        <span className="font-body text-xs uppercase tracking-widest2 text-chalk/50">Email</span>
                        <div className="relative">
                            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-chalk/40 pointer-events-none" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                autoComplete="email"
                                className="w-full bg-pitch/10 border border-line rounded-lg pl-10 pr-4 py-2.5 font-body text-sm text-chalk placeholder:text-chalk/40 focus:outline-none focus:border-floodlight transition-colors"
                            />
                        </div>
                    </label>

                    <label className="flex flex-col gap-2">
                        <span className="font-body text-xs uppercase tracking-widest2 text-chalk/50">Password</span>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-chalk/40 pointer-events-none" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="At least 6 characters"
                                autoComplete="new-password"
                                className="w-full bg-pitch/10 border border-line rounded-lg pl-10 pr-4 py-2.5 font-body text-sm text-chalk placeholder:text-chalk/40 focus:outline-none focus:border-floodlight transition-colors"
                            />
                        </div>
                    </label>

                    <label className="flex flex-col gap-2">
                        <span className="font-body text-xs uppercase tracking-widest2 text-chalk/50">Confirm Password</span>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-chalk/40 pointer-events-none" />
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repeat your password"
                                autoComplete="new-password"
                                className="w-full bg-pitch/10 border border-line rounded-lg pl-10 pr-4 py-2.5 font-body text-sm text-chalk placeholder:text-chalk/40 focus:outline-none focus:border-floodlight transition-colors"
                            />
                        </div>
                    </label>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="mt-2 w-full py-3 rounded bg-floodlight text-night font-body font-semibold text-sm uppercase tracking-widest2 hover:bg-chalk transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? "Creating account..." : "Create Account"}
                    </button>
                </form>

                <p className="font-body text-sm text-chalk/50 mt-8 text-center">
                    Already have an account?{" "}
                    <Link to="/login" className="text-floodlight hover:text-chalk transition-colors font-semibold">
                        Sign In
                    </Link>
                </p>
            </section>
        </div>
    );
}