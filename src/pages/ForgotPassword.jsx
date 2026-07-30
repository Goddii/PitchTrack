import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, AlertCircle, CheckCircle2 } from "lucide-react";
import PublicNavbar from "../components/PublicNavbar";
import api from "../services/api";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
  
   

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);
        try {
            const data = await api.auth.forgotPassword({ email: email.trim().toLowerCase() });
            setSubmitted(true);
        } catch (err) {
            setError(err.message || "Something went wrong");
        } finally {
            setSubmitting(false);
        }
    };
    return (
        <div>
            <PublicNavbar />

            <section className="max-w-md mx-auto px-6 py-20">
                <h1 className="font-display uppercase tracking-wide text-3xl text-chalk mb-2">
                    Reset Password
                </h1>
                <p className="font-body text-sm text-chalk/50 mb-10">
                    Enter your account email and we'll get you back in.
                </p>

                {submitted ? (
                    <div className="flex flex-col gap-5">
                        <div className="flex items-start gap-2 bg-pitch/20 border border-floodlight/30 rounded-lg px-4 py-3 text-sm text-chalk font-body">
                            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-floodlight" />
                            <span>If an account with that email exists, a reset link has been generated.</span>
                        </div>
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

                        <button
                            type="submit"
                            disabled={submitting}
                            className="mt-2 w-full py-3 rounded bg-floodlight text-night font-body font-semibold text-sm uppercase tracking-widest2 hover:bg-chalk transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? "Sending..." : "Send Reset Link"}
                        </button>
                    </form>
                )}

                <p className="font-body text-sm text-chalk/50 mt-8 text-center">
                    Remembered it?{" "}
                    <Link to="/login" className="text-floodlight hover:text-chalk transition-colors font-semibold">
                        Sign In
                    </Link>
                </p>
            </section>
        </div>
    );
}