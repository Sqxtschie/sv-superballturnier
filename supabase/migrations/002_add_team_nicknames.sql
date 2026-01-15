-- Add nickname field to teams table
ALTER TABLE teams ADD COLUMN nickname TEXT;

-- RLS policies for admin team management

-- Allow admins to update teams (name, nickname)
CREATE POLICY "Admins können Teams aktualisieren" ON teams
  FOR UPDATE
  USING (
    auth.uid() IN (SELECT id FROM admin_users)
  );

-- Allow admins to insert new teams
CREATE POLICY "Admins können Teams hinzufügen" ON teams
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT id FROM admin_users)
  );

-- Allow admins to delete teams
CREATE POLICY "Admins können Teams löschen" ON teams
  FOR DELETE
  USING (
    auth.uid() IN (SELECT id FROM admin_users)
  );
