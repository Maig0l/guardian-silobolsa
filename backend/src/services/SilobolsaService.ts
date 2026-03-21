import { EntityManager } from '@mikro-orm/core';
import { Silobolsa } from '../entities/Silobolsa';
import { orm } from '../app';

export class SilobolsaService {
  private get em(): EntityManager {
    if (!orm) {
      throw new Error('ORM not initialized');
    }
    return orm.em.fork();
  }

  async getAllSilobolsas(): Promise<Silobolsa[]> {
    return await this.em.find(Silobolsa, { estado: 'ACTIVO' }, {
      populate: ['campo']
    });
  }

  async getSilobolsaById(id: number): Promise<Silobolsa | null> {
    return await this.em.findOne(Silobolsa, { id, estado: 'ACTIVO' }, {
      populate: ['campo', 'sensorLinks']
    });
  }

  async createSilobolsa(data: Partial<Silobolsa>): Promise<Silobolsa> {
    const silobolsa = new Silobolsa(data);
    await this.em.persistAndFlush(silobolsa);
    return silobolsa;
  }

  async updateSilobolsa(id: number, data: Partial<Silobolsa>): Promise<Silobolsa | null> {
    const silobolsa = await this.em.findOne(Silobolsa, { id, estado: 'ACTIVO' });
    if (!silobolsa) return null;
    
    Object.assign(silobolsa, data);
    silobolsa.updatedAt = new Date();
    await this.em.persistAndFlush(silobolsa);
    return silobolsa;
  }

  async deleteSilobolsa(id: number): Promise<Silobolsa | null> {
    const silobolsa = await this.em.findOne(Silobolsa, { id, estado: 'ACTIVO' });
    if (!silobolsa) return null;
    
    silobolsa.estado = 'INACTIVO';
    silobolsa.updatedAt = new Date();
    await this.em.persistAndFlush(silobolsa);
    return silobolsa;
  }

  async getSilobolsasByCampo(campoId: number): Promise<Silobolsa[]> {
    return await this.em.find(Silobolsa, { campo: campoId, estado: 'ACTIVO' });
  }
}
