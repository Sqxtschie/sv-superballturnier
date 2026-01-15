-- Seed Daten für Entwicklung
-- Dieses Skript erstellt die initialen Turnierbäume

-- Funktion zum Erstellen des Double Elimination Brackets
CREATE OR REPLACE FUNCTION create_tournament_bracket(
  p_category category_type,
  p_team_ids UUID[]
) RETURNS void AS $$
DECLARE
  num_teams INTEGER;
  num_rounds INTEGER;
  team_id UUID;
  match_id UUID;
BEGIN
  num_teams := array_length(p_team_ids, 1);

  -- Berechne Anzahl der Runden für Winner Bracket
  num_rounds := CEIL(LOG(2, num_teams));

  -- TODO: Hier die vollständige Bracket-Logik implementieren
  -- Dies ist ein Platzhalter für die initiale Bracket-Erstellung

END;
$$ LANGUAGE plpgsql;

-- Kommentar: Die Bracket-Logik wird im Backend/Frontend implementiert
-- da sie komplex ist und besser in TypeScript gehandhabt werden kann
