import { useEffect, useState, useCallback } from "react"
import { useSearchParams } from "react-router-dom"
import { Plus, Pencil, Trash2, Save, X, Shield, AlertCircle } from "lucide-react"
import AdminSidebar from "../components/AdminSidebar"
import Modal from "../components/Modal"
import api from "../services/api"

const SECTIONS = [
    { value: "teams", label: "Teams" },
    { value: "players", label: "Players" },
    { value: "matches", label: "Matches" },
]

const VALID_POSITIONS = ["Forward", "Midfielder", "Defender", "Goalkeeper"]
const VALID_STATUSES = ["scheduled", "live", "completed"]

function Field({ label, children }) {
    return (
        <label className="flex flex-col gap-1.5">
            <span className="font-body text-xs uppercase tracking-widest2 text-chalk/50">{label}</span>
            {children}
        </label>
    )
}

function Input({ value, onChange, placeholder, type = "text", required }) {
    return (
        <input
            type={type}
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            className="w-full bg-night border border-line rounded-lg px-4 py-2.5 font-body text-sm text-chalk placeholder:text-chalk/30 focus:outline-none focus:border-floodlight transition-colors"
        />
    )
}

function Select({ value, onChange, options }) {
    return (
        <select
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-night border border-line rounded-lg px-4 py-2.5 font-body text-sm text-chalk focus:outline-none focus:border-floodlight transition-colors"
        >
            <option value="" disabled>Select…</option>
            {options.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-night text-chalk">
                    {opt.label}
                </option>
            ))}
        </select>
    )
}

function ConfirmDialog({ open, onClose, onConfirm, title, message }) {
    return (
        <Modal open={open} onClose={onClose} title={title}>
            <p className="font-body text-sm text-chalk/60 mb-6">{message}</p>
            <div className="flex justify-end gap-3">
                <button
                    onClick={onClose}
                    className="px-4 py-2.5 rounded border border-line text-chalk/70 hover:text-chalk transition-colors font-body text-sm font-semibold cursor-pointer"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    className="px-4 py-2.5 rounded bg-flare text-white font-body text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                >
                    Delete
                </button>
            </div>
        </Modal>
    )
}

const VALID_TABS = ["teams", "players", "matches"]

