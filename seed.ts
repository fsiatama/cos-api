import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Crear permisos
  const readDashboard = await prisma.permission.create({
    data: {
      name: 'read:dashboard',
      title: 'Dashboard',
      icon: 'dashboard-icon',
      route: '/dashboard',
    },
  });

  const viewSettings = await prisma.permission.create({
    data: {
      name: 'view:settings',
      title: 'Settings',
      icon: 'settings-icon',
      route: '/settings',
    },
  });

  const adminRole = await prisma.role.create({
    data: {
      name: 'ADMIN',
    },
  });

  const userRole = await prisma.role.create({
    data: {
      name: 'USER',
    },
  });

  // Crear usuarios
  const hashPassword = await bcrypt.hash('Abc123.', 10);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: hashPassword,
      name: 'Admin',
    },
  });

  const normalUser = await prisma.user.create({
    data: {
      email: 'user@example.com',
      password: hashPassword,
      name: 'User',
    },
  });

  // Conectar roles a permisos usando la tabla RolePermission
  await prisma.rolePermission.create({
    data: {
      roleId: adminRole.id,
      permissionId: readDashboard.id,
    },
  });

  await prisma.rolePermission.create({
    data: {
      roleId: adminRole.id,
      permissionId: viewSettings.id,
    },
  });

  await prisma.rolePermission.create({
    data: {
      roleId: userRole.id,
      permissionId: readDashboard.id,
    },
  });

  // Conectar usuarios a roles usando la tabla UserRole
  await prisma.userRole.create({
    data: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  await prisma.userRole.create({
    data: {
      userId: normalUser.id,
      roleId: userRole.id,
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
