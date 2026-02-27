import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/entities/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Obtenemos los roles necesarios para la ruta
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true; // Si la ruta no tiene @Roles, es pública

    // 2. Obtenemos el usuario de la request (inyectado por Passport)
    const { user } = context.switchToHttp().getRequest();

    // 3. Comprobamos si el rol del usuario está entre los permitidos
    const hasRole = requiredRoles.some((role) => user.rol === role);

    if (!hasRole) {
      throw new ForbiddenException('Acceso denegado');
    }

    return true;
  }
}