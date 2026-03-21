import { MikroORM } from '@mikro-orm/mariadb';
import config from '../../mikro-orm.config.js';

let orm: MikroORM;

export async function initDatabase(): Promise<MikroORM> {
  orm = await MikroORM.init(config);

  // Verifica conexión
  const connected = await orm.isConnected();
  if (!connected) throw new Error('No se pudo conectar a la base de datos');

  console.log('✅  Conectado a MariaDB');
  return orm;
}

export function getORM(): MikroORM {
  if (!orm) throw new Error('ORM no inicializado. Llamá a initDatabase() primero.');
  return orm;
}

export function getEM() {
  return getORM().em.fork();
}
