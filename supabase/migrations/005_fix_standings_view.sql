-- Fix: Aktualisiere standings View für Mittelstufe
-- - Füge class_name Format hinzu
-- - Stelle sicher, dass nur Mittelstufe Teams angezeigt werden
-- - Lösche alte Oberstufe-Teams die eventuell noch übrig sind

-- Lösche alte Oberstufe-Teams die eventuell noch von Migration 001 übrig sind
DELETE FROM teams
WHERE category = 'oberstufe'
AND name NOT IN ('EF 1', 'EF 2', 'Q1 Kohnen', 'Q1 Sczranka', 'Q1 LK', 'Q2', 'Lehrer', 'SV');

DROP VIEW IF EXISTS standings;

CREATE OR REPLACE VIEW standings AS
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
WHERE t.category = 'mittelstufe'
GROUP BY t.id, t.name, t.class_name
ORDER BY points DESC, goal_difference DESC, goals_for DESC;
