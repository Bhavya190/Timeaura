// users.ts (or employees.ts)
import prisma from "./db";

// Auth / basic user
export type Role = "admin" | "employee" | "teamLead";

export type User = {
  id: number;
  name: string;
  email: string;
  password: string;
  role: Role;
};

// Full employee profile
export type Employee = {
  id: number;
  code: string;
  email: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  password: string;
  role: Role;
  department: string;
  departmentId?: number;
  location: string;
  shift: "day" | "evening" | "night";

  // Details
  address: string;
  city: string;
  stateRegion: string;
  country: string;
  zip: string;
  phone: string;
  hireDate: string;
  terminationDate?: string;

  // Billing
  workType: "standard" | "overtime";
  billingType: "hourly" | "monthly";
  employeeRate: string;
  employeeCurrency: string;
  billingRateType: "fixed" | "hourly";
  billingCurrency: string;
  billingStart: string;
  billingEnd: string;
  avatarUrl?: string;
  emailNotifications?: boolean;
  weeklyReport?: boolean;
  securityAlerts?: boolean;
};

export async function getUsers(): Promise<User[]> {
  const employees = await prisma.employee.findMany();
  return employees.map(emp => ({
    id: emp.id,
    name: `${emp.firstName} ${emp.lastName}`,
    email: emp.email,
    password: emp.password,
    role: emp.role as Role,
  }));
}

export async function getEmployees(): Promise<Employee[]> {
  const employees = await prisma.employee.findMany();
  return employees as unknown as Employee[];
}

export async function createEmployee(data: Omit<Employee, "id">): Promise<Employee> {
  const created = await prisma.employee.create({
    data: {
      ...data,
      departmentId: data.departmentId || null,
    } as any
  });
  return created as unknown as Employee;
}

export async function updateEmployeeProfile(id: number, data: Partial<Employee>): Promise<Employee> {
  const updated = await prisma.employee.update({
    where: { id },
    data: data as any
  });
  return updated as unknown as Employee;
}

export async function deleteEmployee(id: number): Promise<void> {
  await prisma.employee.delete({
    where: { id }
  });
}
