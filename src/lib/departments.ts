import prisma from "./db";
import { Department } from "@/types";

export async function getDepartments(): Promise<Department[]> {
    const departments = await prisma.department.findMany({
        include: { _count: { select: { Employee: true } } },
        orderBy: { name: 'asc' }
    });
    return departments.map((d: any) => ({
        ...d,
        employeeCount: d._count.Employee
    } as unknown as Department));
}

export async function getDepartmentById(id: number): Promise<Department | null> {
    const department = await prisma.department.findUnique({ where: { id } });
    if (!department) return null;
    return department as unknown as Department;
}

export async function createDepartment(data: { name: string; description?: string }): Promise<Department> {
    const created = await prisma.department.create({
        data: {
            name: data.name,
            description: data.description || null as any
        }
    });
    return created as unknown as Department;
}

export async function updateDepartment(id: number, data: { name: string; description?: string }): Promise<Department> {
    const updated = await prisma.department.update({
        where: { id },
        data: {
            name: data.name,
            description: data.description || null as any,
            updatedAt: new Date()
        }
    });
    return updated as unknown as Department;
}

export async function deleteDepartment(id: number): Promise<void> {
    await prisma.department.delete({ where: { id } });
}

export async function getDepartmentEmployees(departmentId: number) {
    const employees = await prisma.employee.findMany({
        where: { departmentId },
        select: { id: true, firstName: true, lastName: true, email: true, role: true, code: true }
    });
    return employees;
}

