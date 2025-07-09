Modular Instruction File: Fantasy Team Creation Assistant with Admin Role and AI Integration
Objective
The objective of these modifications is to enhance the Fantasy Team Creation Assistant project by:
Integrating AI analysis within the existing team creation strategies.
Implementing a login system with role-based access for Admin and User.
Enabling dummy data upload into Neon DB for match and player data.
Keeping the existing strategies intact, while enhancing them with AI-based recommendations for player selection, captaincy suggestions, and strategy adjustments.

1. Database Setup (Neon DB)
1.1 Neon DB Database Schema
The database schema will consist of two main tables: matches and players. The data will be uploaded manually by the Admin based on the given structure.

Matches Table Schema:
sql
CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    team_name TEXT,                -- The teams playing in the match
    match_venue TEXT,              -- Venue of the match
    match_date DATE,               -- The date of the match
    match_format TEXT,             -- Format of the match (e.g., T20, ODI, Test)
    is_active BOOLEAN,             -- Whether the match is active (still in progress or upcoming)
    start_time TIME,               -- Start time of the match
    end_time TIME,                 -- End time of the match (if applicable)
    is_upcoming BOOLEAN,           -- Flag to check if the match is upcoming
    status TEXT,                   -- Status of the match (e.g., Scheduled, Completed, Canceled)
    venue_condition TEXT,          -- Condition of the match venue (e.g., 'Dry', 'Wet', 'Neutral')
    pitch_condition TEXT,          -- Pitch condition (e.g., 'Flat', 'Spin-friendly', 'Bouncy', 'Seam-friendly')
    weather_condition TEXT         -- Weather condition during the match (e.g., 'Clear', 'Overcast', 'Rainy', 'Humid')
);
Players Table Schema:
sql
CREATE TABLE players (
    id SERIAL PRIMARY KEY,
    name TEXT,                     -- Name of the player
    full_name TEXT,                -- Full name of the player
    team_name TEXT,                -- Team name (e.g., 'India', 'Australia')
    player_role TEXT,              -- Role of the player (e.g., BAT, BWL, AR)
    credits FLOAT,                 -- Credit value of the player (based on their form)
    selection_percentage FLOAT,    -- Percentage of how often the player is selected by others
    points INTEGER,                -- Points earned by the player based on their recent performance
    is_playing_today BOOLEAN,      -- Whether the player is playing today (based on match status)
    country TEXT,                  -- Country of the player
    batting_style TEXT,            -- Batting style (RH/LH)
    bowling_style TEXT             -- Bowling style (RH/LH)
);
1.2 Admin Upload Process
Admin Uploads match and player data into the Neon DB tables.
The data will include match schedules, team names, player credits, selection percentage, and match conditions.
Data Integrity: Admin must ensure the data is valid and accurate before uploading into the database.
2. AI Integration in Existing Strategies
2.1 AI Analysis in Pre-Existing Strategies
AI integration is a core part of the strategies and will assist in generating optimal team selections, player recommendations, and captaincy suggestions. This AI analysis is NOT a new section but enhances the functionality of the existing strategies.

The AI will analyze the following:
Player Credits: Helps the AI recommend players based on their credits (high credits for safe picks, low credits for risky but high-reward picks).
Selection Percentage: Balances between popular picks and differential picks.
Player Points: Evaluates players' recent form.
Pitch & Weather Conditions: Provides recommendations based on conditions that favor certain types of players (e.g., fast bowlers in overcast conditions, spinners on spin-friendly pitches).
AI-Driven Suggestions will be integrated within the following strategies:

Strategy 1: AI-Guided Chatbot (Pre-Match Team Creation Assistant)
The AI will help guide the user to select players based on the pitch/weather conditions and player form.

Strategy 2: Same XI, Different Captains
AI will analyze form and conditions to suggest which captain/vice-captain pairings will be most effective based on the chosen XI.

Strategy 3: Score & Storyline Prediction
The AI will incorporate pitch/weather analysis to make predictions about the match's scoring and suggest players accordingly.

Strategy 4: Core-Hedge Player Selection
The AI will suggest how to mix high-reward (low credit) and safe picks (high credit), factoring in player form and match conditions.

Strategy 5: Stats-Driven Guardrails
The AI will work with user-defined filters (e.g., selection percentage, Dream Team percentage) to suggest players who meet these criteria, based on form and match conditions.
Strategy 6: Preset Scenarios / Configurations
AI will adjust player selection based on the preset scenarios (e.g., “High differentials,” “Team A high total, Team B collapse”) and match conditions like pitch/weather.

Strategy 7: Role-Split Lineups
AI will optimize player selection based on defined role ratios (e.g., batsmen, bowlers, all-rounders) and adjust for pitch/weather conditions.

Strategy 8: Base Team + Rule-Based Edits
AI will apply minor edits to the baseline team based on optimization rules, ensuring balance between roles, preferences, and match conditions.

3. Login System with Role-Based Redirection
3.1 Implementing the Login System
Admin Login: Admin will use a username and password to access the Admin Panel for uploading match and player data.
User Login: Regular users will also use username and password to access the match selection page.

3.1.1 Admin Redirection
After successful login, admins will be redirected to the Admin Panel where they can upload data, view matches, and modify player details.

3.1.2 User Redirection
Users will be redirected to the match selection page where they can view the available matches and start creating their fantasy teams.

4. Dummy Data Upload for Testing
4.1 Adding Dummy Data to Neon DB
The admin will upload the following dummy data:
5 Matches (for 10 teams)
For each match, the admin will upload 15 players per team, with 11 players active and 4 players inactive.

4.1.1 Match Data (5 Matches)
The admin will upload data regarding the match format, venue, pitch, weather, and teams playing in each match. Each match will be associated with 2 teams.

4.1.2 Player Data (150 Players)
15 players per team with attributes such as:
Player Credits
Selection Percentage
Points
Active Status (11 active, 4 inactive)
for now create a script which push the dummy data to neondb


5. Step-by-Step Workflow for Changes
Step 1: Set Up Neon DB Schema
Follow the provided SQL schema to create the matches and players tables in Neon DB.

Step 2: Admin Login and Data Upload
Implement the login system and differentiate admin and user roles.
Admin can access the Admin Panel and upload match and player data.
Admin uploads 5 matches and 150 players (11 active and 4 inactive per team).

Step 3: Fetch Data from Neon DB
The application will fetch the required match details and player details from the Neon DB tables.

Step 4: AI Analysis for Player Selection
AI will analyze the fetched data (credits, selection percentage, player points, pitch, weather) to make recommendations.
The AI will adjust recommendations based on match conditions, player form, and role requirements.

Step 5: Generate Fantasy Teams
Based on AI analysis, the system will generate fantasy teams with captain/vice-captain suggestions, role distributions, and player recommendations.

6. Technologies Used
Neon DB for storing match and player data.
AI/ML Model for analyzing player data based on credits, selection percentage, points, pitch/weather conditions.
JavaScript/Node.js for backend integration.
OpenAI GPT-3 (or a custom AI model) for generating recommendations.

Key Changes:
Database Setup in Neon DB for match and player details.
AI Analysis integrated within the existing team creation strategies.
Dynamic Player Selection and Captain/Vice-Captain Suggestions.
Admin Upload Process for match and player data.
Login System with user differentiation.
This updated workflow ensures that Fantasy Team Creation Assistant dynamically analyzes uploaded data, generates optimal teams based on form and conditions, and enhances the user experience by suggesting players based on AI-driven insights.






