import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PrismaModule } from '../database/prisma.module';
import { AbilitiesGuard } from '../auth/guards/abilities.guard';

@Module({
  imports: [PrismaModule],
  exports: [PermissionsService],
  providers: [PermissionsService],
})
export class PermissionsModule {}
