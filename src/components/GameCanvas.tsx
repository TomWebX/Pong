import { useEffect, useRef } from "react";
import {
  FIELD_HEIGHT,
  FIELD_WIDTH,
  GameState,
  MAX_FRAME_DELTA,
  movePlayerTo,
  stepGame,
  togglePause,
} from "../game/game";
import { getKeyboardAction } from "../game/controls";
import { drawGame } from "../game/render/draw";

interface GameCanvasProps {
  gameRef: { current: GameState };
  onGameChange: (game: GameState) => void;
  onStart: () => void;
}

const ignoredFocus = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    target.closest("button, input, select, textarea, a, [contenteditable='true']") !==
      null);

export function GameCanvas({
  gameRef,
  onGameChange,
  onStart,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) {
      throw new Error("Der Canvas-Kontext konnte nicht initialisiert werden.");
    }

    let animationFrame = 0;
    let previousTime = 0;
    let lastSnapshot = "";
    let previousPhase = gameRef.current.phase;
    const keys = new Set<string>();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      const width = Math.max(1, Math.round(rect.width * ratio));
      const height = Math.max(1, Math.round(rect.height * ratio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      context.setTransform(width / FIELD_WIDTH, 0, 0, height / FIELD_HEIGHT, 0, 0);
      context.imageSmoothingEnabled = false;
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    window.addEventListener("resize", resize);
    resize();

    const tick = (time: number) => {
      const delta = previousTime === 0 ? 0 : Math.min((time - previousTime) / 1000, MAX_FRAME_DELTA);
      previousTime = time;
      const game = gameRef.current;
      const direction =
        (keys.has("s") || keys.has("arrowdown") ? 1 : 0) -
        (keys.has("w") || keys.has("arrowup") ? 1 : 0);
      const next = stepGame(game, delta, direction);
      gameRef.current = next;
      drawGame(context, next);
      if (
        next.phase === "playing" &&
        ["start", "paused", "complete"].includes(previousPhase)
      ) {
        canvas.focus();
      }
      previousPhase = next.phase;

      const snapshot = [
        next.phase,
        next.playerScore,
        next.cpuScore,
        next.totalHits,
        next.message,
      ].join(":");
      if (snapshot !== lastSnapshot) {
        lastSnapshot = snapshot;
        onGameChange(next);
      }
      animationFrame = requestAnimationFrame(tick);
    };

    animationFrame = requestAnimationFrame(tick);

    const onPointerDown = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * FIELD_WIDTH;
      if (x >= FIELD_WIDTH / 2) return;
      event.preventDefault();
      canvas.setPointerCapture(event.pointerId);
      const y = ((event.clientY - rect.top) / rect.height) * FIELD_HEIGHT;
      const next = movePlayerTo(gameRef.current, y);
      gameRef.current = next;
      onGameChange(next);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!canvas.hasPointerCapture(event.pointerId)) return;
      const rect = canvas.getBoundingClientRect();
      const y = ((event.clientY - rect.top) / rect.height) * FIELD_HEIGHT;
      const next = movePlayerTo(gameRef.current, y);
      gameRef.current = next;
      onGameChange(next);
    };

    const onPointerUp = (event: PointerEvent) => {
      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (ignoredFocus(event.target)) return;
      const key = event.key.toLowerCase();
      const action = getKeyboardAction(key);
      if (action === "move-up" || action === "move-down") {
        keys.add(key);
        event.preventDefault();
      } else if (action === "toggle" && !event.repeat) {
        event.preventDefault();
        if (gameRef.current.phase === "start" || gameRef.current.phase === "complete") {
          onStart();
        } else {
          const next = togglePause(gameRef.current);
          gameRef.current = next;
          onGameChange(next);
        }
      } else if (
        action === "pause" &&
        (gameRef.current.phase === "playing" || gameRef.current.phase === "point")
      ) {
        const next = togglePause(gameRef.current);
        gameRef.current = next;
        onGameChange(next);
      }
    };

    const onKeyUp = (event: KeyboardEvent) => keys.delete(event.key.toLowerCase());
    const clearKeys = () => keys.clear();
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", clearKeys);

    return () => {
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", clearKeys);
    };
  }, [gameRef, onGameChange, onStart]);

  return (
    <canvas
      ref={canvasRef}
      className="game-canvas"
      width={FIELD_WIDTH}
      height={FIELD_HEIGHT}
      aria-label="Spielfeld. Dein Schläger ist links in Cyan, der CPU-Schläger rechts in Magenta."
      role="img"
      tabIndex={0}
      onContextMenu={(event) => event.preventDefault()}
    />
  );
}
