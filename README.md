# SV Superballturnier 2026 🏆

Eine moderne Turnier-Management-Website mit Double-Elimination-Bracket (Winner + Loser Bracket) für das Superballturnier 2026.

## Features ✨

- **3 Turnierkategorien**: Unterstufe, Mittelstufe, Oberstufe
- **Double Elimination**: Winner Bracket + Loser Bracket für faire Zweikämpfe
- **Real-time Updates**: Live-Aktualisierung der Spielergebnisse für alle Besucher
- **Admin Dashboard**: Geschützter Bereich zur Verwaltung der Ergebnisse
- **Responsive Design**: Funktioniert auf Desktop, Tablet und Mobile
- **Moderne UI**: Inspiriert vom bereitgestellten Design-Template

## Tech Stack 🛠️

- **Frontend**: Next.js 14 (React)
- **Backend**: Supabase (PostgreSQL + Real-time)
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **TypeScript**: Vollständig typisiert

## Teams 📋

### Unterstufe (6 Teams)
5a, 5b, 5c, 6a, 6b, 6c

### Mittelstufe (11 Teams)
7a, 7b, 7c, 8a, 8b, 8c, 9a, 9b, 10a, 10b, 10c

### Oberstufe (4 Teams)
EF, Q1-1, Q1-2, Lehrer-Team

## Installation & Setup 🚀

### 1. Voraussetzungen

- Node.js 18+ installiert
- Ein Supabase-Konto (kostenlos auf [supabase.com](https://supabase.com))

### 2. Supabase-Projekt erstellen

1. Gehe zu [supabase.com](https://supabase.com) und erstelle ein neues Projekt
2. Warte, bis das Projekt fertig eingerichtet ist
3. Gehe zu **Settings** → **API**
4. Kopiere die **Project URL** und den **anon public** Key

### 3. Datenbank einrichten

1. Gehe im Supabase Dashboard zu **SQL Editor**
2. Öffne die Datei `supabase/migrations/001_initial_schema.sql` aus diesem Projekt
3. Kopiere den gesamten Inhalt und führe ihn im SQL Editor aus
4. Die Tabellen, Teams und Policies werden automatisch erstellt

### 4. Admin-Benutzer erstellen

1. Gehe im Supabase Dashboard zu **Authentication** → **Users**
2. Klicke auf **Add user** → **Create new user**
3. Gib eine E-Mail und ein Passwort ein (z.B. `admin@turnier.de`)
4. Bestätige die E-Mail (in der Testumgebung: gehe zu **Authentication** → **Users** und klicke auf den Benutzer → **Confirm email**)
5. Kopiere die **User ID** (UUID)
6. Gehe zurück zum **SQL Editor** und führe folgenden Befehl aus:

```sql
INSERT INTO admin_users (id, email)
VALUES ('HIER_DIE_USER_ID_EINFUEGEN', 'admin@turnier.de');
```

### 5. Projekt klonen und Dependencies installieren

```bash
# Navigiere zum Projektordner
cd "c:\Users\drjco\Documents\SV Superballturnier"

# Installiere Dependencies
npm install
```

### 6. Umgebungsvariablen einrichten

1. Kopiere die `.env.local.example` und benenne sie um zu `.env.local`:

```bash
copy .env.local.example .env.local
```

2. Öffne `.env.local` und trage deine Supabase-Credentials ein:

```env
NEXT_PUBLIC_SUPABASE_URL=https://dein-projekt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dein-anon-key
```

### 7. Entwicklungsserver starten

```bash
npm run dev
```

Die Website ist nun unter [http://localhost:3000](http://localhost:3000) erreichbar.

## Verwendung 📖

### Öffentliche Ansicht

- Besuche `http://localhost:3000`
- Wähle eine Kategorie (Unterstufe, Mittelstufe, Oberstufe)
- Betrachte den Turnierbaum mit Winner und Loser Bracket
- Die Ansicht aktualisiert sich automatisch bei Änderungen

### Admin-Bereich

1. Gehe zu `http://localhost:3000/admin`
2. Melde dich mit deinen Admin-Credentials an
3. Wähle eine Kategorie
4. **Turnierbäume initialisieren**: Klicke auf "Turnierbäume neu initialisieren" um die Brackets zu erstellen
5. **Gewinner auswählen**: Klicke auf ein Team in einem Match, um es als Gewinner zu markieren
6. Der Gewinner wird automatisch ins nächste Match übertragen
7. Der Verlierer wird automatisch ins Loser Bracket übertragen

### Real-time Updates

- Alle Besucher der Website sehen Änderungen in Echtzeit
- Keine Seiten-Aktualisierung notwendig
- Powered by Supabase Realtime

## Deployment 🌐

### Vercel (empfohlen)

1. Pushe das Projekt zu GitHub
2. Gehe zu [vercel.com](https://vercel.com)
3. Importiere dein GitHub-Repository
4. Füge die Umgebungsvariablen hinzu (NEXT_PUBLIC_SUPABASE_URL, etc.)
5. Deploy!

### Andere Hosting-Plattformen

Das Projekt ist eine Standard Next.js App und kann auf jeder Plattform deployed werden, die Next.js unterstützt:
- Netlify
- Railway
- AWS Amplify
- Etc.

## Datenbankstruktur 📊

### Tabellen

- **teams**: Speichert alle Teams mit Kategorie
- **matches**: Speichert alle Spiele mit Status, Teams, Gewinner
- **admin_users**: Speichert Admin-Berechtigungen

### Row Level Security (RLS)

- Alle können Teams und Matches **lesen**
- Nur Admins können Matches **aktualisieren**
- Geschützt durch Supabase Auth

## Anpassungen 🎨

### Farben ändern

Bearbeite `tailwind.config.js`:

```js
colors: {
  tournament: {
    purple: '#8B7BB8',      // Hauptfarbe
    'purple-dark': '#6B5B98', // Dunklere Variante
    'purple-light': '#AB9BC8', // Hellere Variante
    yellow: '#F4D03F',        // Akzentfarbe
  },
}
```

### Team-Namen ändern

1. Gehe ins Supabase Dashboard → SQL Editor
2. Führe aus:

```sql
UPDATE teams SET name = 'Neuer Name' WHERE name = 'Alter Name';
```

### Weitere Teams hinzufügen

```sql
INSERT INTO teams (name, category) VALUES ('Neues Team', 'mittelstufe');
```

## Troubleshooting 🔧

### "Turnierbäume neu initialisieren" funktioniert nicht

- Stelle sicher, dass du als Admin angemeldet bist
- Prüfe in der Browser-Konsole auf Fehler
- Stelle sicher, dass die Teams in der Datenbank existieren

### Real-time Updates funktionieren nicht

- Prüfe, ob Realtime in Supabase aktiviert ist (sollte standardmäßig an sein)
- Stelle sicher, dass die RLS Policies korrekt eingerichtet sind

### Login funktioniert nicht

- Stelle sicher, dass der Benutzer in `admin_users` eingetragen ist
- Prüfe, ob die E-Mail im Supabase Dashboard bestätigt wurde
- Überprüfe die Umgebungsvariablen

## Lizenz 📄

Dieses Projekt wurde speziell für das SV Superballturnier 2026 erstellt.

## Support 💬

Bei Fragen oder Problemen:
1. Prüfe die Supabase-Logs im Dashboard
2. Prüfe die Browser-Konsole auf JavaScript-Fehler
3. Stelle sicher, dass alle Environment-Variablen gesetzt sind

Viel Erfolg beim Turnier! 🏆⚽
