require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Dummy data for 5 matches (10 teams total)
const dummyMatches = [
  {
    team_name: 'India vs Australia',
    match_venue: 'Wankhede Stadium, Mumbai',
    match_date: '2025-07-15',
    match_format: 'T20',
    is_active: true,
    start_time: '19:30',
    end_time: '23:00',
    is_upcoming: true,
    status: 'Scheduled',
    venue_condition: 'Dry',
    pitch_condition: 'Flat',
    weather_condition: 'Clear'
  },
  {
    team_name: 'England vs Pakistan',
    match_venue: 'Lord\'s Cricket Ground, London',
    match_date: '2025-07-16',
    match_format: 'ODI',
    is_active: true,
    start_time: '14:30',
    end_time: '22:30',
    is_upcoming: true,
    status: 'Scheduled',
    venue_condition: 'Neutral',
    pitch_condition: 'Seam-friendly',
    weather_condition: 'Overcast'
  },
  {
    team_name: 'South Africa vs New Zealand',
    match_venue: 'Newlands, Cape Town',
    match_date: '2025-07-17',
    match_format: 'Test',
    is_active: true,
    start_time: '10:00',
    end_time: '17:00',
    is_upcoming: true,
    status: 'Scheduled',
    venue_condition: 'Dry',
    pitch_condition: 'Bouncy',
    weather_condition: 'Clear'
  },
  {
    team_name: 'West Indies vs Sri Lanka',
    match_venue: 'Kensington Oval, Barbados',
    match_date: '2025-07-18',
    match_format: 'T20',
    is_active: true,
    start_time: '20:00',
    end_time: '00:00',
    is_upcoming: true,
    status: 'Scheduled',
    venue_condition: 'Humid',
    pitch_condition: 'Spin-friendly',
    weather_condition: 'Humid'
  },
  {
    team_name: 'Bangladesh vs Afghanistan',
    match_venue: 'Sher-e-Bangla Stadium, Dhaka',
    match_date: '2025-07-19',
    match_format: 'ODI',
    is_active: true,
    start_time: '09:30',
    end_time: '17:30',
    is_upcoming: true,
    status: 'Scheduled',
    venue_condition: 'Wet',
    pitch_condition: 'Slow',
    weather_condition: 'Rainy'
  }
];

// Sample players for each team (15 players per team, 11 active + 4 inactive)
const dummyPlayers = [];

// Helper function to create players
function createPlayers(teamName, playerData) {
  return playerData.map((player, index) => ({
    name: player.name,
    full_name: player.full_name || player.name,
    team_name: teamName,
    player_role: player.role,
    credits: player.credits,
    selection_percentage: player.selection_percentage,
    points: player.points,
    is_playing_today: index < 11, // First 11 are playing
    country: teamName,
    batting_style: player.batting_style || 'RH',
    bowling_style: player.bowling_style || 'Pace'
  }));
}

// India players
const indiaPlayers = [
  { name: 'Virat Kohli', role: 'BAT', credits: 10.5, selection_percentage: 85.2, points: 125, batting_style: 'RH' },
  { name: 'Rohit Sharma', role: 'BAT', credits: 10.0, selection_percentage: 78.4, points: 118, batting_style: 'RH' },
  { name: 'KL Rahul', role: 'WK', credits: 9.5, selection_percentage: 65.3, points: 98, batting_style: 'RH' },
  { name: 'Hardik Pandya', role: 'AR', credits: 9.5, selection_percentage: 72.1, points: 145, batting_style: 'RH', bowling_style: 'Pace' },
  { name: 'Ravindra Jadeja', role: 'AR', credits: 9.0, selection_percentage: 58.7, points: 132, batting_style: 'LH', bowling_style: 'Spin' },
  { name: 'Jasprit Bumrah', role: 'BWL', credits: 9.5, selection_percentage: 82.9, points: 156, bowling_style: 'Pace' },
  { name: 'Mohammed Shami', role: 'BWL', credits: 8.5, selection_percentage: 45.2, points: 89, bowling_style: 'Pace' },
  { name: 'Ravichandran Ashwin', role: 'BWL', credits: 8.5, selection_percentage: 38.6, points: 76, bowling_style: 'Spin' },
  { name: 'Shubman Gill', role: 'BAT', credits: 8.0, selection_percentage: 42.3, points: 87, batting_style: 'RH' },
  { name: 'Rishabh Pant', role: 'WK', credits: 9.0, selection_percentage: 67.8, points: 142, batting_style: 'LH' },
  { name: 'Ishan Kishan', role: 'WK', credits: 8.0, selection_percentage: 28.4, points: 64, batting_style: 'LH' },
  { name: 'Suryakumar Yadav', role: 'BAT', credits: 8.5, selection_percentage: 52.1, points: 95, batting_style: 'RH' },
  { name: 'Yuzvendra Chahal', role: 'BWL', credits: 7.5, selection_percentage: 23.7, points: 58, bowling_style: 'Spin' },
  { name: 'Shardul Thakur', role: 'AR', credits: 7.0, selection_percentage: 18.9, points: 45, batting_style: 'RH', bowling_style: 'Pace' },
  { name: 'Axar Patel', role: 'AR', credits: 7.5, selection_percentage: 25.6, points: 52, batting_style: 'LH', bowling_style: 'Spin' }
];

