import { EntityManager } from '@mikro-orm/core';
import { Usuario } from '../entities/Usuario';
import { orm } from '../app';

export class UsuarioService {
  private em: EntityManager;

  constructor() {
    this.em = orm.em.fork();
  }

  async getAllUsuarios(): Promise<Usuario[]> {
    return await this.em.find(Usuario, { estado: 'ACTIVO' });
  }

  async getUsuarioById(id: number): Promise<Usuario | null> {
    return await this.em.findOne(Usuario, { id, estado: 'ACTIVO' });
  }

  async createUsuario(data: Partial<Usuario>): Promise<Usuario> {
    const usuario = new Usuario(data);
    await this.em.persistAndFlush(usuario);
    return usuario;
  }

  async updateUsuario(id: number, data: Partial<Usuario>): Promise<Usuario | null> {
    const usuario = await this.em.findOne(Usuario, { id, estado: 'ACTIVO' });
    if (!usuario) return null;
    
    Object.assign(usuario, data);
    usuario.updatedAt = new Date();
    await this.em.persistAndFlush(usuario);
    return usuario;
  }

  async deleteUsuario(id: number): Promise<Usuario | null> {
    const usuario = await this.em.findOne(Usuario, { id, estado: 'ACTIVO' });
    if (!usuario) return null;
    
    usuario.estado = 'INACTIVO';
    usuario.updatedAt = new Date();
    await this.em.persistAndFlush(usuario);
    return usuario;
  }

  async getUsuarioByEmail(email: string): Promise<Usuario | null> {
    return await this.em.findOne(Usuario, { email, estado: 'ACTIVO' });
  }
}
