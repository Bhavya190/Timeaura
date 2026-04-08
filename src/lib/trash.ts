import prisma from "./db";

export type TrashItemType = "Employee" | "Client" | "Project" | "Task";

export interface TrashItem {
  id: number;
  userId: number;
  entityType: TrashItemType;
  entityId: number;
  entityData: any; // JSONB
  createdAt: string;
}

export async function moveToTrash(
  userId: number,
  entityType: TrashItemType,
  entityId: number,
  entityData: any
): Promise<void> {
  await prisma.trash.create({
    data: {
      userId,
      entityType,
      entityId,
      entityData: entityData as any
    }
  });
}

export async function getTrashForUser(userId: number): Promise<TrashItem[]> {
  const items = await prisma.trash.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
  return items.map((t: any) => ({
    ...t,
    createdAt: t.createdAt.toISOString(),
  })) as TrashItem[];
}

export async function getAllTrash(): Promise<TrashItem[]> {
  const items = await prisma.trash.findMany({
    orderBy: { createdAt: 'desc' }
  });
  return items.map((t: any) => ({
    ...t,
    createdAt: t.createdAt.toISOString()
  })) as TrashItem[];
}

export async function restoreFromTrash(trashId: number): Promise<void> {
  const item = await prisma.trash.findUnique({ where: { id: trashId } });

  if (!item) {
    throw new Error("Trash item not found");
  }

  const { entityType, entityData } = item;
  const data: any = entityData;

  try {
    switch (entityType) {
      case "Employee":
        await prisma.employee.create({
          data: {
            id: data.id,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            password: data.password,
            role: data.role,
            code: data.code,
            department: data.department,
            departmentId: data.departmentId,
            location: data.location,
            shift: data.shift,
            address: data.address,
            city: data.city,
            stateRegion: data.stateRegion,
            country: data.country,
            zip: data.zip,
            phone: data.phone,
            hireDate: data.hireDate,
            workType: data.workType,
            billingType: data.billingType,
            employeeRate: data.employeeRate,
            employeeCurrency: data.employeeCurrency,
            billingRateType: data.billingRateType,
            billingCurrency: data.billingCurrency,
            billingStart: data.billingStart,
            billingEnd: data.billingEnd
          } as any
        });
        break;

      case "Client":
        await prisma.client.create({
          data: {
            id: data.id,
            name: data.name,
            nickname: data.nickname,
            email: data.email,
            country: data.country,
            address: data.address,
            city: data.city,
            stateRegion: data.stateRegion,
            zip: data.zip,
            contactNumber: data.contactNumber,
            defaultRate: data.defaultRate,
            fixedBidMode: data.fixedBidMode || false,
            status: data.status
          } as any
        });
        break;

      case "Project":
        await prisma.project.create({
          data: {
            id: data.id,
            name: data.name,
            code: data.code,
            clientId: data.clientId,
            clientName: data.clientName,
            teamLeadId: data.teamLeadId,
            managerId: data.managerId,
            defaultBillingRate: data.defaultBillingRate,
            billingType: data.billingType,
            fixedCost: data.fixedCost,
            startDate: data.startDate,
            endDate: data.endDate,
            invoiceFileName: data.invoiceFileName,
            description: data.description,
            duration: data.duration,
            estimatedCost: data.estimatedCost,
            status: data.status,
            Employee_TeamMembers: {
              connect: (data.teamMemberIds || []).map((id: number) => ({ id }))
            }
          } as any
        });
        break;

      case "Task":
        await prisma.task.create({
          data: {
            id: data.id,
            projectId: data.projectId,
            projectName: data.projectName,
            name: data.name,
            workedHours: data.workedHours,
            startDate: data.startDate || data.date,
            dueDate: data.dueDate,
            reportedTo: data.reportedTo,
            status: data.status,
            description: data.description,
            billingType: data.billingType,
            Employee: {
              connect: (data.assigneeIds || []).map((id: number) => ({ id }))
            }
          } as any
        });
        break;

      default:
        throw new Error("Unknown entity type");
    }

    await hardDeleteTrash(trashId);
  } catch (err: any) {
    if (err.code === "P2002") { // unique violation in Prisma
      throw new Error(`Failed to restore: An item with the same identifier already exists.`);
    }
    throw new Error(`Restore failed: ${err.message}`);
  }
}

export async function hardDeleteTrash(trashId: number): Promise<void> {
  await prisma.trash.delete({ where: { id: trashId } });
}

export async function cleanupTrash(): Promise<void> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  await prisma.trash.deleteMany({
    where: {
      createdAt: { lt: thirtyDaysAgo }
    }
  });
}

