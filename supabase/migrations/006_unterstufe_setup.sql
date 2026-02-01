-- Setup für Unterstufe Turnier
-- 6 Teams, Jeder gegen Jeden (Round Robin)
-- 5 Runden à 3 Spiele parallel = 15 Spiele total

-- Teams: 5a, 5b, 5c, 6a, 6b, 6c

-- Lösche zuerst alte Unterstufen-Matches (wegen Foreign Key Constraints)
DELETE FROM playoff_matches WHERE team1_id IN (SELECT id FROM teams WHERE category = 'unterstufe');
DELETE FROM playoff_matches WHERE team2_id IN (SELECT id FROM teams WHERE category = 'unterstufe');
DELETE FROM group_matches WHERE team1_id IN (SELECT id FROM teams WHERE category = 'unterstufe');
DELETE FROM group_matches WHERE team2_id IN (SELECT id FROM teams WHERE category = 'unterstufe');

-- Jetzt können wir die Unterstufen-Teams löschen
DELETE FROM teams WHERE category = 'unterstufe';

-- Teams einfügen (Name, Klasse)
INSERT INTO teams (name, class_name, category) VALUES
  ('SC Fireballs', '5a', 'unterstufe'),
  ('Die Teufels B', '5b', 'unterstufe'),
  ('Cobra Kai', '5c', 'unterstufe'),
  ('Die Simpsons', '6a', 'unterstufe'),
  ('BAB-SHARKS', '6b', 'unterstufe'),
  ('Die Stannis', '6c', 'unterstufe');

-- =============================================
-- GRUPPENPHASE - Jeder gegen Jeden (Round Robin)
-- 5 Runden, 3 Spiele pro Runde
-- =============================================

INSERT INTO group_matches (match_day, match_number, team1_id, team2_id) VALUES
-- Runde 1 (3 Spiele parallel)
(1, 301,
  (SELECT id FROM teams WHERE name = 'SC Fireballs' AND category = 'unterstufe' LIMIT 1),
  (SELECT id FROM teams WHERE name = 'Die Stannis' AND category = 'unterstufe' LIMIT 1)),
(1, 302,
  (SELECT id FROM teams WHERE name = 'Die Teufels B' AND category = 'unterstufe' LIMIT 1),
  (SELECT id FROM teams WHERE name = 'BAB-SHARKS' AND category = 'unterstufe' LIMIT 1)),
(1, 303,
  (SELECT id FROM teams WHERE name = 'Cobra Kai' AND category = 'unterstufe' LIMIT 1),
  (SELECT id FROM teams WHERE name = 'Die Simpsons' AND category = 'unterstufe' LIMIT 1)),

-- Runde 2 (3 Spiele parallel)
(2, 304,
  (SELECT id FROM teams WHERE name = 'SC Fireballs' AND category = 'unterstufe' LIMIT 1),
  (SELECT id FROM teams WHERE name = 'BAB-SHARKS' AND category = 'unterstufe' LIMIT 1)),
(2, 305,
  (SELECT id FROM teams WHERE name = 'Die Stannis' AND category = 'unterstufe' LIMIT 1),
  (SELECT id FROM teams WHERE name = 'Die Simpsons' AND category = 'unterstufe' LIMIT 1)),
(2, 306,
  (SELECT id FROM teams WHERE name = 'Die Teufels B' AND category = 'unterstufe' LIMIT 1),
  (SELECT id FROM teams WHERE name = 'Cobra Kai' AND category = 'unterstufe' LIMIT 1)),

-- Runde 3 (3 Spiele parallel)
(3, 307,
  (SELECT id FROM teams WHERE name = 'SC Fireballs' AND category = 'unterstufe' LIMIT 1),
  (SELECT id FROM teams WHERE name = 'Die Simpsons' AND category = 'unterstufe' LIMIT 1)),
(3, 308,
  (SELECT id FROM teams WHERE name = 'BAB-SHARKS' AND category = 'unterstufe' LIMIT 1),
  (SELECT id FROM teams WHERE name = 'Cobra Kai' AND category = 'unterstufe' LIMIT 1)),
(3, 309,
  (SELECT id FROM teams WHERE name = 'Die Stannis' AND category = 'unterstufe' LIMIT 1),
  (SELECT id FROM teams WHERE name = 'Die Teufels B' AND category = 'unterstufe' LIMIT 1)),

-- Runde 4 (3 Spiele parallel)
(4, 310,
  (SELECT id FROM teams WHERE name = 'SC Fireballs' AND category = 'unterstufe' LIMIT 1),
  (SELECT id FROM teams WHERE name = 'Cobra Kai' AND category = 'unterstufe' LIMIT 1)),
(4, 311,
  (SELECT id FROM teams WHERE name = 'Die Simpsons' AND category = 'unterstufe' LIMIT 1),
  (SELECT id FROM teams WHERE name = 'Die Teufels B' AND category = 'unterstufe' LIMIT 1)),
(4, 312,
  (SELECT id FROM teams WHERE name = 'BAB-SHARKS' AND category = 'unterstufe' LIMIT 1),
  (SELECT id FROM teams WHERE name = 'Die Stannis' AND category = 'unterstufe' LIMIT 1)),

-- Runde 5 (3 Spiele parallel)
(5, 313,
  (SELECT id FROM teams WHERE name = 'SC Fireballs' AND category = 'unterstufe' LIMIT 1),
  (SELECT id FROM teams WHERE name = 'Die Teufels B' AND category = 'unterstufe' LIMIT 1)),
(5, 314,
  (SELECT id FROM teams WHERE name = 'Cobra Kai' AND category = 'unterstufe' LIMIT 1),
  (SELECT id FROM teams WHERE name = 'Die Stannis' AND category = 'unterstufe' LIMIT 1)),
(5, 315,
  (SELECT id FROM teams WHERE name = 'Die Simpsons' AND category = 'unterstufe' LIMIT 1),
  (SELECT id FROM teams WHERE name = 'BAB-SHARKS' AND category = 'unterstufe' LIMIT 1));

-- =============================================
-- STANDINGS VIEW FÜR UNTERSTUFE
-- =============================================

DROP VIEW IF EXISTS standings_unterstufe;
CREATE OR REPLACE VIEW standings_unterstufe AS
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
WHERE t.category = 'unterstufe'
GROUP BY t.id, t.name, t.class_name
ORDER BY points DESC, goal_difference DESC, goals_for DESC;
