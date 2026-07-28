import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import Navbar from "../components/Navbar";
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
