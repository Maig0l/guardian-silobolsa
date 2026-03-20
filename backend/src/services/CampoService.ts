import { EntityManager } from '@mikro-orm/core';
import { Campo } from '../entities/Campo';
import { orm } from '../app';

export class CampoService {
  private em: EntityManager;

  constructor() {
    this.em = orm.em.fork();
  }

  async getAllCampos(): Promise<Campo[]> {
    return await this.em.find(Campo, { estado: 'ACTIVO' }, {
      populate: ['usuario']
    });
  }

  async getCampoById(id: number): Promise<Campo | null> {
    return await this.em.findOne(Campo, { id, estado: 'ACTIVO' }, {
      populate: ['usuario', 'sensores', 'silobolsas']
    });
  }

  async createCampo(data: Partial<Campo>): Promise<Campo> {
    const campo = new Campo(data);
    await this.em.persistAndFlush(campo);
    return campo;
  }

  async updateCampo(id: number, data: Partial<Campo>): Promise<Campo | null> {
    const campo = await this.em.findOne(Campo, { id, estado: 'ACTIVO' });
    if (!campo) return null;
    
    Object.assign(campo, data);
    campo.updatedAt = new Date();
    await this.em.persistAndFlush(campo);
    return campo;
  }

  async deleteCampo(id: number): Promise<Campo | null> {
    const campo = await this.em.findOne(Campo, { id, estado: 'ACTIVO' });
    if (!campo) return null;
    
    campo.estado = 'INACTIVO';
    campo.updatedAt = new Date();
    await this.em.persistAndFlush(campo);
    return campo;
  }

  async getCamposByUsuario(usuarioId: number): Promise<Campo[]> {
    return await this.em.find(Campo, { usuario: usuarioId, estado: 'ACTIVO' });
  }
}
