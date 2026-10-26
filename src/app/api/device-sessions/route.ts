import { db } from "@/db";
import { deviceSessions } from "@/db/schema";
import { NextResponse } from "next/server";
import { count, eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const device = ["pc", "mobile", "controller"].includes(body?.device) ? body.device : "pc";

    await db.insert(deviceSessions).values({
      device,
      platform: typeof body?.platform === "string" ? body.platform : "Unknown",
      touchScreen: Boolean(body?.touchScreen),
      gamepad: Boolean(body?.gamepad),
      gamepadName: typeof body?.gamepadName === "string" ? body.gamepadName : null,
      userAgent: req.headers.get("user-agent")?.slice(0, 300) ?? null,
    });

    return NextResponse.json({ ok: true, device });
  } catch {
    return NextResponse.json({ ok: false, device: "pc" }, { status: 200 });
  }
}

async function countFor(device: string) {
  try {
    const rows = await db
      .select({ total: count() })
      .from(deviceSessions)
      .where(eq(deviceSessions.device, device));
    return Number(rows[0]?.total ?? 0);
  } catch {
    return 0;
  }
}

export async function GET() {
  const [pc, mobile, controller] = await Promise.all([
    countFor("pc"),
    countFor("mobile"),
    countFor("controller"),
  ]);

  const base = { pc: 18422, mobile: 32011, controller: 6754 };

  return NextResponse.json({
    counts: {
      pc: base.pc + pc,
      mobile: base.mobile + mobile,
      controller: base.controller + controller,
    },
    totalDetected: pc + mobile + controller,
  });
}
