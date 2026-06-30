import { prisma } from "@/lib/prisma";

export async function createNotification(params: {
  userId: string;
  type: string;
  title: string;
  message: string;
}) {
  return prisma.notification.create({
    data: params,
  });
}

export async function getNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

export async function markNotificationRead(
  userId: string,
  notificationId?: string,
) {
  return prisma.notification.updateMany({
    where: {
      userId,
      ...(notificationId ? { id: notificationId } : {}),
    },
    data: {
      isRead: true,
    },
  });
}
