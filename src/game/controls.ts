export type KeyboardAction = "move-up" | "move-down" | "toggle" | "pause";

export function getKeyboardAction(key: string): KeyboardAction | null {
  switch (key.toLowerCase()) {
    case "w":
    case "arrowup":
      return "move-up";
    case "s":
    case "arrowdown":
      return "move-down";
    case " ":
      return "toggle";
    case "escape":
      return "pause";
    default:
      return null;
  }
}