// Australia players
const australiaPlayers = [
  { name: 'Steve Smith', role: 'BAT', credits: 10.0, selection_percentage: 76.8, points: 134, batting_style: 'RH' },
  { name: 'David Warner', role: 'BAT', credits: 9.5, selection_percentage: 69.2, points: 128, batting_style: 'LH' },
  { name: 'Alex Carey', role: 'WK', credits: 8.5, selection_percentage: 42.1, points: 78, batting_style: 'LH' },
  { name: 'Glenn Maxwell', role: 'AR', credits: 9.0, selection_percentage: 65.7, points: 118, batting_style: 'RH', bowling_style: 'Spin' },
  { name: 'Marcus Stoinis', role: 'AR', credits: 8.5, selection_percentage: 38.9, points: 89, batting_style: 'RH', bowling_style: 'Pace' },
  { name: 'Pat Cummins', role: 'BWL', credits: 9.5, selection_percentage: 72.4, points: 145, bowling_style: 'Pace' },
  { name: 'Mitchell Starc', role: 'BWL', credits: 9.0, selection_percentage: 58.6, points: 112, bowling_style: 'Pace' },
  { name: 'Adam Zampa', role: 'BWL', credits: 8.0, selection_percentage: 34.2, points: 67, bowling_style: 'Spin' },
  { name: 'Travis Head', role: 'BAT', credits: 8.5, selection_percentage: 45.8, points: 92, batting_style: 'LH' },
  { name: 'Josh Hazlewood', role: 'BWL', credits: 8.5, selection_percentage: 41.3, points: 85, bowling_style: 'Pace' },
  { name: 'Marnus Labuschagne', role: 'BAT', credits: 8.0, selection_percentage: 35.7, points: 74, batting_style: 'RH' },
  { name: 'Mitchell Marsh', role: 'AR', credits: 8.0, selection_percentage: 28.4, points: 65, batting_style: 'RH', bowling_style: 'Pace' },
  { name: 'Josh Inglis', role: 'WK', credits: 7.5, selection_percentage: 22.1, points: 48, batting_style: 'RH' },
  { name: 'Sean Abbott', role: 'AR', credits: 7.0, selection_percentage: 15.3, points: 38, batting_style: 'RH', bowling_style: 'Pace' },
  { name: 'Ashton Agar', role: 'AR', credits: 7.0, selection_percentage: 18.7, points: 42, batting_style: 'LH', bowling_style: 'Spin' }
];

// Add similar data for other teams...
// For brevity, I'll just add two more teams

