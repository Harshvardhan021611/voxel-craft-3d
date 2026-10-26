export type DeviceMode = "pc" | "mobile" | "controller";

export interface DeviceInfo {
  mode: DeviceMode;
  platform: string;
  touch: boolean;
  gamepad: boolean;
  gamepadName: string | null;
}

export function platformLabel(): string {
  if (typeof navigator === "undefined") return "Unknown";
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return /iPad/i.test(ua) ? "iPadOS" : "iOS";
  if (/Android/i.test(ua)) return "Android";
  if (/Windows/i.test(ua)) return "Windows";
  if (/Macintosh|Mac OS X/i.test(ua)) return "macOS";
  if (/Linux/i.test(ua)) return "Linux";
  return "Other";
}

export function firstConnectedGamepad(): Gamepad | null {
  if (typeof navigator === "undefined" || !navigator.getGamepads) return null;
  const pads = navigator.getGamepads();
  for (const pad of pads) {
    if (pad && pad.connected) return pad;
  }
  return null;
}

/**
 * Automatic detection — no manual setup.
 * Priority: connected controller > touch-first (coarse pointer / mobile UA) > keyboard + mouse.
 */
export function detectDevice(): DeviceInfo {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return { mode: "pc", platform: "Unknown", touch: false, gamepad: false, gamepadName: null };
  }

  const maxTouch = navigator.maxTouchPoints ?? 0;
  const touch =
    "ontouchstart" in window ||
    maxTouch > 0 ||
    window.matchMedia?.("(any-pointer: coarse)").matches === true;
  const coarse = window.matchMedia?.("(pointer: coarse)").matches === true;
  const finePointer = window.matchMedia?.("(any-pointer: fine)").matches === true;
  const mobileUA = /Android|iPhone|iPad|iPod|Mobile|Windows Phone/i.test(navigator.userAgent);
  const pad = firstConnectedGamepad();

  if (pad) {
    return {
      mode: "controller",
      platform: platformLabel(),
      touch,
      gamepad: true,
      gamepadName: pad.id.replace(/\s*\(.*?\)\s*/g, "").trim() || "Gamepad",
    };
  }

  // Touch-screen laptops keep the desktop layout: require a coarse primary pointer
  // or a mobile user-agent instead of merely reporting touch capability.
  if (touch && (coarse || mobileUA || (maxTouch > 1 && !finePointer))) {
    return { mode: "mobile", platform: platformLabel(), touch: true, gamepad: false, gamepadName: null };
  }

  return { mode: "pc", platform: platformLabel(), touch, gamepad: false, gamepadName: null };
}

export const DEVICE_LABELS: Record<DeviceMode, string> = {
  pc: "Keyboard + Mouse",
  mobile: "Touch",
  controller: "Controller",
};
