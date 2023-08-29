import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  async getUserRoles(userId: string) {
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

  async getUserPermissions(userId: string) {
    const userRoles = await this.getUserRoles(userId);

    const permissions = userRoles.roles
      .flatMap((userRole) => userRole.role.permissions)
      .map((rolePermission) => ({
        subject: rolePermission.permission.subject,
        action: rolePermission.permission.action,
      }));

    return permissions;
  }
}