const englandPlayers = [
  { name: 'Joe Root', role: 'BAT', credits: 10.0, selection_percentage: 78.5, points: 142, batting_style: 'RH' },
  { name: 'Ben Stokes', role: 'AR', credits: 9.5, selection_percentage: 74.2, points: 158, batting_style: 'LH', bowling_style: 'Pace' },
  { name: 'Jos Buttler', role: 'WK', credits: 9.0, selection_percentage: 68.9, points: 125, batting_style: 'RH' },
  { name: 'Jofra Archer', role: 'BWL', credits: 9.0, selection_percentage: 62.4, points: 134, bowling_style: 'Pace' },
  { name: 'Adil Rashid', role: 'BWL', credits: 8.0, selection_percentage: 38.7, points: 78, bowling_style: 'Spin' },
  { name: 'Jonny Bairstow', role: 'WK', credits: 8.5, selection_percentage: 45.3, points: 89, batting_style: 'RH' },
  { name: 'Liam Livingstone', role: 'AR', credits: 8.0, selection_percentage: 42.1, points: 85, batting_style: 'RH', bowling_style: 'Spin' },
  { name: 'Mark Wood', role: 'BWL', credits: 8.5, selection_percentage: 35.8, points: 72, bowling_style: 'Pace' },
  { name: 'Harry Brook', role: 'BAT', credits: 8.0, selection_percentage: 38.9, points: 76, batting_style: 'RH' },
  { name: 'Chris Woakes', role: 'AR', credits: 8.0, selection_percentage: 32.6, points: 68, batting_style: 'RH', bowling_style: 'Pace' },
  { name: 'Moeen Ali', role: 'AR', credits: 7.5, selection_percentage: 28.4, points: 58, batting_style: 'LH', bowling_style: 'Spin' },
  { name: 'Sam Curran', role: 'AR', credits: 7.5, selection_percentage: 25.7, points: 52, batting_style: 'LH', bowling_style: 'Pace' },
  { name: 'Phil Salt', role: 'WK', credits: 7.0, selection_percentage: 22.3, points: 45, batting_style: 'RH' },
  { name: 'Reece Topley', role: 'BWL', credits: 7.0, selection_percentage: 18.9, points: 38, bowling_style: 'Pace' },
  { name: 'Liam Dawson', role: 'AR', credits: 6.5, selection_percentage: 15.2, points: 32, batting_style: 'LH', bowling_style: 'Spin' }
];

const pakistanPlayers = [
  { name: 'Babar Azam', role: 'BAT', credits: 10.5, selection_percentage: 82.7, points: 156, batting_style: 'RH' },
  { name: 'Mohammad Rizwan', role: 'WK', credits: 9.5, selection_percentage: 75.3, points: 142, batting_style: 'RH' },
  { name: 'Shaheen Afridi', role: 'BWL', credits: 9.5, selection_percentage: 69.8, points: 138, bowling_style: 'Pace' },
  { name: 'Shadab Khan', role: 'AR', credits: 8.5, selection_percentage: 52.4, points: 98, batting_style: 'RH', bowling_style: 'Spin' },
  { name: 'Fakhar Zaman', role: 'BAT', credits: 8.0, selection_percentage: 46.7, points: 89, batting_style: 'LH' },
  { name: 'Hasan Ali', role: 'BWL', credits: 8.0, selection_percentage: 38.9, points: 76, bowling_style: 'Pace' },
  { name: 'Imam-ul-Haq', role: 'BAT', credits: 7.5, selection_percentage: 35.2, points: 72, batting_style: 'LH' },
  { name: 'Mohammad Hafeez', role: 'AR', credits: 7.5, selection_percentage: 32.8, points: 68, batting_style: 'RH', bowling_style: 'Spin' },
  { name: 'Sarfaraz Ahmed', role: 'WK', credits: 7.0, selection_percentage: 28.6, points: 58, batting_style: 'RH' },
  { name: 'Haris Rauf', role: 'BWL', credits: 7.5, selection_percentage: 25.9, points: 54, bowling_style: 'Pace' },
  { name: 'Asif Ali', role: 'BAT', credits: 7.0, selection_percentage: 22.4, points: 46, batting_style: 'RH' },
  { name: 'Imad Wasim', role: 'AR', credits: 7.0, selection_percentage: 19.7, points: 42, batting_style: 'LH', bowling_style: 'Spin' },
  { name: 'Mohammad Nawaz', role: 'AR', credits: 6.5, selection_percentage: 17.3, points: 38, batting_style: 'LH', bowling_style: 'Spin' },
  { name: 'Naseem Shah', role: 'BWL', credits: 7.0, selection_percentage: 15.8, points: 34, bowling_style: 'Pace' },
  { name: 'Shan Masood', role: 'BAT', credits: 6.5, selection_percentage: 12.4, points: 28, batting_style: 'LH' }
];

// Create complete player arrays
dummyPlayers.push(...createPlayers('India', indiaPlayers));
dummyPlayers.push(...createPlayers('Australia', australiaPlayers));
dummyPlayers.push(...createPlayers('England', englandPlayers));
dummyPlayers.push(...createPlayers('Pakistan', pakistanPlayers));

