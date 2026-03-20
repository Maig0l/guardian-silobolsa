import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.BACKEND_PORT || '3000', 10),
  host: process.env.BACKEND_HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'guardian_user',
    password: process.env.DB_PASSWORD || 'secure_password',
    name: process.env.DB_NAME || 'guardian_silobolsa',
  },

  // MQTT
  mqtt: {
    brokerUrl: process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883',
    clientId: process.env.MQTT_CLIENT_ID || 'guardian_backend',
    username: process.env.MQTT_USERNAME || '',
    password: process.env.MQTT_PASSWORD || '',
    topic: process.env.MQTT_TOPIC || 'sensors/+/data',
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_key_here',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },

  // Alert Thresholds
  thresholds: {
    co2: parseFloat(process.env.CO2_THRESHOLD || '2000'),
    temperature: parseFloat(process.env.TEMPERATURE_THRESHOLD || '30'),
    humidity: parseFloat(process.env.HUMIDITY_THRESHOLD || '70'),
  },
};
