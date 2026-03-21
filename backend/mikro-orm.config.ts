import { defineConfig } from '@mikro-orm/mariadb';
import { Migrator } from '@mikro-orm/migrations';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Busca el .env en el directorio actual o un nivel arriba (raíz del monorepo)
const envPath = ['.env', '../.env'].map(p => path.resolve(p)).find(p => fs.existsSync(p));
if (envPath) dotenv.config({ path: envPath });

export default defineConfig({
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '3306'),
  user: process.env.DB_USER ?? 'guardian',
  password: process.env.DB_PASSWORD ?? '',
  dbName: process.env.DB_NAME ?? 'guardian_silobolsa',

  entities: ['./dist/entities/*.js'],
  entitiesTs: ['./src/entities/*.ts'],

  debug: process.env.NODE_ENV === 'development',

  extensions: [Migrator],
  migrations: {
    path: './dist/migrations',
    pathTs: './src/migrations',
    glob: '!(*.d).{js,ts}',
    transactional: true,
    allOrNothing: true,
  },
});