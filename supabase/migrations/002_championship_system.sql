-- Neue Migration für Meisterschafts-System
-- Löscht altes Double-Elimination System und erstellt Gruppenphase + Playoffs

-- Alte Tabellen und Types löschen
DROP TABLE IF EXISTS matches CASCADE;
DROP TYPE IF EXISTS bracket_type CASCADE;

-- Neue Types
CREATE TYPE match_phase AS ENUM ('group', 'playoff');
CREATE TYPE playoff_round AS ENUM ('halbfinale', 'finale', 'kleines_finale');

-- Gruppenphase Matches Tabelle
CREATE TABLE group_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_day INTEGER NOT NULL, -- Spieltag (1, 2, 3, 4)
  match_number INTEGER NOT NULL, -- Nummer innerhalb des Spieltags
  team1_id UUID REFERENCES teams(id),
  team2_id UUID REFERENCES teams(id),
  team1_score INTEGER, -- NULL wenn noch nicht gespielt
  team2_score INTEGER, -- NULL wenn noch nicht gespielt
  status match_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  CONSTRAINT different_teams CHECK (team1_id != team2_id)
);

-- Playoff Matches Tabelle
CREATE TABLE playoff_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  round playoff_round NOT NULL,
  match_number INTEGER NOT NULL, -- 1 oder 2 für Halbfinale
  team1_id UUID REFERENCES teams(id),
  team2_id UUID REFERENCES teams(id),
  team1_score INTEGER,
  team2_score INTEGER,
  winner_id UUID REFERENCES teams(id),
  status match_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  CONSTRAINT different_teams CHECK (team1_id != team2_id)
);

-- Trigger für updated_at
CREATE TRIGGER update_group_matches_updated_at
BEFORE UPDATE ON group_matches
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_playoff_matches_updated_at
BEFORE UPDATE ON playoff_matches
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE group_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE playoff_matches ENABLE ROW LEVEL SECURITY;

-- Jeder kann Matches lesen
CREATE POLICY "Group matches sind öffentlich lesbar" ON group_matches
  FOR SELECT USING (true);

CREATE POLICY "Playoff matches sind öffentlich lesbar" ON playoff_matches
  FOR SELECT USING (true);

-- Nur Admins können Matches erstellen/aktualisieren
CREATE POLICY "Nur Admins können Group matches erstellen" ON group_matches
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT id FROM admin_users)
  );

CREATE POLICY "Nur Admins können Group matches aktualisieren" ON group_matches
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM admin_users)
  );

CREATE POLICY "Nur Admins können Playoff matches erstellen" ON playoff_matches
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT id FROM admin_users)
  );

CREATE POLICY "Nur Admins können Playoff matches aktualisieren" ON playoff_matches
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM admin_users)
  );

-- View für Tabelle/Standings (automatisch berechnet)
CREATE OR REPLACE VIEW standings AS
SELECT
  t.id AS team_id,
  t.name AS team_name,
  COUNT(gm.id) AS played,
  SUM(CASE
    WHEN (gm.team1_id = t.id AND gm.team1_score > gm.team2_score) OR
         (gm.team2_id = t.id AND gm.team2_score > gm.team1_score)
    THEN 1 ELSE 0
  END) AS won,
  SUM(CASE
    WHEN gm.team1_score = gm.team2_score AND gm.team1_score IS NOT NULL
    THEN 1 ELSE 0
  END) AS drawn,
  SUM(CASE
    WHEN (gm.team1_id = t.id AND gm.team1_score < gm.team2_score) OR
         (gm.team2_id = t.id AND gm.team2_score < gm.team1_score)
    THEN 1 ELSE 0
  END) AS lost,
  SUM(CASE
    WHEN gm.team1_id = t.id THEN COALESCE(gm.team1_score, 0)
    WHEN gm.team2_id = t.id THEN COALESCE(gm.team2_score, 0)
    ELSE 0
  END) AS goals_for,
  SUM(CASE
    WHEN gm.team1_id = t.id THEN COALESCE(gm.team2_score, 0)
    WHEN gm.team2_id = t.id THEN COALESCE(gm.team1_score, 0)
    ELSE 0
  END) AS goals_against,
  SUM(CASE
    WHEN gm.team1_id = t.id THEN COALESCE(gm.team1_score, 0) - COALESCE(gm.team2_score, 0)
    WHEN gm.team2_id = t.id THEN COALESCE(gm.team2_score, 0) - COALESCE(gm.team1_score, 0)
    ELSE 0
  END) AS goal_difference,
  SUM(CASE
    WHEN (gm.team1_id = t.id AND gm.team1_score > gm.team2_score) OR
         (gm.team2_id = t.id AND gm.team2_score > gm.team1_score)
    THEN 3
    WHEN gm.team1_score = gm.team2_score AND gm.team1_score IS NOT NULL
    THEN 1
    ELSE 0
  END) AS points
FROM teams t
LEFT JOIN group_matches gm ON (gm.team1_id = t.id OR gm.team2_id = t.id)
WHERE t.category = 'mittelstufe'
GROUP BY t.id, t.name
ORDER BY points DESC, goal_difference DESC, goals_for DESC;

