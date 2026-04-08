import prisma from "./db";
import type { Timesheet } from "@/types";

export async function getTimesheets(): Promise<Timesheet[]> {
  const timesheets = await prisma.timesheet.findMany();
  return timesheets.map(ts => ({
    ...ts,
    status: ts.status || "Not Submitted"
  } as unknown as Timesheet));
}

export async function getEmployeeTimesheets(employeeId: number): Promise<Timesheet[]> {
  const timesheets = await prisma.timesheet.findMany({
    where: { employeeId }
  });
  return timesheets.map(ts => ({
    ...ts,
    status: ts.status || "Not Submitted"
  } as unknown as Timesheet));
}

export async function upsertTimesheet(data: Omit<Timesheet, "id">): Promise<Timesheet> {
  const { employeeId, weekStart, status } = data;

  const existing = await prisma.timesheet.findFirst({
    where: { employeeId, weekStart }
  });

  if (existing) {
    const updated = await prisma.timesheet.update({
      where: { id: existing.id },
      data: { status, rejectionComment: null }
    });
    return updated as unknown as Timesheet;
  } else {
    const created = await prisma.timesheet.create({
      data: { employeeId, weekStart, status } as any
    });
    return created as unknown as Timesheet;
  }
}

export async function approveTimesheet(timesheetId: number): Promise<Timesheet> {
  const updated = await prisma.timesheet.update({
    where: { id: timesheetId },
    data: { status: "Approved" }
  });
  return updated as unknown as Timesheet;
}

export async function rejectTimesheet(timesheetId: number, comment: string): Promise<Timesheet> {
  const updated = await prisma.timesheet.update({
    where: { id: timesheetId },
    data: { status: "Rejected", rejectionComment: comment }
  });
  return updated as unknown as Timesheet;
}

