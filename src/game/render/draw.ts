import {
  BALL_RADIUS,
  FIELD_HEIGHT,
  FIELD_WIDTH,
  GameState,
  PADDLE_HEIGHT,
  PADDLE_WIDTH,
} from "../game";

const stars = Array.from({ length: 58 }, (_, index) => ({
  x: (index * 137 + 43) % FIELD_WIDTH,
  y: (index * 83 + 19) % FIELD_HEIGHT,
  size: index % 7 === 0 ? 3 : 2,
  alpha: 0.2 + ((index * 17) % 60) / 100,
}));

export function drawGame(
  context: CanvasRenderingContext2D,
  state: GameState,
): void {
  context.clearRect(0, 0, FIELD_WIDTH, FIELD_HEIGHT);
  context.fillStyle = "#080b1a";
  context.fillRect(0, 0, FIELD_WIDTH, FIELD_HEIGHT);

  for (const star of stars) {
    context.globalAlpha = star.alpha;
    context.fillStyle = "#a8d7ff";
    context.fillRect(star.x, star.y, star.size, star.size);
  }
  context.globalAlpha = 1;

  context.fillStyle = "rgba(95, 215, 255, 0.55)";
  for (let y = 12; y < FIELD_HEIGHT; y += 24) {
    context.fillRect(FIELD_WIDTH / 2 - 2, y, 4, 12);
  }

  context.shadowBlur = 16;
  context.shadowColor = "#40e8ff";
  context.fillStyle = "#65f2ff";
  context.fillRect(
    Math.round(state.player.x - PADDLE_WIDTH / 2),
    Math.round(state.player.y - PADDLE_HEIGHT / 2),
    PADDLE_WIDTH,
    PADDLE_HEIGHT,
  );
  context.shadowColor = "#ff56ce";
  context.fillStyle = "#ff68d2";
  context.fillRect(
    Math.round(state.cpu.x - PADDLE_WIDTH / 2),
    Math.round(state.cpu.y - PADDLE_HEIGHT / 2),
    PADDLE_WIDTH,
    PADDLE_HEIGHT,
  );

  context.shadowColor = "#fff1ae";
  context.fillStyle = "#fff3c4";
  context.fillRect(
    Math.round(state.ball.x - BALL_RADIUS),
    Math.round(state.ball.y - BALL_RADIUS),
    BALL_RADIUS * 2,
    BALL_RADIUS * 2,
  );
  context.shadowBlur = 0;
}
