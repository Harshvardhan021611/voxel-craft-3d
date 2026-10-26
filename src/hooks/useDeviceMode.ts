"use client";

import { useCallback, useEffect } from "react";
import { detectDevice, firstConnectedGamepad, type DeviceInfo } from "@/lib/device";
import { useGameStore } from "@/lib/store";

const reportedModes = new Set<string>();

function reportSession(info: DeviceInfo) {
  if (reportedModes.has(info.mode)) return;
  reportedModes.add(info.mode);
  void fetch("/api/device-sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      device: info.mode,
      platform: info.platform,
      touchScreen: info.touch,
      gamepad: info.gamepad,
      gamepadName: info.gamepadName,
    }),
  }).catch(() => undefined);
}

function controllerInfo(pad: Gamepad, previous: DeviceInfo): DeviceInfo {
  return {
    ...previous,
    mode: "controller",
    gamepad: true,
    gamepadName: pad.id.replace(/\s*\(.*?\)\s*/g, "").trim() || "Gamepad",
  };
}

/**
 * Detects the player's input device automatically and keeps it up to date:
 * plugging in a controller, touching the screen, or pressing a key swaps layouts instantly.
 */
export function useDeviceMode() {
  const device = useGameStore((s) => s.device);
  const detected = useGameStore((s) => s.detected);
  const setDevice = useGameStore((s) => s.setDevice);

  const redetect = useCallback(() => {
    const info = detectDevice();
    setDevice(info);
    reportSession(info);
    return info;
  }, [setDevice]);

  useEffect(() => {
    const apply = (info: DeviceInfo) => {
      const state = useGameStore.getState();
      const current = state.device;
      if (
        state.detected &&
        current.mode === info.mode &&
        current.gamepadName === info.gamepadName &&
        current.platform === info.platform
      ) {
        return;
      }
      setDevice(info);
      reportSession(info);
      if (info.mode === "controller" && info.gamepadName) {
        useGameStore.getState().pushNotice(`Controller connected — ${info.gamepadName}`);
      }
    };

    // 1. Instant automatic detection on first paint.
    apply(detectDevice());

    // 2. Live switching — the last meaningful input wins.
    const onKeyDown = () => {
      apply({ ...detectDevice(), mode: "pc" });
    };

    // A mouse only promotes the PC layout when a fine pointer actually exists.
    // Mobile browsers can synthesise mouse events after taps, which must never
    // steal the touch layout.
    const finePointer = window.matchMedia?.("(any-pointer: fine)").matches ?? false;

    const onMouseMove = (event: MouseEvent) => {
      if (!finePointer) return;
      if (Math.abs(event.movementX) + Math.abs(event.movementY) < 2) return;
      const state = useGameStore.getState();
      const capabilities = (event as MouseEvent & {
        sourceCapabilities?: { firesTouchEvents?: boolean };
      }).sourceCapabilities;
      if (state.device.touch && capabilities?.firesTouchEvents) return;
      if (state.device.mode !== "pc") apply({ ...detectDevice(), mode: "pc" });
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "touch" || event.pointerType === "pen") {
        const base = detectDevice();
        if (useGameStore.getState().device.mode !== "mobile") {
          apply({ ...base, mode: "mobile", touch: true });
        }
      }
    };

    const onGamepadConnected = (event: Event) => {
      const pad = (event as GamepadEvent).gamepad;
      apply(controllerInfo(pad, detectDevice()));
    };

    const onGamepadDisconnected = () => {
      apply(detectDevice());
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("gamepadconnected", onGamepadConnected);
    window.addEventListener("gamepaddisconnected", onGamepadDisconnected);

    // Some browsers only expose pads after the first interaction — poll as a safety net.
    // Only a real button/stick press promotes the controller, so a connected-but-idle
    // pad never steals the layout from an actively used mouse or touchscreen.
    const poll = window.setInterval(() => {
      const pad = firstConnectedGamepad();
      const current = useGameStore.getState().device;
      if (pad) {
        const active =
          pad.buttons.some((button) => button.pressed) ||
          pad.axes.some((axis) => Math.abs(axis) > 0.35);
        if (active && current.mode !== "controller") {
          apply(controllerInfo(pad, detectDevice()));
        }
      } else if (current.mode === "controller") {
        apply(detectDevice());
      }
    }, 1000);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("gamepadconnected", onGamepadConnected);
      window.removeEventListener("gamepaddisconnected", onGamepadDisconnected);
      window.clearInterval(poll);
    };
  }, [setDevice]);

  return { device, detected, redetect };
}
