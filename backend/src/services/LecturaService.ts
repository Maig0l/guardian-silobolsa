import { EntityManager } from '@mikro-orm/core';
import { Lectura } from '../entities/Lectura';
import { orm } from '../app';

export class LecturaService {
  private em: EntityManager;

  constructor() {
    this.em = orm.em.fork();
  }

  async getAllLecturas(): Promise<Lectura[]> {
    return await this.em.find(Lectura, {}, {
      populate: ['sensor'],
      orderBy: { timestamp: 'DESC' }
    });
  }

  async getLecturaById(id: number): Promise<Lectura | null> {
    return await this.em.findOne(Lectura, { id }, {
      populate: ['sensor']
    });
  }

  async createLectura(data: Partial<Lectura>): Promise<Lectura> {
    const lectura = new Lectura(data);
    await this.em.persistAndFlush(lectura);
    return lectura;
  }

  async getLecturasBySensor(sensorId: number, limit: number = 10): Promise<Lectura[]> {
    return await this.em.find(Lectura, { sensor: sensorId }, {
      orderBy: { timestamp: 'DESC' },
      limit,
      populate: ['sensor']
    });
  }

  async getAlertLecturas(): Promise<Lectura[]> {
    return await this.em.find(Lectura, { flag_alerta: true }, {
      orderBy: { timestamp: 'DESC' },
      populate: ['sensor']
    });
  }

  async getLecturasByDateRange(startDate: Date, endDate: Date): Promise<Lectura[]> {
    return await this.em.find(Lectura, {
      timestamp: { $gte: startDate, $lte: endDate }
    }, {
      orderBy: { timestamp: 'DESC' },
      populate: ['sensor']
    });
  }

  async getLatestLecturaBySensor(sensorId: number): Promise<Lectura | null> {
    return await this.em.findOne(Lectura, { sensor: sensorId }, {
      orderBy: { timestamp: 'DESC' },
      populate: ['sensor']
    });
  }
}
