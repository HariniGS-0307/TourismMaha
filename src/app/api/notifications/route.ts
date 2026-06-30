import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getNotifications,
  markNotificationRead,
} from "@/server/services/notification-service";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notifications = await getNotifications(session.user.id);
  return NextResponse.json(notifications);
}

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  await markNotificationRead(session.user.id, body.notificationId);
  return NextResponse.json({ ok: true });
}
