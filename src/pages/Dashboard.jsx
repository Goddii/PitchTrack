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
