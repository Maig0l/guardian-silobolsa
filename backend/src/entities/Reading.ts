import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Sensor } from './Sensor.js';

@Entity({ tableName: 'lectura' })
export class Reading {
  @PrimaryKey({ type: 'number' })
  id!: number;

  @ManyToOne(() => Sensor)
  sensor!: Sensor;

  @Property({ type: 'float' })
  hum!: number;

  @Property({ type: 'float' })
  temp!: number;

  @Property({ type: 'float' })
  co2!: number;

  @Property()
  timestamp: Date = new Date();

  @Property({ default: false })
  alerta: boolean = false;
}
