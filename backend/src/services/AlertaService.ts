import { EntityManager } from '@mikro-orm/core';
import { Lectura } from '../entities/Lectura';
import { orm } from '../app';

export class AlertaService {
  private em: EntityManager;

  constructor() {
    this.em = orm.em.fork();
  }

  async getAllAlertas(): Promise<Lectura[]> {
    return await this.em.find(Lectura, { flag_alerta: true }, {
      populate: ['sensor'],
      orderBy: { timestamp: 'DESC' }
    });
  }

  async getActiveAlertas(): Promise<Lectura[]> {
    // Get alertas from last 24 hours
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    
    return await this.em.find(Lectura, {
      flag_alerta: true,
      timestamp: { $gte: twentyFourHoursAgo }
    }, {
      populate: ['sensor'],
      orderBy: { timestamp: 'DESC' }
    });
  }

  async getAlertaById(id: number): Promise<Lectura | null> {
    return await this.em.findOne(Lectura, { id, flag_alerta: true }, {
      populate: ['sensor']
    });
  }

  async createAlerta(lectura: Lectura): Promise<Lectura> {
    lectura.flag_alerta = true;
    await this.em.persistAndFlush(lectura);
    
    // Here you could add notification logic (email, SMS, push notification)
    await this.sendNotification(lectura);
    
    return lectura;
  }

  async resolveAlerta(id: number): Promise<Lectura | null> {
    const alerta = await this.em.findOne(Lectura, { id, flag_alerta: true });
    if (!alerta) return null;
    
    alerta.flag_alerta = false;
    await this.em.persistAndFlush(alerta);
    return alerta;
  }

  private async sendNotification(lectura: Lectura): Promise<void> {
    // TODO: Implement notification logic
    // This could send emails, SMS, or push notifications
    console.log(`ALERT: Sensor ${lectura.sensor} triggered alert at ${lectura.timestamp}`);
    console.log(`CO2: ${lectura.co2}, Temp: ${lectura.temp}, Humidity: ${lectura.humedad}`);
  }

  async getAlertasBySensor(sensorId: number): Promise<Lectura[]> {
    return await this.em.find(Lectura, {
      sensor: sensorId,
      flag_alerta: true
    }, {
      populate: ['sensor'],
      orderBy: { timestamp: 'DESC' }
    });
  }

  async getAlertStats(): Promise<{
    total: number;
    active: number;
    resolved: number;
    last24h: number;
  }> {
    const total = await this.em.count(Lectura, { flag_alerta: true });
    
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    
    const active = await this.em.count(Lectura, {
      flag_alerta: true,
      timestamp: { $gte: twentyFourHoursAgo }
    });
    
    const last24h = active; // Active alerts in last 24h
    const resolved = total - active;
    
    return {
      total,
      active,
      resolved,
      last24h
    };
  }
}
