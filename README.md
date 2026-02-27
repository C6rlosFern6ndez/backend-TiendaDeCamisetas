# 👕 Sistema Integral de Tienda de Camisetas - Backend (NestJS)

Este repositorio contiene la API profesional de la Tienda de Camisetas. Se ha diseñado bajo los principios de **Arquitectura Limpia** y **Sólida**, asegurando que el sistema sea escalable, seguro y fácil de mantener.

---

## 🏗️ Arquitectura y Patrones de Diseño

El backend utiliza el framework **NestJS** siguiendo un patrón de capas estricto para separar responsabilidades:

1. **Controllers**: Único punto de entrada para peticiones externas. Se encargan de la validación inicial y la respuesta HTTP.
2. **Services**: Contienen el 100% de la lógica de negocio. Interactúan con otros servicios (como el de Mail) y coordinan las operaciones.
3. **Repositories**: Capa de persistencia. Los servicios no acceden a la base de datos directamente a través de modelos, sino mediante inyección de repositorios para mantener el código desacoplado.
4. **Entities**: Definición del esquema de datos mediante decoradores, sirviendo como fuente de verdad para la base de datos.

---

## 🛠️ Stack Tecnológico y Justificación

Para este proyecto se han seleccionado librerías específicas que resuelven retos comunes en el desarrollo profesional:

### 🟢 Core & Framework
* **NestJS**: Elegido por su estructura modular y su potente sistema de inyección de dependencias, lo que facilita las pruebas unitarias y el crecimiento del proyecto.
* **TypeORM**: ORM que permite manejar la base de datos mediante objetos de TypeScript. Se utiliza para garantizar la integridad referencial y facilitar las **Transacciones ACID** (necesarias para evitar pedidos sin stock).

### 🔐 Seguridad y Protección
* **@nestjs/passport & jwt**: Implementación de estándar industrial para la autenticación. Permite que el frontend se comunique de forma segura mediante tokens temporales.
* **@nestjs/throttler**: Implementa **Rate Limiting**. Evita abusos de la API limitando el número de peticiones por IP en un tiempo determinado.
* **bcrypt**: Librería de hashing para encriptar contraseñas de usuarios. Nunca se guardan contraseñas en texto plano en la base de datos.

### 🧪 Validación y Datos
* **class-validator & class-transformer**: Permiten validar los **DTOs** (Data Transfer Objects) automáticamente. Si un cliente envía un precio negativo o falta un campo, la API lo rechaza antes de llegar al servicio.
* **reflect-metadata**: Necesaria para que los decoradores de TypeScript funcionen correctamente en el sistema de inyección de NestJS.

### 📧 Comunicación y Utilidades
* **nodemailer**: Motor de envío de correos. Se utiliza para notificar al cliente cambios en el estado de su pedido (ej. de Pagado a Enviado).
* **@nestjs/swagger**: Genera documentación viva. Al entrar en `/api/docs`, cualquier desarrollador puede probar los endpoints sin necesidad de herramientas externas como Postman.

---

## 🚀 Lógicas Clave del Sistema

### 📦 Máquina de Estados de Pedidos
El flujo de un pedido está estrictamente controlado en `OrdersService`. Las transiciones legales son:
* `PENDIENTE` ➔ `PAGADO` (Dispara la resta de stock en la tabla de variantes).
* `PENDIENTE` ➔ `CANCELADO` (Libera el stock si estaba reservado).
* `PAGADO` ➔ `ENVIADO` (Dispara notificación por email).

### 📏 Gestión de Stock por Variante
El sistema no solo rastrea el producto, sino la combinación de **Producto + Talla + Color**. Al procesar un pago, el sistema valida que exista stock suficiente para cada item individual antes de confirmar la transacción.

---

## ⚙️ Configuración del Entorno (.env)

Es imprescindible configurar un archivo `.env` en la raíz con:
```env
PORT=3000
DB_PASSWORD=tu_clave_segura
JWT_SECRET=tu_secreto_jwt
# Configuración de Mailtrap para pruebas de correo
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_USER=tu_usuario
MAIL_PASS=tu_password