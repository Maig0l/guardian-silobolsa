import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { MikroORM } from '@mikro-orm/core';
import { config } from './config';
import { mikroOrmConfig } from './config/database';
import { MqttService } from './config/mqtt';
import { logger } from './utils/logger';
 
const app = express();
let orm: MikroORM;
let mqttService: MqttService;
 
// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
 
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    mqtt: mqttService?.isConnected() || false
  });
});
 
// API Routes
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/campos', require('./routes/campos'));
app.use('/api/sensores', require('./routes/sensores'));
app.use('/api/silobolsas', require('./routes/silobolsas'));
app.use('/api/lecturas', require('./routes/lecturas'));
app.use('/api/alertas', require('./routes/alertas'));
 
// Error handling middleware
app.use(require('./middleware/error'));
 
async function initializeApp() {
  try {
    // Initialize database
    orm = await MikroORM.init(mikroOrmConfig);
    await orm.getMigrator().up();
    logger.info('Database connected and migrations applied');
 
    // Initialize MQTT service
    mqttService = new MqttService();
 
    // Set up sensor data callback
    global.sensorDataCallback = async (topic: string, data: any) => {
      try {
        // Process sensor data here
        logger.info(`Processing sensor data from ${topic}:`, data);
 
        // TODO: Save to database and check thresholds
        // This will be implemented in the SensorService
      } catch (error) {
        logger.error('Error processing sensor data:', error);
      }
    };
 
    // Start server
    app.listen(config.port, config.host, () => {
      logger.info(`Server running on ${config.host}:${config.port}`);
      logger.info(`Environment: ${config.nodeEnv}`);
    });
 
  } catch (error) {
    logger.error('Failed to initialize application:', error);
    process.exit(1);
  }
}
 
// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  if (mqttService) {
    mqttService.disconnect();
  }
  if (orm) {
    await orm.close();
  }
  process.exit(0);
});
 
process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  if (mqttService) {
    mqttService.disconnect();
  }
  if (orm) {
    await orm.close();
  }
  process.exit(0);
});
 
// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});
 
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
 
initializeApp();
 
export { orm, mqttService };