// Add more teams to reach 150 players total (need 2 more teams = 30 more players)
const southAfricaPlayers = [
  { name: 'Quinton de Kock', role: 'WK', credits: 9.0, selection_percentage: 68.4, points: 125, batting_style: 'LH' },
  { name: 'Kagiso Rabada', role: 'BWL', credits: 9.5, selection_percentage: 72.8, points: 145, bowling_style: 'Pace' },
  { name: 'AB de Villiers', role: 'BAT', credits: 10.0, selection_percentage: 78.9, points: 152, batting_style: 'RH' },
  // ... add 12 more players
  { name: 'Temba Bavuma', role: 'BAT', credits: 8.0, selection_percentage: 42.1, points: 78, batting_style: 'RH' },
  { name: 'David Miller', role: 'BAT', credits: 8.5, selection_percentage: 48.6, points: 89, batting_style: 'LH' },
  { name: 'Andile Phehlukwayo', role: 'AR', credits: 7.5, selection_percentage: 32.4, points: 65, batting_style: 'RH', bowling_style: 'Pace' },
  { name: 'Tabraiz Shamsi', role: 'BWL', credits: 7.5, selection_percentage: 28.7, points: 58, bowling_style: 'Spin' },
  { name: 'Anrich Nortje', role: 'BWL', credits: 8.0, selection_percentage: 35.9, points: 72, bowling_style: 'Pace' },
  { name: 'Rassie van der Dussen', role: 'BAT', credits: 7.5, selection_percentage: 38.2, points: 74, batting_style: 'RH' },
  { name: 'Lungi Ngidi', role: 'BWL', credits: 7.0, selection_percentage: 25.8, points: 52, bowling_style: 'Pace' },
  { name: 'Keshav Maharaj', role: 'BWL', credits: 7.0, selection_percentage: 22.6, points: 48, bowling_style: 'Spin' },
  { name: 'Heinrich Klaasen', role: 'WK', credits: 7.5, selection_percentage: 28.9, points: 58, batting_style: 'RH' },
  { name: 'Wayne Parnell', role: 'AR', credits: 6.5, selection_percentage: 18.4, points: 38, batting_style: 'LH', bowling_style: 'Pace' },
  { name: 'Aiden Markram', role: 'AR', credits: 7.0, selection_percentage: 24.7, points: 52, batting_style: 'RH', bowling_style: 'Spin' },
  { name: 'Marco Jansen', role: 'AR', credits: 6.5, selection_percentage: 16.8, points: 35, batting_style: 'LH', bowling_style: 'Pace' }
];

const newZealandPlayers = [
  { name: 'Kane Williamson', role: 'BAT', credits: 9.5, selection_percentage: 74.6, points: 138, batting_style: 'RH' },
  { name: 'Trent Boult', role: 'BWL', credits: 9.0, selection_percentage: 65.8, points: 128, bowling_style: 'Pace' },
  { name: 'Martin Guptill', role: 'BAT', credits: 8.5, selection_percentage: 52.3, points: 95, batting_style: 'RH' },
  { name: 'Devon Conway', role: 'WK', credits: 8.0, selection_percentage: 48.7, points: 89, batting_style: 'LH' },
  { name: 'Mitchell Santner', role: 'AR', credits: 7.5, selection_percentage: 35.8, points: 72, batting_style: 'LH', bowling_style: 'Spin' },
  { name: 'Tim Southee', role: 'BWL', credits: 8.0, selection_percentage: 42.9, points: 85, bowling_style: 'Pace' },
  { name: 'Ross Taylor', role: 'BAT', credits: 8.0, selection_percentage: 45.2, points: 86, batting_style: 'RH' },
  { name: 'Kyle Jamieson', role: 'AR', credits: 7.5, selection_percentage: 32.6, points: 68, batting_style: 'RH', bowling_style: 'Pace' },
  { name: 'Tom Latham', role: 'WK', credits: 7.5, selection_percentage: 38.4, points: 74, batting_style: 'LH' },
  { name: 'Ish Sodhi', role: 'BWL', credits: 7.0, selection_percentage: 25.7, points: 52, bowling_style: 'Spin' },
  { name: 'Jimmy Neesham', role: 'AR', credits: 7.0, selection_percentage: 28.9, points: 58, batting_style: 'LH', bowling_style: 'Pace' },
  { name: 'Daryl Mitchell', role: 'AR', credits: 7.0, selection_percentage: 26.4, points: 54, batting_style: 'RH', bowling_style: 'Pace' },
  { name: 'Tim Seifert', role: 'WK', credits: 6.5, selection_percentage: 22.8, points: 46, batting_style: 'RH' },
  { name: 'Matt Henry', role: 'BWL', credits: 6.5, selection_percentage: 19.3, points: 42, bowling_style: 'Pace' },
  { name: 'Adam Milne', role: 'BWL', credits: 6.5, selection_percentage: 17.6, points: 38, bowling_style: 'Pace' }
];

