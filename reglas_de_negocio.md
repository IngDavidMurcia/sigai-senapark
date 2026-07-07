# Documento de Formalización: Reglas de Negocio del Sistema de Parqueadero (SIGAI)

Este documento consolida las reglas de negocio, directrices operativas y funcionalidades clave del sistema de gestión de parqueaderos y portería (actualmente en desarrollo). Su propósito es servir como base para evaluación, escrutinio, ratificación o modificación por parte del cuerpo administrativo de la institución.

---

## 1. Alcance y Naturaleza del Servicio
*   **Servicio Gratuito y de Uso Público:** El parqueadero es un servicio provisto por la institución de carácter gratuito para sus miembros. No opera bajo un modelo de negocio de cobro o reserva garantizada (excepto para cupos gerenciales/especiales).
*   **Disponibilidad Informativa:** El sistema debe proveer una interfaz pública mínima (web/móvil) que permita a los usuarios consultar el nivel de ocupación en tiempo real para planificar su visita.

## 2. Roles, Actores y Tipos de Usuarios

### 2.1. Tipos de Usuarios (Conductores/Ciclistas)
El sistema clasifica a las personas que hacen uso del parqueadero en las siguientes categorías principales:
1.  **Administrativos**
2.  **Instructores**
3.  **Estudiantes** (Diferenciados potencialmente por jornada: mañana, tarde, noche, fines de semana).
4.  **Otros Funcionarios**
5.  **Visitantes**

### 2.2. Perfil y Adscripción del Usuario
Todo usuario registrado (no visitante) debe tener en su perfil:
*   Nombre completo y Documento de Identidad.
*   **Vehículos Asociados:** Un usuario puede registrar múltiples vehículos (ej. un carro y una moto), pero las reglas de acceso aplicarán de forma lógica para evitar abusos.
*   **Centro de Adscripción:** El usuario debe estar vinculado a uno de los 3 "Centros" (edificios) de la institución, o la categoría "Otro" (para servicios unificados como cafetería o biblioteca).
*   **Permisos Especiales:** Indicadores booleanos si el usuario requiere acceso a zonas de Discapacidad o si posee un Parqueadero Reservado (Gerencia/Altos funcionarios).

### 2.3. Roles del Sistema (Operadores)
*   **Personal de Vigilancia (Operador de Portería):** Encargado de la validación física y asistencia en el registro de entrada/salida. Tienen una interfaz de botones grandes y acciones rápidas.
*   **Administrador del Sistema:** Capacidad para crear, modificar y eliminar zonas de parqueo, editar registros de usuarios y visualizar reportes históricos y analíticas.

---

## 3. Gestión de la Infraestructura Física

*   **Inventario Dinámico:** La cantidad de cupos no está "quemada" en el sistema. El Administrador puede ampliar, reducir, mantener o renombrar las zonas de parqueo en cualquier momento debido a remodelaciones o eventos.
*   **Clasificación de Cupos por Vehículo:** Se mantiene inventario separado y en tiempo real para:
    *   Carros
    *   Motos
    *   Bicicletas
    *   Otros
*   **Tipificación de Zonas:** Los cupos se dividen lógicamente en:
    *   General
    *   Reservado (Directivos/Gerencia)
    *   Discapacitados

---

## 4. Reglas de Acceso, Entrada y Salida

Esta es la lógica central (Core) del sistema implementada actualmente en el backend.

*   **Automatización Asistida (Edge OCR):** El sistema leerá la placa a través de cámaras (OCR). Esta lectura busca en la base de datos y presenta los datos al vigilante en pantalla para que apruebe el ingreso con un solo clic (dado que la talanquera es manual en su operación física actual).
*   **Regla de Anti-passback (Control de Duplicidad):** *[Implementado activamente en el código]*
    *   **Condición:** Un vehículo no puede "ingresar" si el sistema ya lo tiene registrado como "adentro". 
    *   **Acción:** Si una placa intenta ingresar y la base de datos (Redis) indica que ya está en las instalaciones, el sistema rechaza automáticamente la solicitud (`REJECT`). Si no está adentro, permite el acceso (`OPEN`) y cambia su estado.
*   **Registro Histórico:** Todo movimiento genera un registro inmutable con marca de tiempo (timestamp) de ingreso, salida y cálculo automático del tiempo de permanencia.

---

## 5. Caracterización, Comportamiento y Sistema de Alertas

El sistema no solo abre y cierra barreras, sino que audita el comportamiento de la comunidad.

*   **Hoja de Vida Vehicular:** Se construye un historial de comportamiento por usuario/vehículo.
*   **Sistema de "Flags" (Alertas Tempranas):** El personal de vigilancia puede marcar a un usuario en el sistema por infracciones a la convivencia. Ejemplos:
    *   Exceso de velocidad permitida dentro de la institución.
    *   Vehículo mal parqueado (fuera de líneas o bloqueando vías).
    *   Ocupación de zonas para discapacitados/directivos sin el permiso correspondiente.
*   **Notificaciones Contextuales:** Cuando un usuario con una alerta previa ingresa a la institución, la pantalla del vigilante mostrará un mensaje pop-up o recordatorio específico (Ej: "Recordar a este usuario parquear solo en zonas habilitadas").

---

## 6. Escalabilidad y Expansiones Futuras (Roadmap)

El diseño arquitectónico actual (basado en eventos con MQTT y WebSockets) permite las siguientes expansiones sin tener que rehacer el sistema:

1.  **Automatización Total de Barreras:** Aunque la talanquera hoy es manual, el software ya emite señales de hardware (`OPEN`/`REJECT`). El día que haya presupuesto para talanqueras automáticas, el sistema se conectará directamente a ellas.
2.  **Gestión Ágil de Visitantes mediante QR:** Posibilidad de que un funcionario administrativo genere un código QR de invitación temporal, el cual es validado en la cámara o por el vigilante para un ingreso expedito.
3.  **Múltiples Porterías Sincronizadas:** La arquitectura soporta que un vehículo entre por la "Portería Norte" y salga por la "Portería Sur" manteniendo la integridad de los datos de ocupación y anti-passback.
