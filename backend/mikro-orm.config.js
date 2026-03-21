"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mariadb_1 = require("@mikro-orm/mariadb");
const migrations_1 = require("@mikro-orm/migrations");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Busca el .env en el directorio actual o un nivel arriba (raíz del monorepo)
const envPath = ['.env', '../.env'].map(p => path_1.default.resolve(p)).find(p => fs_1.default.existsSync(p));
if (envPath)
    dotenv_1.default.config({ path: envPath });
exports.default = (0, mariadb_1.defineConfig)({
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '3306'),
    user: process.env.DB_USER ?? 'guardian',
    password: process.env.DB_PASSWORD ?? '',
    dbName: process.env.DB_NAME ?? 'guardian_silobolsa',
    entities: ['./dist/entities/*.js'],
    entitiesTs: ['./src/entities/*.ts'],
    debug: process.env.NODE_ENV === 'development',
    extensions: [migrations_1.Migrator],
    migrations: {
        path: './dist/migrations',
        pathTs: './src/migrations',
        glob: '!(*.d).{js,ts}',
        transactional: true,
        allOrNothing: true,
    },
});
//# sourceMappingURL=mikro-orm.config.js.map