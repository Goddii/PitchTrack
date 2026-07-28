import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, Lock, AlertCircle } from "lucide-react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const redirectTo = location.state?.from?.pathname || "/dashboard"
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);
        try {
            await login(email.trim().toLowerCase(), password);
            navigate(redirectTo, { replace: true });
        } catch (err) {
            setError(err.message || "Something went wrong logging you in");
        } finally {
            setSubmitting(false);
        }
    };