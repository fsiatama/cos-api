import {
  AbilityBuilder,
  CreateAbility,
  MongoAbility,
  createMongoAbility,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { PermissionsService } from '../permissions/permissions.service';
import { PayloadTokenDto } from '../models';

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

export type Subject = 'dashboard' | 'settings' | 'users';

export const createAppAbility = createMongoAbility as CreateAbility<AppAbility>;

export type AppAbility = MongoAbility<[Action, Subject]>;

const isValidSubject = (subject: string): subject is Subject =>
  ['dashboard', 'settings', 'users'].includes(subject);

@Injectable()
export class CaslAbilityFactory {
  constructor(private permissionsService: PermissionsService) {}

  async createForUser(user: PayloadTokenDto) {
    const { can, build } = new AbilityBuilder<MongoAbility<[Action, Subject]>>(
      createMongoAbility,
    );

    const userPermissions = await this.permissionsService.getUserPermissions(
      user.sub,
    );

    userPermissions.forEach((permission: string) => {
      const [action, subject] = permission.split(':');
      if (
        Object.values(Action).includes(action as Action) &&
        isValidSubject(subject)
      ) {
        can(action as Action, subject);
      }
    });

    return build();
  }
}
