import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, AlertCircle } from "lucide-react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext"