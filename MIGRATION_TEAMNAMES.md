# Migration: Teamnamen und Klassen trennen

Diese Anleitung erklärt, wie Sie die neue Funktionalität für separate Teamnamen und Klassen aktivieren.

## Was ist neu?

**Vorher:**
- Ein Feld: "name" (z.B. "5a", "7b", "Q1-1")

**Jetzt:**
- Zwei Felder: "name" (Teamname) + "class_name" (Klasse)
- Beispiel: name = "FC München", class_name = "5a"
- Anzeige: "FC München (5a)"

## Schritt 1: Datenbank-Migration ausführen

1. Gehe zu deinem Supabase Dashboard
2. Klicke auf **SQL Editor** (links in der Sidebar)
3. Klicke auf **New query**
4. Öffne die Datei `supabase/migrations/003_add_class_name.sql` auf deinem Computer
5. Kopiere den **gesamten Inhalt** der Datei
6. Füge ihn in den SQL Editor ein
7. Klicke auf **Run** (oder drücke Strg+Enter)
8. Du solltest "Success" sehen

**Was passiert dabei:**
- Ein neues Feld `class_name` wird zur `teams`-Tabelle hinzugefügt
- Bestehende Werte aus `name` werden automatisch in `class_name` kopiert
  - Beispiel: Aus "5a" wird: name="5a", class_name="5a"
- Die Standings-View wird aktualisiert, um beide Felder anzuzeigen

## Schritt 2: Teams aktualisieren (im Admin-Bereich)

Jetzt kannst du deine Teams bearbeiten und ihnen richtige Namen geben:

1. Gehe zu [http://localhost:3000/admin](http://localhost:3000/admin)
2. Melde dich als Admin an
3. Wähle eine Kategorie aus
4. Klicke auf **"👥 Teams verwalten"**
5. Für jedes Team:
   - Klicke auf **"✏️ Bearbeiten"**
   - **Teamname**: Gib den echten Teamnamen ein (z.B. "FC München", "Die Raketen", "Team Blau")
   - **Klasse**: Belasse oder ändere die Klasse (z.B. "5a", "U8", "7b")
   - Klicke auf **"✓ Speichern"**

## Beispiel

**Vorher:**
- Team: "7b"

**Nachher:**
- Teamname: "Die Champions"
- Klasse: "7b"
- Wird angezeigt als: "Die Champions (7b)"

## Neue Teams hinzufügen

Wenn du neue Teams hinzufügst, musst du jetzt sowohl den Teamnamen als auch die Klasse angeben:

1. Klicke auf **"➕ Neues Team hinzufügen"**
2. **Teamname**: z.B. "FC Barcelona"
3. **Klasse**: z.B. "8a"
4. **Spitzname** (optional): z.B. "Die Löwen"
5. Klicke auf **"✓ Hinzufügen"**

## Hinweise

- Das Feld "Spitzname" ist weiterhin optional und unabhängig von Teamname und Klasse
- Alle Änderungen werden sofort in allen Ansichten (Gruppenphase, Playoffs, Tabelle) angezeigt
- Die Migration ist rückwärtskompatibel: Bestehende Teams behalten ihre Klassennamen
- Nach der Migration kannst du die Teamnamen schrittweise anpassen, ohne dass etwas kaputt geht

## Troubleshooting

**Fehler beim Ausführen der Migration:**
- Stelle sicher, dass du als Admin in Supabase eingeloggt bist
- Prüfe, ob alle vorherigen Migrationen erfolgreich ausgeführt wurden
- Die Migration sollte nur einmal ausgeführt werden

**Teams werden nicht korrekt angezeigt:**
- Stelle sicher, dass du nach der Migration die Seite neu geladen hast (Strg+F5)
- Prüfe im Admin-Bereich, ob die Teams korrekt gespeichert wurden
- Öffne die Browser-Konsole (F12) und schaue nach Fehlermeldungen

## Rückkehr zum alten System

Falls du wieder zurück zum alten System möchtest (nicht empfohlen):

```sql
-- ACHTUNG: Dies entfernt die neue Funktionalität!
ALTER TABLE teams DROP COLUMN IF EXISTS class_name;
```

**Hinweis:** Dies führt zu Fehlern in der Anwendung, da der Code das Feld `class_name` erwartet!
