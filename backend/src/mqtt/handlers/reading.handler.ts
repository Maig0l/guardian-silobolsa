import { MqttClient } from 'mqtt';
import { env } from '../../config/env.js';
import { saveReading } from '../../services/reading.service.js';
import { getEM } from '../../config/database.js';
import { Sensor } from '../../entities/index.js';

interface SensorPayload {
  hum: number;
  temp: number;
  co2: number;
  timestamp?: string;
}

export function registerReadingHandler(client: MqttClient): void {
  const topicFilter = `${env.MQTT_TOPIC_PREFIX}/+`;

  client.subscribe(topicFilter, { qos: 1 }, (err) => {
    if (err) {
      console.error('❌  No se pudo suscribir al topic MQTT:', err.message);
      return;
    }
    console.log(`📡  Suscrito a MQTT topic: ${topicFilter}`);
  });

  // Eliminar listeners previos antes de agregar uno nuevo
  // Evita duplicados cuando MQTT reconecta y re-registra el handler
  client.removeAllListeners('message');

  client.on('message', async (topic: string, message: Buffer) => {
    const parts = topic.split('/');
    const apiKey = parts[parts.length - 1];

    if (!apiKey) {
      console.warn('⚠️  MQTT: topic sin api_key:', topic);
      return;
    }

    let payload: SensorPayload;
    try {
      payload = JSON.parse(message.toString()) as SensorPayload;
    } catch {
      console.warn('⚠️  MQTT: payload inválido en topic:', topic);
      return;
    }

    if (
      typeof payload.hum !== 'number' ||
      typeof payload.temp !== 'number' ||
      typeof payload.co2 !== 'number'
    ) {
      console.warn('⚠️  MQTT: campos numéricos faltantes, ignorando');
      return;
    }

    const em = getEM();
    const sensor = await em.findOne(Sensor, { api_key: apiKey });
    if (!sensor) {
      console.warn(`⚠️  MQTT: sensor no encontrado para api_key: ${apiKey}`);
      return;
    }

    try {
      const reading = await saveReading({
        sensor_id: sensor.id,
        hum: payload.hum,
        temp: payload.temp,
        co2: payload.co2,
        timestamp: payload.timestamp ? new Date(payload.timestamp) : undefined,
      });

      console.log(
        `📊  Lectura — Sensor ${sensor.id} | ` +
        `hum: ${reading.hum}% temp: ${reading.temp}°C co2: ${reading.co2}ppm` +
        (reading.alerta ? ' ⚠️  ALERTA' : '')
      );
    } catch (err) {
      console.error('❌  Error guardando lectura MQTT:', err);
    }
  });
}