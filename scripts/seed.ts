import { PrismaClient } from '.prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL must be defined");
  process.exit(1);
}
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database (handling existing records gracefully)...");

  const defaultPassword = await bcrypt.hash('password123', 10);

  // 1. Department
  const dept = await prisma.department.upsert({
    where: { name: 'Engineering' },
    update: {},
    create: {
      name: 'Engineering',
      description: 'Software Development Team'
    }
  });

  // 2. Users 
  const admin = await prisma.employee.upsert({
    where: { email: 'admin@timey.com' },
    update: { password: defaultPassword, role: 'admin' },
    create: {
      firstName: 'Alice',
      lastName: 'Admin',
      email: 'admin@timey.com',
      password: defaultPassword,
      role: 'admin',
      department: 'Engineering',
      departmentId: dept.id,
      code: 'ADM-001',
      location: 'Remote',
    }
  });

  const lead = await prisma.employee.upsert({
    where: { email: 'lead@timey.com' },
    update: { password: defaultPassword, role: 'teamLead' },
    create: {
      firstName: 'Tom',
      lastName: 'Lead',
      email: 'lead@timey.com',
      password: defaultPassword,
      role: 'teamLead',
      department: 'Engineering',
      departmentId: dept.id,
      code: 'TL-001',
      location: 'New York',
    }
  });

  const emp = await prisma.employee.upsert({
    where: { email: 'employee@timey.com' },
    update: { password: defaultPassword, role: 'employee' },
    create: {
      firstName: 'Emma',
      lastName: 'Employee',
      email: 'employee@timey.com',
      password: defaultPassword,
      role: 'employee',
      department: 'Engineering',
      departmentId: dept.id,
      code: 'EMP-001',
      location: 'London',
    }
  });

  const randSuffix = Date.now().toString().slice(-4);

  // 3. Client
  const clientRes = await prisma.client.create({
    data: {
      name: 'Acme Corp ' + randSuffix,
      email: 'contact' + randSuffix + '@acme.corp',
      country: 'USA',
      fixedBidMode: false,
      status: 'Active',
    }
  });

  // 4. Project
  const project = await prisma.project.create({
    data: {
      name: 'Acme Redesign ' + randSuffix,
      code: 'ACME' + randSuffix,
      clientId: clientRes.id,
      clientName: clientRes.name,
      teamLeadId: lead.id,
      status: 'Active',
      Employee_TeamMembers: {
        connect: [{ id: lead.id }, { id: emp.id }]
      }
    }
  });

  // 5. Tasks
  const task1 = await prisma.task.create({
    data: {
      projectId: project.id,
      projectName: project.name,
      name: 'Frontend Development',
      workedHours: 0,
      startDate: new Date().toISOString().split('T')[0],
      status: 'Not Started',
      billingType: 'billable',
      Employee: {
        connect: [{ id: emp.id }]
      }
    }
  });

  const task2 = await prisma.task.create({
    data: {
      projectId: project.id,
      projectName: project.name,
      name: 'Backend Architecture',
      workedHours: 5,
      startDate: new Date().toISOString().split('T')[0],
      status: 'In Progress',
      billingType: 'billable',
      Employee: {
        connect: [{ id: lead.id }]
      }
    }
  });

  // 6. Timesheet for Employee
  const ts = await prisma.timesheet.create({
    data: {
      employeeId: emp.id,
      weekStart: '2026-04-06',
      status: 'Submitted',
    }
  });

  await prisma.dailyTime.upsert({
    where: { employeeId_date: { employeeId: emp.id, date: '2026-04-06' } },
    update: { totalSeconds: 28800 },
    create: {
      employeeId: emp.id,
      date: '2026-04-06',
      status: 'Completed',
      totalSeconds: 28800 // 8 hours
    }
  });

  console.log("Seeding complete!");
  console.log("--- Credentials ---");
  console.log("Admin:  admin@timey.com  / password123");
  console.log("Lead:   lead@timey.com   / password123");
  console.log("Employee: employee@timey.com / password123");
}

main().catch((e) => {
  console.error("error:", e);
}).finally(() => process.exit(0));
