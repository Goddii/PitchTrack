# PitchTrack ⚽

A full-stack football league management system that lets administrators create teams, manage players, schedule matches, and track standings — while giving fans a dashboard to follow their favorite clubs in real time.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Frontend](#frontend)
  - [Pages & Routing](#pages--routing)
  - [Component Library](#component-library)
  - [Design System](#design-system)
  - [State Management](#state-management)
- [Backend API](#backend-api)
  - [Authentication](#authentication)
  - [Teams](#teams)
  - [Players](#players)
  - [Matches](#matches)
  - [Favorites](#favorites)
- [Authentication & Authorization](#authentication--authorization)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)

---

## Overview

PitchTrack solves a real problem: grassroots football leagues run on spreadsheets that don't scale past one season. Rosters change, fixtures move, and scores need to be accurate the moment the final whistle blows.

The system provides:

- **Public landing page** with hero, live match spotlight, top-rated player card, stats ribbon, and feature explanations
- **Club directory** with per-team pages showing squad, standings, and fixture lists
- **Player profiles** with radar-chart attribute visualisation and biographical info
- **Match centre** with live/upcoming/completed filters, expanded match stats, and detailed match view
- **Fan dashboard** where authenticated users can follow clubs, see upcoming fixtures and recent results for their teams, and manage their profile
- **Admin panel** with full CRUD for teams, players (including position-specific attribute assignment), and matches

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend framework** | React 19 with JSX |
| **Bundler** | Vite 8 |
| **Styling** | Tailwind CSS v4 (via `@tailwindcss/vite`) |
| **Routing** | React Router v7 |
| **Charts** | Recharts (radar charts for player attributes) |
| **Icons** | Lucide React |
| **Auth** | JWT tokens stored in localStorage |
| **Fonts** | Oswald (display) + Inter (body) via Google Fonts |
| **Backend** | Flask (Python) — REST API at `localhost:5000` |
| **Animations** | CSS keyframes + Tailwind transitions (no GSAP/Framer) |

---

## Architecture

The application follows a **traditional SPA + REST API** architecture:

```
┌──────────────────────┐       ┌──────────────────────┐
│   React SPA (Vite)   │ HTTP  │   Flask API Server    │
│   localhost:5173     │◄─────►│   localhost:5000      │
│                      │ JWT   │                      │
│  ┌────────────────┐  │       │  ┌────────────────┐  │
│  │  Public Routes  │  │       │  │  /auth/*        │  │
│  │  /              │  │       │  │  /teams/*       │  │
│  │  /teams         │  │       │  │  /players/*     │  │
│  │  /players       │  │       │  │  /matches/*     │  │
│  │  /matches       │  │       │  │  /favorites/*   │  │
│  ├────────────────┤  │       │  └────────────────┘  │
│  │  Protected      │  │       └──────────────────────┘
│  │  /dashboard     │  │
│  │  /admin         │  │
│  └────────────────┘  │
└──────────────────────┘
```

The frontend is a single-page application with client-side routing. Public-facing pages (home, teams, players, matches) require no authentication. The dashboard and admin panel are protected behind JWT-based authentication. The `api.js` service layer wraps `fetch()` and automatically attaches the JWT Bearer token to authenticated requests.

The backend URL is configured via the `VITE_API_URL` environment variable (defaults to `http://localhost:5000/api`).

---

## Frontend

### Pages & Routing

All routes are defined in `src/App.jsx`:

| Route | Page Component | Auth Required | Description |
|---|---|---|---|
| `/` | `Home` | No | Landing page with hero, spotlight, stats ribbon, how-it-works, why-section, CTA |
| `/teams` | `Teams` | No | Browse all clubs |
| `/teams/:id` | `TeamDetails` | No | Single-team page with squad, standings, fixtures |
| `/players` | `Player` | No | Browse all players |
| `/players/:id` | `PlayerProfile` | No | Player detail with radar chart, bio, stats |
| `/matches` | `Matches` | No | Match centre with filters (live/upcoming/completed) |
| `/matches/:id` | `MatchDetails` | No | Full match view with stats and timeline |
| `/login` | `Login` | No | Sign-in form |
| `/register` | `Register` | No | Registration form |
| `/forgot-password` | `ForgotPassword` | No | Password reset request |
| `/reset-password` | `ResetPassword` | No | Password reset with token |
| `/dashboard` | `Dashboard` | Yes | User dashboard — followed teams, fixtures, results |
| `/admin` | `AdminPanel` | Yes (admin) | CRUD for teams, players, matches |

### Component Library

Key reusable components in `src/components/`:

| Component | Purpose |
|---|---|
| `Hero.jsx` | Full-viewport landing hero with animated wordmark, player image, floating stat cards |
| `FeaturedMatchHero.jsx` | Cinematic match hero used on the Matches page (stadium image, large scoreboard) |
| `HomeSpotlight.jsx` | Two-column homepage section — featured match card + top-rated player card |
| `MatchCard.jsx` | Compact match row (teams, score, date) |
| `MatchStatusBadge.jsx` | Colour-coded badge: LIVE (orange pulse), FT (muted), UPCOMING (cyan) |
| `TeamEmblem.jsx` | Circular team crest placeholder with size variants (xs → lg) |
| `PlayerCard.jsx` | Player card with photo/initials, position, jersey, team link |
| `PlayerRadarChart.jsx` | Recharts radar chart for attribute visualisation with rating badge |
| `StandingsTable.jsx` | League standings with zone dividers (Continental/Promotion, Relegation) |
| `StatCard.jsx` | Animated count-up stat card with intersection observer |
| `HowItWorks.jsx` | 3-step numbered process (Create → Track → Follow) |
| `WhySection.jsx` | 4-feature grid (Built for admins, Always current, Fan accounts, Season history) |
| `CTASection.jsx` | Call-to-action banner with registration link |
| `PublicNavbar.jsx` | Navigation bar for public pages |
| `DashboardNav.jsx` | Navigation bar for authenticated dashboard |
| `AdminSidebar.jsx` | Sidebar layout wrapper for admin panel |
| `Modal.jsx` | Reusable modal dialog (Radix-based) |
| `ProtectedRoute.jsx` | Route guard — redirects unauthenticated users to `/login` |
| `EmptyState.jsx` | Empty state placeholder with icon, message, optional action |
| `TeamCard.jsx` | Team card with follow support |
| `LeagueSection.jsx` | Collapsible match section with decorative background |
| `ExpandedMatchPanel.jsx` | Match statistics panel (possession, shots, cards, momentum) |
| `SearchBar.jsx`, `FilterDropdown.jsx`, `MatchFilters.jsx` | Search and filter controls |
| `MatchCardSkeleton.jsx`, `PlayerCardSkeleton.jsx`, `MatchSkeleton.jsx`, `TeamcardSkeleton.jsx` | Loading skeletons |

### Design System

Design tokens are defined in `src/index.css` under `@theme` and map directly to Tailwind utility classes:

| Token | Value | Usage |
|---|---|---|
| `--color-night` | `#0B1F17` | Primary background (`bg-night`) |
| `--color-chalk` | `#F4F1E9` | Primary text (`text-chalk`) |
| `--color-floodlight` | `#FFB627` | Accent / highlights (`text-floodlight`, `bg-floodlight`) |
| `--color-pitch` | `#1F4D3A` | Surface / card backgrounds (`bg-pitch/10`) |
| `--color-line` | `rgba(244,241,233,0.12)` | Borders and dividers (`border-line`) |
| `--color-pitch-light` | `#2D6B4F` | Emblem gradient accent |
| `--color-flare` | `#FF6B35` | Destructive actions / live indicators |
| `--color-chalk-muted` | `rgba(244,241,233,0.55)` | Secondary text |
| `--color-glass-bg` | `rgba(11,31,23,0.72)` | Glassmorphism surfaces |
| `--font-display` | `"Oswald", sans-serif` | Headings, uppercase labels |
| `--font-body` | `"Inter", sans-serif` | Body text, descriptions |

The homepage layout uses CSS class-based styling (`hero-*`, `stats-ribbon-*`, `section-padded`, `how-it-works-*`, `feature-pills`, `cta-section-*`, `site-footer`) defined in `index.css`, while detail pages use Tailwind utility classes directly.

### State Management

No external state library — the app uses React's built-in tools:

- **`useState` / `useEffect`** for local page state (data fetching, form state, UI toggles)
- **`useMemo`** for derived data (filtered/sorted lists, computed stats)
- **`useCallback`** for memoised event handlers
- **`AuthContext`** for global authentication state (user object, login, logout, profile update)

---

## Backend API

The backend is a Flask REST API expected at `http://localhost:5000/api`. The frontend communicates with it through `src/services/api.js`, which provides namespaced methods for each resource.

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Create account (name, email, password) → returns JWT + user |
| POST | `/auth/login` | No | Sign in (email, password) → returns JWT + user |
| POST | `/auth/logout` | Yes | Invalidate session |
| GET | `/auth/me` | Yes | Get current user profile |
| PUT | `/auth/me` | Yes | Update profile (name, email) |
| POST | `/auth/forgot-password` | No | Request password reset email |
| POST | `/auth/reset-password` | No | Reset password with token |

### Teams

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/teams` | No | List all teams |
| GET | `/teams/:id` | No | Get team details |
| POST | `/teams` | Yes | Create team |
| PUT | `/teams/:id` | Yes | Update team |
| DELETE | `/teams/:id` | Yes | Delete team |

Team fields: `name`, `city`, `founded_year`, `coach`, `logo_url`

### Players

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/players` | No | List all players (supports query params like `?team_id=1`) |
| GET | `/players/:id` | No | Get player details |
| POST | `/players` | Yes | Create player |
| PUT | `/players/:id` | Yes | Update player |
| DELETE | `/players/:id` | Yes | Delete player |

Player fields: `name`, `position`, `team_id`, `jersey_number`, `nationality`, `age`, `photo_url`, `bio`, `attributes`

**Attributes** are a JSON object within the player model. Outfield players have `{pace, shooting, passing, dribbling, defending, physical}` (0–100 scale). Goalkeepers have `{diving, handling, kicking, reflexes, speed, positioning}`. The `PlayerRadarChart.jsx` component reads whichever keys are present.

### Matches

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/matches` | No | List all matches (supports query params) |
| GET | `/matches/:id` | No | Get match details |
| POST | `/matches` | Yes | Create match |
| PUT | `/matches/:id` | Yes | Update match |
| DELETE | `/matches/:id` | Yes | Delete match |

Match fields: `home_team_id`, `away_team_id`, `match_date` (ISO datetime), `venue`, `status` (scheduled/live/completed), `home_score`, `away_score`, `minute` (elapsed minutes for live matches)

### Favorites

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/favorites` | Yes | List user's followed teams |
| POST | `/favorites/:team_id` | Yes | Follow a team |
| DELETE | `/favorites/:team_id` | Yes | Unfollow a team |

Favorites power the user dashboard: followed teams drive the "Upcoming Fixtures", "Recent Results", and "Your Teams" sections.

---

## Authentication & Authorization

The app uses a **JWT token** flow:

1. **Register or login** — credentials sent to `/auth/register` or `/auth/login`. The server returns a JWT token and user object.
2. **Token storage** — the token is persisted in `localStorage` under the key `pitchtrack_token`.
3. **Session restore** — on app mount, the `AuthContext` checks for an existing token and validates it against `GET /auth/me`. If valid, the user session is restored; if invalid, the token is cleared.
4. **Authenticated requests** — `src/services/api.js` automatically reads the token and attaches it as `Authorization: Bearer <token>` when `auth: true` (the default).
5. **Route protection** — `ProtectedRoute.jsx` wraps dashboard and admin routes. It checks `isAuthenticated` and optionally `isAdmin` from `AuthContext`. Unauthenticated users are redirected to `/login` with a `state.from` location for post-login redirect. Non-admin users accessing `/admin` are redirected to `/dashboard`.

The user model includes a `role` field — admin routes check `user.role === "admin"`.

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.10+ (for the Flask backend)
- A running Flask API server (see backend setup)

### Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd PitchTrack

# 2. Install frontend dependencies
npm install

# 3. Configure the API URL (optional — defaults to localhost:5000)
echo "VITE_API_URL=http://localhost:5000/api" > .env

# 4. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Backend Setup

The frontend expects a Flask API at `http://localhost:5000`. The backend project is not included in this repository — you'll need to set it up separately with the following minimum endpoints:

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET/POST /api/teams`, `GET/PUT/DELETE /api/teams/:id`
- `GET/POST /api/players`, `GET/PUT/DELETE /api/players/:id`
- `GET/POST /api/matches`, `GET/PUT/DELETE /api/matches/:id`
- `GET /api/favorites`, `POST/DELETE /api/favorites/:team_id`

The API should return JSON. Authentication endpoints should return `{ token, user }` on success. Protected endpoints should return 401 for invalid/missing tokens.

### Mock Data

The file `src/data/mockData.js` contains sample teams (8 clubs), players (18 players with outfield and goalkeeper attribute sets), and matches (14 matches with scheduled, completed, and live statuses). This file was used during development before the API was available and mirrors the expected API response shapes.

---

## Available Scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `npm run dev` | Start Vite dev server with HMR |
| `build` | `npm run build` | Production build to `dist/` |
| `preview` | `npm run preview` | Preview production build locally |
| `lint` | `npm run lint` | Run ESLint on all source files |

---

## Project Structure

```
PitchTrack/
├── index.html               # SPA entry point
├── vite.config.js           # Vite config (React + Tailwind plugins)
├── eslint.config.js         # ESLint flat config
├── package.json             # Dependencies and scripts
├── .env                     # Environment variables (VITE_API_URL)
├── src/
│   ├── main.jsx             # React DOM root
│   ├── App.jsx              # Router + route definitions
│   ├── App.css              # Legacy styles (minimal)
│   ├── index.css            # Tailwind theme + all app CSS
│   ├── assets/              # Static images (soccer.png, football1.png, football2.png)
│   ├── context/
│   │   └── AuthContext.jsx  # Authentication provider + hook
│   ├── services/
│   │   └── api.js           # HTTP client + API endpoint definitions
│   ├── utils/
│   │   └── playerRating.js  # Shared player rating computation
│   ├── data/
│   │   └── mockData.js      # Development mock data (teams, players, matches)
│   ├── pages/               # Route-level page components
│   │   ├── Home.jsx
│   │   ├── Teams.jsx
│   │   ├── TeamDetails.jsx
│   │   ├── Player.jsx
│   │   ├── PlayerProfile.jsx
│   │   ├── Matches.jsx
│   │   ├── MatchDetails.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── ResetPassword.jsx
│   │   ├── Dashboard.jsx
│   │   └── AdminPanel.jsx
│   └── components/          # Reusable UI components
│       ├── Hero.jsx
│       ├── HomeSpotlight.jsx
│       ├── FeaturedMatchHero.jsx
│       ├── HowItWorks.jsx
│       ├── WhySection.jsx
│       ├── CTASection.jsx
│       ├── MatchCard.jsx
│       ├── MatchStatusBadge.jsx
│       ├── TeamEmblem.jsx
│       ├── PlayerCard.jsx
│       ├── PlayerRadarChart.jsx
│       ├── StandingsTable.jsx
│       ├── StatCard.jsx
│       ├── Navbar.jsx
│       ├── PublicNavbar.jsx
│       ├── DashboardNav.jsx
│       ├── AdminSidebar.jsx
│       ├── ProtectedRoute.jsx
│       ├── Modal.jsx
│       ├── EmptyState.jsx
│       ├── TeamCard.jsx
│       ├── LeagueSection.jsx
│       ├── ExpandedMatchPanel.jsx
│       ├── LeagueStats.jsx
│       ├── Chart.jsx
│       ├── DashboardStatCard.jsx
│       ├── MatchFilters.jsx
│       ├── SearchBar.jsx
│       ├── FilterDropdown.jsx
│       ├── LiveMatchCarousel.jsx
│       ├── MatchSkeleton.jsx
│       ├── MatchCardSkeleton.jsx
│       ├── PlayerCardSkeleton.jsx
│       ├── TeamcardSkeleton.jsx
│       └── MatchStatsPill.jsx
└── dist/                    # Production build output (gitignored)
```