dummyPlayers.push(...createPlayers('South Africa', southAfricaPlayers));
dummyPlayers.push(...createPlayers('New Zealand', newZealandPlayers));

// West Indies players
const westIndiesPlayers = [
  { name: 'Chris Gayle', role: 'BAT', credits: 9.5, selection_percentage: 68.4, points: 125, batting_style: 'LH' },
  { name: 'Kieron Pollard', role: 'AR', credits: 9.0, selection_percentage: 62.8, points: 118, batting_style: 'RH', bowling_style: 'Pace' },
  { name: 'Andre Russell', role: 'AR', credits: 9.5, selection_percentage: 72.6, points: 142, batting_style: 'RH', bowling_style: 'Pace' },
  { name: 'Nicholas Pooran', role: 'WK', credits: 8.5, selection_percentage: 55.3, points: 98, batting_style: 'LH' },
  { name: 'Dwayne Bravo', role: 'AR', credits: 8.0, selection_percentage: 48.7, points: 89, batting_style: 'RH', bowling_style: 'Pace' },
  { name: 'Sunil Narine', role: 'AR', credits: 8.5, selection_percentage: 52.4, points: 95, batting_style: 'LH', bowling_style: 'Spin' },
  { name: 'Jason Holder', role: 'AR', credits: 8.0, selection_percentage: 45.8, points: 85, batting_style: 'RH', bowling_style: 'Pace' },
  { name: 'Shimron Hetmyer', role: 'BAT', credits: 7.5, selection_percentage: 38.9, points: 74, batting_style: 'LH' },
  { name: 'Evin Lewis', role: 'BAT', credits: 7.5, selection_percentage: 42.1, points: 78, batting_style: 'LH' },
  { name: 'Fabian Allen', role: 'AR', credits: 7.0, selection_percentage: 32.6, points: 65, batting_style: 'LH', bowling_style: 'Spin' },
  { name: 'Sheldon Cottrell', role: 'BWL', credits: 7.5, selection_percentage: 35.8, points: 68, bowling_style: 'Pace' },
  { name: 'Oshane Thomas', role: 'BWL', credits: 7.0, selection_percentage: 28.4, points: 55, bowling_style: 'Pace' },
  { name: 'Lendl Simmons', role: 'BAT', credits: 6.5, selection_percentage: 25.7, points: 48, batting_style: 'RH' },
  { name: 'Denesh Ramdin', role: 'WK', credits: 6.5, selection_percentage: 22.3, points: 42, batting_style: 'RH' },
  { name: 'Hayden Walsh Jr.', role: 'BWL', credits: 6.5, selection_percentage: 19.6, points: 38, bowling_style: 'Spin' }
];

