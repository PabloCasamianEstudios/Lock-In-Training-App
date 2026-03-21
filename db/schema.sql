-- LockIn Database Schema (Solo Leveling Fit)

CREATE DATABASE IF NOT EXISTS lockin_db;
USE lockin_db;

-- 1. Users table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    profile_pic VARCHAR(255),
    nickname VARCHAR(50), -- "The Monster", "Beginner", etc.
    rank_level VARCHAR(5) DEFAULT 'D', -- S, A, B, C, D, SS...
    level INT DEFAULT 1,
    xp BIGINT DEFAULT 0,
    coins INT DEFAULT 0,
    streak INT DEFAULT 0,
    role VARCHAR(20) DEFAULT 'USER', -- USER, ADMIN
    weight FLOAT,
    height FLOAT,
    birth_date DATE,
    gender VARCHAR(20),
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Stats definitions (Physical attributes)
CREATE TABLE stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL, -- Strength, Agility, Sense, Vitality, Intelligence
    description TEXT
);

-- 3. User Stats mapping
CREATE TABLE user_stats (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    stat_id INT NOT NULL,
    value INT DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (stat_id) REFERENCES stats(id) ON DELETE CASCADE
);

-- 4. Achievements
CREATE TABLE achievements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(255)
);

CREATE TABLE user_achievements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    achievement_id INT NOT NULL,
    obtained_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE
);

-- 5. Titles
CREATE TABLE titles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(255)
);

CREATE TABLE user_titles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title_id INT NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (title_id) REFERENCES titles(id) ON DELETE CASCADE
);

-- 6. Leagues
CREATE TABLE leagues (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL, -- Bronze, Silver, Gold, Platinum, Diamond, Master, Grandmaster
    min_rank INT DEFAULT 0,
    reward_multiplier FLOAT DEFAULT 1.0,
    xp_bonus INT DEFAULT 0
);

-- 7. Missions (Single exercises)
CREATE TABLE missions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(50), -- Strength, Cardio, Flexibility
    difficulty VARCHAR(20), -- EASY, NORMAL, HARD, HELL
    xp_reward INT DEFAULT 10,
    gold_reward INT DEFAULT 5,
    stat_boost_id INT, -- Links to stats table
    stat_boost_amount INT DEFAULT 1,
    reps INT DEFAULT 0,
    duration_sec INT DEFAULT 0,
    FOREIGN KEY (stat_boost_id) REFERENCES stats(id)
);

-- 8. Quests (Workouts - collection of missions)
CREATE TABLE quests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    owner_id BIGINT, -- If null, it's a system quest
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50),
    difficulty VARCHAR(20),
    total_xp INT DEFAULT 0,
    total_gold INT DEFAULT 0,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE quest_missions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    quest_id BIGINT NOT NULL,
    mission_id BIGINT NOT NULL,
    FOREIGN KEY (quest_id) REFERENCES quests(id) ON DELETE CASCADE,
    FOREIGN KEY (mission_id) REFERENCES missions(id) ON DELETE CASCADE
);

-- 9. User Quest Progress
CREATE TABLE user_quests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    quest_id BIGINT NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, COMPLETED, FAILED
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (quest_id) REFERENCES quests(id) ON DELETE CASCADE
);

-- 10. Tips
CREATE TABLE tips (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(255),
    image_url VARCHAR(255)
);

-- 11. Feed (Global notes from admins)
CREATE TABLE feed (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    author_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert basic stats
INSERT INTO stats (name, description) VALUES ('Strength', 'Pure physical power');
INSERT INTO stats (name, description) VALUES ('Agility', 'Speed and reflexes');
INSERT INTO stats (name, description) VALUES ('Intelligence', 'Focus and strategy');
INSERT INTO stats (name, description) VALUES ('Sense', 'Awareness and recovery');
INSERT INTO stats (name, description) VALUES ('Vitality', 'Endurance and health');
