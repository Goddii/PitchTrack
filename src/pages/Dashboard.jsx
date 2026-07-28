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
