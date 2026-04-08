import prisma from './src/lib/db'; 
prisma.employee.count().then(console.log).catch(console.error).finally(() => process.exit(0));
