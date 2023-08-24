import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  async getUserRoles(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async getUserPermissions(userId: number) {
    const userRoles = await this.getUserRoles(userId);

    const permissions = userRoles.roles
      .flatMap((userRole) => userRole.role.permissions)
      .map((rolePermission) => rolePermission.permission.name);

    return permissions;
  }
}
