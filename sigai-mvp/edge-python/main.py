import cv2
import json
import paho.mqtt.client as mqtt
import time

# Configuración
MQTT_BROKER = "localhost" # IP del servidor Node.js
GATE_ID = "ENTRADA_01"

client = mqtt.Client()
client.connect(MQTT_BROKER, 1883)

def detect_plate(frame):
    # MVP: Aquí integramos un modelo ligero de detección
    # Por ahora simulamos detección con la tecla 'S'
    return "ABC1234" 

cap = cv2.VideoCapture(0) # 0 para Webcam o "video.mp4"

print("📡 Iniciando nodo Edge LPR...")

while True:
    ret, frame = cap.read()
    if not ret: break

    cv2.putText(frame, "Presione 'S' para simular lectura de placa", (50, 50), 
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
    cv2.imshow('Jetson Edge LPR', frame)

    key = cv2.waitKey(1)
    if key & 0xFF == ord('s'):
        plate = detect_plate(frame)
        payload = {
            "plate": plate,
            "gate_id": GATE_ID,
            "timestamp": time.time()
        }
        client.publish("access/request/vehicle", json.dumps(payload))
        print(f" [Sent] Solicitud de acceso: {plate}")

cap.release()
cv2.destroyAllWindows()