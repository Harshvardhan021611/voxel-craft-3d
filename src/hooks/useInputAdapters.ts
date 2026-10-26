"use client";

import { useEffect, useRef } from "react";
import { applyDeadzone, GAMEPAD, input, queueAction } from "@/lib/input";
import { useGameStore } from "@/lib/store";
import { actionForCode, useSettings, type ControlAction } from "@/lib/settings";

const MOVEMENT_CODES = new Set([
  "KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space",
]);

/** Keyboard adapter — always listening and fully rebindable. */
export function useKeyboardMouseInput() {
  const keys = useRef<Set<string>>(new Set());

  useEffect(() => {
    const sync = () => {
      const state = useGameStore.getState();
      const bindings = useSettings.getState().bindings;
      const has = (action: ControlAction) => keys.current.has(bindings[action]);
      input.keyboardMove.x = (has("right") ? 1 : 0) - (has("left") ? 1 : 0);
      input.keyboardMove.y = (has("forward") ? 1 : 0) - (has("back") ? 1 : 0);
      input.jumpHeld = has("jump");
      input.sprintHeld = has("sprint");
      input.crouchHeld = has("crouch");
      input.descendHeld = has("crouch");
      if (input.keyboardMove.x !== 0 || input.keyboardMove.y !== 0) state.markControl("move");
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const state = useGameStore.getState();
      const bindings = useSettings.getState().bindings;
      const overlay = state.overlay;
      const isTyping =
        event.target instanceof HTMLElement &&
        (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA");

      if (!isTyping && MOVEMENT_CODES.has(event.code) && !state.paused && !overlay) {
        event.preventDefault();
      }
      keys.current.add(event.code);
      sync();

      const action = actionForCode(event.code, bindings);
      if (!action) {
        if (event.code >= "Digit1" && event.code <= "Digit8") state.setSelected(Number(event.code.slice(5)) - 1);
        return;
      }

      if (action === "inventory") {
        state.markControl("inventory");
        if (overlay === "inventory") state.setOverlay(null);
        else if (!state.paused) state.setOverlay("inventory");
      } else if (action === "interact") {
        state.markControl("interact");
        queueAction("interact");
      } else if (action === "drop") {
        state.markControl("drop");
        queueAction("drop");
      } else if (action === "pause") {
        state.markControl("pause");
        if (state.overlay && state.overlay !== "tutorial") state.setOverlay(null);
        else state.setPaused(!state.paused);
      } else if (action === "fly") {
        state.toggleFly();
      } else if (action === "jump") {
        state.markControl("jump");
      } else if (action === "sprint") {
        state.markControl("sprint");
      } else if (action === "crouch") {
        state.markControl("crouch");
      } else if (action === "forward" || action === "back" || action === "left" || action === "right") {
        state.markControl("move");
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      keys.current.delete(event.code);
      sync();
    };

    const onBlur = () => {
      keys.current.clear();
      sync();
    };

    const onWheel = (event: WheelEvent) => {
      if (useGameStore.getState().paused) return;
      queueAction(event.deltaY > 0 ? "select-next" : "select-prev");
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    window.addEventListener("wheel", onWheel, { passive: true });

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("wheel", onWheel);
    };
  }, []);
}

/** Gamepad adapter — polls the Gamepad API and routes through the shared bindings/actions. */
export function useGamepadInput() {
  useEffect(() => {
    let frame = 0;
    let previous: boolean[] = [];
    let last = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const pads = navigator.getGamepads ? navigator.getGamepads() : [];
      const pad = Array.from(pads).find((p) => p && p.connected) ?? null;

      if (!pad) {
        input.gamepadConnected = false;
        input.padMove.x = 0;
        input.padMove.y = 0;
        frame = requestAnimationFrame(loop);
        return;
      }

      input.gamepadConnected = true;
      input.gamepadName = pad.id;
      const state = useGameStore.getState();
      const active = state.device.mode === "controller" && !state.paused && !state.overlay;
      const sensitivity = useSettings.getState().padSensitivity;
      const invert = useSettings.getState().invertY ? -1 : 1;

      input.padMove.x = applyDeadzone(pad.axes[0] ?? 0);
      input.padMove.y = -applyDeadzone(pad.axes[1] ?? 0);
      if (Math.hypot(input.padMove.x, input.padMove.y) > 0.2) state.markControl("move");

      if (active) {
        const lookX = applyDeadzone(pad.axes[2] ?? 0);
        const lookY = applyDeadzone(pad.axes[3] ?? 0);
        if (Math.abs(lookX) + Math.abs(lookY) > 0.05) state.markControl("look");
        input.padLook.x -= lookX * 2.4 * sensitivity * dt;
        input.padLook.y -= lookY * 1.8 * sensitivity * invert * dt;
      }

      const pressed = (index: number) => Boolean(pad.buttons[index]?.pressed);
      const justPressed = (index: number) => pressed(index) && !previous[index];

      input.jumpHeld = pressed(GAMEPAD.jump);
      input.descendHeld = pressed(GAMEPAD.descend) || pressed(GAMEPAD.crouch);
      input.crouchHeld = pressed(GAMEPAD.crouch);
      input.sprintHeld = pressed(GAMEPAD.sprint);

      if (state.device.mode === "controller") {
        if (justPressed(GAMEPAD.mine)) {
          queueAction("mine");
          state.markControl("break");
        }
        if (justPressed(GAMEPAD.place)) {
          queueAction("place");
          state.markControl("place");
        }
        if (justPressed(GAMEPAD.fly)) {
          state.toggleFly();
          state.markControl("fly");
        }
        if (justPressed(GAMEPAD.inventory)) {
          if (state.overlay === "inventory") state.setOverlay(null);
          else if (!state.paused) state.setOverlay("inventory");
          state.markControl("inventory");
        }
        if (justPressed(GAMEPAD.interact)) {
          queueAction("interact");
          state.markControl("interact");
        }
        if (justPressed(GAMEPAD.jump)) state.markControl("jump");
        if (justPressed(GAMEPAD.sprint)) state.markControl("sprint");
        if (justPressed(GAMEPAD.prevBlock)) queueAction("select-prev");
        if (justPressed(GAMEPAD.nextBlock)) queueAction("select-next");
      }

      previous = pad.buttons.map((b) => b.pressed);
      frame = requestAnimationFrame(loop);
    };

    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, []);
}
