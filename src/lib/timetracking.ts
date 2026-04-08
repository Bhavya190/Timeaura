import prisma from "./db";

export type DailyTimeStatus = "Not Started" | "Clocked In" | "Paused" | "Clocked Out";

export type DailyTime = {
    id: number;
    employeeId: number;
    date: string;
    status: DailyTimeStatus;
    totalSeconds: number;
    lastClockInTime: string | null;
};

// Helper to sanitize dates for Next.js actions
function formatRow(row: any): DailyTime {
    return {
        ...row,
        lastClockInTime: row.lastClockInTime ? new Date(row.lastClockInTime).toISOString() : null
    } as DailyTime;
}

export async function getDailyTime(employeeId: number, date: string): Promise<DailyTime | null> {
    const res = await prisma.dailyTime.findFirst({
        where: { employeeId, date }
    });
    if (!res) return null;
    return formatRow(res);
}

export async function clockIn(employeeId: number, date: string): Promise<DailyTime> {
    const existing = await getDailyTime(employeeId, date);
    const now = new Date();
    
    if (!existing) {
        const res = await prisma.dailyTime.create({
            data: {
                employeeId,
                date,
                status: "Clocked In",
                lastClockInTime: now
            }
        });
        return formatRow(res);
    }

    if (existing.status === "Clocked Out") {
        throw new Error("Already clocked out for the day.");
    }

    if (existing.status !== "Clocked In") {
        const res = await prisma.dailyTime.update({
            where: { id: existing.id },
            data: {
                status: "Clocked In",
                lastClockInTime: now,
                updatedAt: now
            }
        });
        return formatRow(res);
    }
    return existing;
}

export async function pauseTime(employeeId: number, date: string): Promise<DailyTime> {
    const existing = await prisma.dailyTime.findFirst({ where: { employeeId, date }});
    if (!existing) throw new Error("No time record found.");
    if (existing.status !== "Clocked In") return formatRow(existing); 
    
    const now = new Date();
    const diffInSeconds = existing.lastClockInTime ? Math.floor((now.getTime() - new Date(existing.lastClockInTime).getTime()) / 1000) : 0;

    const res = await prisma.dailyTime.update({
         where: { id: existing.id },
         data: {
             status: "Paused",
             totalSeconds: existing.totalSeconds + diffInSeconds,
             lastClockInTime: null,
             updatedAt: now
         }
    });
    return formatRow(res);
}

export async function clockOut(employeeId: number, date: string): Promise<DailyTime> {
    let existing = await prisma.dailyTime.findFirst({ where: { employeeId, date }});
    
    if (!existing) {
         const res = await prisma.dailyTime.create({
             data: {
                 employeeId,
                 date,
                 status: "Clocked Out",
                 totalSeconds: 0
             }
         });
         return formatRow(res);
    }
    
    if (existing.status === "Clocked Out") return formatRow(existing);
    
    const now = new Date();
    let additionalSeconds = 0;
    
    if (existing.status === "Clocked In" && existing.lastClockInTime) {
        additionalSeconds = Math.floor((now.getTime() - new Date(existing.lastClockInTime).getTime()) / 1000);
    }

    const res = await prisma.dailyTime.update({
        where: { id: existing.id },
        data: {
            status: "Clocked Out",
            totalSeconds: existing.totalSeconds + additionalSeconds,
            lastClockInTime: null,
            updatedAt: now
        }
    });
    
    return formatRow(res);
}

