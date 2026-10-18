# Spielkonzept: STAR VOLLEY // 1982

## 1. Überblick

Ein einfaches, direkt im Browser spielbares Singleplayer-Arcade-Spiel. Der Spieler
steuert einen Schläger auf der linken Seite und tritt in einem Weltraum-Setting
gegen eine CPU auf der rechten Seite an. Die Umsetzung nutzt React,
TypeScript und ein HTML-Canvas-Spielfeld.

**Ziel:** Ein Match bis 7 Punkte gewinnen. Der Ball wird innerhalb eines
Ballwechsels schrittweise schneller und die CPU reagiert besser. Die Progression
ist gedeckelt, damit das Spiel herausfordernd, aber schaffbar bleibt.

## 2. Zielplattform und Technik

- Moderne Desktop- und Mobile-Browser, ohne Backend oder Benutzerkonto
- React und TypeScript für App-Shell, Menü, Statusanzeigen und Overlays
- HTML Canvas für Spielfeld und bewegte Spielobjekte
- Vite als schlankes React/TypeScript-Entwicklungs- und Build-Setup
- Spielregeln und Physik als von React unabhängige TypeScript-Module

React rendert keine einzelnen Frames. Eine `requestAnimationFrame`-Schleife
aktualisiert den Spielzustand und zeichnet das Canvas; React erhält nur
Zustandswechsel wie Start, Pause, Punkt und Matchende. So bleibt die Animation
flüssig, ohne den React-Renderzyklus mit jedem Frame auszulösen.

### Hosting und Deployment

- **Hosting:** GitHub Pages veröffentlicht die statisch gebaute Anwendung
  direkt aus dem Repository; ein eigener Webserver und ein Backend sind nicht
  erforderlich.
- **Build:** Vite erzeugt mit `npm run build` das deploybare Artefakt im
  Verzeichnis `dist/`.
- **GitHub Actions:** Ein Workflow installiert die per Lockdatei festgelegten
  Abhängigkeiten, führt Tests und Produktions-Build aus und veröffentlicht das
  Artefakt über die offizielle GitHub-Pages-Deployment-Umgebung.
- **Deployment-Regel:** Pull Requests führen Tests und Build als Prüfung aus,
  veröffentlichen aber nichts. Ein erfolgreicher Push auf `main` deployt die
  gebaute Version automatisch nach GitHub Pages.
- **Projektpfad:** Da GitHub Pages das Spiel unter
  `https://tomwebx.github.io/Star-Volley/` bereitstellt, wird Vites `base` auf
  `/Star-Volley/` gesetzt. Assets und Navigation müssen unter diesem Repository-Pfad
  korrekt funktionieren.
- **Repository-Einstellung:** In den GitHub-Repository-Einstellungen wird
  GitHub Pages als Quelle „GitHub Actions“ ausgewählt.

## 3. Spielablauf und Regeln

1. Im Startzustand zeigt das Spiel Titel, kurze Steuerungshinweise und eine
   Startaktion.
2. Beim Start wird der Ball in Richtung Spieler oder CPU ins Spiel gebracht.
   Nach jedem Punkt startet ein neuer Ballwechsel.
3. Ein Punkt wird vergeben, sobald der Ball das Spielfeld hinter einem
   Schläger verlässt. Die Gegenseite erhält den Punkt.
4. Die erste Seite mit 7 Punkten gewinnt das Match.
5. Pause und Fortsetzen sind jederzeit möglich. Nach einem Match kann eine neue
   Runde gestartet werden.

Der Schwierigkeitsfortschritt steigt mit jedem erfolgreichen Schlägerkontakt
innerhalb des laufenden Ballwechsels: Balltempo und CPU-Reaktionsfähigkeit
nehmen schrittweise zu. Beide Werte haben ein festes Maximum. Bei einem neuen
Punktwechsel startet das Tempo wieder auf einem gut lesbaren Niveau; der
Fortschritt bleibt bis zum Matchende erhalten und wird beim Neustart
zurückgesetzt.

## 4. Steuerung und Mobile-Verhalten

### Touch

- Primäre Steuerung: Auf der linken Spielfeldhälfte ziehen; die Y-Position des
  Fingers führt den Spieler-Schläger.
- Pointer Events unterstützen Touch und Maus über denselben Eingabepfad.
- Ein Ziehen beginnt in der linken Spielfeldhälfte; danach hält Pointer Capture
  die Steuerung stabil, wenn der Finger kurz über die Mittellinie oder den
  Canvas-Rand hinaus bewegt wird.
- Das Spiel nutzt keine erzwungene Geräteausrichtung und bleibt in Hoch- und
  Querformat spielbar.

### Tastatur

- `W` oder `↑`: Schläger nach oben bewegen
- `S` oder `↓`: Schläger nach unten bewegen
- `Leertaste`: Spiel starten, pausieren oder fortsetzen
- `Esc`: Pause, sofern das Match läuft

Die Steuerung ist im Start- und Pausenbildschirm sichtbar. Tastatureingaben
werden nicht verarbeitet, wenn ein anderes Bedienelement den Fokus hat.

