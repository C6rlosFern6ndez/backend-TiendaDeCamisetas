// src/common/seeds/seeds.controller.ts
import { Controller, Post, UseGuards } from '@nestjs/common';
import { SeedsService } from './seeds.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';

@ApiTags('Utilidades (Seeds)')
@Controller('seeds')
export class SeedsController {
  constructor(private readonly seedsService: SeedsService) { }

  @Post('run')
  @UseGuards(AuthGuard('jwt'), RolesGuard) // Comentario: ¡Solo un Admin debería poder ejecutar seeds! 
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Inicializa la DB' })
  async runSeeds() {
    return await this.seedsService.run();
  }
}