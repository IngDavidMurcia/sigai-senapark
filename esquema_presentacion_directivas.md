# Esquema de Presentación: Proyecto SIGAI ante Directivas SENA

Este documento sirve como guion y estructura para las diapositivas de la presentación oficial del proyecto **SIGAI** (Sistema Inteligente de Gestión de Acceso Institucional) ante el cuerpo directivo.

---

## Diapositiva 1: Portada
*   **Título Principal:** SIGAI - Sistema Inteligente de Gestión de Acceso Institucional.
*   **Subtítulo:** Modernización, Control y Automatización del Parqueadero SENA.
*   **Expositor:** [Tu Nombre / Tu Cargo]
*   **Concepto Visual:** Una imagen de fondo moderna que combine tecnología (líneas de código o red) con seguridad física (una talanquera o un vehículo).

## Diapositiva 2: El Reto Actual (Justificación y Pertinencia)
*   **Objetivo de la diapositiva:** Mostrar por qué se necesita el sistema.
*   **Puntos clave:**
    *   **Procesos Manuales:** Tiempos de registro lentos en portería, propensos al error humano.
    *   **Puntos Ciegos:** Desconocimiento en tiempo real de la capacidad (cuántos carros/motos hay adentro realmente).
    *   **Seguridad y Convivencia:** Dificultad para rastrear infractores (exceso de velocidad, mal parqueo) de forma sistemática.
    *   **Vulnerabilidad:** Sin control estricto de "Anti-passback" (un vehículo podría ceder su turno a otro no autorizado).

## Diapositiva 3: La Solución: ¿Qué es SIGAI?
*   **Objetivo:** Presentar el producto.
*   **Puntos clave:**
    *   Un ecosistema de software y hardware diseñado a la medida de la institución.
    *   Dashboard administrativo en tiempo real para visualizar ocupación y alertas.
    *   Gestión dinámica de cupos (Carros, Motos, Bicis, Zonas Especiales).
    *   Registro inmutable y automático del historial vehicular.

## Diapositiva 4: Alcance: Lo que SÍ hace y lo que NO hace
*   **Objetivo:** Aclarar expectativas administrativas.
*   **SÍ HACE:**
    *   Automatiza el registro de entrada/salida mediante lectura de placas.
    *   Gestiona alertas y "hoja de vida" del conductor (alertas de convivencia).
    *   Controla estrictamente la duplicidad (Anti-passback).
    *   Informa al usuario final sobre disponibilidad de cupos (App Web mínima).
*   **NO HACE:**
    *   No es un sistema de cobro o facturación de parqueadero (es un servicio institucional gratuito).
    *   No garantiza ni reserva cupos (salvo directrices gerenciales configuradas).
    *   No reemplaza al personal de seguridad (optimiza su labor).

## Diapositiva 5: Potencial de Escalabilidad
*   **Objetivo:** Demostrar que no es un sistema estático, sino una plataforma para el futuro.
*   **Puntos clave:**
    *   **Arquitectura IoT (Internet de las Cosas):** Listo para integrarse con sensores, semáforos o barreras adicionales.
    *   **Múltiples Porterías:** Capacidad de sincronizar entradas y salidas separadas en futuras ampliaciones de obra civil.
    *   **Códigos QR:** Expansión futura para registro ágil de visitantes temporales.

---

## Diapositiva 6: Cronograma de Trabajo (Por Fases)
*   **Objetivo:** Mostrar un plan de ejecución realista, que comienza sin impacto financiero inmediato.

### Fase 1: Prueba de Concepto (PoC) y Demostración "Cero Costo"
*   **Alcance:** Validación del software y de la arquitectura técnica en un entorno controlado (laboratorio/oficina).
*   **Recursos:** Hardware actualmente disponible (Raspberry Pi 4, displays, módulos de cámara básicos, Jetson Nano, servomotores pequeños).
*   **Entregable:** Demostración física de la lectura de una placa y el movimiento de un servomotor (simulando la talanquera) que se refleja en tiempo real en el Dashboard.

### Fase 2: Despliegue Híbrido Asistido (Portería Real)
*   **Alcance:** Llevar el software a la portería. La talanquera sigue operándose de forma **manual**, pero el registro se automatiza.
*   **Recursos:** Un PC/Portátil en portería con una cámara apuntando al acceso.
*   **Entregable:** El sistema detecta la placa, la busca en la base de datos y le muestra al guarda un gran botón verde (Aprobado) o rojo (Rechazado). El guarda presiona enter y levanta manualmente la talanquera. Recopilación de datos reales de afluencia.

### Fase 3: Automatización Total (Grado Industrial)
*   **Alcance:** Eliminar la intervención manual en el flujo normal. La talanquera se levanta sola si el vehículo está autorizado.
*   **Recursos:** Compra de equipamiento profesional justificada por el éxito de las Fases 1 y 2.
*   **Entregable:** Sistema autónomo de control de acceso.

---

## Diapositiva 7: Proyección Financiera (Para la Fase 3)
*   **Objetivo:** Presentar las cifras estimadas para cuando se decida automatizar totalmente el hardware.
*   **Justificación:** La Fase 1 y 2 demuestran que el "cerebro" (el software, que suele ser lo más costoso) **ya está construido y es propiedad del SENA**. Solo se requiere invertir en los "músculos y ojos" (hardware industrial).
*   **Presupuesto Estimado (Por 1 carril de acceso):**
    *   Cámaras LPR (Inteligencia embebida): ~$600 - $800 USD.
    *   Talanquera Vehicular de alto tráfico: ~$800 - $1,500 USD.
    *   Sensores de seguridad (Lazos magnéticos/Fotoceldas): ~$150 - $250 USD.
    *   Controladores y Redes: ~$100 - $250 USD.
    *   **Total Estimado Hardware (sin obra civil):** $1,650 USD a $2,800 USD (Aprox. $6.6M - $11.2M COP).

## Diapositiva 8: Conclusiones y Próximos Pasos
*   **Cierre:** SIGAI es un proyecto factible, moderno y escalable que resolverá los problemas actuales de control.
*   **Llamado a la acción (Call to Action):** Solicitar el aval oficial de las directivas para iniciar inmediatamente la **Fase 1 (PoC)** con los equipos con los que ya se cuenta, sin necesidad de desembolsos financieros en este momento.
