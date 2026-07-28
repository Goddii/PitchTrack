import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, AlertCircle, CheckCircle2 } from "lucide-react";
import Navbar from "../components/Navbar";
import api from "../services/api";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    // TODO: once real email delivery is wired up on the backend, drop this -
    // the token is only surfaced here because there's no email provider yet.
    const [devResetToken, setDevResetToken] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);
        try {
            const data = await api.auth.forgotPassword({ email: email.trim().toLowerCase() });
            setSubmitted(true);
            setDevResetToken(data?.reset_token || null);
        } catch (err) {
            setError(err.message || "Something went wrong");
        } finally {
            setSubmitting(false);
        }
    };