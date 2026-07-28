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