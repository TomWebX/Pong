# PONG // 1982

Ein geplantes, browserbasiertes Pong-Spiel im 80er-Jahre-Pixel-Art-Stil. Du
spielst allein gegen eine CPU, weichst im Weltraum den Grenzen des Spielfelds
aus und versuchst, zuerst sieben Punkte zu erreichen.

> **Status:** Konzeptphase – das Spiel ist noch nicht implementiert.

## Konzept

- **Stack:** React, TypeScript und HTML Canvas
- **Modus:** Singleplayer gegen eine CPU
- **Steuerung:** Touch-first durch Ziehen auf der linken Spielfeldhälfte,
  zusätzlich per Tastatur (`W`/`S` oder `↑`/`↓`)
- **Schwierigkeit:** Balltempo und CPU-Reaktion steigen im Verlauf eines
  Ballwechsels automatisch und bleiben fair begrenzt
- **Runden:** Match bis 7 Punkte
- **Darstellung:** Neon-Pixel-Art mit Weltraumhintergrund; Hoch- und Querformat
  werden unterstützt
- **Hosting:** GitHub Pages, automatische Veröffentlichung von `main` über
  GitHub Actions – ohne eigenen Webserver

Das vollständige Spielkonzept und die technischen Leitlinien stehen in
[docs/CONCEPT.md](./docs/CONCEPT.md). Die Umsetzung ist in Arbeitspakete
aufgeteilt:

1. [React-/TypeScript-Grundlage, Vite und Pages-Deployment](https://github.com/TomWebX/Pong/issues/1)
2. [Canvas-Game-Loop, Physik und Punktestand](https://github.com/TomWebX/Pong/issues/2)
3. [CPU-Gegner und Difficulty-Progression](https://github.com/TomWebX/Pong/issues/3)
4. [Touch- und Tastatursteuerung](https://github.com/TomWebX/Pong/issues/4)
5. [Retro-UI, Spielzustände und Barrierefreiheit](https://github.com/TomWebX/Pong/issues/5)

## Geplante Features

- Responsive Canvas-Spiel mit pixelgenauer Darstellung
- Spieler-Schläger auf der linken, CPU-Schläger auf der rechten Seite
- Punktestand, Start-, Pause- und Ergebniszustand
- Automatische, gedeckelte Difficulty-Progression
- Tastatur- und Touch-Steuerung
- CI-Build und automatisches Deployment nach GitHub Pages bei Push auf `main`

## Starten

Das Projekt enthält noch keine Anwendung oder Startskripte. Setup- und
Startanweisungen werden ergänzt, sobald die Implementierung beginnt.
