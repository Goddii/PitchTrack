import { useMemo, useRef, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import AdminSidebar from "../components/AdminSidebar"
import TeamStatsTable from "../components/TeamStatsTable"
import LineupEditor from "../components/LineupEditor"
import ErrorState from "../components/ErrorState"
import { useAsync } from "../hooks/useAsync"
import {
    EMPTY_DRAFT,
    draftFromRow,
    draftProblem,
    isBlankDraft,
    lineupProblem,
    payloadFromDrafts,
    startersDraft,
    teamGoalTotal,
    toggleStarter,
} from "../utils/matchStatsForm"
import api from "../services/api"

const FULL_TIME_MINUTES = 90
const FLASH_MS = 4000

async function loadMatchStats(id, signal) {
    const match = await api.matches.get(id, { signal })
    const [home, away, rows] = await Promise.all([
        api.players.list({ team_id: match.home_team.id }, { signal }),
        api.players.list({ team_id: match.away_team.id }, { signal }),
        api.matches.playerStats(id, { signal }),
    ])
    return { match, home, away, rows }
}

export default function AdminMatchStats() {
    const { id } = useParams()
    const { data, loading, error, refetch } = useAsync((signal) => loadMatchStats(id, signal), [id], null)

    const [edits, setEdits] = useState({})
    const [formationEdits, setFormationEdits] = useState({})
    const [saving, setSaving] = useState(false)
    const [flash, setFlash] = useState(null)
    const flashTimer = useRef(null)

    // Saved numbers for everyone in the match, with local edits layered on top
    const saved = useMemo(() => {
        if (!data) return { drafts: {}, ids: new Set() }
        const byPlayer = new Map(data.rows.map((row) => [row.player.id, row]))
        const drafts = {}
        for (const player of [...data.home, ...data.away]) {
            const row = byPlayer.get(player.id)
            drafts[player.id] = row ? draftFromRow(row) : EMPTY_DRAFT
        }
        return { drafts, ids: new Set(byPlayer.keys()) }
    }, [data])
    const drafts = useMemo(() => ({ ...saved.drafts, ...edits }), [saved, edits])

    const showFlash = (type, message) => {
        clearTimeout(flashTimer.current)
        setFlash({ type, message })
        flashTimer.current = setTimeout(() => setFlash(null), FLASH_MS)
    }

    const changeField = (playerId, field, value) =>
        setEdits((prev) => ({ ...prev, [playerId]: { ...(prev[playerId] ?? drafts[playerId]), [field]: value } }))

    const markStarters = (players) => {
        const minutes = data.match.status === "live" ? Math.max(1, data.match.minute ?? 1) : FULL_TIME_MINUTES
        setEdits((prev) => ({ ...prev, ...startersDraft(players, drafts, minutes) }))
    }

    const toggleLineupPlayer = (playerId) =>
        setEdits((prev) => ({ ...prev, [playerId]: toggleStarter(drafts[playerId]) }))

    const changeFormation = (field, value) => setFormationEdits((prev) => ({ ...prev, [field]: value }))

    const formationOf = (field) => (field in formationEdits ? formationEdits[field] : data.match[field])

    const saveLineup = async () => {
        const squads = [data.home, data.away]
        if (squads.some((squad) => lineupProblem(squad, drafts) || squad.some((p) => draftProblem(drafts[p.id], { lineupOnly: true })))) {
            showFlash("error", "Fix the lineup first")
            return
        }

        const everyone = [...data.home, ...data.away]
        const cleared = everyone.filter((p) => saved.ids.has(p.id) && isBlankDraft(drafts[p.id]))
        const starters = payloadFromDrafts(drafts, new Set()).filter((row) => row.started)

        setSaving(true)
        try {
            if (starters.length > 0) await api.matches.saveStats(id, starters)
            await Promise.all(cleared.map((p) => api.matches.removeStat(id, p.id)))
            if (Object.keys(formationEdits).length > 0) await api.matches.update(id, formationEdits)
            setEdits({})
            setFormationEdits({})
            refetch()
            showFlash("success", "Lineup saved")
        } catch (err) {
            showFlash("error", err.message || "Could not save the lineup")
        } finally {
            setSaving(false)
        }
    }

    const handleSave = async () => {
        if (data.match.status === "scheduled") return saveLineup()

        const players = [...data.home, ...data.away]
        if (players.some((p) => draftProblem(drafts[p.id]))) {
            showFlash("error", "Fix the highlighted players first")
            return
        }

        const { match } = data
        const sides = [[match.home_score, data.home, match.home_team.name], [match.away_score, data.away, match.away_team.name]]
        for (const [score, squad, name] of sides) {
            if (teamGoalTotal(squad, drafts) > (score ?? 0)) {
                showFlash("error", `${name}: goals entered are more than the ${score ?? 0} the team scored`)
                return
            }
        }

        const payload = payloadFromDrafts(drafts, saved.ids)
        if (payload.length === 0) {
            showFlash("error", "Nothing to save yet")
            return
        }

        setSaving(true)
        try {
            await api.matches.saveStats(id, payload)
            setEdits({})
            refetch()
            showFlash("success", "Stats saved")
        } catch (err) {
            showFlash("error", err.message || "Could not save the stats")
        } finally {
            setSaving(false)
        }
    }

    const match = data?.match
    const isLineupMode = match?.status === "scheduled"
    const dirty = Object.keys(edits).length > 0 || Object.keys(formationEdits).length > 0

    return (
        <AdminSidebar>
            {flash && (
                <div
                    role="status"
                    className={`fixed right-4 top-4 z-50 rounded-lg border px-5 py-3 font-body text-sm font-semibold shadow-lg ${
                        flash.type === "error" ? "border-flare/30 bg-night text-flare" : "border-floodlight/30 bg-night text-floodlight"
                    }`}
                >
                    {flash.message}
                </div>
            )}

            <section className="mx-auto max-w-7xl px-6 py-12 md:px-10">
                <Link
                    to="/admin?tab=matches"
                    className="mb-6 inline-flex min-h-11 items-center gap-1.5 font-body text-sm text-chalk/70 transition-colors hover:text-floodlight"
                >
                    <ArrowLeft size={15} aria-hidden="true" /> Back to matches
                </Link>

                {error && error.status !== 404 ? (
                    <ErrorState error={error} onRetry={refetch} title="Couldn't load this match" />
                ) : error || (!loading && !match) ? (
                    <p className="font-body text-sm text-chalk/70">That match doesn&apos;t exist.</p>
                ) : loading || !match ? (
                    <div className="animate-pulse" aria-hidden="true">
                        <div className="mb-3 h-8 w-80 rounded bg-line/30" />
                        <div className="h-4 w-52 rounded bg-line/20" />
                    </div>
                ) : (
                    <>
                        <header className="mb-8">
                            <h1 className="mb-2 font-display text-3xl uppercase tracking-wide text-chalk">
                                {match.home_team.name}{" "}
                                <span className="text-floodlight tabular-nums">
                                    {match.home_score != null ? `${match.home_score} - ${match.away_score}` : "vs"}
                                </span>{" "}
                                {match.away_team.name}
                            </h1>
                            <p className="font-body text-sm text-chalk/70">
                                Player stats · {match.status}
                                {match.status === "live" && match.minute != null && ` ${match.minute}′`}
                                {match.match_date && ` · ${new Date(match.match_date).toLocaleDateString()}`}
                            </p>
                        </header>

                        {(
                            <>
                                <div className="space-y-8">
                                    {isLineupMode ? (
                                        [
                                            [match.home_team.name, data.home, "home_formation"],
                                            [match.away_team.name, data.away, "away_formation"],
                                        ].map(([name, squad, field]) => (
                                            <LineupEditor
                                                key={field}
                                                title={name}
                                                players={squad}
                                                drafts={drafts}
                                                formation={formationOf(field)}
                                                onFormation={(value) => changeFormation(field, value)}
                                                onToggle={toggleLineupPlayer}
                                                disabled={saving}
                                            />
                                        ))
                                    ) : (<>
                                    <TeamStatsTable
                                        title={match.home_team.name}
                                        players={data.home}
                                        drafts={drafts}
                                        score={match.home_score ?? 0}
                                        onChange={changeField}
                                        onStarters={() => markStarters(data.home)}
                                        disabled={saving}
                                    />
                                    <TeamStatsTable
                                        title={match.away_team.name}
                                        players={data.away}
                                        drafts={drafts}
                                        score={match.away_score ?? 0}
                                        onChange={changeField}
                                        onStarters={() => markStarters(data.away)}
                                        disabled={saving}
                                    />
                                    </>)}
                                </div>

                                <div className="sticky bottom-0 mt-8 flex items-center justify-between gap-4 border-t border-line bg-night py-4">
                                    <p className="font-body text-sm text-chalk/70">
                                        {dirty ? "You have unsaved changes." : "All changes saved."}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={handleSave}
                                        disabled={saving || !dirty}
                                        className="min-h-11 cursor-pointer rounded-lg bg-floodlight px-6 font-body text-sm font-semibold text-night transition-colors hover:bg-chalk disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {saving ? "Saving…" : isLineupMode ? "Save lineup" : "Save stats"}
                                    </button>
                                </div>
                            </>
                        )}
                    </>
                )}
            </section>
        </AdminSidebar>
    )
}
