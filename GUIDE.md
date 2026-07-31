# PitchTrack — Complete System Guide

> **Date:** July 31, 2026  
> **Stack:** React 19 + Vite 8 + Tailwind CSS v4 + Flask REST API  
> **Live URL:** [pitch-track.vercel.app](https://pitch-track.vercel.app) (if deployed)

---

## Table of Contents

1. [User Interaction Flow](#1-user-interaction-flow)
   - [Visitor (Unauthenticated)](#11-visitor-unauthenticated)
   - [Authenticated User (Fan)](#12-authenticated-user-fan)
   - [Admin User](#13-admin-user)
2. [Routing & Page Map](#2-routing--page-map)
3. [Data Flow Architecture](#3-data-flow-architecture)
   - [How useState, useEffect, and API Communicate](#31-how-usestate-useeffect-and-api-communicate)
   - [Component Trigger Chain](#32-component-trigger-chain)
   - [Debounced Search Pattern](#33-debounced-search-pattern)
   - [Optimistic UI Updates](#34-optimistic-ui-updates)
4. [Component Directory — What Each Component Does & What Fires It](#4-component-directory)
   - [Landing Page Components](#41-landing-page-components)
   - [Data Display Components](#42-data-display-components)
   - [Form & Input Components](#43-form--input-components)
   - [Navigation Components](#44-navigation-components)
   - [Feedback & Skeleton Components](#45-feedback--skeleton-components)
   - [Auth & Layout Components](#46-auth--layout-components)
5. [Animations & Visual Effects](#5-animations--visual-effects)
6. [Design System & Layout](#6-design-system--layout)
7. [Libraries & Dependencies](#7-libraries--dependencies)
8. [Project File Structure](#8-project-file-structure)

---

## 1. User Interaction Flow

### 1.1 Visitor (Unauthenticated)

A **Visitor** lands on the app and can browse everything freely — no login required.

#### Landing Page (`/` — `Home.jsx`)

```
Visitor arrives at /
         │
         ▼
┌─────────────────────────────────────────────────┐
│                   HERO SECTION                   │
│  • "PITCH TRACK." wordmark (staggered slide-in) │
│  • Player image with entrance animation +       │
│    mouse parallax on desktop                     │
│  • 3 floating stat cards (Clubs, Players,       │
│    Matches) slide in from right                  │
│  • Two CTAs: "Get Started" → /register          │
│               "Browse Teams" → /teams           │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│                 STATS RIBBON                     │
│  • 4 numbers: 128 clubs, 3,406 players,         │
│    942 matches, 37 fixtures this week           │
│  • Display-only (no fetch — hardcoded in        │
│    Home.jsx as STATS array)                     │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│              HOME SPOTLIGHT (2-column)           │
│  LEFT: "Featured Match" card                    │
│    • Fires: HomeSpotlight.jsx useEffect fetches │
│      api.matches.list() on mount                │
│    • Picks: Live > next upcoming > most recent  │
│      completed                                  │
│    • Shows: team emblems, score, venue, status  │
│    • Click → /matches/:id                       │
│  RIGHT: "In Form Player" card                   │
│    • Fires: same useEffect fetches              │
│      api.players.list()                         │
│    • Picks: player with highest overall rating  │
│      (computed via utils/playerRating.js)       │
│    • Shows: avatar, name, position, jersey #,   │
│      rating badge (colored by tier)             │
│    • Click → /players/:id                       │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────┐
│               HOW IT WORKS                    │
│  • 3-step grid (Create → Track → Follow)     │
│  • Static content from STEPS array in        │
│    HowItWorks.jsx                            │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│              WHY PITCHTRACK                   │
│  • 4 feature pills (Built for admins,        │
│    Always current, Fan accounts,             │
│    Season history)                           │
│  • Static content                            │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│              CTA SECTION                      │
│  • Amber banner "Ready to run your league?"  │
│  • Button → /register                        │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│                  FOOTER                       │
│  • © 2026 PitchTrack · About · Contact       │
└──────────────────────────────────────────────┘
```

#### Browse Teams (`/teams` — `Teams.jsx`)

```
Visitor clicks "Teams" or "Browse Teams"
         │
         ▼
┌────────────────────────────────────────────────────┐
│ Teams.jsx mounts                                  │
│   useEffect fires → api.teams.list() +            │
│   api.matches.list() in parallel                  │
│      │                                            │
│      ▼                                            │
│   sets teams[], matches[] state                   │
│      │                                            │
│      ▼                                            │
│   useMemo → computeStandings(teams, matches)      │
│     (points, GD, GF sorted)                       │
│      │                                            │
│      ▼                                            │
│   Two tabs: "Standings" (default) vs "Teams"      │
│                                                    │
│ STANDINGS TAB:                                    │
│   Renders <StandingsTable> with:                  │
│   • Position, Club (emblem + name), P, W, D, L,  │
│     GF, GA, GD, Pts                               │
│   • Zone dividers: Top 4 = Continental/Promotion  │
│     Bottom 4 = Relegation (flare-colored)         │
│   • Loading skeleton while fetching               │
│   • Error state if API fails                      │
│                                                    │
│ TEAMS TAB:                                        │
│   • SearchBar (debounced 300ms)                   │
│   • FilterDropdown (filter by city)               │
│   • TeamCard grid (2-col mobile → 4-col desktop)  │
│   • EmptyState when no match                      │
│   • URL sync: filters written to ?q=&city=        │
│     search params, restored on page load          │
│   • Click card → /teams/:id                       │
└────────────────────────────────────────────────────┘
```

#### Team Details (`/teams/:id` — `TeamDetails.jsx`)

```
Visitor clicks a team card
         │
         ▼
┌─────────────────────────────────────────────────────┐
│ TeamDetails.jsx mounts                              │
│   useEffect fires:                                  │
│     api.teams.get(id)                                │
│     api.matches.list({ team_id: id })                │
│     api.players.list({ team_id: id })                │
│   All 3 in parallel via Promise.all                 │
│      │                                               │
│      ▼                                               │
│   Sets team, matches[], roster[] state              │
│      │                                               │
│      ▼                                               │
│   Renders:                                           │
│   • Hero: Back button, team logo/initial circle,    │
│     name, city, founded year, coach, Follow button  │
│     (only if authenticated)                         │
│   • Lineup section with <FormationPitch>             │
│     (SVG grass pitch with markings) +               │
│     <PlayerFormationCard> per position group        │
│     (Forwards → Midfielders → Defenders →           │
│      Goalkeepers, top to bottom)                    │
│   • "Upcoming Matches" section with <MatchCard>     │
│   • "Past Matches" section with <MatchCard>         │
│   • EmptyState when no data                         │
│   • Loading skeleton while fetching                 │
│                                                     │
│ If authenticated: also fetches api.favorites.list() │
│ to check if already following this team             │
│                                                     │
│ Follow button uses optimistic update:               │
│   Click → immediately toggle UI →                   │
│   call api.favorites.follow/unfollow →              │
│   revert on error                                   │
└─────────────────────────────────────────────────────┘
```

#### Browse Players (`/players` — `Player.jsx`)

```
Same pattern as Teams:
  • Fetch api.players.list() on mount
  • SearchBar (debounced) filters by name or team
  • FilterDropdown filters by position
  • PlayerCard grid (2-col → 4-col)
  • EmptyState + URL sync
  • Click → /players/:id
```

#### Player Profile (`/players/:id` — `PlayerProfile.jsx`)

```
  • Fetch api.players.get(id) on mount
  • Walk-in animation on photo/initials card
    (CSS keyframes: translateX(-10%) + blur → normal)
  • Show: initials/photo, name, position, jersey #,
    age, nationality, team link
  • <PlayerRadarChart> using Recharts (radar chart)
    reading player.attributes
  • Bio section
  • Loading skeleton + EmptyState + back button
```

#### Browse Matches (`/matches` — `Matches.jsx`)

```
The most feature-rich public page.
  • Fetch api.matches.list() on mount
  • FeaturedMatchHero at top (first live, or first upcoming)
    with stadium background image + cinematic scoreboard
  • StatsBar: Total, Live (accented), Upcoming, Finished
  • Sticky MatchFilters toolbar:
    • Date navigation pills: All Dates / Today / Tomorrow
    • Status pills: All / Live (count badge) / Upcoming / Finished
    • Search input (debounced, with Cmd+K focus shortcut)
    • Sort dropdown
  • Matches grouped by date using LeagueSection (collapsible)
    • "Today" / "Tomorrow" / weekday long-format labels
    • MatchCard grid inside each section
    • Gameweek badge
    • Expandable/collapsible with animated height
  • EmptyMatches with reset button + "Browse Teams" CTA
  • Skeleton loaders during fetch
  • URL sync: filters written to ?status=&q=
```

#### Auth Pages

- **`/login`** — Email + password form → `useAuth().login()` → role-based redirect (admin → /admin, user → /dashboard)
- **`/register`** — Name + email + password + confirm → `useAuth().register()` → redirect to /dashboard
- **`/forgot-password`** — Email form → POST `/auth/forgot-password` → confirmation message
- **`/reset-password`** — Email + token (from URL params) + new password → POST `/auth/reset-password` → redirect to /login

---

### 1.2 Authenticated User (Fan)

When a user **registers** or **logs in**, JWT token is saved in `localStorage` and the app state moves to authenticated.

```
User registers or logs in
         │
         ▼
┌─────────────────────────────────────────────┐
│ AuthContext.jsx                              │
│                                              │
│ login(email, password) →                     │
│   api.auth.login({email, password})          │
│   → response: { token, user }               │
│   → setToken(token) → localStorage          │
│   → setUser(user) → context state           │
│                                              │
│ register(name, email, password) →            │
│   Same flow → redirect to /dashboard         │
│                                              │
│ On app mount:                                │
│   Check localStorage for existing token      │
│   If found → GET /auth/me to validate        │
│   → setUser(data) or clear token on error    │
│   This allows page refresh without logout    │
└─────────────────────┬───────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────┐
│              DASHBOARD (/dashboard)          │
│  Wrapped in <ProtectedRoute>                │
│  (redirects to /login if not authenticated) │
│                                             │
│  useEffect on mount:                        │
│    Promise.all([                            │
│      api.favorites.list(),                  │
│      api.matches.list(),                    │
│    ]) → sets favorites[], matches[]         │
│                                             │
│  Derived data (useMemo):                    │
│    • favoriteTeamIds: Set of team IDs       │
│    • liveMatches: status === "live"         │
│    • favoriteTeamMatches: matches where     │
│      home or away team is in favorites      │
│    • upcomingFixtures: scheduled matches,   │
│      sorted by date, slice(0,5)            │
│    • recentResults: completed matches,      │
│      sorted by date desc, slice(0,4)       │
│    • stats: [Teams Followed, Live Now,      │
│      Upcoming, Completed]                   │
│                                             │
│  LEFT COLUMN (2/3):                         │
│  ┌─────────────────────────────────┐        │
│  │ "Your Teams" — TeamCard grid   │        │
│  │   (3-col) with unfollow button │        │
│  │   on hover, or EmptyState      │        │
│  ├─────────────────────────────────┤        │
│  │ "Upcoming Fixtures" — Fixture  │        │
│  │   cards for followed teams     │        │
│  ├─────────────────────────────────┤        │
│  │ "Recent Results" — Result      │        │
│  │   cards for followed teams     │        │
│  └─────────────────────────────────┘        │
│                                             │
│  RIGHT COLUMN (1/3):                        │
│  ┌─────────────────────────────────┐        │
│  │ "Quick Links" — to /teams,     │        │
│  │   /players, /matches           │        │
│  ├─────────────────────────────────┤        │
│  │ "Live Now" — LiveMatchCard for │        │
│  │   live matches, or empty state │        │
│  ├─────────────────────────────────┤        │
│  │ "Profile" — inline edit form   │        │
│  │   (name + email + save button) │        │
│  │   → updateProfile()            │        │
│  └─────────────────────────────────┘        │
│                                             │
│  DashboardNav at top with:                  │
│  • Logo + quick links (Teams, Players,      │
│    Matches)                                 │
│  • Notification bell (decorative)           │
│  • Profile dropdown with avatar, name,      │
│    email, Dashboard link, Admin link        │
│    (if admin), Sign Out                     │
│  • Mobile hamburger menu                    │
└─────────────────────────────────────────────┘
```

**Key behaviors unique to authenticated users on public pages:**

| Page | What changes |
|------|-------------|
| **TeamDetails** | Follow/Unfollow button appears. Click toggles favorite status optimistically |
| **All pages** | Navbar swaps "Sign In / Register" for user avatar + Dashboard link |

---

### 1.3 Admin User

An admin user has everything a regular user has, plus access to `/admin`.

```
Admin logs in → role-based redirect to /admin
         │
         ▼
┌──────────────────────────────────────────────┐
│               ADMIN PANEL (/admin)            │
│  Wrapped in <ProtectedRoute adminOnly>        │
│  (non-admin users redirected to /dashboard)   │
│                                               │
│  Layout: AdminSidebar (desktop) + Top bar     │
│  Sidebar: collapsible (expand/collapse        │
│  button), items: Overview, Teams, Players,    │
│  Matches                                      │
│                                               │
│  On mount:                                    │
│    useEffect → Promise.all([                  │
│      api.teams.list(),                        │
│      api.players.list(),                      │
│      api.matches.list(),                      │
│    ])                                         │
│                                               │
│  3 tabs (sync'd to URL via ?tab=teams):       │
│                                               │
│  ── TEAMS TAB ──                              │
│  Table: Name, City, Founded, Coach, Actions   │
│  "Add Team" button → Modal with form:         │
│    name*, city, founded_year, coach, logo_url │
│    → api.teams.create() or .update()          │
│  Delete with confirmation dialog              │
│                                               │
│  ── PLAYERS TAB ──                            │
│  Table: Name, Position, Team, Jersey#, Actions│
│  "Add Player" button → Modal:                │
│    name*, position* (dropdown), team*         │
│    (dropdown from loaded teams), jersey #,    │
│    age, nationality, photo_url, bio           │
│    + Dynamic attribute fields based on        │
│    position:                                  │
│      Outfield: pace, shooting, passing,       │
│                dribbling, defending, physical  │
│      GK: diving, handling, kicking, reflexes, │
│           speed, positioning                  │
│    → Clearing position resets attributes      │
│    → api.players.create() or .update()        │
│                                               │
│  ── MATCHES TAB ──                            │
│  Table: Home, Away, Date, Status, Score,      │
│  Actions                                      │
│  "Add Match" button → Modal:                 │
│    home_team*, away_team* (dropdown),         │
│    match_date*, venue, status, home_score,    │
│    away_score, minute                         │
│    → api.matches.create() or .update()        │
│                                               │
│  Flash messages: "Team updated" etc appear    │
│  top-right, auto-dismiss after 3s             │
└──────────────────────────────────────────────┘
```

---

## 2. Routing & Page Map

Defined in `src/App.jsx`:

| Route | Component | Auth | Description |
|-------|-----------|------|-------------|
| `/` | `Home` | No | Landing page |
| `/teams` | `Teams` | No | Browse + standings |
| `/teams/:id` | `TeamDetails` | No | Team profile |
| `/players` | `Player` | No | Browse players |
| `/players/:id` | `PlayerProfile` | No | Player profile + radar |
| `/matches` | `Matches` | No | Match centre |
| `/matches/:id` | `MatchDetails` | No | Match info |
| `/login` | `Login` | No | Sign in form |
| `/register` | `Register` | No | Registration form |
| `/forgot-password` | `ForgotPassword` | No | Request reset |
| `/reset-password` | `ResetPassword` | No | Reset with token |
| `/dashboard` | `Dashboard` | Yes | Fan dashboard |
| `/admin` | `AdminPanel` | Admin | CRUD panel |

**Auth flow in ProtectedRoute.jsx:**
```
<ProtectedRoute> → check isAuthenticated (from AuthContext)
  → if loading: show spinner
  → if not authenticated: <Navigate to="/login" state={{ from: location }}>
  → if adminOnly && !isAdmin: <Navigate to="/dashboard">
  → else: render children

After login: read location.state.from.pathname → redirect there
(fallback: admin → /admin, user → /dashboard)
```

---

## 3. Data Flow Architecture

### 3.1 How useState, useEffect, and API Communicate

This is the **core data pattern** used across almost every page in PitchTrack:

```
┌─────────────────────────────────────────────────────────────┐
│                    THE STANDARD PATTERN                      │
│                                                             │
│  1. COMPONENT MOUNTS                                        │
│     useEffect(() => { ... }, []) — runs once on mount      │
│                                                             │
│  2. SET LOADING STATE                                       │
│     setLoading(true)                                        │
│                                                             │
│  3. FETCH DATA FROM API                                     │
│     api.resource.list() or .get(id)                         │
│     This calls fetch() inside services/api.js:              │
│       const res = await fetch(`${API_BASE}/path`, {         │
│         method, headers, body                               │
│       })                                                    │
│       if (!res.ok) throw error                              │
│       return JSON data                                      │
│                                                             │
│  4. CANCELLATION GUARD                                      │
│     let cancelled = false                                   │
│     .then(data => { if (!cancelled) setData(data) })        │
│     return () => { cancelled = true }  ← cleanup           │
│     (Prevents setState on unmounted component)              │
│                                                             │
│  5. STOP LOADING                                            │
│     .finally(() => { if (!cancelled) setLoading(false) })   │
│                                                             │
│  6. DERIVE DATA (if needed)                                 │
│     const derived = useMemo(() => compute(raw), [raw])      │
│     (Standings, filtered lists, sorted matches, etc.)       │
│                                                             │
│  7. RENDER BASED ON STATE                                   │
│     if (loading) → show <Skeleton/>                         │
│     if (error) → show <ErrorState/>                         │
│     if (data.length === 0) → show <EmptyState/>             │
│     else → show data                                        │
│                                                             │
│  8. USER INTERACTION TRIGGERS RE-FETCH OR MUTATION          │
│     Click "Follow" → optimistic UI → api.favorites.follow() │
│     Click "Save" (admin) → api.teams.create() → re-fetch   │
└─────────────────────────────────────────────────────────────┘
```

**Concrete example from `Teams.jsx`:**

```
1. Component mounts
     │
2. setLoading(true)
     │
3. Promise.all([ api.teams.list(), api.matches.list() ])
     │
4. .then(([teamsData, matchesData]) => {
       if (!cancelled) {
         setTeams(teamsData)      ← triggers re-render
         setMatches(matchesData)  ← triggers re-render
       }
     })
     │
5. .finally(() => { if (!cancelled) setLoading(false) })
     │
6. const standings = useMemo(() => computeStandings(teams, matches), [teams, matches])
   const filteredTeams = useMemo(() => teams.filter(...), [teams, debouncedQuery, city])
     │
7. Render:
     loading ? <Skeleton/> :
     activeTab === "standings" ? <StandingsTable standings={standings}/> :
     filteredTeams.length === 0 ? <EmptyState/> : <TeamCard grid/>
```

### 3.2 Component Trigger Chain

This shows what **fires** each component and when:

```
PAGE RENDER TRIGGERS:
│
├── Route changes (URL) → BrowserRouter + Routes match → Page component mounts
│
├── State changes → React re-renders affected components
│   ├── setTeams(data), setMatches(data) → page re-renders
│   ├── setQuery("text") → re-renders SearchBar + filter results
│   ├── setTab("live") → re-filters matches array
│   └── setUser(user) → AuthContext re-renders → Navbar shows auth buttons
│
├── User interaction → event handler → state change → re-render
│   ├── Click "Add Team" → openCreate() → setModalOpen(true) → Modal shows
│   ├── Click "Follow" → setFollowed(!followed) → button updates → API call
│   ├── Type in search → onChange → setQuery() → debounce → filter
│   └── Click accordion → toggle() → setIsOpen(!isOpen) → collapse/expand
│
├── API response → .then() → setState → re-render
│   └── HomeSpotlight fetches matches+players → setMatches + setPlayers → cards appear
│
└── Time-based → useEffect + setTimeout/requestAnimationFrame
    ├── Debounce: query → 300ms delay → setDebouncedQuery
    ├── Animated counters: requestAnimationFrame → count up
    └── Login success → setTimeout(() => navigate(...), 1800)
```

### 3.3 Debounced Search Pattern

Used on **Teams**, **Players**, and **Matches** pages to prevent excessive filtering on every keystroke:

```
User types "riv"
         │
         ▼
setQuery("riv")  ← immediate state update (controls input value)
         │
         ▼
useEffect with setTimeout(300ms):
  if user types more within 300ms → clearTimeout → restart timer
  if user stops for 300ms → setDebouncedQuery("riv")
         │
         ▼
useMemo re-runs → filter teams by "riv"
         │
         ▼
URL sync effect fires → setSearchParams({ q: "riv" })
```

### 3.4 Optimistic UI Updates

Used for **Follow/Unfollow** on TeamDetails and Dashboard:

```
User clicks "Follow" button
         │
         ▼
const prev = followed          ← save previous state
setFollowed(!followed)         ← immediately flip UI button
         │
         ▼
try {
  await api.favorites.follow(id)  ← actual API call
} catch {
  setFollowed(prev)               ← revert on error (button flips back)
}
```

---

## 4. Component Directory

### 4.1 Landing Page Components

| Component | File | What it does | What fires it |
|-----------|------|-------------|---------------|
| **Hero** | `Hero.jsx` | Full-viewport landing hero. Renders staggered wordmark animation, floating stat cards, player image with entrance + mouse parallax. Uses `useRef` + `useEffect` for direct DOM animation. Contains `PublicNavbar` with `transparent`. | Route `/` mounts `Home.jsx` → renders `<Hero />` |
| **HomeSpotlight** | `HomeSpotlight.jsx` | Two-column section: Featured Match card + Top-Rated Player card. Fetches `api.matches.list()` and `api.players.list()` on mount. Uses `useMemo` to pick best match/player. | `Home.jsx` renders it after stats ribbon |
| **HowItWorks** | `HowItWorks.jsx` | 3-step grid (Create → Track → Follow). Static data in `STEPS` array. | `Home.jsx` renders it |
| **WhySection** | `WhySection.jsx` | 4-feature grid with icons. Static data in `FEATURES` array. | `Home.jsx` renders it |
| **CTASection** | `CTASection.jsx` | Amber gradient banner with CTA to /register. | `Home.jsx` renders it |
| **StatCard** | `StatCard.jsx` | Animated count-up stat card. Uses `IntersectionObserver` to detect when card enters viewport, then counts from 0 to target using `requestAnimationFrame` with cubic ease-out. | `LeagueStats.jsx` renders it |
| **LeagueStats** | `LeagueStats.jsx` | Grid of 4 StatCards (clubs, players, matches, fixtures). | Could be used on any stats page |

### 4.2 Data Display Components

| Component | File | What it does | What fires it |
|-----------|------|-------------|---------------|
| **TeamCard** | `TeamCard.jsx` | Circular team emblem + name + city. Links to `/teams/:id`. Hover: border turns floodlight. | Grid map in Teams.jsx / Dashboard.jsx |
| **PlayerCard** | `PlayerCard.jsx` | Player avatar/initials + name + position + jersey + team. Links to `/players/:id`. | Grid map in Player.jsx |
| **PlayerFormationCard** | `PlayerFormationCard.jsx` | Compact lineup marker: portrait circle (with gold spotlight), trapezoid nameplate (CSS clip-path), tiny team badge. Used on the pitch view. `memo`-ized. | Map inside FormationPitch in TeamDetails.jsx |
| **MatchCard** | `MatchCard.jsx` | Compact match row: home team, score/vs, away team, date/time. Used inside tables and grids. | Map in Matches.jsx, TeamDetails.jsx, Dashboard.jsx |
| **MatchStatusBadge** | `MatchStatusBadge.jsx` | Color-coded badge: LIVE (orange, pulsing dot), FT (muted), UPCOMING (cyan). `memo`-ized. | Used inside MatchCard, FeaturedMatchHero |
| **StandingsTable** | `StandingsTable.jsx` | Full league table with position, emblem, P/W/D/L/GF/GA/GD/Pts. Zone dividers (Continental/Promotion = gold, Relegation = red). Loading skeleton + error + empty states. | Teams.jsx → `activeTab === "standings"` |
| **TeamEmblem** | `TeamEmblem.jsx` | Round team crest placeholder with gradient background. Sizes: xs→lg. `memo`-ized. | Used on cards, tables, featured hero |
| **PlayerRadarChart** | `PlayerRadarChart.jsx` | Recharts RadarChart showing player attributes. Outfield (pace/shooting/passing/dribbling/defending/physical) vs GK (diving/handling/kicking/reflexes/speed/positioning). Shows overall rating badge with color tier. | PlayerProfile.jsx |
| **FormationPitch** | `FormationPitch.jsx` | SVG football pitch with turf stripes, complete pitch markings (touchline, halfway, center circle, penalty areas, corner arcs). Alternating green mow stripes. Vignette overlay. `memo`-ized. | TeamDetails.jsx wraps the lineup |
| **FeaturedMatchHero** | `FeaturedMatchHero.jsx` | Cinematic match hero: stadium background image with blur/gradient overlays, amber glow, breadcrumb, giant scoreboard, team emblems, match info, CTA buttons. `memo`-ized. | Matches.jsx → `!loading && featuredMatch` |
| **ExpandedMatchPanel** | `ExpandedMatchPanel.jsx` | Match statistics panel: possession/shots/shots on target/corners/fouls/cards with animated stat bars, momentum strip, card details. Generates synthetic stats from match ID. `memo`-ized. | LeagueSection expansion |
| **LeagueSection** | `LeagueSection.jsx` | Collapsible section for matches grouped by date. Animated height transition. Contains header with accent bar, icon, title, gameweek badge, match count, chevron toggle. `memo`-ized. | Matches.jsx groups matches by date |
| **LiveMatchCarousel** | `LiveMatchCarousel.jsx` | Rotating live match display with auto-advance (5s), pause on hover, prev/next buttons, dot indicators. Reduces motion for prefers-reduced-motion. | Could be used on homepage / dashboard sidebar |
| **DashboardStatCard** | `DashboardStatCard.jsx` | Animated count-up stat card for dashboard. Uses `requestAnimationFrame` with cubic ease-out. Respects reduced motion. Accent variant for "Live Now". | Dashboard.jsx stats grid |
| **PlayerAvatar** | `PlayerAvatar.jsx` | Player avatar circle with gradient background, optional status indicator (available/injured). Sizes: sm/md/lg. `memo`-ized. | Reusable atomic component |
| **PlayerName** | `PlayerName.jsx` | Text-only player name with display font. `memo`-ized. | Reusable atomic component |
| **PlayerMeta** | `PlayerMeta.jsx` | Text-only "position · #jersey" metadata. `memo`-ized. | Reusable atomic component |
| **MatchStatsPill** | `MatchStatsPill.jsx` | Small stat pill with icon, value, label. `memo`-ized. | Reusable atomic component |
| **Chart** | `Chart.jsx` | Ported shadcn/ui chart container. Provides `ChartContainer`, `ChartTooltip`, `ChartTooltipContent` for Recharts integration with project design tokens. | Used by PlayerRadarChart (indirectly) |

### 4.3 Form & Input Components

| Component | File | What it does | What fires it |
|-----------|------|-------------|---------------|
| **SearchBar** | `SearchBar.jsx` | Search input with magnifying glass icon. Controlled via `value`/`onChange`. | Teams, Players, Matches pages |
| **FilterDropdown** | `FilterDropdown.jsx` | Custom select dropdown with chevron icon. | Teams (city filter), Players (position filter) |
| **MatchFilters** | `MatchFilters.jsx` | Combined filter toolbar: date nav pills, status pills (with live count), search (Cmd+K shortcut), sort dropdown. Sticky. `memo`-ized. | Matches.jsx |

### 4.4 Navigation Components

| Component | File | What it does | What fires it |
|-----------|------|-------------|---------------|
| **PublicNavbar** | `PublicNavbar.jsx` | Main nav: logo, links (Matches/Teams/Players), auth buttons. Transparent variant for hero. Sticky on scroll (non-transparent). Mobile hamburger with animated open/close. Active link indicator. Desktop: shows user avatar + Dashboard link when logged in. | Used on all public pages |
| **Navbar** | `Navbar.jsx` | Legacy navbar (same pattern as PublicNavbar but simpler). | Still in codebase, less used |
| **DashboardNav** | `DashboardNav.jsx` | Dashboard header: logo, quick links (Teams/Players/Matches), notification bell (decorative), profile dropdown (avatar, name, Dashboard, Admin, Sign Out). Mobile hamburger. Closes dropdown on outside click. | Dashboard.jsx |
| **AdminSidebar** | `AdminSidebar.jsx` | Admin layout shell: collapsible sidebar (desktop) with nav items (Overview/Teams/Players/Matches), logo, user info, logout. Mobile: overlay sidebar with backdrop. Top bar with hamburger, "Admin Panel" label, notifications, profile quick menu. | AdminPanel.jsx wraps content |

### 4.5 Feedback & Skeleton Components

| Component | File | What it does | What fires it |
|-----------|------|-------------|---------------|
| **EmptyState** | `EmptyState.jsx` | Generic empty state: icon + title + message + optional action button. | Any page with no data |
| **EmptyMatches** | `EmptyMatches.jsx` | Match-specific empty state: football background image, amber glow, title, message, "Reset Filters" button, "Browse Teams" CTA. `memo`-ized. | Matches.jsx when filtered results = 0 |
| **MatchSkeleton** | `MatchSkeleton.jsx` | Loading skeleton for match cards/hero. `memo`-ized. | Matches.jsx during loading |
| **PlayerCardSkeleton** | `PlayerCardSkeleton.jsx` | Pulsing placeholder matching PlayerCard shape. | Player.jsx during loading |
| **TeamcardSkeleton** | `TeamcardSkeleton.jsx` | Pulsing placeholder matching TeamCard shape. | Teams.jsx during loading |
| **MatchCardSkeleton** | `MatchCardSkeleton.jsx` | Pulsing placeholder matching MatchCard shape. | TeamDetails.jsx |
| **Modal** | `Modal.jsx` | Dialog overlay with backdrop blur, Escape key close, close button, title. Scrollable content. | AdminPanel.jsx (create/edit forms) |

### 4.6 Auth & Layout Components

| Component | File | What it does | What fires it |
|-----------|------|-------------|---------------|
| **AuthProvider** | `AuthContext.jsx` | React Context provider. Exposes: user, loading, isAuthenticated, isAdmin, login(), register(), logout(), updateProfile(). On mount: checks localStorage for token → validates via /auth/me. | App.jsx wraps entire app |
| **useAuth** | `AuthContext.jsx` | Custom hook consuming AuthContext. Throws if used outside provider. | Any component needing auth state |
| **ProtectedRoute** | `ProtectedRoute.jsx` | Route guard. Shows loading spinner while auth loads. Redirects to /login (with return location) if unauthenticated. Redirects non-admin users to /dashboard for admin routes. | App.jsx wraps Dashboard and Admin routes |

---

## 5. Animations & Visual Effects

### 5.1 CSS Keyframe Animations

All defined in `src/index.css` (for the hero) and inline `<style>` tags in components.

| Animation | Location | What it does |
|-----------|----------|-------------|
| `wordmarkSlide` | `index.css` | "PITCH TRACK." letters slide in from left with `cubic-bezier(0.16, 1, 0.3, 1)` ease. Each `<span>` has staggered delay (0.1s, 0.2s). |
| `fadeUp` | `index.css` | Tagline + CTA buttons fade in and translate up. Delays: 0.5s, 0.65s. |
| `cardSlide` | `index.css` | Floating stat cards slide in from right with staggered delays (0.6s, 0.75s, 0.9s). |
| `ambientDrift` | `index.css` | Background gradients slowly oscillate opacity (30s cycle) for a living, breathing background. |
| `pt-walk-in` | `PlayerProfile.jsx` | Player photo/initials card walks in from left with blur → clear transition (0.85s cubic-bezier). |
| `pt-sweep` | `PlayerProfile.jsx` | Shine sweep across player card (1.05s delay, moves from left to right with skew). |
| `pt-rise-in` | `PlayerProfile.jsx` | Meta info (position, jersey, age, nationality) rises up with staggered delays (0.5s, 0.6s, 0.7s). |
| pulse | Tailwind `animate-pulse` | Live indicator dots, loading skeletons. |

### 5.2 JavaScript-Driven Animations

| Effect | Location | How it works |
|--------|----------|-------------|
| **Player entrance + parallax** | `Hero.jsx` | `useRef` + `useEffect`. On mount: set initial transform (translateY + scale), then after 50ms trigger transition to normal (entrance). On mousemove: calculate delta from mouse position relative to hero center, apply translate(x, y) directly to DOM via ref (no React re-render). Only after entrance completes (1s). Respects reduced motion. |
| **Animated stat counters** | `StatCard.jsx`, `DashboardStatCard.jsx` | `IntersectionObserver` detects when card enters viewport → `requestAnimationFrame` loop counts from 0 to target with cubic ease-out (`1 - (1-t)^3`). Dashboard version: runs on mount, respects reduced motion. |
| **Accordion height** | `LeagueSection.jsx` | Uses `useRef` + `useEffect` to measure `scrollHeight` of content, then applies `maxHeight: contentHeight` with CSS `transition: all 300ms ease-out`. Also transitions opacity and translateY. |
| **Optimistic follow toggle** | `TeamDetails.jsx`, `Dashboard.jsx` | UI updates instantly on click, API call happens in background. If API fails, UI reverts. |
| **Debounced search** | `Teams.jsx`, `Player.jsx`, `Matches.jsx` | `useEffect` with `setTimeout` (300ms). Clears and restarts on each keystroke. |
| **Dropdown outside click** | `DashboardNav.jsx`, `AdminSidebar.jsx` | `useEffect` + `mousedown` event listener on window. Checks if click target is inside dropdown ref. If not, closes dropdown. |
| **Keyboard shortcut** | `MatchFilters.jsx` | `useEffect` listens for `Cmd+K` / `Ctrl+K` → focuses search input. |
| **Auto-advance carousel** | `LiveMatchCarousel.jsx` | `setInterval` (5s) advances to next match. Pauses on hover. Skips if reduced motion. |
| **Escape to close** | `Modal.jsx` | `useEffect` listens for `Escape` key → calls `onClose()`. |

### 5.3 CSS Transitions

Widely used via Tailwind's `transition-all duration-200/300` classes:

- **Hover effects**: TeamCard/PlayerCard border color changes, translateY(-1px or -2px), shadow reveals
- **Navbar links**: underline scale animation using `::after` pseudo-element
- **Mobile menu**: `max-h-0` → `max-h-96` with opacity transition
- **Sidebar collapse**: width transition (60 → 240px)
- **Button hovers**: background color, translateY(-2px), shadow

### 5.4 Reduced Motion

Every animation respects `prefers-reduced-motion: reduce`:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.001ms !important;
    transition-duration: 0.001ms !important;
  }
}
```

---

## 6. Design System & Layout

### 6.1 Color Palette

Defined in `src/index.css` under `@theme`:

| Token | Value | Usage |
|-------|-------|-------|
| `--color-night` | `#0B1F17` | Primary background |
| `--color-black` | `#050D0A` | Hero background, darker surfaces |
| `--color-chalk` | `#F4F1E9` | Primary text, light elements |
| `--color-floodlight` | `#FFB627` | Accent (amber/gold) — CTAs, highlights, active states |
| `--color-pitch` | `#1F4D3A` | Card backgrounds, surface fills |
| `--color-pitch-light` | `#2D6B4F` | Emblem gradients, hover states |
| `--color-flare` | `#FF6B35` | Destructive actions, live indicators, errors |
| `--color-line` | `rgba(244,241,233,0.12)` | Borders, dividers |
| `--color-chalk-muted` | `rgba(244,241,233,0.55)` | Secondary text |
| `--color-glass-bg` | `rgba(11,31,23,0.72)` | Glassmorphism surfaces (dashboard cards) |
| `--color-glass-border` | `rgba(244,241,233,0.1)` | Glass borders |

### 6.2 Typography

| Font | Weight | Usage |
|------|--------|-------|
| **Oswald** (display) | 400–700 | Headings, uppercase labels, numbers |
| **Inter** (body) | 300–600 | Body text, descriptions, form inputs |

Loaded via Google Fonts CDN in `index.css`.

### 6.3 Layout System

- **Max-width**: 1440px for hero, 1280px (`max-w-7xl`) for all other pages
- **Grid**: Tailwind grid system (grid-cols-1/2/3/4) with responsive breakpoints
- **Spacing**: px-6 md:px-10 for horizontal padding on all sections
- **Sticky elements**: Navbar (`sticky top-0`), MatchFilters (`sticky top-16 md:top-20`), sidebar
- **Cards**: Rounded-lg/xl with border-line, bg-pitch/10 or bg-glass-bg
- **Container pattern**: `max-w-7xl mx-auto px-6 md:px-10` on every page

### 6.4 Responsive Breakpoints

| Breakpoint | Width | Changes |
|-----------|-------|---------|
| Default | Mobile | Single column, stacked layout, hamburger menu, smaller fonts |
| `sm` | 640px | Two columns start, horizontal filter rows |
| `md` | 768px | Full layout, tablet grid (2-col cards), sidebar visible |
| `lg` | 1024px | Three-column grids, desktop sidebar, hero 3-column layout |
| `xl` | 1280px | Max-width constraints, wider gaps |

**Hero responsiveness** (`@media (max-width: 1024px) and (max-width: 768px)`):
- Tablet: 2-column grid (typography + player), cards move to bottom row
- Mobile: Single column, smaller player image (42vh), horizontal scrollable cards, animation disabled

---

## 7. Libraries & Dependencies

| Library | Version | Purpose |
|---------|---------|---------|
| **react** | ^19.2.7 | UI framework |
| **react-dom** | ^19.2.7 | DOM rendering |
| **react-router-dom** | ^7.18.1 | Client-side routing, navigation, URL params |
| **lucide-react** | ^1.25.0 | Icon set (consistent outline style, Tree-shakeable) |
| **recharts** | ^3.10.1 | Radar chart for player attributes |
| **tailwindcss** | ^4.3.3 | Utility-first CSS framework |
| **@tailwindcss/vite** | ^4.3.3 | Tailwind Vite integration |
| **@radix-ui/react-dialog** | ^1.1.19 | Accessible modal dialog primitive |
| **@radix-ui/react-label** | ^2.1.11 | Accessible label primitive |
| **@radix-ui/react-slot** | ^1.3.0 | Slot pattern for composition |
| **clsx** | ^2.1.1 | Conditional class name construction |
| **tailwind-merge** | ^3.6.0 | Intelligent Tailwind class merging |
| **class-variance-authority** | ^0.7.1 | Component variant management |
| **vite** | ^8.1.1 | Build tool and dev server |
| **@vitejs/plugin-react** | ^6.0.3 | React Fast Refresh + JSX transform |

### Why These Libraries?

- **Lucide React** over Font Awesome: Tree-shakeable, consistent stroke-based style, lightweight
- **Recharts** over D3 directly: Declarative, React-friendly API, good radar chart support
- **Radix UI** over custom: Built-in accessibility (aria attributes, keyboard nav, focus management)
- **clsx + tailwind-merge**: Standard combo for conditional Tailwind classes without conflicts
- **CVA (class-variance-authority)**: For variant-based component styling (used for button variants, etc.)

### What's NOT Used (Intentionally)

- **No GSAP / Framer Motion**: All animations use CSS keyframes + Tailwind transitions. Simpler, smaller bundle, good enough for the effects needed.
- **No Redux / Zustand**: `useState` + `useMemo` + Context are sufficient for this app's state complexity.
- **No React Query / SWR**: Data fetching is simple enough with `useEffect` + manual state. No caching needs yet.
- **No Axios**: Native `fetch` wraps cleanly in `api.js`.
- **No shadcn/ui**: Only the Chart tooltip was ported. The rest is custom.

---

## 8. Project File Structure

```
PitchTrack/
├── index.html                   # SPA entry point
├── vite.config.js               # Vite config
├── eslint.config.js             # ESLint flat config
├── package.json                 # Dependencies & scripts
├── vercel.json                  # Vercel deployment config
├── .gitignore
├── GUIDE.md                     # ← You are here
├── README.md                    # Original README
│
├── src/
│   ├── main.jsx                 # ReactDOM.createRoot
│   ├── App.jsx                  # Router + Routes + AuthProvider
│   ├── index.css                # Tailwind theme + hero CSS + responsive
│   ├── App.css                  # Minimal legacy styles
│   │
│   ├── assets/
│   │   ├── soccer.png           # Hero player image
│   │   ├── football1.png        # FeaturedMatchHero background
│   │   └── football2.png        # LeagueSection + EmptyMatches decoration
│   │
│   ├── context/
│   │   └── AuthContext.jsx      # Auth state, login/register/logout/update
│   │
│   ├── services/
│   │   └── api.js               # HTTP client + endpoint definitions
│   │
│   ├── utils/
│   │   └── playerRating.js      # computeOverallRating(), ratingTier()
│   │
│   ├── data/
│   │   └── mockData.js          # Development mock data (8 teams, 14 matches, 18 players)
│   │
│   ├── pages/
│   │   ├── Home.jsx             # Landing page
│   │   ├── Teams.jsx            # Browse teams + standings
│   │   ├── TeamDetails.jsx      # Team profile
│   │   ├── Player.jsx           # Browse players
│   │   ├── PlayerProfile.jsx    # Player profile + radar chart
│   │   ├── Matches.jsx          # Match centre
│   │   ├── MatchDetails.jsx     # Match info
│   │   ├── Login.jsx            # Sign in
│   │   ├── Register.jsx         # Create account
│   │   ├── ForgotPassword.jsx   # Request reset
│   │   ├── ResetPassword.jsx    # Reset with token
│   │   ├── Dashboard.jsx        # Fan dashboard
│   │   └── AdminPanel.jsx       # Admin CRUD panel
│   │
│   └── components/
│       ├── Hero.jsx             # Landing hero
│       ├── HomeSpotlight.jsx    # Featured match + top player
│       ├── FeaturedMatchHero.jsx # Cinematic match hero
│       ├── HowItWorks.jsx       # 3-step process
│       ├── WhySection.jsx       # 4-feature grid
│       ├── CTASection.jsx       # Call-to-action banner
│       ├── StatCard.jsx         # Animated counter
│       ├── LeagueStats.jsx      # Stats grid
│       ├── StandingsTable.jsx   # League table
│       ├── TeamCard.jsx         # Team card
│       ├── PlayerCard.jsx       # Player card
│       ├── PlayerFormationCard.jsx # Compact lineup marker
│       ├── FormationPitch.jsx   # SVG pitch with markings
│       ├── PlayerRadarChart.jsx # Recharts radar chart
│       ├── PlayerAvatar.jsx     # Avatar atomic component
│       ├── PlayerName.jsx       # Name atomic component
│       ├── PlayerMeta.jsx       # Meta atomic component
│       ├── MatchCard.jsx        # Compact match row
│       ├── MatchStatusBadge.jsx # Status badge
│       ├── MatchStatsPill.jsx   # Stat pill
│       ├── MatchFilters.jsx     # Filter toolbar
│       ├── MatchSkeleton.jsx    # Match skeleton
│       ├── MatchCardSkeleton.jsx # MatchCard skeleton
│       ├── PlayerCardSkeleton.jsx # PlayerCard skeleton
│       ├── TeamcardSkeleton.jsx # TeamCard skeleton
│       ├── LiveMatchCarousel.jsx # Rotating live matches
│       ├── ExpandedMatchPanel.jsx # Match stats panel
│       ├── LeagueSection.jsx    # Collapsible section
│       ├── TeamEmblem.jsx       # Team crest placeholder
│       ├── SearchBar.jsx        # Search input
│       ├── FilterDropdown.jsx   # Select dropdown
│       ├── Modal.jsx            # Dialog overlay
│       ├── EmptyState.jsx       # Empty state
│       ├── EmptyMatches.jsx     # Match empty state
│       ├── DashboardStatCard.jsx # Dashboard animated counter
│       ├── Chart.jsx            # shadcn/ui chart container port
│       ├── Navbar.jsx           # Legacy navbar
│       ├── PublicNavbar.jsx     # Main navigation
│       ├── DashboardNav.jsx     # Dashboard navigation
│       ├── AdminSidebar.jsx     # Admin layout shell
│       └── ProtectedRoute.jsx   # Auth route guard
│
└── dist/                        # Production build (gitignored)
```
