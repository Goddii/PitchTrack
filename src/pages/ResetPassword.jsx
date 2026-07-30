import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import PublicNavbar from "../components/PublicNavbar";
import api from "../services/api";

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [email, setEmail] = useState(searchParams.get("email") || "");
    const [token, setToken] = useState(searchParams.get("token") || "");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (newPassword !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }
        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setSubmitting(true);
        try {
            await api.auth.resetPassword({
                email: email.trim().toLowerCase(),
                token: token.trim(),
                new_password: newPassword,
            });
            setDone(true);
            setTimeout(() => navigate("/login", { replace: true }), 1800);
        } catch (err) {
            setError(err.message || "That reset link is invalid or has expired");
        } finally {
            setSubmitting(false);
        }
    };
    return (
        <div>
            <PublicNavbar />

            <section className="max-w-md mx-auto px-6 py-20">
                <h1 className="font-display uppercase tracking-wide text-3xl text-chalk mb-2">
                    Set New Password
                </h1>
                <p className="font-body text-sm text-chalk/50 mb-10">
                    Choose a new password for your account.
                </p>

                {done ? (
                    <div className="flex items-start gap-2 bg-pitch/20 border border-floodlight/30 rounded-lg px-4 py-3 text-sm text-chalk font-body">
                        <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-floodlight" />
                        <span>Password updated. Redirecting you to sign in...</span>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        {error && (
                            <div className="flex items-start gap-2 bg-flare/10 border border-flare/30 rounded-lg px-4 py-3 text-sm text-flare font-body">
                                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <label className="flex flex-col gap-2">
                            <span className="font-body text-xs uppercase tracking-widest2 text-chalk/50">Email</span>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full bg-pitch/10 border border-line rounded-lg px-4 py-2.5 font-body text-sm text-chalk placeholder:text-chalk/40 focus:outline-none focus:border-floodlight transition-colors"
                            />
                        </label>

                        <label className="flex flex-col gap-2">
                            <span className="font-body text-xs uppercase tracking-widest2 text-chalk/50">Reset Token</span>
                            <input
                                type="text"
                                required
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                placeholder="Paste the token from your reset link"
                                className="w-full bg-pitch/10 border border-line rounded-lg px-4 py-2.5 font-body text-sm text-chalk placeholder:text-chalk/40 focus:outline-none focus:border-floodlight transition-colors"
                            />
                        </label>

                        <label className="flex flex-col gap-2">
                            <span className="font-body text-xs uppercase tracking-widest2 text-chalk/50">New Password</span>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-chalk/40 pointer-events-none" />
                                <input
                                    type="password"
                                    required
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
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
                                    placeholder="Repeat new password"
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
                            {submitting ? "Updating..." : "Update Password"}
                        </button>
                    </form>
                )}

                <p className="font-body text-sm text-chalk/50 mt-8 text-center">
                    <Link to="/login" className="text-floodlight hover:text-chalk transition-colors font-semibold">
                        Back to Sign In
                    </Link>
                </p>
            </section>
        </div>
    );
}
