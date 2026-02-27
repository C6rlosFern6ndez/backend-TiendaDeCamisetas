import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  // Comentario: Método genérico para enviar notificaciones de estado 
  async enviarNotificacionEstado(email: string, nombre: string, pedidoId: number, estado: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: `Actualización de tu pedido #${pedidoId}`,
      html: `
        <div style="font-family: Arial, sans-serif; border: 1px solid #ddd; padding: 20px;">
          <h2>Hola, ${nombre} 👋</h2>
          <p>Te informamos que tu pedido <strong>#${pedidoId}</strong> ha cambiado de estado.</p>
          <p style="font-size: 1.2em; color: #2c3e50;">Nuevo estado: <strong>${estado.toUpperCase()}</strong></p>
          <hr>
          <p>Gracias por confiar en nosotros.</p>
        </div>
      `,
    });
  }
}