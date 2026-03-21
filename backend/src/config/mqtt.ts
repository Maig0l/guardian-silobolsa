import mqtt, { MqttClient } from 'mqtt';
import { env } from './env.js';

let client: MqttClient;

export function getMqttClient(): MqttClient {
  if (!client) throw new Error('MQTT no inicializado. Llamá a initMqtt() primero.');
  return client;
}

export async function initMqtt(): Promise<MqttClient> {
  return new Promise((resolve, reject) => {
    const url = `${env.MQTT_BROKER_URL}:${env.MQTT_PORT}`;

    client = mqtt.connect(url, {
      username: env.MQTT_USERNAME,
      password: env.MQTT_PASSWORD,
      clientId: `guardian_backend_${Date.now()}`,
      clean: true,
      reconnectPeriod: 5000,
    });

    client.on('connect', () => {
      console.log(`✅  Conectado al broker MQTT: ${url}`);
      resolve(client);
    });

    client.on('error', (err) => {
      console.error('❌  Error MQTT:', err.message);
      reject(err);
    });

    client.on('reconnect', () => {
      console.log('🔄  Reconectando a MQTT...');
    });

    client.on('offline', () => {
      console.warn('⚠️  MQTT offline');
    });
  });
}
