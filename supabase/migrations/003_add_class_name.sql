-- Add class_name field to teams table
-- This allows storing the class separately from the team name
-- Example: name = "FC München", class_name = "5a"
-- Display will be: "FC München (5a)"

ALTER TABLE teams ADD COLUMN class_name TEXT;

-- Migrate existing data: copy current 'name' to 'class_name'
-- This preserves existing class names before users update to team names
UPDATE teams SET class_name = name WHERE class_name IS NULL;

-- Make class_name required after migration
ALTER TABLE teams ALTER COLUMN class_name SET NOT NULL;

-- Update standings view to include both name and class_name
-- The team_name will now be in format "Teamname (Class)"
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
