import { neonDB, Match, Player } from '../lib/neon-db';

// Dummy data for 5 matches (10 teams total)
const dummyMatches: Omit<Match, 'id'>[] = [
  {
    team_name: 'India vs Australia',
    match_venue: 'Wankhede Stadium, Mumbai',
    match_date: new Date('2025-07-15'),
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
    match_date: new Date('2025-07-16'),
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
    match_date: new Date('2025-07-17'),
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
    match_date: new Date('2025-07-18'),
    match_format: 'T20',
    is_active: true,
    start_time: '20:00',
    end_time: '23:30',
    is_upcoming: true,
    status: 'Scheduled',
    venue_condition: 'Humid',
    pitch_condition: 'Spin-friendly',
    weather_condition: 'Humid'
  },
  {
    team_name: 'Bangladesh vs Afghanistan',
    match_venue: 'Shere Bangla National Stadium, Dhaka',
    match_date: new Date('2025-07-19'),
    match_format: 'ODI',
    is_active: true,
    start_time: '15:00',
    end_time: '23:00',
    is_upcoming: true,
    status: 'Scheduled',
    venue_condition: 'Wet',
    pitch_condition: 'Spin-friendly',
    weather_condition: 'Rainy'
  }
];

// Dummy players data (15 players per team, 11 active + 4 inactive)
const dummyPlayers: Omit<Player, 'id'>[] = [
  // India Team (15 players - 11 active, 4 inactive)
  { name: 'V Kohli', full_name: 'Virat Kohli', team_name: 'India', player_role: 'BAT', credits: 11.5, selection_percentage: 85.2, points: 58, is_playing_today: true, country: 'India', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'R Sharma', full_name: 'Rohit Sharma', team_name: 'India', player_role: 'BAT', credits: 11.0, selection_percentage: 78.5, points: 52, is_playing_today: true, country: 'India', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'J Bumrah', full_name: 'Jasprit Bumrah', team_name: 'India', player_role: 'BWL', credits: 10.5, selection_percentage: 72.3, points: 45, is_playing_today: true, country: 'India', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'R Pant', full_name: 'Rishabh Pant', team_name: 'India', player_role: 'WK', credits: 10.0, selection_percentage: 68.7, points: 41, is_playing_today: true, country: 'India', batting_style: 'LH', bowling_style: 'RH' },
  { name: 'H Pandya', full_name: 'Hardik Pandya', team_name: 'India', player_role: 'AR', credits: 9.5, selection_percentage: 65.1, points: 38, is_playing_today: true, country: 'India', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'K Rahul', full_name: 'KL Rahul', team_name: 'India', player_role: 'WK', credits: 9.0, selection_percentage: 58.9, points: 35, is_playing_today: true, country: 'India', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'R Ashwin', full_name: 'Ravichandran Ashwin', team_name: 'India', player_role: 'BWL', credits: 8.5, selection_percentage: 45.6, points: 32, is_playing_today: true, country: 'India', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'S Gill', full_name: 'Shubman Gill', team_name: 'India', player_role: 'BAT', credits: 8.0, selection_percentage: 42.3, points: 28, is_playing_today: true, country: 'India', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'Y Chahal', full_name: 'Yuzvendra Chahal', team_name: 'India', player_role: 'BWL', credits: 7.5, selection_percentage: 38.7, points: 25, is_playing_today: true, country: 'India', batting_style: 'RH', bowling_style: 'LH' },
  { name: 'M Shami', full_name: 'Mohammed Shami', team_name: 'India', player_role: 'BWL', credits: 7.0, selection_percentage: 35.2, points: 22, is_playing_today: true, country: 'India', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'R Jadeja', full_name: 'Ravindra Jadeja', team_name: 'India', player_role: 'AR', credits: 8.5, selection_percentage: 48.9, points: 30, is_playing_today: true, country: 'India', batting_style: 'LH', bowling_style: 'LH' },
  // Inactive players
  { name: 'I Kishan', full_name: 'Ishan Kishan', team_name: 'India', player_role: 'WK', credits: 6.5, selection_percentage: 15.2, points: 18, is_playing_today: false, country: 'India', batting_style: 'LH', bowling_style: 'RH' },
  { name: 'P Krishna', full_name: 'Prasidh Krishna', team_name: 'India', player_role: 'BWL', credits: 6.0, selection_percentage: 12.8, points: 15, is_playing_today: false, country: 'India', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'S Samson', full_name: 'Sanju Samson', team_name: 'India', player_role: 'WK', credits: 6.5, selection_percentage: 18.5, points: 20, is_playing_today: false, country: 'India', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'W Sundar', full_name: 'Washington Sundar', team_name: 'India', player_role: 'AR', credits: 6.0, selection_percentage: 14.7, points: 16, is_playing_today: false, country: 'India', batting_style: 'LH', bowling_style: 'RH' },

  // Australia Team (15 players - 11 active, 4 inactive)
  { name: 'S Smith', full_name: 'Steven Smith', team_name: 'Australia', player_role: 'BAT', credits: 11.0, selection_percentage: 82.1, points: 55, is_playing_today: true, country: 'Australia', batting_style: 'RH', bowling_style: 'LH' },
  { name: 'D Warner', full_name: 'David Warner', team_name: 'Australia', player_role: 'BAT', credits: 10.5, selection_percentage: 76.8, points: 48, is_playing_today: true, country: 'Australia', batting_style: 'LH', bowling_style: 'RH' },
  { name: 'P Cummins', full_name: 'Pat Cummins', team_name: 'Australia', player_role: 'BWL', credits: 10.0, selection_percentage: 69.5, points: 42, is_playing_today: true, country: 'Australia', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'A Carey', full_name: 'Alex Carey', team_name: 'Australia', player_role: 'WK', credits: 8.5, selection_percentage: 52.3, points: 33, is_playing_today: true, country: 'Australia', batting_style: 'LH', bowling_style: 'RH' },
  { name: 'G Maxwell', full_name: 'Glenn Maxwell', team_name: 'Australia', player_role: 'AR', credits: 9.0, selection_percentage: 58.7, points: 36, is_playing_today: true, country: 'Australia', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'M Labuschagne', full_name: 'Marnus Labuschagne', team_name: 'Australia', player_role: 'BAT', credits: 9.5, selection_percentage: 61.2, points: 39, is_playing_today: true, country: 'Australia', batting_style: 'RH', bowling_style: 'LH' },
  { name: 'J Hazlewood', full_name: 'Josh Hazlewood', team_name: 'Australia', player_role: 'BWL', credits: 8.0, selection_percentage: 44.8, points: 28, is_playing_today: true, country: 'Australia', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'T Head', full_name: 'Travis Head', team_name: 'Australia', player_role: 'BAT', credits: 8.5, selection_percentage: 47.6, points: 31, is_playing_today: true, country: 'Australia', batting_style: 'LH', bowling_style: 'RH' },
  { name: 'A Zampa', full_name: 'Adam Zampa', team_name: 'Australia', player_role: 'BWL', credits: 7.5, selection_percentage: 41.3, points: 26, is_playing_today: true, country: 'Australia', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'M Starc', full_name: 'Mitchell Starc', team_name: 'Australia', player_role: 'BWL', credits: 8.5, selection_percentage: 46.9, points: 29, is_playing_today: true, country: 'Australia', batting_style: 'LH', bowling_style: 'LH' },
  { name: 'C Green', full_name: 'Cameron Green', team_name: 'Australia', player_role: 'AR', credits: 7.0, selection_percentage: 38.5, points: 24, is_playing_today: true, country: 'Australia', batting_style: 'RH', bowling_style: 'RH' },
  // Inactive players
  { name: 'M Marsh', full_name: 'Mitchell Marsh', team_name: 'Australia', player_role: 'AR', credits: 6.5, selection_percentage: 22.1, points: 19, is_playing_today: false, country: 'Australia', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'N Lyon', full_name: 'Nathan Lyon', team_name: 'Australia', player_role: 'BWL', credits: 6.0, selection_percentage: 18.7, points: 17, is_playing_today: false, country: 'Australia', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'M Short', full_name: 'Matt Short', team_name: 'Australia', player_role: 'BAT', credits: 6.0, selection_percentage: 16.3, points: 14, is_playing_today: false, country: 'Australia', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'S Abbott', full_name: 'Sean Abbott', team_name: 'Australia', player_role: 'BWL', credits: 5.5, selection_percentage: 12.8, points: 12, is_playing_today: false, country: 'Australia', batting_style: 'RH', bowling_style: 'RH' },

  // England Team (15 players - 11 active, 4 inactive)
  { name: 'J Root', full_name: 'Joe Root', team_name: 'England', player_role: 'BAT', credits: 10.5, selection_percentage: 78.9, points: 51, is_playing_today: true, country: 'England', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'B Stokes', full_name: 'Ben Stokes', team_name: 'England', player_role: 'AR', credits: 10.0, selection_percentage: 72.6, points: 46, is_playing_today: true, country: 'England', batting_style: 'LH', bowling_style: 'RH' },
  { name: 'J Buttler', full_name: 'Jos Buttler', team_name: 'England', player_role: 'WK', credits: 9.5, selection_percentage: 68.4, points: 43, is_playing_today: true, country: 'England', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'H Brook', full_name: 'Harry Brook', team_name: 'England', player_role: 'BAT', credits: 9.0, selection_percentage: 61.7, points: 38, is_playing_today: true, country: 'England', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'J Anderson', full_name: 'James Anderson', team_name: 'England', player_role: 'BWL', credits: 8.5, selection_percentage: 55.2, points: 34, is_playing_today: true, country: 'England', batting_style: 'LH', bowling_style: 'RH' },
  { name: 'M Wood', full_name: 'Mark Wood', team_name: 'England', player_role: 'BWL', credits: 8.0, selection_percentage: 48.6, points: 31, is_playing_today: true, country: 'England', batting_style: 'LH', bowling_style: 'RH' },
  { name: 'A Rashid', full_name: 'Adil Rashid', team_name: 'England', player_role: 'BWL', credits: 7.5, selection_percentage: 42.8, points: 27, is_playing_today: true, country: 'England', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'Z Crawley', full_name: 'Zak Crawley', team_name: 'England', player_role: 'BAT', credits: 7.0, selection_percentage: 38.4, points: 25, is_playing_today: true, country: 'England', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'M Ali', full_name: 'Moeen Ali', team_name: 'England', player_role: 'AR', credits: 7.5, selection_percentage: 44.2, points: 29, is_playing_today: true, country: 'England', batting_style: 'LH', bowling_style: 'RH' },
  { name: 'S Broad', full_name: 'Stuart Broad', team_name: 'England', player_role: 'BWL', credits: 7.0, selection_percentage: 36.9, points: 23, is_playing_today: true, country: 'England', batting_style: 'LH', bowling_style: 'RH' },
  { name: 'L Livingstone', full_name: 'Liam Livingstone', team_name: 'England', player_role: 'AR', credits: 6.5, selection_percentage: 34.7, points: 21, is_playing_today: true, country: 'England', batting_style: 'RH', bowling_style: 'RH' },
  // Inactive players
  { name: 'J Bairstow', full_name: 'Jonny Bairstow', team_name: 'England', player_role: 'WK', credits: 6.0, selection_percentage: 19.8, points: 18, is_playing_today: false, country: 'England', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'C Woakes', full_name: 'Chris Woakes', team_name: 'England', player_role: 'AR', credits: 6.5, selection_percentage: 25.6, points: 22, is_playing_today: false, country: 'England', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'R Topley', full_name: 'Reece Topley', team_name: 'England', player_role: 'BWL', credits: 5.5, selection_percentage: 14.2, points: 16, is_playing_today: false, country: 'England', batting_style: 'LH', bowling_style: 'LH' },
  { name: 'P Salt', full_name: 'Phil Salt', team_name: 'England', player_role: 'WK', credits: 6.0, selection_percentage: 17.4, points: 15, is_playing_today: false, country: 'England', batting_style: 'RH', bowling_style: 'RH' },

  // Pakistan Team (15 players - 11 active, 4 inactive)
  { name: 'B Azam', full_name: 'Babar Azam', team_name: 'Pakistan', player_role: 'BAT', credits: 11.0, selection_percentage: 81.5, points: 54, is_playing_today: true, country: 'Pakistan', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'S Afridi', full_name: 'Shaheen Afridi', team_name: 'Pakistan', player_role: 'BWL', credits: 9.5, selection_percentage: 67.8, points: 41, is_playing_today: true, country: 'Pakistan', batting_style: 'LH', bowling_style: 'LH' },
  { name: 'M Rizwan', full_name: 'Mohammad Rizwan', team_name: 'Pakistan', player_role: 'WK', credits: 9.0, selection_percentage: 63.2, points: 37, is_playing_today: true, country: 'Pakistan', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'F Zaman', full_name: 'Fakhar Zaman', team_name: 'Pakistan', player_role: 'BAT', credits: 8.5, selection_percentage: 56.4, points: 33, is_playing_today: true, country: 'Pakistan', batting_style: 'LH', bowling_style: 'LH' },
  { name: 'H Rauf', full_name: 'Haris Rauf', team_name: 'Pakistan', player_role: 'BWL', credits: 8.0, selection_percentage: 49.7, points: 30, is_playing_today: true, country: 'Pakistan', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'S Masood', full_name: 'Shan Masood', team_name: 'Pakistan', player_role: 'BAT', credits: 7.5, selection_percentage: 43.6, points: 26, is_playing_today: true, country: 'Pakistan', batting_style: 'LH', bowling_style: 'LH' },
  { name: 'I Ahmed', full_name: 'Iftikhar Ahmed', team_name: 'Pakistan', player_role: 'AR', credits: 7.0, selection_percentage: 38.9, points: 24, is_playing_today: true, country: 'Pakistan', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'N Shah', full_name: 'Naseem Shah', team_name: 'Pakistan', player_role: 'BWL', credits: 7.5, selection_percentage: 41.8, points: 27, is_playing_today: true, country: 'Pakistan', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'S Khan', full_name: 'Shadab Khan', team_name: 'Pakistan', player_role: 'AR', credits: 8.0, selection_percentage: 47.3, points: 29, is_playing_today: true, country: 'Pakistan', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'M Nawaz', full_name: 'Mohammad Nawaz', team_name: 'Pakistan', player_role: 'AR', credits: 6.5, selection_percentage: 35.7, points: 22, is_playing_today: true, country: 'Pakistan', batting_style: 'LH', bowling_style: 'LH' },
  { name: 'I ul Haq', full_name: 'Imam ul Haq', team_name: 'Pakistan', player_role: 'BAT', credits: 7.0, selection_percentage: 39.8, points: 25, is_playing_today: true, country: 'Pakistan', batting_style: 'LH', bowling_style: 'LH' },
  // Inactive players
  { name: 'A Ali', full_name: 'Azam Ali', team_name: 'Pakistan', player_role: 'BAT', credits: 6.0, selection_percentage: 18.9, points: 17, is_playing_today: false, country: 'Pakistan', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'M Hasnain', full_name: 'Mohammad Hasnain', team_name: 'Pakistan', player_role: 'BWL', credits: 5.5, selection_percentage: 15.4, points: 14, is_playing_today: false, country: 'Pakistan', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'U Qadir', full_name: 'Usman Qadir', team_name: 'Pakistan', player_role: 'BWL', credits: 5.0, selection_percentage: 12.8, points: 11, is_playing_today: false, country: 'Pakistan', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'K Shah', full_name: 'Khushdil Shah', team_name: 'Pakistan', player_role: 'AR', credits: 5.5, selection_percentage: 16.7, points: 13, is_playing_today: false, country: 'Pakistan', batting_style: 'LH', bowling_style: 'LH' },

  // South Africa Team (15 players - 11 active, 4 inactive)
  { name: 'Q de Kock', full_name: 'Quinton de Kock', team_name: 'South Africa', player_role: 'WK', credits: 10.0, selection_percentage: 74.6, points: 47, is_playing_today: true, country: 'South Africa', batting_style: 'LH', bowling_style: 'RH' },
  { name: 'K Rabada', full_name: 'Kagiso Rabada', team_name: 'South Africa', player_role: 'BWL', credits: 9.5, selection_percentage: 69.8, points: 42, is_playing_today: true, country: 'South Africa', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'A Markram', full_name: 'Aiden Markram', team_name: 'South Africa', player_role: 'BAT', credits: 9.0, selection_percentage: 62.4, points: 38, is_playing_today: true, country: 'South Africa', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'D Miller', full_name: 'David Miller', team_name: 'South Africa', player_role: 'BAT', credits: 8.5, selection_percentage: 57.9, points: 35, is_playing_today: true, country: 'South Africa', batting_style: 'LH', bowling_style: 'LH' },
  { name: 'A Nortje', full_name: 'Anrich Nortje', team_name: 'South Africa', player_role: 'BWL', credits: 8.0, selection_percentage: 51.3, points: 32, is_playing_today: true, country: 'South Africa', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'T Bavuma', full_name: 'Temba Bavuma', team_name: 'South Africa', player_role: 'BAT', credits: 7.5, selection_percentage: 45.7, points: 28, is_playing_today: true, country: 'South Africa', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'K Maharaj', full_name: 'Keshav Maharaj', team_name: 'South Africa', player_role: 'BWL', credits: 7.0, selection_percentage: 39.8, points: 25, is_playing_today: true, country: 'South Africa', batting_style: 'LH', bowling_style: 'LH' },
  { name: 'H Klaasen', full_name: 'Heinrich Klaasen', team_name: 'South Africa', player_role: 'WK', credits: 7.5, selection_percentage: 43.2, points: 27, is_playing_today: true, country: 'South Africa', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'M Jansen', full_name: 'Marco Jansen', team_name: 'South Africa', player_role: 'AR', credits: 7.0, selection_percentage: 37.6, points: 23, is_playing_today: true, country: 'South Africa', batting_style: 'LH', bowling_style: 'LH' },
  { name: 'T Shamsi', full_name: 'Tabraiz Shamsi', team_name: 'South Africa', player_role: 'BWL', credits: 6.5, selection_percentage: 33.4, points: 21, is_playing_today: true, country: 'South Africa', batting_style: 'LH', bowling_style: 'LH' },
  { name: 'L Ngidi', full_name: 'Lungi Ngidi', team_name: 'South Africa', player_role: 'BWL', credits: 6.5, selection_percentage: 35.8, points: 22, is_playing_today: true, country: 'South Africa', batting_style: 'RH', bowling_style: 'RH' },
  // Inactive players
  { name: 'R van der Dussen', full_name: 'Rassie van der Dussen', team_name: 'South Africa', player_role: 'BAT', credits: 6.0, selection_percentage: 21.5, points: 19, is_playing_today: false, country: 'South Africa', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'W Mulder', full_name: 'Wiaan Mulder', team_name: 'South Africa', player_role: 'AR', credits: 5.5, selection_percentage: 17.8, points: 16, is_playing_today: false, country: 'South Africa', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'B Fortuin', full_name: 'Bjorn Fortuin', team_name: 'South Africa', player_role: 'BWL', credits: 5.0, selection_percentage: 14.2, points: 13, is_playing_today: false, country: 'South Africa', batting_style: 'LH', bowling_style: 'LH' },
  { name: 'J Malan', full_name: 'Janneman Malan', team_name: 'South Africa', player_role: 'BAT', credits: 5.5, selection_percentage: 16.9, points: 15, is_playing_today: false, country: 'South Africa', batting_style: 'RH', bowling_style: 'RH' },

  // New Zealand Team (15 players - 11 active, 4 inactive)
  { name: 'K Williamson', full_name: 'Kane Williamson', team_name: 'New Zealand', player_role: 'BAT', credits: 10.5, selection_percentage: 77.3, points: 49, is_playing_today: true, country: 'New Zealand', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'T Boult', full_name: 'Trent Boult', team_name: 'New Zealand', player_role: 'BWL', credits: 9.0, selection_percentage: 64.7, points: 39, is_playing_today: true, country: 'New Zealand', batting_style: 'LH', bowling_style: 'LH' },
  { name: 'D Conway', full_name: 'Devon Conway', team_name: 'New Zealand', player_role: 'WK', credits: 8.5, selection_percentage: 58.9, points: 36, is_playing_today: true, country: 'New Zealand', batting_style: 'LH', bowling_style: 'RH' },
  { name: 'T Southee', full_name: 'Tim Southee', team_name: 'New Zealand', player_role: 'BWL', credits: 8.0, selection_percentage: 52.6, points: 33, is_playing_today: true, country: 'New Zealand', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'G Phillips', full_name: 'Glenn Phillips', team_name: 'New Zealand', player_role: 'AR', credits: 7.5, selection_percentage: 46.8, points: 29, is_playing_today: true, country: 'New Zealand', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'D Mitchell', full_name: 'Daryl Mitchell', team_name: 'New Zealand', player_role: 'AR', credits: 7.0, selection_percentage: 41.2, points: 26, is_playing_today: true, country: 'New Zealand', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'M Santner', full_name: 'Mitchell Santner', team_name: 'New Zealand', player_role: 'AR', credits: 6.5, selection_percentage: 37.4, points: 23, is_playing_today: true, country: 'New Zealand', batting_style: 'LH', bowling_style: 'LH' },
  { name: 'T Latham', full_name: 'Tom Latham', team_name: 'New Zealand', player_role: 'WK', credits: 7.0, selection_percentage: 39.6, points: 25, is_playing_today: true, country: 'New Zealand', batting_style: 'LH', bowling_style: 'RH' },
  { name: 'K Jamieson', full_name: 'Kyle Jamieson', team_name: 'New Zealand', player_role: 'BWL', credits: 6.5, selection_percentage: 35.8, points: 22, is_playing_today: true, country: 'New Zealand', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'R Ravindra', full_name: 'Rachin Ravindra', team_name: 'New Zealand', player_role: 'AR', credits: 6.0, selection_percentage: 32.4, points: 20, is_playing_today: true, country: 'New Zealand', batting_style: 'LH', bowling_style: 'LH' },
  { name: 'M Henry', full_name: 'Matt Henry', team_name: 'New Zealand', player_role: 'BWL', credits: 6.0, selection_percentage: 30.7, points: 19, is_playing_today: true, country: 'New Zealand', batting_style: 'RH', bowling_style: 'RH' },
  // Inactive players
  { name: 'C de Grandhomme', full_name: 'Colin de Grandhomme', team_name: 'New Zealand', player_role: 'AR', credits: 5.5, selection_percentage: 18.9, points: 17, is_playing_today: false, country: 'New Zealand', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'A Milne', full_name: 'Adam Milne', team_name: 'New Zealand', player_role: 'BWL', credits: 5.0, selection_percentage: 15.6, points: 14, is_playing_today: false, country: 'New Zealand', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'I Sodhi', full_name: 'Ish Sodhi', team_name: 'New Zealand', player_role: 'BWL', credits: 5.5, selection_percentage: 17.3, points: 16, is_playing_today: false, country: 'New Zealand', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'M Bracewell', full_name: 'Michael Bracewell', team_name: 'New Zealand', player_role: 'AR', credits: 5.0, selection_percentage: 13.8, points: 12, is_playing_today: false, country: 'New Zealand', batting_style: 'LH', bowling_style: 'RH' },

  // West Indies Team (15 players - 11 active, 4 inactive)
  { name: 'S Hope', full_name: 'Shai Hope', team_name: 'West Indies', player_role: 'WK', credits: 9.0, selection_percentage: 66.8, points: 40, is_playing_today: true, country: 'West Indies', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'J Holder', full_name: 'Jason Holder', team_name: 'West Indies', player_role: 'AR', credits: 8.5, selection_percentage: 59.4, points: 36, is_playing_today: true, country: 'West Indies', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'S Hetmyer', full_name: 'Shimron Hetmyer', team_name: 'West Indies', player_role: 'BAT', credits: 8.0, selection_percentage: 53.7, points: 32, is_playing_today: true, country: 'West Indies', batting_style: 'LH', bowling_style: 'RH' },
  { name: 'A Russell', full_name: 'Andre Russell', team_name: 'West Indies', player_role: 'AR', credits: 8.5, selection_percentage: 61.2, points: 37, is_playing_today: true, country: 'West Indies', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'A Joseph', full_name: 'Alzarri Joseph', team_name: 'West Indies', player_role: 'BWL', credits: 7.5, selection_percentage: 47.9, points: 29, is_playing_today: true, country: 'West Indies', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'K Pollard', full_name: 'Kieron Pollard', team_name: 'West Indies', player_role: 'AR', credits: 7.0, selection_percentage: 42.6, points: 26, is_playing_today: true, country: 'West Indies', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'R Shepherd', full_name: 'Romario Shepherd', team_name: 'West Indies', player_role: 'AR', credits: 6.5, selection_percentage: 38.4, points: 23, is_playing_today: true, country: 'West Indies', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'K Roach', full_name: 'Kemar Roach', team_name: 'West Indies', player_role: 'BWL', credits: 6.5, selection_percentage: 36.8, points: 22, is_playing_today: true, country: 'West Indies', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'N Pooran', full_name: 'Nicholas Pooran', team_name: 'West Indies', player_role: 'WK', credits: 7.5, selection_percentage: 45.3, points: 28, is_playing_today: true, country: 'West Indies', batting_style: 'LH', bowling_style: 'RH' },
  { name: 'A Hosein', full_name: 'Akeal Hosein', team_name: 'West Indies', player_role: 'BWL', credits: 6.0, selection_percentage: 33.7, points: 20, is_playing_today: true, country: 'West Indies', batting_style: 'LH', bowling_style: 'LH' },
  { name: 'B King', full_name: 'Brandon King', team_name: 'West Indies', player_role: 'BAT', credits: 6.0, selection_percentage: 31.9, points: 19, is_playing_today: true, country: 'West Indies', batting_style: 'RH', bowling_style: 'RH' },
  // Inactive players
  { name: 'E Lewis', full_name: 'Evin Lewis', team_name: 'West Indies', player_role: 'BAT', credits: 5.5, selection_percentage: 19.8, points: 17, is_playing_today: false, country: 'West Indies', batting_style: 'LH', bowling_style: 'RH' },
  { name: 'O McCoy', full_name: 'Obed McCoy', team_name: 'West Indies', player_role: 'BWL', credits: 5.0, selection_percentage: 16.4, points: 15, is_playing_today: false, country: 'West Indies', batting_style: 'LH', bowling_style: 'LH' },
  { name: 'K Carty', full_name: 'Keacy Carty', team_name: 'West Indies', player_role: 'BAT', credits: 4.5, selection_percentage: 12.7, points: 11, is_playing_today: false, country: 'West Indies', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'G Motie', full_name: 'Gudakesh Motie', team_name: 'West Indies', player_role: 'BWL', credits: 5.0, selection_percentage: 14.9, points: 13, is_playing_today: false, country: 'West Indies', batting_style: 'LH', bowling_style: 'LH' },

  // Sri Lanka Team (15 players - 11 active, 4 inactive)
  { name: 'K Mendis', full_name: 'Kusal Mendis', team_name: 'Sri Lanka', player_role: 'WK', credits: 8.5, selection_percentage: 61.4, points: 37, is_playing_today: true, country: 'Sri Lanka', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'W Hasaranga', full_name: 'Wanindu Hasaranga', team_name: 'Sri Lanka', player_role: 'AR', credits: 8.0, selection_percentage: 56.8, points: 34, is_playing_today: true, country: 'Sri Lanka', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'P Nissanka', full_name: 'Pathum Nissanka', team_name: 'Sri Lanka', player_role: 'BAT', credits: 7.5, selection_percentage: 49.6, points: 30, is_playing_today: true, country: 'Sri Lanka', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'C Karunaratne', full_name: 'Chamika Karunaratne', team_name: 'Sri Lanka', player_role: 'AR', credits: 7.0, selection_percentage: 43.8, points: 26, is_playing_today: true, country: 'Sri Lanka', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'M Theekshana', full_name: 'Maheesh Theekshana', team_name: 'Sri Lanka', player_role: 'BWL', credits: 6.5, selection_percentage: 39.7, points: 24, is_playing_today: true, country: 'Sri Lanka', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'D Shanaka', full_name: 'Dasun Shanaka', team_name: 'Sri Lanka', player_role: 'AR', credits: 6.5, selection_percentage: 37.9, points: 23, is_playing_today: true, country: 'Sri Lanka', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'L Kumara', full_name: 'Lahiru Kumara', team_name: 'Sri Lanka', player_role: 'BWL', credits: 6.0, selection_percentage: 34.6, points: 21, is_playing_today: true, country: 'Sri Lanka', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'D de Silva', full_name: 'Dhananjaya de Silva', team_name: 'Sri Lanka', player_role: 'AR', credits: 6.0, selection_percentage: 32.8, points: 20, is_playing_today: true, country: 'Sri Lanka', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'B Rajapaksa', full_name: 'Bhanuka Rajapaksa', team_name: 'Sri Lanka', player_role: 'BAT', credits: 5.5, selection_percentage: 29.4, points: 18, is_playing_today: true, country: 'Sri Lanka', batting_style: 'LH', bowling_style: 'RH' },
  { name: 'I Udana', full_name: 'Isuru Udana', team_name: 'Sri Lanka', player_role: 'BWL', credits: 5.5, selection_percentage: 27.6, points: 17, is_playing_today: true, country: 'Sri Lanka', batting_style: 'LH', bowling_style: 'LH' },
  { name: 'A Mathews', full_name: 'Angelo Mathews', team_name: 'Sri Lanka', player_role: 'AR', credits: 6.5, selection_percentage: 36.2, points: 22, is_playing_today: true, country: 'Sri Lanka', batting_style: 'RH', bowling_style: 'RH' },
  // Inactive players
  { name: 'K Perera', full_name: 'Kusal Perera', team_name: 'Sri Lanka', player_role: 'WK', credits: 5.0, selection_percentage: 18.7, points: 16, is_playing_today: false, country: 'Sri Lanka', batting_style: 'LH', bowling_style: 'RH' },
  { name: 'N Pradeep', full_name: 'Nuwan Pradeep', team_name: 'Sri Lanka', player_role: 'BWL', credits: 4.5, selection_percentage: 15.3, points: 13, is_playing_today: false, country: 'Sri Lanka', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'P Jayawickrama', full_name: 'Praveen Jayawickrama', team_name: 'Sri Lanka', player_role: 'BWL', credits: 4.5, selection_percentage: 13.8, points: 12, is_playing_today: false, country: 'Sri Lanka', batting_style: 'LH', bowling_style: 'LH' },
  { name: 'C Asalanka', full_name: 'Charith Asalanka', team_name: 'Sri Lanka', player_role: 'BAT', credits: 5.0, selection_percentage: 16.9, points: 14, is_playing_today: false, country: 'Sri Lanka', batting_style: 'LH', bowling_style: 'LH' },

  // Bangladesh Team (15 players - 11 active, 4 inactive)
  { name: 'S Al Hasan', full_name: 'Shakib Al Hasan', team_name: 'Bangladesh', player_role: 'AR', credits: 9.5, selection_percentage: 73.6, points: 44, is_playing_today: true, country: 'Bangladesh', batting_style: 'LH', bowling_style: 'LH' },
  { name: 'M Rahim', full_name: 'Mushfiqur Rahim', team_name: 'Bangladesh', player_role: 'WK', credits: 8.5, selection_percentage: 62.9, points: 38, is_playing_today: true, country: 'Bangladesh', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'L Das', full_name: 'Liton Das', team_name: 'Bangladesh', player_role: 'WK', credits: 7.5, selection_percentage: 51.7, points: 31, is_playing_today: true, country: 'Bangladesh', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'T Iqbal', full_name: 'Tamim Iqbal', team_name: 'Bangladesh', player_role: 'BAT', credits: 8.0, selection_percentage: 56.3, points: 34, is_playing_today: true, country: 'Bangladesh', batting_style: 'LH', bowling_style: 'RH' },
  { name: 'M Rahman', full_name: 'Mustafizur Rahman', team_name: 'Bangladesh', player_role: 'BWL', credits: 7.5, selection_percentage: 47.8, points: 29, is_playing_today: true, country: 'Bangladesh', batting_style: 'LH', bowling_style: 'LH' },
  { name: 'M Miraz', full_name: 'Mehidy Hasan Miraz', team_name: 'Bangladesh', player_role: 'AR', credits: 7.0, selection_percentage: 42.6, points: 26, is_playing_today: true, country: 'Bangladesh', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'A Hossain', full_name: 'Afif Hossain', team_name: 'Bangladesh', player_role: 'AR', credits: 6.5, selection_percentage: 38.9, points: 23, is_playing_today: true, country: 'Bangladesh', batting_style: 'LH', bowling_style: 'LH' },
  { name: 'T Ahmed', full_name: 'Taskin Ahmed', team_name: 'Bangladesh', player_role: 'BWL', credits: 6.5, selection_percentage: 36.4, points: 22, is_playing_today: true, country: 'Bangladesh', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'N Shanto', full_name: 'Najmul Hossain Shanto', team_name: 'Bangladesh', player_role: 'BAT', credits: 6.0, selection_percentage: 33.7, points: 20, is_playing_today: true, country: 'Bangladesh', batting_style: 'LH', bowling_style: 'LH' },
  { name: 'S Sarkar', full_name: 'Soumya Sarkar', team_name: 'Bangladesh', player_role: 'AR', credits: 5.5, selection_percentage: 29.8, points: 18, is_playing_today: true, country: 'Bangladesh', batting_style: 'LH', bowling_style: 'RH' },
  { name: 'E Haque', full_name: 'Ebadot Hossain Chowdhury', team_name: 'Bangladesh', player_role: 'BWL', credits: 5.5, selection_percentage: 27.4, points: 17, is_playing_today: true, country: 'Bangladesh', batting_style: 'RH', bowling_style: 'RH' },
  // Inactive players
  { name: 'M Hasan', full_name: 'Mahedi Hasan', team_name: 'Bangladesh', player_role: 'AR', credits: 5.0, selection_percentage: 19.6, points: 16, is_playing_today: false, country: 'Bangladesh', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'S Islam', full_name: 'Shoriful Islam', team_name: 'Bangladesh', player_role: 'BWL', credits: 4.5, selection_percentage: 16.8, points: 14, is_playing_today: false, country: 'Bangladesh', batting_style: 'LH', bowling_style: 'LH' },
  { name: 'Y Mahmud', full_name: 'Yasir Ali Chowdhury', team_name: 'Bangladesh', player_role: 'BAT', credits: 4.5, selection_percentage: 14.2, points: 12, is_playing_today: false, country: 'Bangladesh', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'N Ahmed', full_name: 'Nasum Ahmed', team_name: 'Bangladesh', player_role: 'BWL', credits: 4.0, selection_percentage: 11.7, points: 10, is_playing_today: false, country: 'Bangladesh', batting_style: 'LH', bowling_style: 'LH' },

  // Afghanistan Team (15 players - 11 active, 4 inactive)
  { name: 'R Khan', full_name: 'Rashid Khan', team_name: 'Afghanistan', player_role: 'AR', credits: 9.0, selection_percentage: 68.9, points: 41, is_playing_today: true, country: 'Afghanistan', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'M Nabi', full_name: 'Mohammad Nabi', team_name: 'Afghanistan', player_role: 'AR', credits: 8.0, selection_percentage: 57.6, points: 35, is_playing_today: true, country: 'Afghanistan', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'H Zazai', full_name: 'Hazratullah Zazai', team_name: 'Afghanistan', player_role: 'BAT', credits: 7.5, selection_percentage: 49.8, points: 30, is_playing_today: true, country: 'Afghanistan', batting_style: 'LH', bowling_style: 'RH' },
  { name: 'R Gurbaz', full_name: 'Rahmanullah Gurbaz', team_name: 'Afghanistan', player_role: 'WK', credits: 7.0, selection_percentage: 44.7, points: 27, is_playing_today: true, country: 'Afghanistan', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'F Ahmad', full_name: 'Fazalhaq Farooqi', team_name: 'Afghanistan', player_role: 'BWL', credits: 6.5, selection_percentage: 39.4, points: 24, is_playing_today: true, country: 'Afghanistan', batting_style: 'LH', bowling_style: 'LH' },
  { name: 'I Alikhil', full_name: 'Ikram Alikhil', team_name: 'Afghanistan', player_role: 'WK', credits: 6.0, selection_percentage: 35.8, points: 21, is_playing_today: true, country: 'Afghanistan', batting_style: 'LH', bowling_style: 'RH' },
  { name: 'A Omarzai', full_name: 'Azmatullah Omarzai', team_name: 'Afghanistan', player_role: 'AR', credits: 6.0, selection_percentage: 33.6, points: 20, is_playing_today: true, country: 'Afghanistan', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'M Ur Rahman', full_name: 'Mujeeb Ur Rahman', team_name: 'Afghanistan', player_role: 'BWL', credits: 5.5, selection_percentage: 30.7, points: 18, is_playing_today: true, country: 'Afghanistan', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'N Kharoti', full_name: 'Nangeyalia Kharoti', team_name: 'Afghanistan', player_role: 'BWL', credits: 5.0, selection_percentage: 27.3, points: 16, is_playing_today: true, country: 'Afghanistan', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'I Zadran', full_name: 'Ibrahim Zadran', team_name: 'Afghanistan', player_role: 'BAT', credits: 5.5, selection_percentage: 29.8, points: 17, is_playing_today: true, country: 'Afghanistan', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'G Naib', full_name: 'Gulbadin Naib', team_name: 'Afghanistan', player_role: 'AR', credits: 5.0, selection_percentage: 25.9, points: 15, is_playing_today: true, country: 'Afghanistan', batting_style: 'RH', bowling_style: 'RH' },
  // Inactive players
  { name: 'A Afghan', full_name: 'Asghar Afghan', team_name: 'Afghanistan', player_role: 'BAT', credits: 4.5, selection_percentage: 17.8, points: 14, is_playing_today: false, country: 'Afghanistan', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'H Shahidi', full_name: 'Hashmatullah Shahidi', team_name: 'Afghanistan', player_role: 'BAT', credits: 4.5, selection_percentage: 16.2, points: 13, is_playing_today: false, country: 'Afghanistan', batting_style: 'LH', bowling_style: 'RH' },
  { name: 'W Riaz', full_name: 'Wafadar Momand', team_name: 'Afghanistan', player_role: 'BWL', credits: 4.0, selection_percentage: 13.7, points: 11, is_playing_today: false, country: 'Afghanistan', batting_style: 'RH', bowling_style: 'RH' },
  { name: 'Q Ahmad', full_name: 'Qais Ahmad', team_name: 'Afghanistan', player_role: 'BWL', credits: 4.0, selection_percentage: 12.4, points: 10, is_playing_today: false, country: 'Afghanistan', batting_style: 'RH', bowling_style: 'RH' }
];

async function insertDummyData() {
  console.log('🚀 Starting dummy data insertion...');
  
  try {
    // Insert matches
    console.log('📊 Inserting matches...');
    for (const match of dummyMatches) {
      const insertedMatch = await neonDB.insertMatch(match);
      console.log(`✅ Inserted match: ${insertedMatch.team_name}`);
    }

    // Insert players
    console.log('👥 Inserting players...');
    for (const player of dummyPlayers) {
      const insertedPlayer = await neonDB.insertPlayer(player);
      console.log(`✅ Inserted player: ${insertedPlayer.name} (${insertedPlayer.team_name})`);
    }

    console.log('🎉 Dummy data insertion completed successfully!');
    
    // Verify data
    const matches = await neonDB.getAllMatches();
    const players = await neonDB.getAllPlayers();
    console.log(`📈 Summary: ${matches.length} matches and ${players.length} players inserted.`);
    
  } catch (error) {
    console.error('❌ Error inserting dummy data:', error);
  }
}

// Run the script
if (require.main === module) {
  insertDummyData().then(() => {
    console.log('Script completed.');
    process.exit(0);
  }).catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}

export { insertDummyData };
