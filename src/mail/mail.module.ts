import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRoot({
      // Comentario: Configuración del servidor SMTP (usa variables de entorno .env) [cite: 2026-02-23]
      transport: {
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT),
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      },
      defaults: {
        from: '"Tienda Camisetas" <noreply@tienda.com>',
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService], // ✅ Importante para usarlo en OrdersService
})
export class MailModule {}