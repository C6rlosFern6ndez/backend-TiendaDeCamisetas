// src/designs/designs.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DesignsService } from '../service/designs.service';
import { DesignsController } from '../controllers/designs.controller';
import { UserDesign } from '../entities/user-design.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserDesign])],
  controllers: [DesignsController],
  providers: [DesignsService],
  exports: [DesignsService],
})
export class DesignsModule {}