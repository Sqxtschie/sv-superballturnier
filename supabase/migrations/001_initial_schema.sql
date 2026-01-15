-- Kategorien für die Turnierbäume
CREATE TYPE category_type AS ENUM ('unterstufe', 'mittelstufe', 'oberstufe');
CREATE TYPE bracket_type AS ENUM ('winner', 'loser');
CREATE TYPE match_status AS ENUM ('pending', 'in_progress', 'completed');

-- Teams Tabelle
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category category_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Matches Tabelle
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category category_type NOT NULL,
  bracket bracket_type NOT NULL,
  round INTEGER NOT NULL,
  match_number INTEGER NOT NULL,
  team1_id UUID REFERENCES teams(id),
  team2_id UUID REFERENCES teams(id),
  winner_id UUID REFERENCES teams(id),
  status match_status DEFAULT 'pending',
  position_in_round INTEGER NOT NULL,
  next_match_id UUID REFERENCES matches(id),
  next_match_position INTEGER, -- 1 oder 2 (welche Position im nächsten Match)
  loser_next_match_id UUID REFERENCES matches(id), -- für Loser Bracket
  loser_next_match_position INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Admin Users Tabelle (für Supabase Auth)
CREATE TABLE admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_matches_updated_at
BEFORE UPDATE ON matches
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Jeder kann Teams und Matches lesen
CREATE POLICY "Teams sind öffentlich lesbar" ON teams
  FOR SELECT USING (true);

CREATE POLICY "Matches sind öffentlich lesbar" ON matches
  FOR SELECT USING (true);

-- Nur Admins können Daten ändern
CREATE POLICY "Nur Admins können Teams erstellen" ON teams
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT id FROM admin_users)
  );

CREATE POLICY "Nur Admins können Matches aktualisieren" ON matches
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM admin_users)
  );

CREATE POLICY "Nur Admins können Matches erstellen" ON matches
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT id FROM admin_users)
  );

-- Initial Teams einfügen
INSERT INTO teams (name, category) VALUES
  -- Unterstufe
  ('5a', 'unterstufe'),
  ('5b', 'unterstufe'),
  ('5c', 'unterstufe'),
  ('6a', 'unterstufe'),
  ('6b', 'unterstufe'),
  ('6c', 'unterstufe'),

  -- Mittelstufe
  ('7a', 'mittelstufe'),
  ('7b', 'mittelstufe'),
  ('7c', 'mittelstufe'),
  ('8a', 'mittelstufe'),
  ('8b', 'mittelstufe'),
  ('8c', 'mittelstufe'),
  ('9a', 'mittelstufe'),
  ('9b', 'mittelstufe'),
  ('10a', 'mittelstufe'),
  ('10b', 'mittelstufe'),
  ('10c', 'mittelstufe'),

  -- Oberstufe
  ('EF', 'oberstufe'),
  ('Q1-1', 'oberstufe'),
  ('Q1-2', 'oberstufe'),
  ('Lehrer-Team', 'oberstufe');
