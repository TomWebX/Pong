import { useCallback, useRef, useState } from "react";
import { GameCanvas } from "./components/GameCanvas";
import {
  GameState,
  createGame,
  startMatch,
  togglePause,
} from "./game/game";

function App() {
  const gameRef = useRef<GameState>(createGame());
  const [game, setGame] = useState(gameRef.current);

  const publish = useCallback((next: GameState) => {
    gameRef.current = next;
    setGame(next);
  }, []);

  const start = useCallback(() => publish(startMatch()), [publish]);
  const toggle = useCallback(() => {
    publish(togglePause(gameRef.current));
  }, [publish]);

  const showOverlay =
    game.phase === "start" ||
    game.phase === "paused" ||
    game.phase === "complete";

  const overlayTitle =
    game.phase === "paused"
      ? "PAUSE"
      : game.phase === "complete"
        ? game.winner === "player"
          ? "SIEG!"
          : "GAME OVER"
        : "READY PLAYER ONE";

  return (
    <main className="arcade">
      <header className="masthead">
        <p className="eyebrow">INSERT COIN TO BEGIN</p>
        <h1>PONG <span>// 1982</span></h1>
        <p className="tagline">Ein letzter Ballwechsel zwischen den Sternen.</p>
      </header>

      <section className="cabinet" aria-label="Pong-Spiel">
        <div className="scoreboard" aria-label="Punktestand">
          <div className="score-side player-side">
            <span className="player-name">YOU</span>
            <strong>{game.playerScore}</strong>
          </div>
          <span className="score-divider" aria-hidden="true">:</span>
          <div className="score-side cpu-side">
            <span className="player-name">CPU</span>
            <strong>{game.cpuScore}</strong>
          </div>
        </div>

        <div className="field-wrap">
          <GameCanvas
            gameRef={gameRef}
            onGameChange={publish}
            onStart={start}
          />
          {showOverlay && (
            <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="overlay-title">
              <p className="overlay-kicker">
                {game.phase === "complete" ? "MATCH ENDE" : "PONG // 1982"}
              </p>
              <h2 id="overlay-title">{overlayTitle}</h2>
              {game.phase === "complete" ? (
                <p className="overlay-copy">
                  Endstand {game.playerScore} : {game.cpuScore}
                </p>
              ) : game.phase === "paused" ? (
                <p className="overlay-copy">Das Match wartet auf dich.</p>
              ) : (
                <p className="overlay-copy">
                  Erreiche zuerst 7 Punkte und werde zur Legende.
                </p>
              )}
              <button className="action-button" onClick={game.phase === "paused" ? toggle : start}>
                {game.phase === "paused"
                  ? "WEITERSPIELEN"
                  : game.phase === "complete"
                    ? "NOCH EINE RUNDE"
                    : "SPIEL STARTEN"}
              </button>
              <p className="button-hint">oder Leertaste drücken</p>
            </div>
          )}
          {game.phase === "point" && (
            <div className="point-banner" aria-hidden="true">{game.message}</div>
          )}
        </div>

        <div className="game-footer">
          <p className="live-message" aria-live="polite" aria-atomic="true">
            {game.message}
          </p>
          <button
            className="pause-button"
            onClick={toggle}
            disabled={
              game.phase !== "playing" &&
              game.phase !== "point" &&
              game.phase !== "paused"
            }
            aria-label={game.phase === "paused" ? "Spiel fortsetzen" : "Spiel pausieren"}
          >
            {game.phase === "paused" ? "FORTSETZEN" : "PAUSE"}
          </button>
        </div>
      </section>

      <footer className="controls">
        <div><kbd>W</kbd><kbd>S</kbd><span>oder</span><kbd>↑</kbd><kbd>↓</kbd><span>bewegen</span></div>
        <span className="control-separator">•</span>
        <p>Auf deiner Spielfeldhälfte ziehen</p>
        <span className="control-separator">•</span>
        <p><kbd>ESC</kbd> pausieren</p>
      </footer>
      <p className="win-condition">FIRST TO 7 WINS <span>—</span> GOOD LUCK, PILOT.</p>
    </main>
  );
}

export default App;
