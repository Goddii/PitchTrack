import { useEffect, useState } from "react";
import { Star, LogOut, User, Mail, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import Navbar from "../components/Navbar";
import TeamCard from "../components/TeamCard";
import TeamcardSkeleton from "../components/TeamcardSkeleton";
import EmptyState from "../components/EmptyState";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function Dashboard() {
    const { user, logout, updateProfile } = useAuth();

    const [favorites, setFavorites] = useState([]);
    const [loadingFavorites, setLoadingFavorites] = useState(true);

    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [profileError, setProfileError] = useState("");
    const [profileSuccess, setProfileSuccess] = useState("");
    const [savingProfile, setSavingProfile] = useState(false);

    useEffect(() => {
        let cancelled = false;
        setLoadingFavorites(true);
        api.favorites
            .list()
            .then((data) => {
                if (!cancelled) setFavorites(data);
            })
            .finally(() => {
                if (!cancelled) setLoadingFavorites(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const handleUnfollow = async (teamId) => {
        // optimistic update, roll back on failure
        const prev = favorites;
        setFavorites((f) => f.filter((fav) => fav.team.id !== teamId));
        try {
            await api.favorites.unfollow(teamId);
        } catch {
            setFavorites(prev);
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setProfileError("");
        setProfileSuccess("");
        setSavingProfile(true);
        try {
            await updateProfile({ name: name.trim(), email: email.trim().toLowerCase() });
            setProfileSuccess("Profile updated");
        } catch (err) {
            setProfileError(err.message || "Couldn't update your profile");
        } finally {
            setSavingProfile(false);
        }
    };
    return (
        <div>
            <Navbar />

            <section className="max-w-7xl mx-auto px-6 md:px-10 py-16">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-12">
                    <div>
                        <h1 className="font-display uppercase tracking-wide text-3xl text-chalk mb-2">
                            Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
                        </h1>
                        <p className="font-body text-sm text-chalk/50">
                            Manage your profile and the clubs you follow.
                        </p>
                    </div>
                    <button
                        onClick={logout}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded border border-line text-chalk/70 hover:border-flare hover:text-flare transition-colors font-body text-sm font-semibold self-start"
                    >
                        <LogOut size={16} />
                        Log Out
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Profile */}
                    <div className="lg:col-span-1">
                        <h2 className="font-display uppercase tracking-wide text-xl text-chalk mb-6">Profile</h2>
                        <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4 bg-pitch/10 border border-line rounded-lg p-6">
                            {profileError && (
                                <div className="flex items-start gap-2 bg-flare/10 border border-flare/30 rounded-lg px-4 py-3 text-sm text-flare font-body">
                                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                    <span>{profileError}</span>
                                </div>
                            )}
                            {profileSuccess && (
                                <div className="flex items-start gap-2 bg-pitch/30 border border-floodlight/30 rounded-lg px-4 py-3 text-sm text-chalk font-body">
                                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-floodlight" />
                                    <span>{profileSuccess}</span>
                                </div>
                            )}

                            <label className="flex flex-col gap-2">
                                <span className="font-body text-xs uppercase tracking-widest2 text-chalk/50">Name</span>
                                <div className="relative">
                                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-chalk/40 pointer-events-none" />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-night border border-line rounded-lg pl-10 pr-4 py-2.5 font-body text-sm text-chalk focus:outline-none focus:border-floodlight transition-colors"
                                    />
                                </div>
                            </label>

                            <label className="flex flex-col gap-2">
                                <span className="font-body text-xs uppercase tracking-widest2 text-chalk/50">Email</span>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-chalk/40 pointer-events-none" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-night border border-line rounded-lg pl-10 pr-4 py-2.5 font-body text-sm text-chalk focus:outline-none focus:border-floodlight transition-colors"
                                    />
                                </div>
                            </label>

                            <button
                                type="submit"
                                disabled={savingProfile}
                                className="mt-2 inline-flex items-center justify-center gap-2 py-2.5 rounded bg-floodlight text-night font-body font-semibold text-sm uppercase tracking-widest2 hover:bg-chalk transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save size={15} />
                                {savingProfile ? "Saving..." : "Save Changes"}
                            </button>
                        </form>
                    </div>

                    {/* Favorite teams */}
                    <div className="lg:col-span-2">
                        <h2 className="font-display uppercase tracking-wide text-xl text-chalk mb-6">
                            Your Teams
                        </h2>

                        {loadingFavorites ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <TeamcardSkeleton key={i} />
                                ))}
                            </div>
                        ) : favorites.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {favorites.map((fav) => (
                                    <div key={fav.team.id} className="relative">
                                        <TeamCard team={fav.team} />
                                        <button
                                            onClick={() => handleUnfollow(fav.team.id)}
                                            aria-label={`Unfollow ${fav.team.name}`}
                                            className="absolute top-2 right-2 p-1.5 rounded-full bg-night/80 border border-line text-floodlight hover:text-flare hover:border-flare transition-colors"
                                        >
                                            <Star size={14} fill="currentColor" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                icon={Star}
                                title="No teams followed yet"
                                message="Browse the league and follow the clubs you care about to see them here"
                            />
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
