# Schnellstart-Anleitung 🚀

Diese Anleitung führt dich Schritt für Schritt durch das Setup.

## Schritt 1: Node.js installieren

Falls noch nicht installiert:
1. Gehe zu [nodejs.org](https://nodejs.org)
2. Lade die LTS-Version herunter
3. Installiere Node.js
4. Prüfe die Installation:
```bash
node --version
npm --version
```

## Schritt 2: Supabase-Projekt erstellen

1. Gehe zu [supabase.com](https://supabase.com)
2. Klicke auf **Start your project**
3. Melde dich an (z.B. mit GitHub)
4. Klicke auf **New Project**
5. Wähle:
   - **Name**: SV Superballturnier 2026
   - **Database Password**: Wähle ein sicheres Passwort (speichere es!)
   - **Region**: Frankfurt (Europe Central)
6. Klicke auf **Create new project**
7. Warte 2-3 Minuten, bis das Projekt fertig ist

## Schritt 3: Supabase-Credentials kopieren

1. Im Supabase Dashboard: Gehe zu **Settings** (Zahnrad-Symbol links)
2. Klicke auf **API**
3. Kopiere folgende Werte:
   - **Project URL** (z.B. `https://abcdefgh.supabase.co`)
   - **anon public** Key (unter "Project API keys")

## Schritt 4: Datenbank einrichten

1. Im Supabase Dashboard: Klicke auf **SQL Editor** (links in der Sidebar)
2. Klicke auf **New query**
3. Öffne auf deinem Computer die Datei:
   ```
   c:\Users\drjco\Documents\SV Superballturnier\supabase\migrations\001_initial_schema.sql
   ```
4. Kopiere den **gesamten Inhalt** der Datei
5. Füge ihn in den SQL Editor ein
6. Klicke auf **Run** (oder drücke Strg+Enter)
7. Du solltest "Success. No rows returned" sehen

## Schritt 5: Admin-Benutzer erstellen

1. Im Supabase Dashboard: Klicke auf **Authentication** → **Users**
2. Klicke auf **Add user** → **Create new user**
3. Gib ein:
   - **Email**: `admin@turnier.de` (oder eine andere E-Mail)
   - **Password**: Wähle ein sicheres Passwort (MERKEN!)
   - **Auto Confirm User**: AN (Häkchen setzen!)
4. Klicke auf **Create user**
5. Kopiere die **User ID** (lange UUID, z.B. `a1b2c3d4-...`)
6. Gehe zurück zu **SQL Editor**
7. Erstelle eine neue Query und führe aus (USER_ID ersetzen!):

```sql
INSERT INTO admin_users (id, email)
VALUES ('HIER_DEINE_USER_ID', 'admin@turnier.de');
```

## Schritt 6: Projekt-Setup

1. Öffne die Eingabeaufforderung (CMD) oder PowerShell
2. Navigiere zum Projektordner:
```bash
cd "c:\Users\drjco\Documents\SV Superballturnier"
```

3. Installiere alle Dependencies:
```bash
npm install
```

4. Erstelle die `.env.local` Datei:
```bash
copy .env.local.example .env.local
```

5. Öffne `.env.local` mit einem Texteditor (z.B. Notepad)
6. Ersetze die Platzhalter mit deinen Werten:

```env
NEXT_PUBLIC_SUPABASE_URL=https://dein-projekt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dein-anon-key
```

7. Speichere die Datei

## Schritt 7: Entwicklungsserver starten

```bash
npm run dev
```

Du solltest sehen:
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

## Schritt 8: Website öffnen

1. Öffne deinen Browser
2. Gehe zu [http://localhost:3000](http://localhost:3000)
3. Du solltest die Turnier-Website sehen!

## Schritt 9: Als Admin anmelden

1. Gehe zu [http://localhost:3000/admin](http://localhost:3000/admin)
2. Melde dich an mit:
   - **Email**: `admin@turnier.de` (die E-Mail von Schritt 5)
   - **Password**: Dein gewähltes Passwort
3. Du solltest das Admin Dashboard sehen

## Schritt 10: Turnierbäume initialisieren

1. Im Admin Dashboard
2. Klicke auf **Turnierbäume neu initialisieren**
3. Bestätige mit OK
4. Warte ein paar Sekunden
5. Die Turnierbäume sollten nun sichtbar sein!

## Schritt 11: Ersten Gewinner eintragen

1. Wähle eine Kategorie (z.B. Unterstufe)
2. Finde ein Match mit zwei Teams
3. Klicke auf ein Team
4. Bestätige die Auswahl
5. Der Gewinner wird ins nächste Match übertragen!

## Fertig! 🎉

Die Website ist jetzt vollständig eingerichtet und einsatzbereit!

### Nächste Schritte:

- Teste verschiedene Kategorien
- Trage weitere Ergebnisse ein
- Öffne `http://localhost:3000` in einem zweiten Browser-Tab und beobachte die Real-time Updates
- Passe die Farben in `tailwind.config.js` an (optional)

### Für das Live-Turnier:

Wenn du die Website online stellen möchtest:
1. Folge der Vercel-Anleitung in der README.md
2. Oder kontaktiere jemanden mit Deployment-Erfahrung

Bei Problemen: Prüfe die Troubleshooting-Sektion in der README.md!
