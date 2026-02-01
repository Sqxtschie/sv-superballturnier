-- Setup für Oberstufe Turnier
-- 2 Vierer-Gruppen mit Überkreuz-Playoffs (Winner + Loser Bracket)

-- Gruppe A: EF 2, Q1 Kohnen, Q1 LK, SV
-- Gruppe B: EF 1, Q1 Sczranka, Q2, Lehrer

-- Füge group_name Spalte zur teams Tabelle hinzu
ALTER TABLE teams ADD COLUMN IF NOT EXISTS group_name TEXT;

-- Lösche zuerst alte Oberstufen-Matches (wegen Foreign Key Constraints)
DELETE FROM playoff_matches WHERE team1_id IN (SELECT id FROM teams WHERE category = 'oberstufe');
DELETE FROM playoff_matches WHERE team2_id IN (SELECT id FROM teams WHERE category = 'oberstufe');
DELETE FROM group_matches WHERE team1_id IN (SELECT id FROM teams WHERE category = 'oberstufe');
DELETE FROM group_matches WHERE team2_id IN (SELECT id FROM teams WHERE category = 'oberstufe');

-- Jetzt können wir die Oberstufen-Teams löschen
DELETE FROM teams WHERE category = 'oberstufe';

-- Teams einfügen mit Gruppenbezeichnung
INSERT INTO teams (name, class_name, category, group_name) VALUES
  -- Gruppe A
  ('EF 2', 'EF 2', 'oberstufe', 'A'),
  ('Q1 Kohnen', 'Q1', 'oberstufe', 'A'),
  ('Q1 LK', 'Q1', 'oberstufe', 'A'),
  ('SV', 'SV', 'oberstufe', 'A'),
  -- Gruppe B
  ('EF 1', 'EF 1', 'oberstufe', 'B'),
  ('Q1 Sczranka', 'Q1', 'oberstufe', 'B'),
  ('Q2', 'Q2', 'oberstufe', 'B'),
  ('Lehrer', 'Lehrer', 'oberstufe', 'B');

-- =============================================
-- GRUPPENPHASE - Jeder gegen Jeden in der Gruppe
-- =============================================

-- Gruppe A Spiele (6 Spiele)
INSERT INTO group_matches (match_day, match_number, team1_id, team2_id) VALUES
-- Spieltag 1
(1, 201,
  (SELECT id FROM teams WHERE name = 'EF 2' AND category = 'oberstufe' LIMIT 1),
  (SELECT id FROM teams WHERE name = 'Q1 Kohnen' AND category = 'oberstufe' LIMIT 1)),
(1, 202,
  (SELECT id FROM teams WHERE name = 'Q1 LK' AND category = 'oberstufe' LIMIT 1),
  (SELECT id FROM teams WHERE name = 'SV' AND category = 'oberstufe' LIMIT 1)),
-- Spieltag 2
(2, 203,
  (SELECT id FROM teams WHERE name = 'EF 2' AND category = 'oberstufe' LIMIT 1),
  (SELECT id FROM teams WHERE name = 'Q1 LK' AND category = 'oberstufe' LIMIT 1)),
(2, 204,
  (SELECT id FROM teams WHERE name = 'Q1 Kohnen' AND category = 'oberstufe' LIMIT 1),
  (SELECT id FROM teams WHERE name = 'SV' AND category = 'oberstufe' LIMIT 1)),
-- Spieltag 3
(3, 205,
  (SELECT id FROM teams WHERE name = 'EF 2' AND category = 'oberstufe' LIMIT 1),
  (SELECT id FROM teams WHERE name = 'SV' AND category = 'oberstufe' LIMIT 1)),
(3, 206,
  (SELECT id FROM teams WHERE name = 'Q1 Kohnen' AND category = 'oberstufe' LIMIT 1),
  (SELECT id FROM teams WHERE name = 'Q1 LK' AND category = 'oberstufe' LIMIT 1));

-- Gruppe B Spiele (6 Spiele)
INSERT INTO group_matches (match_day, match_number, team1_id, team2_id) VALUES
-- Spieltag 1
(1, 211,
  (SELECT id FROM teams WHERE name = 'EF 1' AND category = 'oberstufe' LIMIT 1),
  (SELECT id FROM teams WHERE name = 'Q1 Sczranka' AND category = 'oberstufe' LIMIT 1)),
(1, 212,
  (SELECT id FROM teams WHERE name = 'Q2' AND category = 'oberstufe' LIMIT 1),
  (SELECT id FROM teams WHERE name = 'Lehrer' AND category = 'oberstufe' LIMIT 1)),
-- Spieltag 2
(2, 213,
  (SELECT id FROM teams WHERE name = 'EF 1' AND category = 'oberstufe' LIMIT 1),
  (SELECT id FROM teams WHERE name = 'Q2' AND category = 'oberstufe' LIMIT 1)),
(2, 214,
  (SELECT id FROM teams WHERE name = 'Q1 Sczranka' AND category = 'oberstufe' LIMIT 1),
  (SELECT id FROM teams WHERE name = 'Lehrer' AND category = 'oberstufe' LIMIT 1)),
-- Spieltag 3
(3, 215,
  (SELECT id FROM teams WHERE name = 'EF 1' AND category = 'oberstufe' LIMIT 1),
  (SELECT id FROM teams WHERE name = 'Lehrer' AND category = 'oberstufe' LIMIT 1)),
(3, 216,
  (SELECT id FROM teams WHERE name = 'Q1 Sczranka' AND category = 'oberstufe' LIMIT 1),
  (SELECT id FROM teams WHERE name = 'Q2' AND category = 'oberstufe' LIMIT 1));

-- =============================================
-- STANDINGS VIEWS FÜR GRUPPEN
-- =============================================

-- Standings View für Gruppe A
CREATE OR REPLACE VIEW standings_oberstufe_a AS
SELECT
  t.id AS team_id,
  CONCAT(t.name, ' (', t.class_name, ')') AS team_name,
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
WHERE t.category = 'oberstufe' AND t.group_name = 'A'
GROUP BY t.id, t.name, t.class_name
ORDER BY points DESC, goal_difference DESC, goals_for DESC;

-- Standings View für Gruppe B
CREATE OR REPLACE VIEW standings_oberstufe_b AS
SELECT
  t.id AS team_id,
  CONCAT(t.name, ' (', t.class_name, ')') AS team_name,
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
WHERE t.category = 'oberstufe' AND t.group_name = 'B'
GROUP BY t.id, t.name, t.class_name
ORDER BY points DESC, goal_difference DESC, goals_for DESC;

-- Gesamtstandings Oberstufe (für Übersicht)
DROP VIEW IF EXISTS standings_oberstufe;
CREATE OR REPLACE VIEW standings_oberstufe AS
SELECT
  t.id AS team_id,
  CONCAT(t.name, ' (', t.class_name, ')') AS team_name,
  t.group_name,
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
WHERE t.category = 'oberstufe'
GROUP BY t.id, t.name, t.class_name, t.group_name
ORDER BY t.group_name, points DESC, goal_difference DESC, goals_for DESC;
