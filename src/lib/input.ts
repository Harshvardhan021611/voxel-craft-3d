import type { DeviceMode } from "@/lib/device";

export type SandboxAction =
  | "mine"
  | "place"
  | "select-next"
  | "select-prev"
  | "pause"
  | "fly"
  | "interact"
  | "inventory"
  | "drop";

export interface Vec2 {
  x: number;
  y: number;
}

export const input = {
  keyboardMove: { x: 0, y: 0 } as Vec2,
  padMove: { x: 0, y: 0 } as Vec2,
  touchMove: { x: 0, y: 0 } as Vec2,

  mouseLook: { x: 0, y: 0 } as Vec2,
  padLook: { x: 0, y: 0 } as Vec2,
  touchLook: { x: 0, y: 0 } as Vec2,

  jumpHeld: false,
  descendHeld: false,
  crouchHeld: false,
  sprintHeld: false,

  actions: [] as SandboxAction[],
  gamepadConnected: false,
  gamepadName: null as string | null,
};

export function queueAction(action: SandboxAction) {
  input.actions.push(action);
}

export function drainActions(): SandboxAction[] {
  if (input.actions.length === 0) return [];
  const actions = input.actions.slice();
  input.actions.length = 0;
  return actions;
}

export function activeMove(device: DeviceMode): Vec2 {
  if (device === "mobile") {
    return input.touchMove.x !== 0 || input.touchMove.y !== 0 ? input.touchMove : input.keyboardMove;
  }
  if (device === "controller") {
    return input.padMove.x !== 0 || input.padMove.y !== 0 ? input.padMove : input.keyboardMove;
  }
  return input.keyboardMove;
}

export function consumeLook(device: DeviceMode): Vec2 {
  let x = input.mouseLook.x;
  let y = input.mouseLook.y;
  input.mouseLook.x = 0;
  input.mouseLook.y = 0;

  if (device === "mobile") {
    x += input.touchLook.x;
    y += input.touchLook.y;
    input.touchLook.x = 0;
    input.touchLook.y = 0;
  } else if (device === "controller") {
    x += input.padLook.x;
    y += input.padLook.y;
    input.padLook.x = 0;
    input.padLook.y = 0;
  }

  return { x, y };
}

export function clearInput() {
  input.keyboardMove.x = 0;
  input.keyboardMove.y = 0;
  input.touchMove.x = 0;
  input.touchMove.y = 0;
  input.mouseLook.x = 0;
  input.mouseLook.y = 0;
  input.touchLook.x = 0;
  input.touchLook.y = 0;
  input.padLook.x = 0;
  input.padLook.y = 0;
  input.jumpHeld = false;
  input.descendHeld = false;
  input.crouchHeld = false;
  input.sprintHeld = false;
  input.actions.length = 0;
}

export const GAMEPAD = {
  jump: 0,
  fly: 1,
  descend: 2,
  prevBlock: 3,
  nextBlock: 4,
  interact: 5,
  place: 6,
  mine: 7,
  crouch: 8,
  inventory: 9,
  pause: 9,
  sprint: 10,
  dpadUp: 12,
  dpadDown: 13,
  dpadLeft: 14,
  dpadRight: 15,
} as const;

export const DEADZONE = 0.16;

export function applyDeadzone(value: number): number {
  if (Math.abs(value) < DEADZONE) return 0;
  return (value - Math.sign(value) * DEADZONE) / (1 - DEADZONE);
}
