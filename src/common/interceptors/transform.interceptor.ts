// src/common/interceptors/transform.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // Comentario: Función recursiva para limpiar objetos o arrays 
        return this.cleanSensitiveData(data);
      }),
    );
  }

  private cleanSensitiveData(data: any): any {
    if (!data || typeof data !== 'object') return data;

    if (Array.isArray(data)) {
      return data.map((item) => this.cleanSensitiveData(item));
    }

    // Comentario: Lista de campos que NUNCA deben viajar al Frontend 
    const sensitiveFields = ['password', 'deletedAt', 'currentHashedRefreshToken'];
    
    const cleanObject = { ...data };
    sensitiveFields.forEach((field) => {
      delete cleanObject[field];
    });

    // Comentario: También limpiamos objetos anidados (como el usuario dentro de un pedido) 
    for (const key in cleanObject) {
      if (typeof cleanObject[key] === 'object') {
        cleanObject[key] = this.cleanSensitiveData(cleanObject[key]);
      }
    }

    return cleanObject;
  }
}