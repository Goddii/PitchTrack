import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, Lock, AlertCircle } from "lucide-react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";