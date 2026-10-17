import { describe, expect, it } from "vitest";
import { getKeyboardAction } from "./controls";

describe("keyboard controls", () => {
  it("maps both key sets and match actions", () => {
    expect(getKeyboardAction("w")).toBe("move-up");
    expect(getKeyboardAction("ArrowUp")).toBe("move-up");
    expect(getKeyboardAction("s")).toBe("move-down");
    expect(getKeyboardAction("ArrowDown")).toBe("move-down");
    expect(getKeyboardAction(" ")).toBe("toggle");
    expect(getKeyboardAction("Escape")).toBe("pause");
    expect(getKeyboardAction("x")).toBeNull();
  });
});
