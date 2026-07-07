const mqtt = require('mqtt');
const redis = require('redis');
const { Client } = require('pg');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server); // Para el Dashboard en tiempo real

const mqttClient = mqtt.connect('mqtt://mosquitto:1883');
const redisClient = redis.createClient({ url: 'redis://redis:6379' });

mqttClient.on('connect', () => {
    console.log("✅ Conectado al Broker MQTT");
    mqttClient.subscribe('access/request/vehicle');
});

mqttClient.on('message', async (topic, message) => {
    const data = JSON.parse(message.toString());
    const { plate, gate_id } = data;

    // --- Lógica de Negocio ---
    try {
        await redisClient.connect();
        
        // 1. Verificar Anti-passback (¿Ya está dentro?)
        const isInside = await redisClient.get(`status:${plate}`);
        
        if (isInside) {
            console.log(`[DENEGADO] ${plate} ya está en las instalaciones.`);
            mqttClient.publish(`gate/${gate_id}/command`, JSON.stringify({ action: 'REJECT', reason: 'Anti-passback' }));
        } else {
            // 2. Registrar Entrada
            console.log(`[PERMITIDO] Bienvenido ${plate}`);
            await redisClient.set(`status:${plate}`, 'inside');
            
            // 3. Notificar al Dashboard vía WebSockets
            io.emit('new-access', { plate, gate_id, time: new Date() });

            // 4. Abrir Barrera
            mqttClient.publish(`gate/${gate_id}/command`, JSON.stringify({ action: 'OPEN' }));
        }
        
        await redisClient.disconnect();
    } catch (err) {
        console.error("Error en validación:", err);
    }
});

server.listen(3000, () => console.log("🚀 Backend Node.js corriendo en puerto 3000"));