-- Initial Gruppenphase Spiele einfügen
-- Spieltag 1
INSERT INTO group_matches (match_day, match_number, team1_id, team2_id) VALUES
-- Zeitslot 1 (3 Spiele gleichzeitig)
(1, 1, (SELECT id FROM teams WHERE name = '8b' AND category = 'mittelstufe'), (SELECT id FROM teams WHERE name = '7a' AND category = 'mittelstufe')),
(1, 2, (SELECT id FROM teams WHERE name = '10c' AND category = 'mittelstufe'), (SELECT id FROM teams WHERE name = '10b' AND category = 'mittelstufe')),
(1, 3, (SELECT id FROM teams WHERE name = '9a' AND category = 'mittelstufe'), (SELECT id FROM teams WHERE name = '9b' AND category = 'mittelstufe')),
-- Zeitslot 2 (3 Spiele gleichzeitig)
(1, 4, (SELECT id FROM teams WHERE name = '9a' AND category = 'mittelstufe'), (SELECT id FROM teams WHERE name = '7b' AND category = 'mittelstufe')),
(1, 5, (SELECT id FROM teams WHERE name = '7c' AND category = 'mittelstufe'), (SELECT id FROM teams WHERE name = '8c' AND category = 'mittelstufe')),
(1, 6, (SELECT id FROM teams WHERE name = '8a' AND category = 'mittelstufe'), (SELECT id FROM teams WHERE name = '10c' AND category = 'mittelstufe'));

-- Spieltag 2
INSERT INTO group_matches (match_day, match_number, team1_id, team2_id) VALUES
-- Zeitslot 1
(2, 1, (SELECT id FROM teams WHERE name = '10a' AND category = 'mittelstufe'), (SELECT id FROM teams WHERE name = '9a' AND category = 'mittelstufe')),
(2, 2, (SELECT id FROM teams WHERE name = '10b' AND category = 'mittelstufe'), (SELECT id FROM teams WHERE name = '8b' AND category = 'mittelstufe')),
(2, 3, (SELECT id FROM teams WHERE name = '7a' AND category = 'mittelstufe'), (SELECT id FROM teams WHERE name = '7c' AND category = 'mittelstufe')),
-- Zeitslot 2
(2, 4, (SELECT id FROM teams WHERE name = '9a' AND category = 'mittelstufe'), (SELECT id FROM teams WHERE name = '8a' AND category = 'mittelstufe')),
(2, 5, (SELECT id FROM teams WHERE name = '8c' AND category = 'mittelstufe'), (SELECT id FROM teams WHERE name = '9b' AND category = 'mittelstufe')),
(2, 6, (SELECT id FROM teams WHERE name = '10a' AND category = 'mittelstufe'), (SELECT id FROM teams WHERE name = '10b' AND category = 'mittelstufe'));

-- Spieltag 3
INSERT INTO group_matches (match_day, match_number, team1_id, team2_id) VALUES
-- Zeitslot 1
(3, 1, (SELECT id FROM teams WHERE name = '7b' AND category = 'mittelstufe'), (SELECT id FROM teams WHERE name = '9b' AND category = 'mittelstufe')),
(3, 2, (SELECT id FROM teams WHERE name = '7c' AND category = 'mittelstufe'), (SELECT id FROM teams WHERE name = '10b' AND category = 'mittelstufe')),
(3, 3, (SELECT id FROM teams WHERE name = '8b' AND category = 'mittelstufe'), (SELECT id FROM teams WHERE name = '8a' AND category = 'mittelstufe')),
-- Zeitslot 2
(3, 4, (SELECT id FROM teams WHERE name = '10c' AND category = 'mittelstufe'), (SELECT id FROM teams WHERE name = '8c' AND category = 'mittelstufe')),
(3, 5, (SELECT id FROM teams WHERE name = '10a' AND category = 'mittelstufe'), (SELECT id FROM teams WHERE name = '7b' AND category = 'mittelstufe')),
(3, 6, (SELECT id FROM teams WHERE name = '7a' AND category = 'mittelstufe'), (SELECT id FROM teams WHERE name = '8b' AND category = 'mittelstufe'));

-- Spieltag 4
INSERT INTO group_matches (match_day, match_number, team1_id, team2_id) VALUES
-- Zeitslot 1
(4, 1, (SELECT id FROM teams WHERE name = '7b' AND category = 'mittelstufe'), (SELECT id FROM teams WHERE name = '7c' AND category = 'mittelstufe')),
(4, 2, (SELECT id FROM teams WHERE name = '7a' AND category = 'mittelstufe'), (SELECT id FROM teams WHERE name = '10c' AND category = 'mittelstufe')),
(4, 3, (SELECT id FROM teams WHERE name = '8c' AND category = 'mittelstufe'), (SELECT id FROM teams WHERE name = '10a' AND category = 'mittelstufe')),
-- Zeitslot 2
(4, 4, (SELECT id FROM teams WHERE name = '8a' AND category = 'mittelstufe'), (SELECT id FROM teams WHERE name = '9b' AND category = 'mittelstufe'));