export default function AdminPanel() {
    const [searchParams, setSearchParams] = useSearchParams()
    const tabFromUrl = searchParams.get("tab") || "teams"
    const initialTab = VALID_TABS.includes(tabFromUrl) ? tabFromUrl : "teams"
    const [section, setSection] = useState(initialTab)

    // Data state
    const [teams, setTeams] = useState([])
    const [players, setPlayers] = useState([])
    const [matches, setMatches] = useState([])
    const [loading, setLoading] = useState(true)

    // Form modal state
    const [modalOpen, setModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState(null) // null = create mode
    const [formData, setFormData] = useState({})
    const [saving, setSaving] = useState(false)
    const [formError, setFormError] = useState("")

    // Delete confirmation
    const [deleteTarget, setDeleteTarget] = useState(null)

    // Flash message
    const [flash, setFlash] = useState(null)

    const showFlash = useCallback((message, type = "success") => {
        setFlash({ message, type })
        setTimeout(() => setFlash(null), 3000)
    }, [])

    // Fetch data based on active section
    useEffect(() => {
        let cancelled = false
        setLoading(true)

        const fetches = {
            teams: api.teams.list(),
            players: api.players.list(),
            matches: api.matches.list(),
        }

        Promise.all([fetches.teams, fetches.players, fetches.matches])
            .then(([t, p, m]) => {
                if (cancelled) return
                setTeams(t)
                setPlayers(p)
                setMatches(m)
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })

        return () => { cancelled = true }
    }, [])

    // Open create modal
    const openCreate = () => {
        setEditingItem(null)
        setFormData({})
        setFormError("")
        setModalOpen(true)
    }

    // Open edit modal
    const openEdit = (item) => {
        setEditingItem(item)
        setFormError("")

        if (section === "teams") {
            setFormData({
                name: item.name || "",
                city: item.city || "",
                founded_year: item.founded_year ?? "",
                coach: item.coach || "",
                logo_url: item.logo_url || "",
            })
        } else if (section === "players") {
            setFormData({
                name: item.name || "",
                position: item.position || "",
                team_id: item.team?.id ?? "",
                jersey_number: item.jersey_number ?? "",
                nationality: item.nationality || "",
                age: item.age ?? "",
                photo_url: item.photo_url || "",
                bio: item.bio || "",
                attributes: item.attributes ? { ...item.attributes } : {},
            })
        } else if (section === "matches") {
            setFormData({
                home_team_id: item.home_team?.id ?? "",
                away_team_id: item.away_team?.id ?? "",
                match_date: item.match_date ? item.match_date.slice(0, 16) : "",
                venue: item.venue || "",
                status: item.status || "scheduled",
                home_score: item.home_score ?? "",
                away_score: item.away_score ?? "",
                minute: item.minute ?? "",
            })
        }
        setModalOpen(true)
    }

    // Handle form submit for create/edit
    const handleSave = async (e) => {
        e.preventDefault()
        setSaving(true)
        setFormError("")
        try {
            if (section === "teams") {
                if (editingItem) {
                    await api.teams.update(editingItem.id, formData)
                    setTeams((prev) => prev.map((t) => (t.id === editingItem.id ? { ...t, ...formData } : t)))
                    showFlash("Team updated")
                } else {
                    const created = await api.teams.create(formData)
                    setTeams((prev) => [...prev, created])
                    showFlash("Team created")
                }
            } else if (section === "players") {
                const payload = { ...formData }
                if (payload.age === "") delete payload.age
                if (payload.jersey_number === "") delete payload.jersey_number

                // Clean attributes: remove empty strings, omit if completely empty
                if (payload.attributes) {
                    const cleaned = {}
                    let hasValue = false
                    for (const [k, v] of Object.entries(payload.attributes)) {
                        if (v !== "" && v != null) {
                            cleaned[k] = Number(v)
                            hasValue = true
                        }
                    }
                    payload.attributes = hasValue ? cleaned : undefined
                }

                if (editingItem) {
                    await api.players.update(editingItem.id, payload)
                    // Refresh players list to get updated data with team
                    const updated = await api.players.list()
                    setPlayers(updated)
                    showFlash("Player updated")
                } else {
                    const created = await api.players.create(payload)
                    setPlayers((prev) => [...prev, created])
                    showFlash("Player created")
                }
            } else if (section === "matches") {
                const payload = { ...formData }
                if (payload.home_score === "") payload.home_score = null
                if (payload.away_score === "") payload.away_score = null
                if (payload.minute === "") payload.minute = null

                if (editingItem) {
                    await api.matches.update(editingItem.id, payload)
                    const updated = await api.matches.list()
                    setMatches(updated)
                    showFlash("Match updated")
                } else {
                    const created = await api.matches.create(payload)
                    setMatches((prev) => [...prev, created])
                    showFlash("Match created")
                }
            }
            setModalOpen(false)
        } catch (err) {
            setFormError(err.message || "Something went wrong")
        } finally {
            setSaving(false)
        }
    }

    // Handle delete
    const confirmDelete = async () => {
        if (!deleteTarget) return
        try {
            if (section === "teams") {
                await api.teams.remove(deleteTarget.id)
                setTeams((prev) => prev.filter((t) => t.id !== deleteTarget.id))
                showFlash("Team deleted")
            } else if (section === "players") {
                await api.players.remove(deleteTarget.id)
                setPlayers((prev) => prev.filter((p) => p.id !== deleteTarget.id))
                showFlash("Player removed")
            } else if (section === "matches") {
                await api.matches.remove(deleteTarget.id)
                setMatches((prev) => prev.filter((m) => m.id !== deleteTarget.id))
                showFlash("Match deleted")
            }
            setDeleteTarget(null)
        } catch (err) {
            showFlash(err.message || "Delete failed", "error")
            setDeleteTarget(null)
        }
    }

    const setField = (key) => (value) => setFormData((prev) => ({ ...prev, [key]: value }))

    const OUTFIELD_ATTRS = [
    { key: "pace", label: "Pace" },
    { key: "shooting", label: "Shooting" },
    { key: "passing", label: "Passing" },
    { key: "dribbling", label: "Dribbling" },
    { key: "defending", label: "Defending" },
    { key: "physical", label: "Physical" },
]

const GOALKEEPER_ATTRS = [
    { key: "diving", label: "Diving" },
    { key: "handling", label: "Handling" },
    { key: "kicking", label: "Kicking" },
    { key: "reflexes", label: "Reflexes" },
    { key: "speed", label: "Speed" },
    { key: "positioning", label: "Positioning" },
]

// Modal form based on active section
    const renderForm = () => {
        if (section === "teams") {
            return (
                <div className="flex flex-col gap-4">
                    <Field label="Name *">
                        <Input value={formData.name} onChange={setField("name")} placeholder="e.g. Riverside FC" required />
                    </Field>
                    <Field label="City">
                        <Input value={formData.city} onChange={setField("city")} placeholder="e.g. Millbrook" />
                    </Field>
                    <Field label="Founded Year">
                        <Input value={formData.founded_year} onChange={setField("founded_year")} type="number" placeholder="e.g. 1998" />
                    </Field>
                    <Field label="Coach">
                        <Input value={formData.coach} onChange={setField("coach")} placeholder="e.g. Daniel Otieno" />
                    </Field>
                    <Field label="Logo URL">
                        <Input value={formData.logo_url} onChange={setField("logo_url")} placeholder="https://..." />
                    </Field>
                </div>
            )
        }

        if (section === "players") {
            return (
                <div className="flex flex-col gap-4">
                    <Field label="Name *">
                        <Input value={formData.name} onChange={setField("name")} placeholder="e.g. James Mwangi" required />
                    </Field>
                    <Field label="Position *">
                        <Select
                            value={formData.position}
                            onChange={(value) => {
                                // Clear attributes when position changes between outfield/GK
                                // to prevent stale or wrong-role keys from being sent
                                setFormData((prev) => ({
                                    ...prev,
                                    position: value,
                                    attributes: {},
                                }))
                            }}
                            options={VALID_POSITIONS.map((p) => ({ value: p, label: p }))}
                        />
                    </Field>
                    <Field label="Team *">
                        <Select
                            value={formData.team_id}
                            onChange={setField("team_id")}
                            options={teams.map((t) => ({ value: t.id, label: t.name }))}
                        />
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Jersey #">
                            <Input value={formData.jersey_number} onChange={setField("jersey_number")} type="number" />
                        </Field>
                        <Field label="Age">
                            <Input value={formData.age} onChange={setField("age")} type="number" />
                        </Field>
                    </div>
                    <Field label="Nationality">
                        <Input value={formData.nationality} onChange={setField("nationality")} placeholder="e.g. Kenya" />
                    </Field>
                    <Field label="Photo URL">
                        <Input value={formData.photo_url} onChange={setField("photo_url")} placeholder="https://..." />
                    </Field>
                    <Field label="Bio">
                        <textarea
                            value={formData.bio ?? ""}
                            onChange={(e) => setField("bio")(e.target.value)}
                            rows={3}
                            className="w-full bg-night border border-line rounded-lg px-4 py-2.5 font-body text-sm text-chalk placeholder:text-chalk/30 focus:outline-none focus:border-floodlight transition-colors resize-none"
                            placeholder="Player biography…"
                        />
                    </Field>

                    {/* Attribute inputs — shown conditionally based on position */}
                    {formData.position && (
                        <>
                            <div className="border-t border-line/50 pt-4">
                                <h4 className="font-display uppercase tracking-wide text-sm text-chalk mb-3">
                                    Attributes
                                    <span className="font-body text-[10px] text-chalk/40 ml-2 font-normal normal-case tracking-normal">
                                        ({formData.position === "Goalkeeper" ? "Goalkeeper" : "Outfield"} set)
                                    </span>
                                </h4>
                                <div className="grid grid-cols-3 gap-3">
                                    {(formData.position === "Goalkeeper" ? GOALKEEPER_ATTRS : OUTFIELD_ATTRS).map((attr) => (
                                        <Field key={attr.key} label={attr.label}>
                                            <input
                                                type="number"
                                                min={0}
                                                max={100}
                                                value={formData.attributes?.[attr.key] ?? ""}
                                                onChange={(e) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        attributes: {
                                                            ...(prev.attributes || {}),
                                                            [attr.key]: e.target.value === "" ? "" : Number(e.target.value),
                                                        },
                                                    }))
                                                }
                                                placeholder="0–100"
                                                className="w-full bg-night border border-line rounded-lg px-3 py-2 font-body text-sm text-chalk placeholder:text-chalk/30 focus:outline-none focus:border-floodlight transition-colors text-center tabular-nums"
                                            />
                                        </Field>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )
        }

        if (section === "matches") {
            return (
                <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Home Team *">
                            <Select
                                value={formData.home_team_id}
                                onChange={setField("home_team_id")}
                                options={teams.map((t) => ({ value: t.id, label: t.name }))}
                            />
                        </Field>
                        <Field label="Away Team *">
                            <Select
                                value={formData.away_team_id}
                                onChange={setField("away_team_id")}
                                options={teams.map((t) => ({ value: t.id, label: t.name }))}
                            />
                        </Field>
                    </div>
                    <Field label="Match Date *">
                        <Input value={formData.match_date} onChange={setField("match_date")} type="datetime-local" />
                    </Field>
                    <Field label="Venue">
                        <Input value={formData.venue} onChange={setField("venue")} placeholder="e.g. Millbrook Community Ground" />
                    </Field>
                    <Field label="Status">
                        <Select
                            value={formData.status}
                            onChange={setField("status")}
                            options={VALID_STATUSES.map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))}
                        />
                    </Field>
                    <div className="grid grid-cols-3 gap-4">
                        <Field label="Home Score">
                            <Input value={formData.home_score} onChange={setField("home_score")} type="number" />
                        </Field>
                        <Field label="Away Score">
                            <Input value={formData.away_score} onChange={setField("away_score")} type="number" />
                        </Field>
                        <Field label="Minute">
                            <Input value={formData.minute} onChange={setField("minute")} type="number" />
                        </Field>
                    </div>
                </div>
            )
        }

        return null
    }

    // Table list based on active section
    const renderList = () => {
        if (loading) {
            return (
                <div className="bg-pitch/30 border border-line rounded-lg p-8 text-center">
                    <p className="font-body text-sm text-chalk/50 uppercase tracking-widest2 animate-pulse">Loading…</p>
                </div>
            )
        }

        if (section === "teams") {
            if (teams.length === 0) {
                return <EmptyList message="No teams yet. Create one to get started." />
            }
            return (
                <div className="bg-pitch/30 border border-line rounded-lg overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-line font-body text-xs uppercase tracking-widest2 text-chalk/40">
                                <th className="text-left px-5 py-3 font-normal">Name</th>
                                <th className="text-left px-5 py-3 font-normal">City</th>
                                <th className="text-left px-5 py-3 font-normal">Founded</th>
                                <th className="text-left px-5 py-3 font-normal">Coach</th>
                                <th className="text-right px-5 py-3 font-normal">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-line">
                            {teams.map((t) => (
                                <tr key={t.id} className="font-body text-sm text-chalk hover:bg-pitch/20 transition-colors">
                                    <td className="px-5 py-3 font-semibold">{t.name}</td>
                                    <td className="px-5 py-3 text-chalk/60">{t.city || "—"}</td>
                                    <td className="px-5 py-3 text-chalk/60">{t.founded_year || "—"}</td>
                                    <td className="px-5 py-3 text-chalk/60">{t.coach || "—"}</td>
                                    <td className="px-5 py-3 text-right">
                                        <ActionButtons item={t} onEdit={openEdit} onDelete={setDeleteTarget} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )
        }

        if (section === "players") {
            if (players.length === 0) {
                return <EmptyList message="No players yet. Add one to a team to get started." />
            }
            return (
                <div className="bg-pitch/30 border border-line rounded-lg overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-line font-body text-xs uppercase tracking-widest2 text-chalk/40">
                                <th className="text-left px-5 py-3 font-normal">Name</th>
                                <th className="text-left px-5 py-3 font-normal">Position</th>
                                <th className="text-left px-5 py-3 font-normal">Team</th>
                                <th className="text-left px-5 py-3 font-normal">#</th>
                                <th className="text-right px-5 py-3 font-normal">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-line">
                            {players.map((p) => (
                                <tr key={p.id} className="font-body text-sm text-chalk hover:bg-pitch/20 transition-colors">
                                    <td className="px-5 py-3 font-semibold">{p.name}</td>
                                    <td className="px-5 py-3 text-chalk/60">{p.position}</td>
                                    <td className="px-5 py-3 text-chalk/60">{p.team?.name || "—"}</td>
                                    <td className="px-5 py-3 text-chalk/60">{p.jersey_number ?? "—"}</td>
                                    <td className="px-5 py-3 text-right">
                                        <ActionButtons item={p} onEdit={openEdit} onDelete={setDeleteTarget} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )
        }

        if (section === "matches") {
            if (matches.length === 0) {
                return <EmptyList message="No matches yet. Schedule one to get started." />
            }
            return (
                <div className="bg-pitch/30 border border-line rounded-lg overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-line font-body text-xs uppercase tracking-widest2 text-chalk/40">
                                <th className="text-left px-5 py-3 font-normal">Home</th>
                                <th className="text-left px-5 py-3 font-normal">Away</th>
                                <th className="text-left px-5 py-3 font-normal">Date</th>
                                <th className="text-left px-5 py-3 font-normal">Status</th>
                                <th className="text-left px-5 py-3 font-normal">Score</th>
                                <th className="text-right px-5 py-3 font-normal">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-line">
                            {matches.map((m) => (
                                <tr key={m.id} className="font-body text-sm text-chalk hover:bg-pitch/20 transition-colors">
                                    <td className="px-5 py-3">{m.home_team?.name || "—"}</td>
                                    <td className="px-5 py-3">{m.away_team?.name || "—"}</td>
                                    <td className="px-5 py-3 text-chalk/60">
                                        {m.match_date ? new Date(m.match_date).toLocaleDateString() : "—"}
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className={`text-xs font-semibold uppercase tracking-widest2 ${
                                            m.status === "live" ? "text-floodlight" :
                                            m.status === "completed" ? "text-chalk/40" : "text-chalk/50"
                                        }`}>
                                            {m.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 font-display tabular-nums">
                                        {m.home_score != null ? `${m.home_score} - ${m.away_score}` : "—"}
                                    </td>
                                    <td className="px-5 py-3 text-right">
                                        <ActionButtons item={m} onEdit={openEdit} onDelete={setDeleteTarget} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )
        }

        return null
    }

    return (
        <AdminSidebar>

            {/* Flash message */}
            {flash && (
                <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-lg border font-body text-sm font-semibold shadow-lg transition-all ${
                    flash.type === "error"
                        ? "bg-flare/10 border-flare/30 text-flare"
                        : "bg-pitch/30 border-floodlight/30 text-floodlight"
                }`}>
                    {flash.message}
                </div>
            )}

            <section className="max-w-7xl mx-auto px-6 md:px-10 py-16">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
                    <div>
                        <h1 className="font-display uppercase tracking-wide text-3xl text-chalk mb-2 flex items-center gap-3">
                            <Shield size={24} className="text-floodlight" />
                            Admin Panel
                        </h1>
                        <p className="font-body text-sm text-chalk/50">Manage teams, players, and matches.</p>
                    </div>
                </div>

                {/* Section tabs */}
                <div className="flex gap-1 bg-pitch/10 border border-line rounded-lg p-1 w-fit mb-8">
                    {SECTIONS.map((s) => (
                        <button
                            key={s.value}
                            onClick={() => {
                                setSection(s.value)
                                if (s.value === "teams") {
                                    setSearchParams({}, { replace: true })
                                } else {
                                    setSearchParams({ tab: s.value }, { replace: true })
                                }
                            }}
                            className={`px-4 py-2 rounded font-body text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                                section === s.value
                                    ? "bg-floodlight text-night"
                                    : "text-chalk/60 hover:text-chalk"
                            }`}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>

                {/* Create button */}
                <div className="flex justify-end mb-4">
                    <button
                        onClick={openCreate}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded bg-floodlight text-night font-body font-semibold text-sm uppercase tracking-widest2 hover:bg-chalk transition-colors cursor-pointer"
                    >
                        <Plus size={15} />
                        Add {section.slice(0, -1)}
                    </button>
                </div>

                {/* List */}
                {renderList()}
            </section>

            {/* Create/Edit modal */}
            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingItem ? `Edit ${section.slice(0, -1)}` : `New ${section.slice(0, -1)}`}
            >
                <form onSubmit={handleSave} className="flex flex-col gap-4">
                    {formError && (
                        <div className="flex items-start gap-2 bg-flare/10 border border-flare/30 rounded-lg px-4 py-3 text-sm text-flare font-body">
                            <AlertCircle size={16} className="mt-0.5 shrink-0" />
                            <span>{formError}</span>
                        </div>
                    )}
                    {renderForm()}
                    <div className="flex justify-end gap-3 mt-2">
                        <button
                            type="button"
                            onClick={() => setModalOpen(false)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded border border-line text-chalk/70 hover:text-chalk transition-colors font-body text-sm font-semibold cursor-pointer"
                        >
                            <X size={15} />
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded bg-floodlight text-night font-body font-semibold text-sm uppercase tracking-widest2 hover:bg-chalk transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            <Save size={15} />
                            {saving ? "Saving…" : "Save"}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete confirmation */}
            <ConfirmDialog
                open={deleteTarget !== null}
                onClose={() => setDeleteTarget(null)}
                onConfirm={confirmDelete}
                title={`Delete ${section.slice(0, -1)}`}
                message={`Are you sure you want to delete "${deleteTarget?.name || deleteTarget?.id}"? This action cannot be undone.`}
            />
        </AdminSidebar>
    )
}

function ActionButtons({ item, onEdit, onDelete }) {
    return (
        <div className="inline-flex gap-1">
            <button
                onClick={() => onEdit(item)}
                aria-label="Edit"
                className="p-1.5 rounded text-chalk/40 hover:text-floodlight hover:bg-pitch/30 transition-colors cursor-pointer"
            >
                <Pencil size={15} />
            </button>
            <button
                onClick={() => onDelete(item)}
                aria-label="Delete"
                className="p-1.5 rounded text-chalk/40 hover:text-flare hover:bg-pitch/30 transition-colors cursor-pointer"
            >
                <Trash2 size={15} />
            </button>
        </div>
    )
}

function EmptyList({ message }) {
    return (
        <div className="bg-pitch/30 border border-line rounded-lg p-12 text-center">
            <p className="font-body text-sm text-chalk/50">{message}</p>
        </div>
    )
}