// Sri Lanka players
const sriLankaPlayers = [
  { name: 'Angelo Mathews', role: 'AR', credits: 8.5, selection_percentage: 58.7, points: 108, batting_style: 'RH', bowling_style: 'Pace' },
  { name: 'Dinesh Chandimal', role: 'WK', credits: 8.0, selection_percentage: 52.4, points: 95, batting_style: 'RH' },
  { name: 'Kusal Mendis', role: 'BAT', credits: 7.5, selection_percentage: 48.6, points: 89, batting_style: 'RH' },
  { name: 'Wanindu Hasaranga', role: 'AR', credits: 8.5, selection_percentage: 62.8, points: 118, batting_style: 'RH', bowling_style: 'Spin' },
  { name: 'Lasith Malinga', role: 'BWL', credits: 9.0, selection_percentage: 68.4, points: 128, bowling_style: 'Pace' },
  { name: 'Thisara Perera', role: 'AR', credits: 7.5, selection_percentage: 42.1, points: 78, batting_style: 'LH', bowling_style: 'Pace' },
  { name: 'Kusal Perera', role: 'WK', credits: 7.5, selection_percentage: 45.8, points: 85, batting_style: 'LH' },
  { name: 'Dhananjaya de Silva', role: 'AR', credits: 7.0, selection_percentage: 38.9, points: 72, batting_style: 'RH', bowling_style: 'Spin' },
  { name: 'Isuru Udana', role: 'AR', credits: 7.0, selection_percentage: 35.7, points: 68, batting_style: 'LH', bowling_style: 'Pace' },
  { name: 'Avishka Fernando', role: 'BAT', credits: 6.5, selection_percentage: 32.4, points: 62, batting_style: 'RH' },
  { name: 'Nuwan Pradeep', role: 'BWL', credits: 6.5, selection_percentage: 28.7, points: 55, bowling_style: 'Pace' },
  { name: 'Akila Dananjaya', role: 'BWL', credits: 6.5, selection_percentage: 25.8, points: 48, bowling_style: 'Spin' },
  { name: 'Pathum Nissanka', role: 'BAT', credits: 6.0, selection_percentage: 22.6, points: 42, batting_style: 'RH' },
  { name: 'Niroshan Dickwella', role: 'WK', credits: 6.0, selection_percentage: 19.4, points: 38, batting_style: 'LH' },
  { name: 'Lakshan Sandakan', role: 'BWL', credits: 6.0, selection_percentage: 16.8, points: 32, bowling_style: 'Spin' }
];

// Bangladesh players
const bangladeshPlayers = [
  { name: 'Shakib Al Hasan', role: 'AR', credits: 9.0, selection_percentage: 72.8, points: 138, batting_style: 'LH', bowling_style: 'Spin' },
  { name: 'Tamim Iqbal', role: 'BAT', credits: 8.5, selection_percentage: 58.6, points: 108, batting_style: 'LH' },
  { name: 'Mushfiqur Rahim', role: 'WK', credits: 8.0, selection_percentage: 52.4, points: 95, batting_style: 'RH' },
  { name: 'Mahmudullah', role: 'AR', credits: 7.5, selection_percentage: 48.7, points: 89, batting_style: 'RH', bowling_style: 'Spin' },
  { name: 'Liton Das', role: 'WK', credits: 7.5, selection_percentage: 45.8, points: 85, batting_style: 'RH' },
  { name: 'Mustafizur Rahman', role: 'BWL', credits: 8.5, selection_percentage: 62.9, points: 118, bowling_style: 'Pace' },
  { name: 'Soumya Sarkar', role: 'AR', credits: 7.0, selection_percentage: 38.4, points: 72, batting_style: 'LH', bowling_style: 'Pace' },
  { name: 'Mehidy Hasan', role: 'AR', credits: 7.0, selection_percentage: 35.7, points: 68, batting_style: 'RH', bowling_style: 'Spin' },
  { name: 'Taskin Ahmed', role: 'BWL', credits: 7.0, selection_percentage: 32.6, points: 62, bowling_style: 'Pace' },
  { name: 'Rubel Hossain', role: 'BWL', credits: 6.5, selection_percentage: 28.9, points: 55, bowling_style: 'Pace' },
  { name: 'Sabbir Rahman', role: 'BAT', credits: 6.5, selection_percentage: 25.7, points: 48, batting_style: 'RH' },
  { name: 'Afif Hossain', role: 'AR', credits: 6.0, selection_percentage: 22.4, points: 42, batting_style: 'LH', bowling_style: 'Spin' },
  { name: 'Nasum Ahmed', role: 'BWL', credits: 6.0, selection_percentage: 19.6, points: 38, bowling_style: 'Spin' },
  { name: 'Mohammad Saifuddin', role: 'AR', credits: 6.5, selection_percentage: 26.8, points: 52, batting_style: 'RH', bowling_style: 'Pace' },
  { name: 'Nurul Hasan', role: 'WK', credits: 5.5, selection_percentage: 16.4, points: 32, batting_style: 'LH' }
];

