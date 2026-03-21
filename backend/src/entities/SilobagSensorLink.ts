import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Silobag } from './Silobag.js';
import { Sensor } from './Sensor.js';

export enum LinkStatus {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
}

@Entity({ tableName: 'silobolsa_sensor_link' })
export class SilobagSensorLink {
  @PrimaryKey({ type: 'number' })
  id!: number;

  @ManyToOne(() => Silobag)
  silobolsa!: Silobag;

  @ManyToOne(() => Sensor)
  sensor!: Sensor;

  @Property()
  fecha_instalacion: Date = new Date();

  @Property({ length: 20, default: LinkStatus.ACTIVO })
  estado: string = LinkStatus.ACTIVO;
}
