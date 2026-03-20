import { defineConfig } from '@mikro-orm/mysql';
import { config } from './index';

export const mikroOrmConfig = defineConfig({
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  dbName: config.database.name,
  entities: ['dist/entities/**/*.js'],
  entitiesTs: ['src/entities/**/*.ts'],
  migrations: {
    path: './migrations',
    pathTs: './migrations',
  },
  debug: config.nodeEnv === 'development',
  allowGlobalContext: config.nodeEnv === 'development',
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci',
  driverOptions: {
    connection: {
      ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
    },
  },
});
