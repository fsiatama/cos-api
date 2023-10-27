import { PrismaClient } from '@prisma/client';

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

  const manageConceptPriceHistory = await prisma.permission.create({
    data: {
      action: 'manage',
      subject: 'concept-prices',
      title: 'Concept Prices',
      icon: 'invoices-icon',
      route: '/concept-prices',
    },
  });

  const manageApplicant = await prisma.permission.create({
    data: {
      action: 'manage',
      subject: 'applicants',
      title: 'Applicants',
      icon: 'invoices-icon',
      route: '/applicants',
    },
  });

  const adminRole = await prisma.role.findFirst({
    where: {
      name: 'ADMIN',
    },
  });

  const applicantRole = await prisma.role.findFirst({
    where: {
      name: 'APPLICANT',
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

  await prisma.rolePermission.create({
    data: {
      roleId: adminRole.id,
      permissionId: manageConceptPriceHistory.id,
    },
  });

  await prisma.rolePermission.create({
    data: {
      roleId: adminRole.id,
      permissionId: manageApplicant.id,
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
