import { Module } from '@nestjs/common';
import { PermissionsModule } from '../permissions/permissions.module';
import { CaslAbilityFactory } from './casl-ability.factory';

@Module({
  imports: [PermissionsModule],
  providers: [CaslAbilityFactory],
  exports: [CaslAbilityFactory],
})
export class CaslModule {}
