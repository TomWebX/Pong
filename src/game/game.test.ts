import { describe, expect, it } from "vitest";
import {
  BALL_RADIUS,
  FIELD_HEIGHT,
  MAX_BALL_SPEED,
  MAX_CPU_SPEED,
  PADDLE_HEIGHT,
  WINNING_SCORE,
  createGame,
  movePlayerTo,
  paddleSpeedForHits,
  predictBallY,
  restartRally,
  startMatch,
  stepGame,
  togglePause,
} from "./game";

describe("Star Volley game rules", () => {
  it("reflects a ball from the top and bottom walls", () => {
    const game = startMatch();
    const top = stepGame(
      { ...game, ball: { ...game.ball, x: 400, y: BALL_RADIUS + 1, vx: 0, vy: -100 } },
      0.05,
    );
    expect(top.ball.vy).toBeGreaterThan(0);

    const bottom = stepGame(
      {
        ...game,
        ball: { ...game.ball, x: 400, y: FIELD_HEIGHT - BALL_RADIUS - 1, vx: 0, vy: 100 },
      },
      0.05,
    );
    expect(bottom.ball.vy).toBeLessThan(0);
  });

  it("returns a ball toward the field when it hits the player paddle", () => {
    const game = startMatch();
    const state = {
      ...game,
      player: { ...game.player, y: 250 },
      ball: { x: 59, y: 250, vx: -300, vy: 0, speed: 300 },
    };
    const next = stepGame(state, 0.02);
    expect(next.ball.vx).toBeGreaterThan(0);
    expect(next.totalHits).toBe(1);
    expect(next.ball.speed).toBeLessThanOrEqual(MAX_BALL_SPEED);
  });

  it("detects paddle hits when the ball crosses the paddle in one frame", () => {
    const game = {
      ...startMatch(),
      player: { x: 44, y: 250 },
      ball: { x: 65, y: 250, vx: -600, vy: 0, speed: 600 },
    };
    const next = stepGame(game, 0.05);
    expect(next.totalHits).toBe(1);
    expect(next.ball.vx).toBeGreaterThan(0);
    expect(next.ball.speed).toBe(MAX_BALL_SPEED);
  });

  it("awards the opposite side a point when the ball leaves the field", () => {
    const game = {
      ...startMatch(),
      ball: { x: 10, y: 250, vx: -500, vy: 0, speed: 500 },
    };
    const next = stepGame(game, 0.05);
    expect(next.phase).toBe("point");
    expect(next.cpuScore).toBe(1);
    expect(next.playerScore).toBe(0);
  });

  it("ends the match at seven points", () => {
    const game = {
      ...startMatch(),
      playerScore: WINNING_SCORE - 1,
      ball: { x: 790, y: 250, vx: 500, vy: 0, speed: 500 },
    };
    const next = stepGame(game, 0.05);
    expect(next.phase).toBe("complete");
    expect(next.winner).toBe("player");
  });

  it("caps CPU progression and retains it across rallies", () => {
    expect(paddleSpeedForHits(0)).toBe(210);
    expect(paddleSpeedForHits(100)).toBe(MAX_CPU_SPEED);
    const game = { ...createGame(), totalHits: 8 };
    const next = restartRally(game);
    expect(next.totalHits).toBe(8);
    expect(next.rallyHits).toBe(0);
    expect(next.ball.speed).toBe(339);
    expect(startMatch().totalHits).toBe(0);
  });

  it("bounds player movement and handles pause transitions", () => {
    const game = startMatch();
    expect(movePlayerTo(game, -10).player.y).toBe(PADDLE_HEIGHT / 2);
    expect(togglePause(game).phase).toBe("paused");
    expect(togglePause(togglePause(game)).phase).toBe("playing");
  });

  it("preserves a pending point transition across pause and resume", () => {
    const point = {
      ...startMatch(),
      phase: "point" as const,
      pointTimer: 0.4,
    };
    const paused = togglePause(point);
    const resumed = togglePause(paused);
    expect(paused.phase).toBe("paused");
    expect(resumed.phase).toBe("point");
    expect(resumed.pointTimer).toBe(0.4);
  });

  it("serves the next rally after the point delay without losing match progression", () => {
    const point = {
      ...createGame(),
      phase: "point" as const,
      pointTimer: 0.88,
      totalHits: 6,
      rallyHits: 3,
    };
    const next = stepGame(point, 0.05);
    expect(next.phase).toBe("playing");
    expect(next.totalHits).toBe(6);
    expect(next.rallyHits).toBe(0);
    expect(next.ball.speed).toBe(333);
  });

  it("predicts reflected vertical ball movement", () => {
    const y = predictBallY(
      { x: 100, y: 250, vx: 300, vy: 500, speed: 583 },
      700,
    );
    expect(y).toBeGreaterThanOrEqual(BALL_RADIUS);
    expect(y).toBeLessThanOrEqual(FIELD_HEIGHT - BALL_RADIUS);
  });
});
