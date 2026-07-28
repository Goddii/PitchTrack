import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, MapPin, Calendar, CalendarX } from "lucide-react"
import Navbar from "../components/Navbar"
import EmptyState from "../components/EmptyState"
import { MOCK_MATCHES } from "../data/mockData"

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString(undefined, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    })
}

function formatTime(dateStr) {
    return new Date(dateStr).toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
    })
}

function TeamColumn({ team }) {
    return (
        <Link
            to={`/teams/${team.id}`}
            className="flex-1 flex flex-col items-center gap-3 text-center min-w-0 group"
        >
            <span className="w-20 h-20 rounded-full bg-pitch flex items-center justify-center font-display text-chalk/60 text-2xl shrink-0 border border-line group-hover:border-floodlight transition-colors">
                {team.name.charAt(0)}
            </span>
            <span className="font-display uppercase tracking-wide text-lg text-chalk truncate max-w-full group-hover:text-floodlight transition-colors">
                {team.name}
            </span>
        </Link>
    )
}
