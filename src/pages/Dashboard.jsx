import { useEffect, useState } from "react";
import { Star, LogOut, User, Mail, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import Navbar from "../components/Navbar";
import TeamCard from "../components/TeamCard";
import TeamcardSkeleton from "../components/TeamcardSkeleton";
import EmptyState from "../components/EmptyState";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";