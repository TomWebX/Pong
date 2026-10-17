export const FIELD_WIDTH = 800;
export const FIELD_HEIGHT = 500;
export const PADDLE_WIDTH = 14;
export const PADDLE_HEIGHT = 92;
export const BALL_RADIUS = 8;
export const WINNING_SCORE = 7;
export const MAX_BALL_SPEED = 600;
export const MAX_CPU_SPEED = 330;
export const MAX_CPU_HITS = 24;
export const MAX_FRAME_DELTA = 0.05;
export const POINT_DELAY = 0.9;

export type Side = "player" | "cpu";
export type GamePhase = "start" | "playing" | "paused" | "point" | "complete";

export interface Paddle {
  x: number;
  y: number;
}

export interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
}

export interface GameState {
  phase: GamePhase;
  resumePhase: "playing" | "point" | null;
  player: Paddle;
  cpu: Paddle;
  ball: Ball;
  playerScore: number;
  cpuScore: number;
  rallyHits: number;
  totalHits: number;
  pointTimer: number;
  winner: Side | null;
  message: string;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export function createGame(): GameState {
  return {
    phase: "start",
    resumePhase: null,
    player: { x: 44, y: FIELD_HEIGHT / 2 },
    cpu: { x: FIELD_WIDTH - 44, y: FIELD_HEIGHT / 2 },
    ball: { x: FIELD_WIDTH / 2, y: FIELD_HEIGHT / 2, vx: 0, vy: 0, speed: 300 },
    playerScore: 0,
    cpuScore: 0,
    rallyHits: 0,
    totalHits: 0,
    pointTimer: 0,
    winner: null,
    message: "Bereit für den ersten Aufschlag?",
  };
}

function makeServe(state: GameState, direction: number): GameState {
  const serveSpeed = 315 + Math.min(state.totalHits, MAX_CPU_HITS) * 3;
  return {
    ...state,
    phase: "playing",
    resumePhase: null,
    player: { ...state.player, y: FIELD_HEIGHT / 2 },
    cpu: { ...state.cpu, y: FIELD_HEIGHT / 2 },
    ball: {
      x: FIELD_WIDTH / 2,
      y: FIELD_HEIGHT / 2,
      vx: direction * serveSpeed * 0.953,
      vy: direction * serveSpeed * 0.302,
      speed: serveSpeed,
    },
    rallyHits: 0,
    pointTimer: 0,
    winner: null,
    message: "Der Ball ist im Spiel.",
  };
}

export function startMatch(): GameState {
  const clean = createGame();
  return makeServe(clean, Math.random() < 0.5 ? -1 : 1);
}

export function restartRally(state: GameState): GameState {
  return makeServe(state, Math.random() < 0.5 ? -1 : 1);
}

export function togglePause(state: GameState): GameState {
  if (state.phase === "playing" || state.phase === "point") {
    return {
      ...state,
      phase: "paused",
      resumePhase: state.phase,
      message: "Spiel pausiert.",
    };
  }
  if (state.phase === "paused") {
    return {
      ...state,
      phase: state.resumePhase ?? "playing",
      resumePhase: null,
      message: "Weiter geht's!",
    };
  }
  return state;
}

export function paddleSpeedForHits(totalHits: number): number {
  return Math.min(210 + Math.max(0, totalHits) * 5, MAX_CPU_SPEED);
}

export function predictBallY(ball: Ball, targetX: number): number {
  if (ball.vx <= 0) return FIELD_HEIGHT / 2;

  const timeToPaddle = (targetX - ball.x) / ball.vx;
  const projectedY = ball.y + ball.vy * timeToPaddle;
  const span = FIELD_HEIGHT - BALL_RADIUS * 2;
  const folded = ((projectedY - BALL_RADIUS) % (span * 2) + span * 2) % (span * 2);
  return BALL_RADIUS + (folded <= span ? folded : span * 2 - folded);
}

function reflectBallOnPaddle(
  state: GameState,
  side: Side,
): GameState {
  const paddle = side === "player" ? state.player : state.cpu;
  const offset = clamp(
    (state.ball.y - paddle.y) / (PADDLE_HEIGHT / 2),
    -1,
    1,
  );
  const speed = Math.min(state.ball.speed * 1.045, MAX_BALL_SPEED);
  const angle = offset * 0.9;
  const direction = side === "player" ? 1 : -1;
  const ball = {
    ...state.ball,
    x:
      side === "player"
        ? paddle.x + PADDLE_WIDTH / 2 + BALL_RADIUS
        : paddle.x - PADDLE_WIDTH / 2 - BALL_RADIUS,
    vx: Math.cos(angle) * speed * direction,
    vy: Math.sin(angle) * speed,
    speed,
  };
  const totalHits = Math.min(state.totalHits + 1, MAX_CPU_HITS);
  return {
    ...state,
    ball,
    rallyHits: state.rallyHits + 1,
    totalHits,
    message: side === "player" ? "Treffer!" : "CPU-Treffer.",
  };
}

function scorePoint(state: GameState, scorer: Side): GameState {
  const playerScore = state.playerScore + (scorer === "player" ? 1 : 0);
  const cpuScore = state.cpuScore + (scorer === "cpu" ? 1 : 0);
  const winner =
    playerScore >= WINNING_SCORE
      ? "player"
      : cpuScore >= WINNING_SCORE
        ? "cpu"
        : null;

  return {
    ...state,
    phase: winner ? "complete" : "point",
    resumePhase: null,
    playerScore,
    cpuScore,
    pointTimer: 0,
    winner,
    message: winner
      ? winner === "player"
        ? "Du hast das Match gewonnen!"
        : "Die CPU hat das Match gewonnen."
      : scorer === "player"
        ? "Punkt für dich!"
        : "Punkt für die CPU.",
  };
}

export function movePlayerTo(state: GameState, y: number): GameState {
  return {
    ...state,
    player: {
      ...state.player,
      y: clamp(y, PADDLE_HEIGHT / 2, FIELD_HEIGHT - PADDLE_HEIGHT / 2),
    },
  };
}

export function stepGame(
  state: GameState,
  deltaSeconds: number,
  playerDirection = 0,
): GameState {
  const dt = clamp(deltaSeconds, 0, MAX_FRAME_DELTA);
  if (state.phase === "point") {
    const pointTimer = state.pointTimer + dt;
    return pointTimer >= POINT_DELAY
      ? restartRally(state)
      : { ...state, pointTimer };
  }
  if (state.phase !== "playing" || dt === 0) return state;

  let next: GameState = {
    ...state,
    player: {
      ...state.player,
      y: clamp(
        state.player.y + playerDirection * 430 * dt,
        PADDLE_HEIGHT / 2,
        FIELD_HEIGHT - PADDLE_HEIGHT / 2,
      ),
    },
  };

  const cpuSpeed = paddleSpeedForHits(next.totalHits);
  const cpuError = 112 - Math.min(next.totalHits, MAX_CPU_HITS) * 2.5;
  const predictedY = predictBallY(next.ball, next.cpu.x - PADDLE_WIDTH);
  const cpuTarget = clamp(
    predictedY + Math.sin(next.totalHits * 2.17 + next.ball.y / 83) * cpuError,
    PADDLE_HEIGHT / 2,
    FIELD_HEIGHT - PADDLE_HEIGHT / 2,
  );
  const cpuDelta = cpuTarget - next.cpu.y;
  next = {
    ...next,
    cpu: {
      ...next.cpu,
      y:
        next.cpu.y +
        Math.sign(cpuDelta) *
          Math.min(Math.abs(cpuDelta), cpuSpeed * dt),
    },
  };

  const previousBall = next.ball;
  const unreflectedY = previousBall.y + previousBall.vy * dt;
  let ball = {
    ...next.ball,
    x: next.ball.x + next.ball.vx * dt,
    y: next.ball.y + next.ball.vy * dt,
  };

  if (ball.y - BALL_RADIUS <= 0) {
    ball.y = BALL_RADIUS;
    ball.vy = Math.abs(ball.vy);
  } else if (ball.y + BALL_RADIUS >= FIELD_HEIGHT) {
    ball.y = FIELD_HEIGHT - BALL_RADIUS;
    ball.vy = -Math.abs(ball.vy);
  }
  next = { ...next, ball };

  const playerEdge = next.player.x + PADDLE_WIDTH / 2 + BALL_RADIUS;
  const cpuEdge = next.cpu.x - PADDLE_WIDTH / 2 - BALL_RADIUS;
  if (
    ball.vx < 0 &&
    previousBall.x >= playerEdge &&
    ball.x <= playerEdge &&
    Math.abs(
      previousBall.y +
        (unreflectedY - previousBall.y) *
          ((previousBall.x - playerEdge) / (previousBall.x - ball.x)) -
        next.player.y,
    ) <= PADDLE_HEIGHT / 2 + BALL_RADIUS
  ) {
    next = reflectBallOnPaddle(next, "player");
    ball = next.ball;
  } else if (
    ball.vx > 0 &&
    previousBall.x <= cpuEdge &&
    ball.x >= cpuEdge &&
    Math.abs(
      previousBall.y +
        (unreflectedY - previousBall.y) *
          ((cpuEdge - previousBall.x) / (ball.x - previousBall.x)) -
        next.cpu.y,
    ) <= PADDLE_HEIGHT / 2 + BALL_RADIUS
  ) {
    next = reflectBallOnPaddle(next, "cpu");
    ball = next.ball;
  }

  if (ball.x + BALL_RADIUS < 0) return scorePoint(next, "cpu");
  if (ball.x - BALL_RADIUS > FIELD_WIDTH) return scorePoint(next, "player");
  return next;
}
