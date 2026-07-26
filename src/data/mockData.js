// TEMPORARY — remove once GET /api/teams, /api/players, /api/matches exist.
// Shapes here mirror what the Flask serializers should return, so swapping
// mocks for real fetches later is a drop-in, not a rewrite.

export const MOCK_TEAMS = [
    { id: 1, name: "Riverside FC", city: "Millbrook", founded_year: 1998, coach: "Daniel Otieno", logo_url: null },
    { id: 2, name: "Kestrel City", city: "Dunmore", founded_year: 2004, coach: "Grace Wanjiru", logo_url: null },
    { id: 3, name: "Iron Bridge SC", city: "Halden", founded_year: 1987, coach: "Peter Kamau", logo_url: null },
    { id: 4, name: "Vale United", city: "Ashcombe", founded_year: 2011, coach: null, logo_url: null },
    { id: 5, name: "Coastal Rovers", city: "Seaford", founded_year: 2000, coach: "Susan Achieng", logo_url: null },
    { id: 6, name: "Ashfield Town", city: "Ashfield", founded_year: 1993, coach: null, logo_url: null },
    { id: 7, name: "Oakfield", city: "Oak Valley", founded_year: 2015, coach: "Michael Ouma", logo_url: null },
    { id: 8, name: "Priory Rangers", city: "Priory", founded_year: 1990, coach: null, logo_url: null },
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

// Attribute scale is 0-100. Goalkeepers get a distinct attribute set
// (diving/handling/kicking/reflexes/speed/positioning) instead of the
// outfield set (pace/shooting/passing/dribbling/defending/physical) —
// PlayerRadarChart reads whatever keys are present, so this isn't hardcoded
// anywhere else.
export const MOCK_PLAYERS = [
    { id: 101, name: "James Mwangi", position: "Forward", jersey_number: 9, nationality: "Kenya", age: 24, team: team(1), photo_url: null,
        bio: "A product of the Millbrook youth academy, James leads the line with pace and a clinical first touch inside the box.",
        attributes: { pace: 86, shooting: 84, passing: 63, dribbling: 80, defending: 32, physical: 71 } },
    { id: 102, name: "Brian Kiptoo", position: "Midfielder", jersey_number: 8, nationality: "Kenya", age: 27, team: team(1), photo_url: null,
        bio: "Riverside's engine room, Brian dictates tempo from a deep-lying playmaker role.",
        attributes: { pace: 70, shooting: 62, passing: 85, dribbling: 78, defending: 60, physical: 68 } },
    { id: 103, name: "Felix Otieno", position: "Defender", jersey_number: 4, nationality: "Kenya", age: 29, team: team(1), photo_url: null,
        bio: "A commanding centre-back and the club's longest-serving player, now into his sixth season.",
        attributes: { pace: 66, shooting: 35, passing: 68, dribbling: 55, defending: 87, physical: 82 } },
    { id: 104, name: "Samuel Njoroge", position: "Goalkeeper", jersey_number: 1, nationality: "Kenya", age: 25, team: team(1), photo_url: null,
        bio: "Samuel's shot-stopping kept Riverside in three matches they had no business winning last season.",
        attributes: { diving: 82, handling: 79, kicking: 68, reflexes: 85, speed: 55, positioning: 80 } },

    { id: 201, name: "Collins Wafula", position: "Forward", jersey_number: 11, nationality: "Kenya", age: 22, team: team(2), photo_url: null,
        bio: "The league's fastest outlet ball, Collins thrives running in behind static back lines.",
        attributes: { pace: 88, shooting: 80, passing: 58, dribbling: 84, defending: 28, physical: 65 } },
    { id: 202, name: "Eric Mutiso", position: "Midfielder", jersey_number: 6, nationality: "Kenya", age: 26, team: team(2), photo_url: null,
        bio: "A tireless box-to-box presence who covers every blade of grass at Dunmore.",
        attributes: { pace: 68, shooting: 55, passing: 82, dribbling: 72, defending: 66, physical: 72 } },
    { id: 203, name: "Tony Achieng", position: "Defender", jersey_number: 3, nationality: "Kenya", age: 23, team: team(2), photo_url: null,
        bio: "An overlapping full-back whose crossing has produced six assists this season.",
        attributes: { pace: 75, shooting: 32, passing: 64, dribbling: 58, defending: 79, physical: 74 } },

    { id: 301, name: "Vincent Odhiambo", position: "Forward", jersey_number: 7, nationality: "Kenya", age: 30, team: team(3), photo_url: null,
        bio: "Iron Bridge's all-time top scorer, still finding the net well into his thirties.",
        attributes: { pace: 78, shooting: 88, passing: 65, dribbling: 76, defending: 30, physical: 75 } },
    { id: 302, name: "Dennis Barasa", position: "Defender", jersey_number: 5, nationality: "Uganda", age: 28, team: team(3), photo_url: null,
        bio: "A no-nonsense stopper signed from across the border two seasons ago.",
        attributes: { pace: 62, shooting: 30, passing: 60, dribbling: 48, defending: 84, physical: 86 } },

    { id: 401, name: "Kevin Omondi", position: "Midfielder", jersey_number: 10, nationality: "Kenya", age: 25, team: team(4), photo_url: null,
        bio: "Vale's creative spark, equally comfortable threading a pass or beating a man.",
        attributes: { pace: 74, shooting: 70, passing: 88, dribbling: 85, defending: 50, physical: 62 } },
    { id: 402, name: "Allan Kiprop", position: "Goalkeeper", jersey_number: 1, nationality: "Kenya", age: 31, team: team(4), photo_url: null,
        bio: "A veteran shot-stopper marshalling one of the league's youngest back lines.",
        attributes: { diving: 80, handling: 83, kicking: 74, reflexes: 81, speed: 48, positioning: 85 } },

    { id: 501, name: "Hassan Juma", position: "Forward", jersey_number: 9, nationality: "Tanzania", age: 24, team: team(5), photo_url: null,
        bio: "Hassan's movement in the box has made him a nightmare for static defences.",
        attributes: { pace: 84, shooting: 82, passing: 60, dribbling: 79, defending: 26, physical: 70 } },
    { id: 502, name: "Moses Kiplagat", position: "Defender", jersey_number: 2, nationality: "Kenya", age: 27, team: team(5), photo_url: null,
        bio: "A reliable right-back who rarely misses a fixture.",
        attributes: { pace: 71, shooting: 34, passing: 62, dribbling: 52, defending: 81, physical: 78 } },

    { id: 601, name: "George Mbugua", position: "Midfielder", jersey_number: 8, nationality: "Kenya", age: 26, team: team(6), photo_url: null,
        bio: "The heartbeat of Ashfield's midfield since their 2023 promotion push.",
        attributes: { pace: 66, shooting: 58, passing: 76, dribbling: 70, defending: 63, physical: 69 } },

    { id: 701, name: "Patrick Simiyu", position: "Forward", jersey_number: 14, nationality: "Kenya", age: 21, team: team(7), photo_url: null,
        bio: "The league's breakout talent this season, still just 21 and already drawing scouts.",
        attributes: { pace: 89, shooting: 75, passing: 55, dribbling: 81, defending: 24, physical: 60 } },

    { id: 801, name: "Elias Karanja", position: "Defender", jersey_number: 6, nationality: "Kenya", age: 29, team: team(8), photo_url: null,
        bio: "Elias marshals a young Priory back line with quiet authority.",
        attributes: { pace: 64, shooting: 30, passing: 58, dribbling: 46, defending: 83, physical: 80 } },
];