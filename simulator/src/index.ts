import mqtt, { MqttClient } from 'mqtt';
import { config } from './config.js';
import { generateApiKey } from './apiKey.js';
import { Sensor } from './Sensor.js';

// ─── Inicialización de sensores ───────────────────────────────────────────────
const sensores: Sensor[] = config.sensorMacs.map((mac) => {
  const apiKey = generateApiKey(mac);
  console.log(`🔑  Sensor ${mac} → api_key: ${apiKey.slice(0, 12)}...`);
  return new Sensor(mac, apiKey);
});

// ─── Conexión MQTT ────────────────────────────────────────────────────────────
const brokerUrl = `${config.mqtt.brokerUrl}:${config.mqtt.port}`;

console.log(`\n🛡️  Guardián Silobolsa — Simulador de sensores`);
console.log(`📡  Conectando a MQTT: ${brokerUrl}`);
console.log(`⏱️  Intervalo: ${config.publishIntervalMs}ms por sensor`);
console.log(`📟  Sensores: ${sensores.length}\n`);

const client: MqttClient = mqtt.connect(brokerUrl, {
  username:  config.mqtt.username,
  password:  config.mqtt.password,
  clientId:  `guardian_simulator_${Date.now()}`,
  clean:     true,
  reconnectPeriod: 5000,
});

client.on('connect', () => {
  console.log('✅  Conectado al broker MQTT\n');
  startSimulation(client);
});

client.on('error', (err) => {
  console.error('❌  Error MQTT:', err.message);
});

client.on('reconnect', () => {
  console.log('🔄  Reconectando a MQTT...');
});

// ─── Loop de simulación ───────────────────────────────────────────────────────
function startSimulation(mqttClient: MqttClient): void {
  setInterval(() => {
    for (const sensor of sensores) {
      sensor.tick();
      const reading = sensor.reading();

      // Topic: guardian/readings/<api_key>  — igual al formato que escucha el backend
      const topic = `${config.mqtt.topicPrefix}/${sensor.apiKey}`;
      const payload = JSON.stringify(reading);

      mqttClient.publish(topic, payload, { qos: 1 }, (err) => {
        if (err) {
          console.error(`❌  Error publicando [${sensor.macAddress}]:`, err.message);
          return;
        }

        const isFalla = sensor.currentMode === 'FALLA_SENSOR';
        const isCal   = sensor.currentMode === 'CALENTAMIENTO';
        const icon    = isFalla ? '💀' : isCal ? '🔥' : '📊';
        const alert   = isCal || isFalla ? ` [${sensor.currentMode}]` : '';

        console.log(
          `${icon} [${sensor.macAddress}]${alert}` +
          ` temp: ${reading.temp}°C` +
          ` hum: ${reading.hum}%` +
          ` co2: ${reading.co2}ppm`
        );
      });
    }
  }, config.publishIntervalMs);
}

// ─── Shutdown graceful ────────────────────────────────────────────────────────
process.on('SIGINT', () => {
  console.log('\n\n👋  Simulador detenido.');
  client.end();
  process.exit(0);
});