// Afghanistan players
const afghanistanPlayers = [
  { name: 'Rashid Khan', role: 'AR', credits: 9.5, selection_percentage: 78.4, points: 148, batting_style: 'RH', bowling_style: 'Spin' },
  { name: 'Mohammad Nabi', role: 'AR', credits: 8.5, selection_percentage: 62.7, points: 118, batting_style: 'RH', bowling_style: 'Spin' },
  { name: 'Hazratullah Zazai', role: 'BAT', credits: 8.0, selection_percentage: 55.3, points: 98, batting_style: 'LH' },
  { name: 'Mohammad Shahzad', role: 'WK', credits: 7.5, selection_percentage: 48.6, points: 89, batting_style: 'RH' },
  { name: 'Rahmat Shah', role: 'BAT', credits: 7.0, selection_percentage: 42.1, points: 78, batting_style: 'RH' },
  { name: 'Gulbadin Naib', role: 'AR', credits: 7.0, selection_percentage: 38.7, points: 72, batting_style: 'RH', bowling_style: 'Pace' },
  { name: 'Najibullah Zadran', role: 'BAT', credits: 7.0, selection_percentage: 35.8, points: 68, batting_style: 'LH' },
  { name: 'Asghar Afghan', role: 'BAT', credits: 6.5, selection_percentage: 32.4, points: 62, batting_style: 'RH' },
  { name: 'Mujeeb Ur Rahman', role: 'BWL', credits: 8.0, selection_percentage: 52.6, points: 95, bowling_style: 'Spin' },
  { name: 'Dawlat Zadran', role: 'BWL', credits: 6.5, selection_percentage: 28.9, points: 55, bowling_style: 'Pace' },
  { name: 'Hamid Hassan', role: 'BWL', credits: 6.5, selection_percentage: 25.7, points: 48, bowling_style: 'Pace' },
  { name: 'Samiullah Shinwari', role: 'BAT', credits: 6.0, selection_percentage: 22.4, points: 42, batting_style: 'LH' },
  { name: 'Ikram Ali Khil', role: 'WK', credits: 6.0, selection_percentage: 19.6, points: 38, batting_style: 'LH' },
  { name: 'Karim Janat', role: 'AR', credits: 6.0, selection_percentage: 16.8, points: 32, batting_style: 'RH', bowling_style: 'Pace' },
  { name: 'Qais Ahmad', role: 'BWL', credits: 6.0, selection_percentage: 18.4, points: 35, bowling_style: 'Spin' }
];

dummyPlayers.push(...createPlayers('West Indies', westIndiesPlayers));
dummyPlayers.push(...createPlayers('Sri Lanka', sriLankaPlayers));
dummyPlayers.push(...createPlayers('Bangladesh', bangladeshPlayers));
dummyPlayers.push(...createPlayers('Afghanistan', afghanistanPlayers));

async function insertDummyData() {
  console.log('🚀 Starting dummy data insertion...');
  
  try {
    // Insert matches
    console.log('📊 Inserting matches...');
    for (const match of dummyMatches) {
      const result = await pool.query(
        `INSERT INTO matches (team_name, match_venue, match_date, match_format, is_active, 
         start_time, end_time, is_upcoming, status, venue_condition, pitch_condition, weather_condition) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
        [
          match.team_name, match.match_venue, match.match_date, match.match_format,
          match.is_active, match.start_time, match.end_time, match.is_upcoming,
          match.status, match.venue_condition, match.pitch_condition, match.weather_condition
        ]
      );
      console.log(`✅ Inserted match: ${result.rows[0].team_name}`);
    }

    // Insert players
    console.log('👥 Inserting players...');
    for (const player of dummyPlayers) {
      const result = await pool.query(
        `INSERT INTO players (name, full_name, team_name, player_role, credits, 
         selection_percentage, points, is_playing_today, country, batting_style, bowling_style) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
        [
          player.name, player.full_name, player.team_name, player.player_role,
          player.credits, player.selection_percentage, player.points, player.is_playing_today,
          player.country, player.batting_style, player.bowling_style
        ]
      );
      console.log(`✅ Inserted player: ${result.rows[0].name} (${result.rows[0].team_name})`);
    }

    console.log('🎉 Dummy data insertion completed successfully!');
    
    // Verify data
    const matchResult = await pool.query('SELECT COUNT(*) FROM matches');
    const playerResult = await pool.query('SELECT COUNT(*) FROM players');
    console.log(`📈 Summary: ${matchResult.rows[0].count} matches and ${playerResult.rows[0].count} players inserted.`);
    
    await pool.end();
    
  } catch (error) {
    console.error('❌ Error inserting dummy data:', error);
    await pool.end();
    process.exit(1);
  }
}

insertDummyData();
