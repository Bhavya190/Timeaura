import prisma from "./db";
import type { Notification } from "@/types";

export async function getNotifications(userId: number): Promise<Notification[]> {
    const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
    });
    return notifications as unknown as Notification[];
}

export async function addNotification(userId: number, message: string): Promise<Notification> {
    const created = await prisma.notification.create({
        data: { userId, message }
    });
    return created as unknown as Notification;
}

export async function markNotificationRead(id: number): Promise<Notification> {
    const updated = await prisma.notification.update({
        where: { id },
        data: { isRead: true }
    });
    return updated as unknown as Notification;
}

export async function markAllNotificationsRead(userId: number): Promise<void> {
    await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true }
    });
}

export async function getAdminUserIds(): Promise<number[]> {
    const users = await prisma.employee.findMany({
        where: { role: { in: ['admin', 'teamLead'] } },
        select: { id: true }
    });
    return users.map((row: any) => row.id);
}
