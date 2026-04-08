import prisma from "./db";

export type ProjectStatus = "Active" | "On Hold" | "Completed";

export type Project = {
  id: number;
  name: string;
  code: string;
  clientId: number;
  clientName: string;
  teamLeadId: number | null;
  managerId: number | null;
  teamMemberIds?: number[]; // employee ids
  defaultBillingRate?: string;
  billingType?: "fixed" | "hourly";
  fixedCost?: string;
  startDate?: string;
  endDate?: string;
  invoiceFileName?: string;
  description?: string;
  duration?: string;
  estimatedCost?: string;
  budget?: string;
  totalHours?: number;
  status: ProjectStatus;
};

export async function getProjects(): Promise<Project[]> {
  const projects = await prisma.project.findMany({
    include: { Employee_TeamMembers: { select: { id: true } } }
  });

  return projects.map((p: any) => ({
    ...p,
    status: p.status as ProjectStatus,
    billingType: p.billingType as "fixed" | "hourly" | undefined,
    teamMemberIds: p.Employee_TeamMembers.map((e: any) => e.id),
    defaultBillingRate: p.defaultBillingRate ?? undefined,
    fixedCost: p.fixedCost ?? undefined,
    startDate: p.startDate ?? undefined,
    endDate: p.endDate ?? undefined,
    invoiceFileName: p.invoiceFileName ?? undefined,
    description: p.description ?? undefined,
    duration: p.duration ?? undefined,
    estimatedCost: p.estimatedCost ?? undefined,
    budget: p.estimatedCost ?? undefined,
    totalHours: 0, // Placeholder
  }));
}

export async function createProject(data: Omit<Project, "id">): Promise<Project> {
  const { teamMemberIds, budget, totalHours, ...rest } = data;

  const project = await prisma.project.create({
    data: {
      ...rest,
      Employee_TeamMembers: {
        connect: (teamMemberIds || []).map(id => ({ id }))
      }
    } as any,
    include: { Employee_TeamMembers: { select: { id: true } } }
  });

  return {
    ...project,
    status: project.status as ProjectStatus,
    billingType: project.billingType as "fixed" | "hourly" | undefined,
    teamMemberIds: (project as any).Employee_TeamMembers.map((e: any) => e.id),
    defaultBillingRate: project.defaultBillingRate ?? undefined,
    fixedCost: project.fixedCost ?? undefined,
    startDate: project.startDate ?? undefined,
    endDate: project.endDate ?? undefined,
    invoiceFileName: project.invoiceFileName ?? undefined,
    description: project.description ?? undefined,
    duration: project.duration ?? undefined,
    estimatedCost: project.estimatedCost ?? undefined,
    budget: project.estimatedCost ?? undefined,
    totalHours: 0,
  } as Project;
}

export async function updateProject(id: number, data: Partial<Project>): Promise<Project> {
  const { teamMemberIds, budget, totalHours, ...rest } = data;

  let updateData: any = { ...rest };

  if (teamMemberIds) {
    updateData.Employee_TeamMembers = {
      set: teamMemberIds.map(id => ({ id }))
    };
  }

  const project = await prisma.project.update({
    where: { id },
    data: updateData,
    include: { Employee_TeamMembers: { select: { id: true } } }
  });

  return {
    ...project,
    status: project.status as ProjectStatus,
    billingType: project.billingType as "fixed" | "hourly" | undefined,
    teamMemberIds: (project as any).Employee_TeamMembers.map((e: any) => e.id),
    defaultBillingRate: project.defaultBillingRate ?? undefined,
    fixedCost: project.fixedCost ?? undefined,
    startDate: project.startDate ?? undefined,
    endDate: project.endDate ?? undefined,
    invoiceFileName: project.invoiceFileName ?? undefined,
    description: project.description ?? undefined,
    duration: project.duration ?? undefined,
    estimatedCost: project.estimatedCost ?? undefined,
    budget: project.estimatedCost ?? undefined,
    totalHours: 0,
  } as Project;
}

export async function deleteProject(id: number): Promise<void> {
  await prisma.project.delete({ where: { id } });
}
