import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Busca el .env subiendo hasta la raíz del monorepo
const envPath = ['.env', '../.env', '../../.env']
  .map(p => path.resolve(p))
  .find(p => fs.existsSync(p));

if (envPath) {
  dotenv.config({ path: envPath });
} else {
  console.warn('⚠️  No se encontró .env');
}

export const config = {
  mqtt: {
    brokerUrl: process.env.MQTT_BROKER_URL ?? 'mqtt://localhost',
    port: parseInt(process.env.MQTT_PORT ?? '1883'),
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
    topicPrefix: process.env.MQTT_TOPIC_PREFIX ?? 'guardian/readings',
  },
  apiKeySecret: process.env.API_KEY_SECRET ?? '',

  // Intervalo entre publicaciones de cada sensor (ms)
  publishIntervalMs: parseInt(process.env.SIM_INTERVAL_MS ?? '3000'),

  // MACs de los sensores a simular — sobreescribibles desde .env
  // En producción estos serían los MACs reales de los dispositivos
  sensorMacs: (process.env.SIM_SENSOR_MACS ?? [
    'A4:C3:F0:12:34:01',
    'A4:C3:F0:12:34:02',
    'A4:C3:F0:12:34:03',
  ].join(',')).split(',').map(m => m.trim()),
};
