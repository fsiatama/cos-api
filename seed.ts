import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const manageUsers = await prisma.permission.create({
    data: {
      action: 'manage',
      subject: 'users',
      title: 'Users',
      icon: 'users-icon',
      route: '/users',
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

  const applicantRole = await prisma.role.create({
    data: {
      name: 'APPLICANT',
    },
  });

  // Crear usuarios
  const hashPassword = await bcrypt.hash('American.One_23', 10);

  const adminUser = await prisma.user.create({
    data: {
      email: 'systems@americanone-esl.com',
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
      permissionId: manageUsers.id,
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
