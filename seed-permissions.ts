import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const manageConcepts = await prisma.permission.create({
    data: {
      action: 'manage',
      subject: 'concepts',
      title: 'Concepts',
      icon: 'concepts-icon',
      route: '/concepts',
    },
  });

  const manageInvoices = await prisma.permission.create({
    data: {
      action: 'manage',
      subject: 'invoices',
      title: 'Invoices',
      icon: 'invoices-icon',
      route: '/invoices',
    },
  });

  const adminRole = await prisma.role.findFirst({
    where: {
      name: 'ADMIN',
    },
  });

  // Conectar roles a permisos usando la tabla RolePermission
  await prisma.rolePermission.create({
    data: {
      roleId: adminRole.id,
      permissionId: manageConcepts.id,
    },
  });

  await prisma.rolePermission.create({
    data: {
      roleId: adminRole.id,
      permissionId: manageInvoices.id,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
