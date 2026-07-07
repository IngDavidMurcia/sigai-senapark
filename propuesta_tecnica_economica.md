# Propuesta de Evolución: PoC y Despliegue a Producción (SIGAI)

Este documento detalla el plan de acción para construir una Prueba de Concepto (PoC) funcional para los directivos del SENA, así como una estimación inicial de costos para el hardware profesional que requerirá el despliegue final.

## 1. Evaluación del Estado Actual

Actualmente contamos con una arquitectura de software robusta y moderna:
*   **Frontend (`senapark`)**: Dashboard administrativo basado en React.
*   **Backend (`sigai-mvp`)**: Arquitectura orientada a eventos con Node.js, MQTT (Mosquitto), Redis (caché rápida para anti-passback) y PostgreSQL.
*   **Edge**: Un esqueleto inicial en Python (`edge-python`) preparado para la integración de hardware.

**¿Qué falta para que funcione?** El eslabón físico. Necesitamos que el software "vea" (reconocimiento de placas) y "actúe" (abra la barrera).

---

## 2. Plan para la Prueba de Concepto (PoC)

El objetivo de la PoC es demostrar a los directivos que el flujo completo funciona: el vehículo llega, se lee la placa, el backend valida (anti-passback) y la barrera se abre, reflejándose en el Dashboard en tiempo real. 

Utilizaremos el hardware que ya tienes disponible:

### Fase 1: Desarrollo del Edge (Reconocimiento de Placas)
*   **Hardware:** Jetson Nano o portátil con cámara web (para probar). La Jetson Nano es ideal por su GPU integrada para IA.
*   **Acción:** Desarrollaremos el script en `edge-python/main.py`. Utilizaremos OpenCV para acceder a la cámara y un modelo ligero de OCR (como EasyOCR, Tesseract o ALPR) para detectar la placa en el video en tiempo real.
*   **Integración:** Al detectar una placa, el script enviará un mensaje MQTT (`access/request/vehicle`) al backend.

### Fase 2: Simulación de Barrera (Actuador)
*   **Hardware:** Raspberry Pi 4 + Servomotor grande.
*   **Acción:** La Raspberry Pi se suscribirá al tópico MQTT (`gate/+/command`). Cuando reciba el comando `OPEN` desde el backend Node.js, enviará una señal PWM al servomotor para que simule el levantamiento de la talanquera. Tras unos segundos, volverá a su posición inicial.

### Fase 3: Puesta a Punto del Dashboard
*   **Acción:** Conectar los WebSockets del backend con tu interfaz en React (`senapark`) para que cada vez que pase un auto, aparezca una notificación visual de "Acceso Permitido" o "Acceso Denegado".

> [!TIP]
> **Pregunta para ti:** ¿Tienes componentes electrónicos básicos a la mano (cables jumper, protoboard, fuente de poder externa para el servomotor)? La Raspberry Pi no suele dar suficiente corriente directa para un servomotor grande.

---

## 3. Propuesta Económica: Hardware Profesional (Producción)

Una vez aprobada la PoC, el despliegue en un entorno real (intemperie, flujo constante de vehículos) exige hardware industrial. No usaremos servomotores ni webcams.

A continuación, una lista de precios de referencia estimados (en Dólares y su equivalente aproximado en COP, aunque sujeto a proveedores locales) para **UN (1) carril de acceso** (ej. entrada principal).

### 3.1. Equipos de Captura y Procesamiento (Visión)
En producción, conviene usar cámaras LPR (License Plate Recognition) que ya traen la IA incorporada, descargando de trabajo al servidor.

| Ítem | Descripción Recomendada | Precio Ref. (USD) | Precio Ref. (COP aprox.) |
| :--- | :--- | :--- | :--- |
| **Cámara LPR (ANPR)** | Hikvision DS-2CD7A26G0/P-IZS o Dahua ITC215. Diseñadas para leer placas a alta velocidad, con visión nocturna infrarroja. | $600 - $800 | $2.4M - $3.2M |
| **Soporte/Pedestal** | Poste metálico de montaje para la cámara. | $50 - $100 | $200k - $400k |

### 3.2. Control de Acceso Físico (Actuadores)
| Ítem | Descripción Recomendada | Precio Ref. (USD) | Precio Ref. (COP aprox.) |
| :--- | :--- | :--- | :--- |
| **Talanquera Automática** | Barrera vehicular de alto flujo (ej. marcas como ZKTeco, CAME, o FAAC) de 3 a 4 metros de brazo. | $800 - $1,500 | $3.2M - $6.0M |
| **Controlador de Acceso** | Placa relé (si no se conecta directo de la cámara a la barrera) para abrir remotamente desde el servidor. | $50 - $150 | $200k - $600k |

### 3.3. Sensores de Seguridad
Cruciales para que la barrera no baje y golpee un vehículo.
| Ítem | Descripción Recomendada | Precio Ref. (USD) | Precio Ref. (COP aprox.) |
| :--- | :--- | :--- | :--- |
| **Lazos Magnéticos (Loop Detectors)** | Sensor de masa metálica enterrado en el piso. (Requiere obra civil). | $100 - $200 | $400k - $800k |
| **Fotoceldas Infrarrojas** | Alternativa o complemento al lazo, detectan si un objeto corta el haz de luz bajo la barrera. | $30 - $60 | $120k - $240k |

### 3.4. Infraestructura de Red y Servidor local
| Ítem | Descripción Recomendada | Precio Ref. (USD) | Precio Ref. (COP aprox.) |
| :--- | :--- | :--- | :--- |
| **Switch PoE** | Switch para energizar la cámara y conectarla a la red local. | $50 - $100 | $200k - $400k |
| **Servidor Local / NUC** | Mini PC industrial (Intel NUC, Dell Optiplex Micro) para correr el backend (`sigai-mvp`), la BD y el Broker MQTT. | $400 - $600 | $1.6M - $2.4M |

### Resumen de Presupuesto (Por 1 Entrada)
*   **Mínimo Estimado:** ~$2,080 USD (Aprox. $8.3 Millones COP)
*   **Máximo Estimado:** ~$3,510 USD (Aprox. $14 Millones COP)

> [!IMPORTANT]
> A este presupuesto deben sumársele costos de **Obra Civil** (cableado, zanjas para el lazo magnético, vaciado de pedestales) y la mano de obra de instalación. Multiplica estos costos por el número total de entradas y salidas que tenga la sede del SENA.

---

## 4. Próximos Pasos de Desarrollo
Para avanzar con tu PoC, deberíamos empezar de inmediato con esto:
1.  **Código Edge (ANPR):** Escribir el script en Python (`main.py`) para que tu portátil lea una cámara y extraiga placas de prueba.
2.  **Actuador PoC:** Crear un script de Python para la Raspberry Pi que reciba el mensaje MQTT y mueva el servomotor.
3.  **UI:** Asegurarnos de que el `DashboardView.jsx` muestre el auto pasando en tiempo real.
