-- Initial Stats
INSERT INTO stats (name, description) VALUES ('STR', 'Strength - Physical power for high damage');
INSERT INTO stats (name, description) VALUES ('AGI', 'Agility - Speed and evasive capabilities');
INSERT INTO stats (name, description) VALUES ('VIT', 'Vitality - Stamina and health recovery');
INSERT INTO stats (name, description) VALUES ('INT', 'Intelligence - Analysis and mental focus');
INSERT INTO stats (name, description) VALUES ('LUK', 'Luck - Probability of rewards and criticals');
INSERT INTO stats (name, description) VALUES ('SPD', 'Speed - Movement and execution quickness');
INSERT INTO stats (name, description) VALUES ('DISC', 'Discipline - Mental grit earned through consistency');

-- Initial Quest (Solo Leveling Daily Quest)
INSERT INTO quests (title, description, type, rank_difficulty, gold_reward, xp_reward) 
VALUES ('Daily Quest: Preparing to get stronger', '100 Push-ups, 100 Sit-ups, 100 Squats, 10km Run', 'DAILY', 'E', 500, 10000);

-- Initial Tip
INSERT INTO tips (title, description) VALUES ('Stay Hydrated', 'A good hunter always monitors their fluid intake during intense training sessions.');

-- Titles
INSERT INTO titles (name, description, price) VALUES ('Beginner', 'The journey begins.', 0);
INSERT INTO titles (name, description, price) VALUES ('Awakened', 'Broken through the initial limits.', 0);
INSERT INTO titles (name, description, price) VALUES ('Hard Worker', 'Unwavering dedication to training.', 0);
INSERT INTO titles (name, description, price) VALUES ('Apex', 'Standing at the top of the food chain.', 0);

-- Achievements
INSERT INTO achievements (title, description, icon_url, title_reward_id) VALUES ('The Beginning', 'Reach level 10', '/icons/level10.png', 1);
INSERT INTO achievements (title, description, icon_url, title_reward_id) VALUES ('Awakening', 'Reach level 50', '/icons/level50.png', 2);
INSERT INTO achievements (title, description, icon_url, title_reward_id) VALUES ('Dedicated Hunter', 'Complete 50 missions', '/icons/50missions.png', 3);
INSERT INTO achievements (title, description, icon_url, title_reward_id) VALUES ('Apex Predator', 'Reach the Diamond League', '/icons/diamond.png', 4);