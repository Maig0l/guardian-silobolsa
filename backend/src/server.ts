import { env } from './config/env.js';
import { initDatabase } from './config/database.js';
import { initMqtt } from './config/mqtt.js';
import { registerReadingHandler } from './mqtt/handlers/reading.handler.js';
import app from './app.js';

async function connectMqttWithRetry(retries = 10, delayMs = 5000): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const mqttClient = await initMqtt();
      registerReadingHandler(mqttClient);
      return;
    } catch (err) {
      console.warn(`⚠️  MQTT no disponible (intento ${attempt}/${retries}) — reintentando en ${delayMs / 1000}s...`);
      if (attempt < retries) await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  console.error('❌  No se pudo conectar a MQTT después de varios intentos. Las lecturas de sensores no estarán disponibles hasta reconectar.');
}

async function bootstrap() {
  try {
    // 1. Base de datos (fatal — sin DB no hay nada)
    await initDatabase();

    // 2. HTTP server (arranca siempre)
    app.listen(env.PORT, () => {
      console.log(`🚀  Backend corriendo en http://localhost:${env.PORT}`);
      console.log(`📌  Entorno: ${env.NODE_ENV}`);
    });

    // 3. MQTT (no fatal — reintenta en background)
    connectMqttWithRetry().catch(console.error);

  } catch (err) {
    console.error('❌  Error al iniciar el servidor:', err);
    process.exit(1);
  }
}

bootstrap();