## 5. Visuelles Konzept

- Dunkler Weltraumhintergrund mit zurückhaltendem Sternenfeld
- Zwei kontrastreiche, pixelige Schläger und ein gut sichtbarer Ball
- Neon-Akzente, zum Beispiel Cyan und Magenta, auf dunklem Blau/Schwarz
- Pixelige Trennlinie und kompakte Arcade-Punktanzeige
- Dezente Treffer- und Punkt-Effekte; keine Effekte, die Ball oder Schläger
  verdecken
- Pixel-Art wird bei Skalierung ohne Weichzeichnung dargestellt

Die Spielwelt nutzt ein festes logisches Koordinatensystem und wird in die
verfügbare Fläche skaliert. Auf HiDPI-Displays wird die Canvas-Auflösung an
`devicePixelRatio` angepasst, während die Spielkoordinaten stabil bleiben.
Hoch- und Querformat erhalten das Spielfeld und seine Bedienbarkeit, ohne eine
Orientierungssperre vorauszusetzen.

## 6. UI-Zustände

- **Start:** Titel, Ziel und Steuerungshinweise
- **Laufend:** Canvas-Spielfeld und gut lesbarer Punktestand
- **Pause:** Spiel angehalten, Fortsetzen und Neustart verfügbar
- **Punkt erzielt:** Kurze Rückmeldung und automatischer Neustart des Ballwechsels
- **Matchende:** Gewinner, Endstand und Aktion für ein neues Match

Bedienbare Aktionen und Punktestand bleiben als HTML-Elemente verfügbar und
werden nicht ausschließlich in das Canvas gezeichnet. Der Canvas erhält eine
zugängliche Beschreibung; Punkt- und Matchmeldungen werden für Screenreader
verständlich ausgegeben.

## 7. Technischer Aufbau

Vorgeschlagene Zuständigkeiten:

- `src/game/`: reine Spielregeln, Physik, Kollisionen, CPU-Entscheidung und
  Difficulty-Progression
- `src/game/render/`: Canvas-Zeichnung und Skalierung
- `src/components/`: Canvas-Host, Start-/Pause-/Ergebnis-Overlays und
  Statusanzeigen
- `src/hooks/`: Lebenszyklus-Verbindung zwischen React und Game Loop

Die Game Loop begrenzt große Zeitdeltas nach Tab-Wechseln, damit der Ball nicht
unvorhersehbar springt. Kollisionen und Punkte werden in der Spiellogik
entschieden, nicht anhand von Canvas-Pixeln. Die CPU bewegt sich auf Basis der
vorhergesagten Ballposition, mit begrenzter Reaktionszeit und maximaler
Bewegungsgeschwindigkeit, sodass sie Fehler machen kann.

## 8. Test- und Qualitätsziele

- Unit-Tests für Wand-/Schlägerkollisionen, Punktvergabe, Matchende und
  Progressionsgrenzen
- Tests der Steuerungszuordnung und der Pause-/Neustart-Übergänge
- Responsive-Prüfung in Hoch- und Querformat sowie auf HiDPI-Canvas
- Manuelle Browserprüfung von Touch, Maus und Tastatur
- Sicherstellen, dass CPU und Ball auch bei maximaler Schwierigkeit innerhalb
  ihrer definierten Grenzen bleiben

## 9. Vorgeschlagene Umsetzung in Issues

1. **Projektgrundlage und Deployment:** [Issue #1](https://github.com/TomWebX/Star-Volley/issues/1) –
   React-/TypeScript-App mit Vite, Testbasis, Canvas-App-Shell und automatischem
   GitHub-Pages-Deployment über Actions aufsetzen.
2. **Spielkern:** [Issue #2](https://github.com/TomWebX/Star-Volley/issues/2) –
   typisiertes Spielmodell, Game Loop, Canvas-Rendering, Kollisionen und
   Punktlogik implementieren.
3. **CPU und Difficulty:** [Issue #3](https://github.com/TomWebX/Star-Volley/issues/3) –
   CPU-Gegner sowie gedeckelte Steigerung von Balltempo und CPU-Reaktion pro
   Ballwechsel ergänzen.
4. **Steuerung und Responsive:** [Issue #4](https://github.com/TomWebX/Star-Volley/issues/4) –
   Touch-first-Pointer-Steuerung, Tastatur, Hoch-/Querformat und
   HiDPI-Skalierung integrieren.
5. **Arcade-UX:** [Issue #5](https://github.com/TomWebX/Star-Volley/issues/5) –
   Start-, Pause-, Punkt- und Ergebniszustände sowie das Space-Pixel-Art-Design
   und zugängliche Statusanzeigen umsetzen.

## 10. Bewusste MVP-Grenzen

- Nur Singleplayer gegen CPU; kein lokaler Mehrspielermodus oder Netzwerkspiel
- Keine Konten, Ranglisten oder serverseitige Speicherung
- Keine erzwungene Geräteausrichtung
- Audio und zusätzliche kosmetische Optionen sind nicht Voraussetzung für den
  ersten spielbaren Stand
