import { EntityManager } from '@mikro-orm/core';
import { Sensor } from '../entities/Sensor';
import { Lectura } from '../entities/Lectura';
import { config } from '../config';
import { orm } from '../app';

export class SensorService {
  private em: EntityManager;

  constructor() {
    this.em = orm.em.fork();
  }

  async getAllSensores(): Promise<Sensor[]> {
    return await this.em.find(Sensor, { estado: 'ACTIVO' }, {
      populate: ['campo']
    });
  }

  async getSensorById(id: number): Promise<Sensor | null> {
    return await this.em.findOne(Sensor, { id, estado: 'ACTIVO' }, {
      populate: ['campo', 'lecturas']
    });
  }

  async createSensor(data: Partial<Sensor>): Promise<Sensor> {
    const sensor = new Sensor(data);
    await this.em.persistAndFlush(sensor);
    return sensor;
  }

  async updateSensor(id: number, data: Partial<Sensor>): Promise<Sensor | null> {
    const sensor = await this.em.findOne(Sensor, { id, estado: 'ACTIVO' });
    if (!sensor) return null;
    
    Object.assign(sensor, data);
    sensor.updatedAt = new Date();
    await this.em.persistAndFlush(sensor);
    return sensor;
  }

  async deleteSensor(id: number): Promise<Sensor | null> {
    const sensor = await this.em.findOne(Sensor, { id, estado: 'ACTIVO' });
    if (!sensor) return null;
    
    sensor.estado = 'INACTIVO';
    sensor.updatedAt = new Date();
    await this.em.persistAndFlush(sensor);
    return sensor;
  }

  async getSensorByMacAddress(macAddress: string): Promise<Sensor | null> {
    return await this.em.findOne(Sensor, { mac_address: macAddress, estado: 'ACTIVO' });
  }

  async processSensorData(macAddress: string, data: { co2: number; temp: number; humedad: number }): Promise<Lectura> {
    const sensor = await this.getSensorByMacAddress(macAddress);
    if (!sensor) {
      throw new Error(`Sensor with MAC address ${macAddress} not found`);
    }

    const lectura = new Lectura({
      sensor: sensor,
      timestamp: new Date(),
      co2: data.co2,
      temp: data.temp,
      humedad: data.humedad,
      flag_alerta: this.checkThresholds(data)
    });

    await this.em.persistAndFlush(lectura);
    return lectura;
  }

  private checkThresholds(data: { co2: number; temp: number; humedad: number }): boolean {
    return (
      data.co2 > config.thresholds.co2 ||
      data.temp > config.thresholds.temperature ||
      data.humedad > config.thresholds.humidity
    );
  }

  async getSensoresByCampo(campoId: number): Promise<Sensor[]> {
    return await this.em.find(Sensor, { campo: campoId, estado: 'ACTIVO' });
  }

  async getLatestReadings(sensorId: number, limit: number = 10): Promise<Lectura[]> {
    return await this.em.find(Lectura, { sensor: sensorId }, {
      orderBy: { timestamp: 'DESC' },
      limit
    });
  }
}
