import prisma from "./db";

export type TaskStatus = "Not Started" | "In Progress" | "Completed";
export type TaskBillingType = "billable" | "non-billable";

export type Task = {
  id: number;
  projectId: number;
  projectName: string;
  name: string;
  workedHours: number;
  assigneeIds: number[];
  date: string; // YYYY-MM-DD
  dueDate?: string;
  reportedTo?: string;
  status: TaskStatus;
  description?: string;
  billingType: TaskBillingType;
};

export async function getTasks(): Promise<Task[]> {
  const tasks = await prisma.task.findMany({
    include: { Employee: { select: { id: true } } }
  });

  return tasks.map((t: any) => ({
    ...t,
    status: t.status as TaskStatus,
    billingType: t.billingType as TaskBillingType,
    assigneeIds: t.Employee.map((e: any) => e.id),
    date: t.startDate,
    workedHours: Number(t.workedHours) || 0,
    description: t.description ?? undefined,
  }));
}

export async function createTask(data: Omit<Task, "id">): Promise<Task> {
  const { assigneeIds, date, ...rest } = data;

  const task = await prisma.task.create({
    data: {
      ...rest,
      startDate: date,
      Employee: {
        connect: (assigneeIds || []).map(id => ({ id }))
      }
    } as any,
    include: { Employee: { select: { id: true } } }
  });

  return {
    ...task,
    status: task.status as TaskStatus,
    billingType: task.billingType as TaskBillingType,
    assigneeIds: (task as any).Employee.map((e: any) => e.id),
    date: task.startDate,
    workedHours: Number(task.workedHours) || 0,
    description: task.description ?? undefined,
  } as Task;
}

export async function updateTask(id: number, data: Partial<Task>): Promise<Task> {
  const { assigneeIds, date, ...rest } = data;

  let updateData: any = { ...rest };
  if (date !== undefined) updateData.startDate = date;

  if (assigneeIds) {
    updateData.Employee = {
      set: assigneeIds.map(id => ({ id }))
    };
  }

  const task = await prisma.task.update({
    where: { id },
    data: updateData,
    include: { Employee: { select: { id: true } } }
  });

  return {
    ...task,
    status: task.status as TaskStatus,
    billingType: task.billingType as TaskBillingType,
    assigneeIds: (task as any).Employee.map((e: any) => e.id),
    date: task.startDate,
    workedHours: Number(task.workedHours) || 0,
    description: task.description ?? undefined,
  } as Task;
}

export async function deleteTask(id: number): Promise<void> {
  await prisma.task.delete({ where: { id } });
}
