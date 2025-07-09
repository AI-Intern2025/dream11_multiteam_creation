-- Neon DB Schema for Fantasy Team Creation Assistant

-- Drop tables if they exist (for fresh setup)
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS players CASCADE;
DROP TABLE IF EXISTS matches CASCADE;

-- Create matches table
CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    team_name TEXT NOT NULL,                -- The teams playing in the match (e.g., "India vs Australia")
    match_venue TEXT NOT NULL,              -- Venue of the match
    match_date DATE NOT NULL,               -- The date of the match
    match_format TEXT NOT NULL,             -- Format of the match (e.g., T20, ODI, Test)
    is_active BOOLEAN DEFAULT false,        -- Whether the match is active (still in progress or upcoming)
    start_time TIME NOT NULL,               -- Start time of the match
    end_time TIME,                          -- End time of the match (if applicable)
    is_upcoming BOOLEAN DEFAULT true,       -- Flag to check if the match is upcoming
    status TEXT DEFAULT 'Scheduled',        -- Status of the match (e.g., Scheduled, Completed, Canceled)
    venue_condition TEXT,                   -- Condition of the match venue (e.g., 'Dry', 'Wet', 'Neutral')
    pitch_condition TEXT,                   -- Pitch condition (e.g., 'Flat', 'Spin-friendly', 'Bouncy', 'Seam-friendly')
    weather_condition TEXT,                 -- Weather condition during the match (e.g., 'Clear', 'Overcast', 'Rainy', 'Humid')
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create players table
CREATE TABLE players (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,                     -- Name of the player
    full_name TEXT,                         -- Full name of the player
    team_name TEXT NOT NULL,                -- Team name (e.g., 'India', 'Australia')
    player_role TEXT NOT NULL,              -- Role of the player (e.g., BAT, BWL, AR, WK)
    credits FLOAT NOT NULL,                 -- Credit value of the player (based on their form)
    selection_percentage FLOAT DEFAULT 0,   -- Percentage of how often the player is selected by others
    points INTEGER DEFAULT 0,               -- Points earned by the player based on their recent performance
    is_playing_today BOOLEAN DEFAULT false, -- Whether the player is playing today (based on match status)
    country TEXT,                           -- Country of the player
    batting_style TEXT,                     -- Batting style (RH/LH)
    bowling_style TEXT,                     -- Bowling style (RH/LH)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create users table for authentication
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',      -- 'admin' or 'user'
    email TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_matches_date ON matches(match_date);
CREATE INDEX idx_matches_active ON matches(is_active);
CREATE INDEX idx_matches_upcoming ON matches(is_upcoming);
CREATE INDEX idx_players_team ON players(team_name);
CREATE INDEX idx_players_role ON players(player_role);
CREATE INDEX idx_players_credits ON players(credits);
CREATE INDEX idx_players_playing ON players(is_playing_today);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);

-- Insert default admin user (password: admin123)
INSERT INTO users (username, password_hash, role, email) VALUES 
('admin', '$2a$10$k8Y1THII6w.VNJk3H8I8VeU.5/q6.BN/Z8R5K5L5rV7m7Q5H1K5v.', 'admin', 'admin@fantasycricket.com');

-- Insert default regular user (password: user123)
INSERT INTO users (username, password_hash, role, email) VALUES 
('user', '$2a$10$k8Y1THII6w.VNJk3H8I8VeU.5/q6.BN/Z8R5K5L5rV7m7Q5H1K5v.', 'user', 'user@fantasycricket.com');
