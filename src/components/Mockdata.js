// TEMPORARY — remove once GET /api/teams and GET /api/matches exist.
// Shapes here mirror what the Flask serializers should return, so swapping
// mocks for real fetches later is a drop-in, not a rewrite.

export const MOCK_TEAMS = [
    {
        id: 1,
        name: "Riverside FC",
        city: "Millbrook",
        founded_year: 1998,
        coach: "Daniel Otieno",
        logo_url: null,
        roster: [
            { id: 101, name: "James Mwangi", position: "Forward", jersey_number: 9, nationality: "Kenya" },
            { id: 102, name: "Brian Kiptoo", position: "Midfielder", jersey_number: 8, nationality: "Kenya" },
            { id: 103, name: "Felix Otieno", position: "Defender", jersey_number: 4, nationality: "Kenya" },
            { id: 104, name: "Samuel Njoroge", position: "Goalkeeper", jersey_number: 1, nationality: "Kenya" },
        ],
    },
    {
        id: 2,
        name: "Kestrel City",
        city: "Dunmore",
        founded_year: 2004,
        coach: "Grace Wanjiru",
        logo_url: null,
        roster: [
            { id: 201, name: "Collins Wafula", position: "Forward", jersey_number: 11, nationality: "Kenya" },
            { id: 202, name: "Eric Mutiso", position: "Midfielder", jersey_number: 6, nationality: "Kenya" },
            { id: 203, name: "Tony Achieng", position: "Defender", jersey_number: 3, nationality: "Kenya" },
        ],
    },
    {
        id: 3,
        name: "Iron Bridge SC",
        city: "Halden",
        founded_year: 1987,
        coach: "Peter Kamau",
        logo_url: null,
        roster: [
            { id: 301, name: "Vincent Odhiambo", position: "Forward", jersey_number: 7, nationality: "Kenya" },
            { id: 302, name: "Dennis Barasa", position: "Defender", jersey_number: 5, nationality: "Uganda" },
        ],
    },
    {
        id: 4,
        name: "Vale United",
        city: "Ashcombe",
        founded_year: 2011,
        coach: null,
        logo_url: null,
        roster: [
            { id: 401, name: "Kevin Omondi", position: "Midfielder", jersey_number: 10, nationality: "Kenya" },
            { id: 402, name: "Allan Kiprop", position: "Goalkeeper", jersey_number: 1, nationality: "Kenya" },
        ],
    },
    {
        id: 5,
        name: "Coastal Rovers",
        city: "Seaford",
        founded_year: 2000,
        coach: "Susan Achieng",
        logo_url: null,
        roster: [
            { id: 501, name: "Hassan Juma", position: "Forward", jersey_number: 9, nationality: "Tanzania" },
            { id: 502, name: "Moses Kiplagat", position: "Defender", jersey_number: 2, nationality: "Kenya" },
        ],
    },
    {
        id: 6,
        name: "Ashfield Town",
        city: "Ashfield",
        founded_year: 1993,
        coach: null,
        logo_url: null,
        roster: [
            { id: 601, name: "George Mbugua", position: "Midfielder", jersey_number: 8, nationality: "Kenya" },
        ],
    },
    {
        id: 7,
        name: "Oakfield",
        city: "Oak Valley",
        founded_year: 2015,
        coach: "Michael Ouma",
        logo_url: null,
        roster: [
            { id: 701, name: "Patrick Simiyu", position: "Forward", jersey_number: 14, nationality: "Kenya" },
        ],
    },
    {
        id: 8,
        name: "Priory Rangers",
        city: "Priory",
        founded_year: 1990,
        coach: null,
        logo_url: null,
        roster: [
            { id: 801, name: "Elias Karanja", position: "Defender", jersey_number: 6, nationality: "Kenya" },
        ],
    },
];

const team = (id) => {
    const t = MOCK_TEAMS.find((t) => t.id === id);
    return { id: t.id, name: t.name };
};

export const MOCK_MATCHES = [
    { id: 1, home_team: team(1), away_team: team(5), match_date: "2026-07-25T15:00:00", status: "scheduled", home_score: null, away_score: null, venue: "Millbrook Community Ground" },
    { id: 2, home_team: team(2), away_team: team(4), match_date: "2026-07-25T17:30:00", status: "scheduled", home_score: null, away_score: null, venue: "Dunmore Athletic Park" },
    { id: 3, home_team: team(3), away_team: team(7), match_date: "2026-07-26T14:00:00", status: "scheduled", home_score: null, away_score: null, venue: "Halden Recreation Field" },
    { id: 4, home_team: team(6), away_team: team(8), match_date: "2026-07-26T16:00:00", status: "scheduled", home_score: null, away_score: null, venue: "Ashfield Community Pitch" },
    { id: 5, home_team: team(1), away_team: team(2), match_date: "2026-07-18T15:00:00", status: "completed", home_score: 2, away_score: 1, venue: "Millbrook Community Ground" },
    { id: 6, home_team: team(4), away_team: team(3), match_date: "2026-07-18T17:00:00", status: "completed", home_score: 0, away_score: 0, venue: "Ashcombe Fields" },
    { id: 7, home_team: team(5), away_team: team(6), match_date: "2026-07-11T15:00:00", status: "completed", home_score: 3, away_score: 2, venue: "Seaford Pitch" },
    { id: 8, home_team: team(8), away_team: team(1), match_date: "2026-07-11T14:00:00", status: "completed", home_score: 1, away_score: 3, venue: "Priory Ground" },
    { id: 9, home_team: team(7), away_team: team(5), match_date: "2026-08-01T15:00:00", status: "scheduled", home_score: null, away_score: null, venue: "Oak Valley Ground" },
    { id: 10, home_team: team(2), away_team: team(6), match_date: "2026-08-01T17:00:00", status: "scheduled", home_score: null, away_score: null, venue: "Dunmore Athletic Park" },
];

